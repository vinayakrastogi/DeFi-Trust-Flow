"""
TrustFlow AI Risk Assessment Microservice
FastAPI server that loads a trained XGBoost model and serves risk predictions.
"""

import json
import os
from pathlib import Path
from typing import Optional

import numpy as np
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Load Model & Config ─────────────────────────────────────────────────────

MODEL_DIR = Path(__file__).parent / "model"

with open(MODEL_DIR / "model_config.json") as f:
    config = json.load(f)

FEATURES = config["features"]
THRESHOLDS = config["thresholds"]

model = xgb.Booster()
model.load_model(str(MODEL_DIR / "trustflow_risk_model.json"))

print(f"✅ Model loaded — {len(FEATURES)} features, AUC={config.get('auc_score', 'N/A')}")

# ─── Feature Name → Human Label Mapping ──────────────────────────────────────

FEATURE_LABELS = {
    "AMT_INCOME_TOTAL": "Monthly Income",
    "AMT_CREDIT": "Loan Amount",
    "AMT_ANNUITY": "Monthly Payment",
    "AMT_GOODS_PRICE": "Collateral Value",
    "DAYS_BIRTH": "Account Age",
    "DAYS_EMPLOYED": "Employment Duration",
    "EXT_SOURCE_1": "Credit Score (Source 1)",
    "EXT_SOURCE_2": "Credit Score (Source 2)",
    "EXT_SOURCE_3": "Credit Score (Source 3)",
    "CREDIT_INCOME_RATIO": "Debt-to-Income Ratio",
    "ANNUITY_INCOME_RATIO": "Payment Burden",
    "bureau_loan_count": "Previous Loan Count",
    "bureau_active_count": "Active Debts",
    "bureau_max_overdue": "Worst Overdue Amount",
    "prev_app_count": "Application History",
    "prev_approved_count": "Approved Loans",
    "prev_refused_count": "Rejected Applications",
    "avg_payment_diff": "Payment Consistency",
    "max_dpd": "Worst Payment Delay",
    "avg_dpd": "Average Payment Delay",
}

# ─── API Models ───────────────────────────────────────────────────────────────


class RiskInput(BaseModel):
    """Input features from the frontend's RiskInputData interface."""
    # On-chain / wallet data
    walletAgeDays: float = 0
    txCount: float = 0
    txFrequencyPerMonth: float = 0
    portfolioValue: float = 0
    defiProtocolsUsed: float = 0

    # Financial
    monthlyIncome: float = 0
    existingDebt: bool = False
    debtAmount: float = 0
    collateralPercentage: float = 0

    # Loan request
    loanAmount: float = 0
    interestRateBps: float = 0
    termMonths: float = 6

    # History
    previousLoansCount: float = 0
    previousLoansRepaid: float = 0
    previousDefaultCount: float = 0
    platformTenureDays: float = 0


class TopFactor(BaseModel):
    feature: str
    label: str
    impact: float
    direction: str  # "positive" or "negative"


class RiskOutput(BaseModel):
    risk_tier: str  # "Low Risk", "Moderate Risk", "High Risk"
    default_probability: float
    confidence: float
    score: int  # 0-1000 scale
    top_factors: list[TopFactor]


# ─── Feature Mapping ─────────────────────────────────────────────────────────

def map_to_model_features(inp: RiskInput) -> np.ndarray:
    """Map frontend RiskInputData → model's 20 features."""
    annual_income = inp.monthlyIncome * 12
    loan_amount = inp.loanAmount
    monthly_payment = loan_amount / max(inp.termMonths, 1)

    feature_values = {
        "AMT_INCOME_TOTAL": annual_income,
        "AMT_CREDIT": loan_amount * 50000,  # scale ETH → comparable range
        "AMT_ANNUITY": monthly_payment * 50000,
        "AMT_GOODS_PRICE": loan_amount * 50000 * (inp.collateralPercentage / 100),
        "DAYS_BIRTH": -inp.walletAgeDays * 15,  # negative days (Home Credit convention)
        "DAYS_EMPLOYED": -inp.platformTenureDays,
        "EXT_SOURCE_1": min(inp.txFrequencyPerMonth / 15, 1.0),  # normalize 0-1
        "EXT_SOURCE_2": min(inp.defiProtocolsUsed / 5, 1.0),
        "EXT_SOURCE_3": min(inp.txCount / 200, 1.0),
        "CREDIT_INCOME_RATIO": (loan_amount * 50000) / max(annual_income, 1),
        "ANNUITY_INCOME_RATIO": (monthly_payment * 50000) / max(annual_income, 1),
        "bureau_loan_count": inp.previousLoansCount,
        "bureau_active_count": 1 if inp.existingDebt else 0,
        "bureau_max_overdue": inp.debtAmount,
        "prev_app_count": inp.previousLoansCount + inp.previousDefaultCount,
        "prev_approved_count": inp.previousLoansRepaid,
        "prev_refused_count": inp.previousDefaultCount,
        "avg_payment_diff": inp.previousLoansRepaid * 100 - inp.previousDefaultCount * 500,
        "max_dpd": inp.previousDefaultCount * 30,
        "avg_dpd": inp.previousDefaultCount * 10,
    }

    return np.array([[feature_values.get(f, 0) for f in FEATURES]], dtype=np.float64)


def get_top_factors(feature_vector: np.ndarray, n: int = 5) -> list[TopFactor]:
    """Get top contributing features using model's built-in feature importance."""
    importance = model.get_score(importance_type="gain")
    sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)

    factors = []
    for feat_name, gain in sorted_features[:n]:
        idx = FEATURES.index(feat_name) if feat_name in FEATURES else -1
        val = float(feature_vector[0][idx]) if idx >= 0 else 0
        direction = "positive" if val > 0 else "negative"
        factors.append(TopFactor(
            feature=feat_name,
            label=FEATURE_LABELS.get(feat_name, feat_name),
            impact=round(gain / 1000, 3),
            direction=direction,
        ))
    return factors


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="TrustFlow Risk Assessment API",
    version="1.0.0",
    description="AI-powered loan risk classification using XGBoost",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "model_version": config.get("version", "unknown")}


@app.post("/predict", response_model=RiskOutput)
def predict_risk(inp: RiskInput):
    try:
        features = map_to_model_features(inp)
        dmatrix = xgb.DMatrix(features, feature_names=FEATURES)
        raw_pred = model.predict(dmatrix)[0]  # raw logit or probability

        # Sigmoid if raw output, otherwise already probability
        if raw_pred < 0 or raw_pred > 1:
            default_prob = 1.0 / (1.0 + np.exp(-raw_pred))
        else:
            default_prob = float(raw_pred)

        # Classify into 3 tiers
        if default_prob < THRESHOLDS["low"]:
            risk_tier = "Low Risk"
        elif default_prob < THRESHOLDS["moderate"]:
            risk_tier = "Moderate Risk"
        else:
            risk_tier = "High Risk"

        # Confidence = how far from the decision boundary
        confidence = float(max(default_prob, 1 - default_prob))

        # Score on 0-1000 scale (higher = safer)
        score = int(round((1 - default_prob) * 1000))

        top_factors = get_top_factors(features)

        return RiskOutput(
            risk_tier=risk_tier,
            default_probability=round(default_prob, 4),
            confidence=round(confidence, 4),
            score=score,
            top_factors=top_factors,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
