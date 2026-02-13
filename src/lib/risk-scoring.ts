// AI-powered Risk Scoring Algorithm
// Total: 1000 points across 5 categories

export interface RiskInputData {
    // On-chain data
    walletAgeDays: number;
    txCount: number;
    txFrequencyPerMonth: number;
    portfolioValue: number;
    defiProtocolsUsed: number;
    tokenCount: number;
    nftCount: number;
    longestHoldingDays: number;

    // Identity verification
    kycVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    addressVerified: boolean;

    // Social verification
    twitterFollowers: number;
    twitterAccountAgeDays: number;
    twitterVerified: boolean;
    linkedinConnections: number;
    linkedinEndorsements: number;
    referencesCount: number;

    // Financial
    employmentStatus: "employed" | "self_employed" | "student" | "unemployed";
    incomeRange: string;
    existingDebt: boolean;
    debtAmount: number;
    monthlyIncome: number;

    // Collateral & History
    collateralPercentage: number;
    previousLoansCount: number;
    previousLoansRepaid: number;
    previousDefaultCount: number;
    platformTenureDays: number;
}

export interface ScoreBreakdown {
    onChain: {
        total: number;
        walletAge: number;
        txCount: number;
        txConsistency: number;
        portfolioValue: number;
        defiInteraction: number;
        tokenDiversity: number;
    };
    identity: {
        total: number;
        kyc: number;
        email: number;
        phone: number;
        address: number;
    };
    social: {
        total: number;
        twitter: number;
        linkedin: number;
        references: number;
    };
    financial: {
        total: number;
        employment: number;
        income: number;
        debtRatio: number;
    };
    collateralHistory: {
        total: number;
        collateral: number;
        previousLoans: number;
        platformTenure: number;
    };
}

