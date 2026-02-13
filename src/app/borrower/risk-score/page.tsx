"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Shield, Brain, TrendingUp, AlertCircle, CheckCircle2,
    ArrowRight, Wallet, Twitter, Linkedin, Mail, Phone, MapPin,
    History, Lightbulb, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getRiskColor, getRiskLabel, formatCurrency, cn } from "@/lib/utils";
import {
    calculateRiskScore,
    generateMockRiskData,
    type ScoreBreakdown,
} from "@/lib/risk-scoring";

const mockData = generateMockRiskData(42);
const result = calculateRiskScore(mockData);

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
    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Risk Score Report</h1>
                    <p className="text-muted-foreground">
                        Your comprehensive AI-generated risk assessment
                    </p>
                </div>

                {/* Overall Score */}
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
                                            strokeDasharray={`${(result.score / 1000) * 427} 427`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="text-center z-10">
                                        <p className={`text-5xl font-bold ${getRiskColor(result.score)}`}>
                                            {result.score}
                                        </p>
                                        <p className="text-sm text-muted-foreground">/1000</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                    <Badge variant="success" className="text-lg px-4 py-1">
                                        {getRiskLabel(result.score)}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mb-4 max-w-lg">
                                    Your risk score is calculated across 5 categories using 20+ data points.
                                    A higher score unlocks lower interest rates and higher loan limits.
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-w-md">
                                    <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                                        <p className="text-lg font-bold text-primary">{result.interestRate}% APR</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-xs text-muted-foreground">Max Loan Amount</p>
                                        <p className="text-lg font-bold">{formatCurrency(result.maxLoanAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryConfig.map((cat) => {
                        const breakdown = result.breakdown[cat.key];
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

                {/* Improvement Suggestions */}
                {result.suggestions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                How to Improve Your Score
                            </CardTitle>
                            <CardDescription>
                                Follow these recommendations to boost your risk score and unlock better loan terms.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {result.suggestions.map((suggestion, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
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
