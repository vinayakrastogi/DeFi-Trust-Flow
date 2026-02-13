"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Shield, TrendingUp, Wallet, Clock, ArrowRight, AlertCircle,
    CheckCircle2, DollarSign, Calendar, Plus, CreditCard
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getRiskColor, getRiskLabel, getRiskBgColor, calculateMonthlyPayment } from "@/lib/utils";
import { format } from "date-fns";

// Mock data
const mockRiskScore = 720;
const mockActiveLoans = [
    {
        id: "1",
        loanId: "LN-A7B3C2",
        amount: 1500,
        currency: "USDC",
        interestRate: 10.5,
        termMonths: 6,
        status: "active",
        totalRepaid: 530,
        nextPaymentDue: "2025-03-15",
        purpose: "Education",
    },
    {
        id: "2",
        loanId: "LN-D9E4F1",
        amount: 800,
        currency: "USDT",
        interestRate: 12.0,
        termMonths: 3,
        status: "active",
        totalRepaid: 290,
        nextPaymentDue: "2025-03-10",
        purpose: "Business",
    },
];

const mockApplications = [
    {
        id: "3",
        loanId: "LN-G5H8J6",
        amount: 2000,
        status: "funding",
        fundingProgress: 65,
        createdAt: "2025-02-05",
    },
];

const statusSteps = [
    { label: "Under Review", key: "pending" },
    { label: "Risk Assessment", key: "approved" },
    { label: "Matching Lenders", key: "funding" },
    { label: "Funded", key: "active" },
];

export default function BorrowerDashboard() {
    const totalOutstanding = mockActiveLoans.reduce(
        (sum, l) => sum + (l.amount - l.totalRepaid),
        0
    );

    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Borrower Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your loans, track repayments, and build your credit score.
                        </p>
                    </div>
                    <Link href="/borrower/apply">
                        <Button variant="gradient" className="group">
                            <Plus className="mr-2 h-4 w-4" />
                            Apply for Loan
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Risk Score */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Risk Score</p>
                                    <p className={`text-3xl font-bold ${getRiskColor(mockRiskScore)}`}>
                                        {mockRiskScore}
                                    </p>
                                    <Badge variant="success" className="mt-1">
                                        {getRiskLabel(mockRiskScore)}
                                    </Badge>
                                </div>
                                <div className={`w-14 h-14 rounded-full ${getRiskBgColor(mockRiskScore)} bg-opacity-20 flex items-center justify-center`}>
                                    <Shield className={`h-7 w-7 ${getRiskColor(mockRiskScore)}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Loans */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Loans</p>
                                    <p className="text-3xl font-bold">{mockActiveLoans.length}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Outstanding: {formatCurrency(totalOutstanding)}
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Wallet className="h-7 w-7 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Payment */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Next Payment</p>
                                    <p className="text-3xl font-bold">
                                        {formatCurrency(calculateMonthlyPayment(800, 12, 3))}
                                    </p>
                                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Due in 5 days
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Calendar className="h-7 w-7 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Repaid */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Repaid</p>
                                    <p className="text-3xl font-bold">
                                        {formatCurrency(mockActiveLoans.reduce((s, l) => s + l.totalRepaid, 0))}
                                    </p>
                                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        On track
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <DollarSign className="h-7 w-7 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Active Loans */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold">Active Loans</h2>
                        {mockActiveLoans.map((loan) => {
                            const progress = (loan.totalRepaid / loan.amount) * 100;
                            const monthly = calculateMonthlyPayment(loan.amount, loan.interestRate, loan.termMonths);
                            return (
                                <Card key={loan.id} className="hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-mono text-sm font-medium">{loan.loanId}</span>
                                                    <Badge variant="info">{loan.status}</Badge>
                                                    <Badge variant="outline">{loan.purpose}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Amount</p>
                                                        <p className="font-semibold">{formatCurrency(loan.amount)} {loan.currency}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Interest Rate</p>
                                                        <p className="font-semibold">{loan.interestRate}% APR</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Monthly Payment</p>
                                                        <p className="font-semibold">{formatCurrency(monthly)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Next Due</p>
                                                        <p className="font-semibold">{format(new Date(loan.nextPaymentDue), "MMM d, yyyy")}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-muted-foreground">Repayment Progress</span>
                                                        <span className="font-medium">{Math.round(progress)}%</span>
                                                    </div>
                                                    <Progress value={progress} indicatorClassName="bg-emerald-500" className="h-2" />
                                                </div>
                                            </div>
                                            <Link href={`/borrower/repay`}>
                                                <Button variant="default" size="sm" className="whitespace-nowrap">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Pay Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Risk Score Summary + Pending Applications */}
                    <div className="space-y-4">
                        {/* Risk Score Card */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Risk Score Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { label: "On-Chain Activity", score: 185, max: 250, color: "bg-blue-500" },
                                    { label: "Identity Verification", score: 200, max: 200, color: "bg-emerald-500" },
                                    { label: "Social Verification", score: 95, max: 150, color: "bg-purple-500" },
                                    { label: "Financial Stability", score: 140, max: 200, color: "bg-amber-500" },
                                    { label: "Collateral & History", score: 100, max: 200, color: "bg-cyan-500" },
                                ].map((cat) => (
                                    <div key={cat.label}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">{cat.label}</span>
                                            <span className="font-medium">{cat.score}/{cat.max}</span>
                                        </div>
                                        <Progress
                                            value={(cat.score / cat.max) * 100}
                                            indicatorClassName={cat.color}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                                <Link href="/borrower/risk-score">
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        View Full Report
                                        <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Pending Applications */}
                        {mockApplications.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Pending Applications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {mockApplications.map((app) => (
                                        <div key={app.id} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-sm">{app.loanId}</span>
                                                <span className="font-medium text-sm">{formatCurrency(app.amount)}</span>
                                            </div>
                                            {/* Status stepper */}
                                            <div className="flex items-center gap-1">
                                                {statusSteps.map((step, i) => {
                                                    const stepIndex = statusSteps.findIndex(
                                                        (s) => s.key === app.status
                                                    );
                                                    const isComplete = i <= stepIndex;
                                                    const isCurrent = i === stepIndex;
                                                    return (
                                                        <div key={step.key} className="flex items-center flex-1">
                                                            <div
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${isComplete
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                {isComplete ? (
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                ) : (
                                                                    i + 1
                                                                )}
                                                            </div>
                                                            {i < statusSteps.length - 1 && (
                                                                <div
                                                                    className={`h-0.5 flex-1 mx-1 ${i < stepIndex ? "bg-primary" : "bg-muted"
                                                                        }`}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-xs text-muted-foreground text-center">
                                                {statusSteps.find((s) => s.key === app.status)?.label} — {app.fundingProgress}% funded
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Improvement Tips */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium mb-1">Improve Your Score</p>
                                        <p className="text-xs text-muted-foreground">
                                            Connect your Twitter account to earn up to 50 more points and unlock lower interest rates.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