export interface RiskResult {
    score: number;
    breakdown: ScoreBreakdown;
    riskTier: "excellent" | "good" | "fair" | "poor" | "very_poor";
    interestRate: number;
    maxLoanAmount: number;
    suggestions: string[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function calculateOnChainScore(data: RiskInputData) {
    const walletAge = clamp(data.walletAgeDays / 7.3, 0, 50);
    const txCount = clamp(data.txCount / 2.5, 0, 40);

    // Transaction consistency: regular activity = higher score
    const txConsistency = clamp(data.txFrequencyPerMonth * 4, 0, 40);

    const portfolioValue = clamp(data.portfolioValue / 20, 0, 50);
    const defiInteraction = clamp(data.defiProtocolsUsed * 13.3, 0, 40);
    const tokenDiversity = clamp(data.tokenCount * 6, 0, 30);

    return {
        walletAge: Math.round(walletAge),
        txCount: Math.round(txCount),
        txConsistency: Math.round(txConsistency),
        portfolioValue: Math.round(portfolioValue),
        defiInteraction: Math.round(defiInteraction),
        tokenDiversity: Math.round(tokenDiversity),
        total: Math.round(walletAge + txCount + txConsistency + portfolioValue + defiInteraction + tokenDiversity),
    };
}

function calculateIdentityScore(data: RiskInputData) {
    const kyc = data.kycVerified ? 100 : 0;
    const email = data.emailVerified ? 30 : 0;
    const phone = data.phoneVerified ? 30 : 0;
    const address = data.addressVerified ? 40 : 0;

    return {
        kyc,
        email,
        phone,
        address,
        total: kyc + email + phone + address,
    };
}

function calculateSocialScore(data: RiskInputData) {
    // Twitter: 0-50 based on followers, account age, verification
    let twitter = 0;
    if (data.twitterFollowers > 0) {
        twitter += clamp(data.twitterFollowers / 20, 0, 15); // followers
        twitter += clamp(data.twitterAccountAgeDays / 73, 0, 15); // account age (max 5 years)
        twitter += data.twitterVerified ? 20 : 0;
    }

    // LinkedIn: 0-50 based on connections and endorsements
    let linkedin = 0;
    if (data.linkedinConnections > 0) {
        linkedin += clamp(data.linkedinConnections / 10, 0, 25);
        linkedin += clamp(data.linkedinEndorsements * 5, 0, 25);
    }

    const references = clamp(data.referencesCount * 25, 0, 50);

    return {
        twitter: Math.round(twitter),
        linkedin: Math.round(linkedin),
        references: Math.round(references),
        total: Math.round(twitter + linkedin + references),
    };
}

function calculateFinancialScore(data: RiskInputData) {
    const employmentScores: Record<string, number> = {
        employed: 60,
        self_employed: 40,
        student: 20,
        unemployed: 0,
    };
    const employment = employmentScores[data.employmentStatus] || 0;

    // Income score: 0-80
    let income = 0;
    const incomeMap: Record<string, number> = {
        "Under $20,000": 10,
        "$20,000 - $35,000": 25,
        "$35,000 - $50,000": 40,
        "$50,000 - $75,000": 55,
        "$75,000 - $100,000": 70,
        "Over $100,000": 80,
    };
    income = incomeMap[data.incomeRange] || 0;

    // Debt ratio: 0-60 (no debt = 60, high debt = 0)
    let debtRatio = 60;
    if (data.existingDebt && data.monthlyIncome > 0) {
        const ratio = data.debtAmount / (data.monthlyIncome * 12);
        debtRatio = Math.round(clamp(60 - ratio * 120, 0, 60));
    }

    return {
        employment,
        income,
        debtRatio,
        total: employment + income + debtRatio,
    };
}

function calculateCollateralHistoryScore(data: RiskInputData) {
    const collateral = Math.round(clamp(data.collateralPercentage * 2.5, 0, 100));

    // Previous loans: up to 50 points, penalized for defaults
    let previousLoans = 0;
    if (data.previousLoansCount > 0) {
        const repaymentRate =
            data.previousLoansRepaid / data.previousLoansCount;
        previousLoans = Math.round(
            clamp(data.previousLoansCount * 10, 0, 50) * repaymentRate
        );
    }

    const platformTenure = Math.round(
        clamp(data.platformTenureDays / 7.3, 0, 50)
    );

    return {
        collateral,
        previousLoans,
        platformTenure,
        total: collateral + previousLoans + platformTenure,
    };
}

function getRiskTier(score: number): RiskResult["riskTier"] {
    if (score >= 750) return "excellent";
    if (score >= 600) return "good";
    if (score >= 450) return "fair";
    if (score >= 300) return "poor";
    return "very_poor";
}

function generateSuggestions(
    data: RiskInputData,
    breakdown: ScoreBreakdown
): string[] {
    const suggestions: string[] = [];

    if (!data.kycVerified) {
        suggestions.push(
            "Complete KYC verification to earn up to 100 points and unlock better loan terms."
        );
    }
    if (!data.emailVerified) {
        suggestions.push("Verify your email address to earn 30 points.");
    }
    if (!data.phoneVerified) {
        suggestions.push("Add and verify your phone number for 30 points.");
    }
    if (breakdown.social.twitter < 30) {
        suggestions.push(
            "Connect your Twitter account to boost your social verification score by up to 50 points."
        );
    }
    if (breakdown.social.linkedin < 30) {
        suggestions.push(
            "Link your LinkedIn profile to add up to 50 points to your social score."
        );
    }
    if (data.collateralPercentage < 20) {
        suggestions.push(
            `Increase your collateral to 20% to improve your rate by ~2% and add ${Math.round(
                (20 - data.collateralPercentage) * 2.5
            )} points.`
        );
    }
    if (breakdown.onChain.total < 150) {
        suggestions.push(
            "Increase on-chain activity: make more DeFi transactions and diversify your token holdings."
        );
    }
    if (data.referencesCount < 2) {
        suggestions.push(
            "Add 2 references to earn up to 50 points in social verification."
        );
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
}

export function calculateInterestRate(
    riskScore: number,
    termMonths: number,
    collateralPercentage: number
): number {
    let baseApr: number;
    if (riskScore >= 750) baseApr = 8.0;
    else if (riskScore >= 600) baseApr = 12.0;
    else if (riskScore >= 450) baseApr = 18.0;
    else baseApr = 25.0;

    const termPremium = (termMonths - 3) * 0.5;
    const collateralDiscount = collateralPercentage / 10;
    const finalApr = clamp(baseApr + termPremium - collateralDiscount, 6.0, 35.0);

    return Math.round(finalApr * 100) / 100;
}

function calculateMaxLoanAmount(riskScore: number): number {
    if (riskScore >= 750) return 5000;
    if (riskScore >= 600) return 3500;
    if (riskScore >= 450) return 2000;
    if (riskScore >= 300) return 1000;
    return 500;
}

export function calculateRiskScore(data: RiskInputData): RiskResult {
    const onChain = calculateOnChainScore(data);
    const identity = calculateIdentityScore(data);
    const social = calculateSocialScore(data);
    const financial = calculateFinancialScore(data);
    const collateralHistory = calculateCollateralHistoryScore(data);

    const breakdown: ScoreBreakdown = {
        onChain,
        identity,
        social,
        financial,
        collateralHistory,
    };

    const totalScore = clamp(
        onChain.total +
        identity.total +
        social.total +
        financial.total +
        collateralHistory.total,
        0,
        1000
    );

    const suggestions = generateSuggestions(data, breakdown);
    const riskTier = getRiskTier(totalScore);
    const interestRate = calculateInterestRate(totalScore, 6, data.collateralPercentage);
    const maxLoanAmount = calculateMaxLoanAmount(totalScore);

    return {
        score: totalScore,
        breakdown,
        riskTier,
        interestRate,
        maxLoanAmount,
        suggestions,
    };
}

// Generate mock risk data for seeding
export function generateMockRiskData(seed: number = 0): RiskInputData {
    const random = (min: number, max: number) =>
        Math.floor(min + ((seed * 7919 + 104729) % (max - min + 1)));

    return {
        walletAgeDays: random(10, 730),
        txCount: random(5, 200),
        txFrequencyPerMonth: random(1, 15),
        portfolioValue: random(50, 5000),
        defiProtocolsUsed: random(0, 5),
        tokenCount: random(1, 10),
        nftCount: random(0, 20),
        longestHoldingDays: random(5, 365),
        kycVerified: seed % 3 !== 0,
        emailVerified: seed % 5 !== 0,
        phoneVerified: seed % 4 !== 0,
        addressVerified: seed % 3 !== 0,
        twitterFollowers: random(0, 500),
        twitterAccountAgeDays: random(30, 2000),
        twitterVerified: seed % 6 === 0,
        linkedinConnections: random(0, 300),
        linkedinEndorsements: random(0, 10),
        referencesCount: random(0, 2),
        employmentStatus: (["employed", "self_employed", "student", "unemployed"] as const)[
            seed % 4
        ],
        incomeRange: [
            "Under $20,000",
            "$20,000 - $35,000",
            "$35,000 - $50,000",
            "$50,000 - $75,000",
            "$75,000 - $100,000",
            "Over $100,000",
        ][seed % 6],
        existingDebt: seed % 3 === 0,
        debtAmount: seed % 3 === 0 ? random(1000, 20000) : 0,
        monthlyIncome: random(1500, 8000),
        collateralPercentage: random(0, 40),
        previousLoansCount: random(0, 5),
        previousLoansRepaid: random(0, 5),
        previousDefaultCount: random(0, 1),
        platformTenureDays: random(0, 365),
    };
}

// ─── AI Risk Assessment (calls Python microservice) ─────────────────────────

export interface AIRiskFactor {
    feature: string;
    label: string;
    impact: number;
    direction: "positive" | "negative";
}

export interface AIRiskResult {
    risk_tier: "Low Risk" | "Moderate Risk" | "High Risk";
    default_probability: number;
    confidence: number;
    score: number; // 0-1000
    top_factors: AIRiskFactor[];
    source: "ai" | "fallback";
}

const RISK_API_URL = process.env.NEXT_PUBLIC_RISK_API_URL || "http://localhost:8000";

/**
 * Call the AI risk assessment microservice.
 * Falls back to rule-based scoring if the API is unreachable.
 */
export async function calculateAIRiskScore(
    data: RiskInputData,
    loanAmount: number = 0,
    interestRateBps: number = 0,
    termMonths: number = 6,
): Promise<AIRiskResult> {
    try {
        const response = await fetch(`${RISK_API_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                walletAgeDays: data.walletAgeDays,
                txCount: data.txCount,
                txFrequencyPerMonth: data.txFrequencyPerMonth,
                portfolioValue: data.portfolioValue,
                defiProtocolsUsed: data.defiProtocolsUsed,
                monthlyIncome: data.monthlyIncome,
                existingDebt: data.existingDebt,
                debtAmount: data.debtAmount,
                collateralPercentage: data.collateralPercentage,
                loanAmount,
                interestRateBps,
                termMonths,
                previousLoansCount: data.previousLoansCount,
                previousLoansRepaid: data.previousLoansRepaid,
                previousDefaultCount: data.previousDefaultCount,
                platformTenureDays: data.platformTenureDays,
            }),
        });

        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const result = await response.json();
        return { ...result, source: "ai" as const };
    } catch {
        // Fallback to rule-based scoring
        const fallback = calculateRiskScore(data);
        const tier = fallback.score >= 700 ? "Low Risk"
            : fallback.score >= 400 ? "Moderate Risk"
                : "High Risk";

        return {
            risk_tier: tier,
            default_probability: Math.round((1 - fallback.score / 1000) * 10000) / 10000,
            confidence: 0.5,
            score: fallback.score,
            top_factors: [],
            source: "fallback",
        };
    }
}

