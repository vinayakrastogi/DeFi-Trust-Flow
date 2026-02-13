"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Shield, Brain, TrendingUp, AlertCircle, CheckCircle2,
    ArrowRight, Wallet, Twitter, History, Lightbulb,
    Loader2, Cpu, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { getRiskColor, cn } from "@/lib/utils";
import {
    calculateRiskScore,
    calculateAIRiskScore,
    generateMockRiskData,
    type AIRiskResult,
    type ScoreBreakdown,
} from "@/lib/risk-scoring";

const mockData = generateMockRiskData(42);
const ruleResult = calculateRiskScore(mockData);

const categoryConfig = [
    {
        key: "onChain" as const,
        label: "On-Chain Activity",
        icon: Wallet,
        color: "from-blue-500 to-indigo-500",
        bgColor: "bg-blue-500",
        maxScore: 250,
        details: [
            { label: "Wallet Age", key: "walletAge" },
            { label: "Transaction Count", key: "txCount" },
            { label: "Transaction Consistency", key: "txConsistency" },
            { label: "Portfolio Value", key: "portfolioValue" },
            { label: "DeFi Interaction", key: "defiInteraction" },
            { label: "Token Diversity", key: "tokenDiversity" },
        ],
    },
    {
        key: "identity" as const,
        label: "Identity Verification",
        icon: Shield,
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-500",
        maxScore: 200,
        details: [
            { label: "KYC Verified", key: "kyc" },
            { label: "Email Verified", key: "email" },
            { label: "Phone Verified", key: "phone" },
            { label: "Address Verified", key: "address" },
        ],
    },
    {
        key: "social" as const,
        label: "Social Verification",
        icon: Twitter,
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-500",
        maxScore: 150,
        details: [
            { label: "Twitter Score", key: "twitter" },
            { label: "LinkedIn Score", key: "linkedin" },
            { label: "References", key: "references" },
        ],
    },
    {
        key: "financial" as const,
        label: "Financial Stability",
        icon: TrendingUp,
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-500",
        maxScore: 200,
        details: [
            { label: "Employment", key: "employment" },
            { label: "Income Level", key: "income" },
            { label: "Debt Ratio", key: "debtRatio" },
        ],
    },
    {
        key: "collateralHistory" as const,
        label: "Collateral & History",
        icon: History,
        color: "from-cyan-500 to-blue-500",
        bgColor: "bg-cyan-500",
        maxScore: 200,
        details: [
            { label: "Collateral", key: "collateral" },
            { label: "Previous Loans", key: "previousLoans" },
            { label: "Platform Tenure", key: "platformTenure" },
        ],
    },
];

export default function RiskScorePage() {
    const [aiResult, setAiResult] = useState<AIRiskResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAI() {
            setLoading(true);
            const result = await calculateAIRiskScore(mockData, 0.5, 950, 6);
            setAiResult(result);
            setLoading(false);
        }
        fetchAI();
    }, []);

    const tierColor = aiResult?.risk_tier === "Low Risk"
        ? "text-emerald-500"
        : aiResult?.risk_tier === "Moderate Risk"
            ? "text-amber-500"
            : "text-red-500";

    const tierBg = aiResult?.risk_tier === "Low Risk"
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        : aiResult?.risk_tier === "Moderate Risk"
            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
            : "bg-red-500/10 text-red-600 border-red-500/20";

    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Risk Score Report</h1>
                    <p className="text-muted-foreground">
                        AI-powered risk assessment using trained XGBoost model
                    </p>
                </div>

                {/* AI Risk Assessment Card */}
                <Card className="border-primary/20">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full border-8 border-muted flex items-center justify-center relative">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="68"
                                            fill="none"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="8"
                                            strokeDasharray={`${((aiResult?.score ?? ruleResult.score) / 1000) * 427} 427`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="text-center z-10">
                                        {loading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        ) : (
                                            <>
                                                <p className={`text-5xl font-bold ${getRiskColor(aiResult?.score ?? 0)}`}>
                                                    {aiResult?.score ?? 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">/1000</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Running AI model...
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                            <Badge className={`text-lg px-4 py-1 border ${tierBg}`}>
                                                {aiResult?.risk_tier}
                                            </Badge>
                                            <Badge variant="outline" className="gap-1">
                                                <Cpu className="h-3 w-3" />
                                                {aiResult?.source === "ai" ? "AI Model" : "Rule-based Fallback"}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground mb-4 max-w-lg">
                                            {aiResult?.source === "ai"
                                                ? `AI confidence: ${Math.round((aiResult.confidence ?? 0) * 100)}%. Default probability: ${Math.round((aiResult.default_probability ?? 0) * 100)}%.`
                                                : "AI service unavailable. Showing rule-based risk score as fallback."}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 max-w-md">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Default Probability</p>
                                                <p className={`text-lg font-bold ${tierColor}`}>
                                                    {Math.round((aiResult?.default_probability ?? 0) * 100)}%
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">AI Confidence</p>
                                                <p className="text-lg font-bold text-primary">
                                                    {Math.round((aiResult?.confidence ?? 0) * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Top Factors */}
                {aiResult?.top_factors && aiResult.top_factors.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                Top AI Risk Factors
                            </CardTitle>
                            <CardDescription>
                                Key features influencing the AI model&apos;s prediction
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {aiResult.top_factors.map((factor, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                factor.direction === "positive"
                                                    ? "bg-emerald-500/10 text-emerald-600"
                                                    : "bg-red-500/10 text-red-600"
                                            )}>
                                                {factor.direction === "positive"
                                                    ? <ArrowUpRight className="h-4 w-4" />
                                                    : <ArrowDownRight className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{factor.label}</p>
                                                <p className="text-xs text-muted-foreground">{factor.feature}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            factor.direction === "positive"
                                                ? "text-emerald-600 border-emerald-300"
                                                : "text-red-600 border-red-300"
                                        )}>
                                            {factor.direction === "positive" ? "+" : "-"}{factor.impact.toFixed(3)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Category Breakdown (rule-based detail) */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Detailed Score Breakdown</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryConfig.map((cat) => {
                            const breakdown = ruleResult.breakdown[cat.key];
                            const pct = (breakdown.total / cat.maxScore) * 100;
                            return (
                                <Card key={cat.key} className="hover:shadow-lg transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cat.color} flex items-center justify-center`}>
                                                <cat.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">{cat.label}</CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {breakdown.total}/{cat.maxScore} points
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Progress value={pct} indicatorClassName={cat.bgColor} className="h-2" />
                                        {cat.details.map((detail) => {
                                            const val = (breakdown as Record<string, number>)[detail.key] ?? 0;
                                            return (
                                                <div key={detail.key} className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">{detail.label}</span>
                                                    <span className="font-medium">{val} pts</span>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Improvement Suggestions */}
                {ruleResult.suggestions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                How to Improve Your Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {ruleResult.suggestions.map((suggestion, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* CTA */}
                <div className="flex gap-3">
                    <Link href="/borrower/apply">
                        <Button variant="gradient" className="group">
                            Apply for a Loan
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
