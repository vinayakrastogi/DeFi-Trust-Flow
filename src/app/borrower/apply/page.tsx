"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    ArrowRight, Calculator, Shield, Clock, Percent,
    AlertCircle, CheckCircle2, Info, Wallet,
} from "lucide-react";
import { formatEth } from "@/lib/utils";
import {
    calculateInterestRate,
    calculateAIRiskScore,
    generateMockRiskData,
    type AIRiskResult,
} from "@/lib/risk-scoring";
import { useCreateLoan } from "@/hooks/useLending";

const loanPurposes = [
    "Education", "Business", "Personal", "Medical", "Housing",
    "Debt Consolidation", "Emergency", "Other",
];

export default function LoanApplicationPage() {
    const router = useRouter();
    const { address } = useAccount();
    const { createLoan, isPending, isConfirming, isSuccess, error } = useCreateLoan();
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(0.1); // ETH
    const [term, setTerm] = useState(6);
    const [purpose, setPurpose] = useState("");
    const [description, setDescription] = useState("");
    const [aiScore, setAiScore] = useState<number>(720);
    const [aiTier, setAiTier] = useState<string>("Moderate Risk");
    const [scoreLoading, setScoreLoading] = useState(false);

    const interestRate = calculateInterestRate(aiScore, term, 0);
    const interestRateBps = Math.round(interestRate * 100); // e.g. 9.5% → 950 bps
    const totalInterest = amount * (interestRate / 100) * (term / 12);
    const totalPayment = amount + totalInterest;
    const monthlyPayment = totalPayment / term;

    // Fetch AI risk score when amount/term change
    useEffect(() => {
        async function fetchScore() {
            setScoreLoading(true);
            const mockData = generateMockRiskData(42);
            const result = await calculateAIRiskScore(mockData, amount, interestRateBps, term);
            setAiScore(result.score);
            setAiTier(result.risk_tier);
            setScoreLoading(false);
        }
        fetchScore();
    }, [amount, term]);

    // Redirect on success
    useEffect(() => {
        if (isSuccess) {
            toast.success("Loan application submitted on-chain!", {
                description: "Your loan is now pending admin approval.",
            });
            router.push("/borrower/loans");
        }
    }, [isSuccess, router]);

    useEffect(() => {
        if (error) {
            toast.error("Transaction failed", {
                description: error.message.slice(0, 120),
            });
        }
    }, [error]);

    const handleSubmit = () => {
        if (!address) {
            toast.error("Connect your wallet first");
            return;
        }
        createLoan(
            amount.toString(),
            interestRateBps,
            term,
            aiScore,
            purpose || "General"
        );
    };

    const isLoading = isPending || isConfirming;

    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Apply for a Loan</h1>
                    <p className="text-muted-foreground">
                        Configure your loan terms — transaction is submitted on-chain via MetaMask
                    </p>
                </div>

                {/* Wallet Check */}
                {!address && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Connect your wallet to apply for a loan</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Go to login page and connect your MetaMask wallet.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {address && (
                    <>
                        {/* Step Indicator */}
                        <div className="flex items-center gap-2 mb-8">
                            {[
                                { n: 1, label: "Loan Details" },
                                { n: 2, label: "Purpose & Info" },
                                { n: 3, label: "Review & Submit" },
                            ].map((s, i) => (
                                <div key={s.n} className="flex items-center flex-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors ${step >= s.n
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {step > s.n ? <CheckCircle2 className="h-5 w-5" /> : s.n}
                                    </div>
                                    <span
                                        className={`ml-2 text-sm hidden sm:inline ${step >= s.n ? "font-medium" : "text-muted-foreground"
                                            }`}
                                    >
                                        {s.label}
                                    </span>
                                    {i < 2 && (
                                        <div className={`h-0.5 flex-1 mx-3 ${step > s.n ? "bg-primary" : "bg-muted"}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2">
                                {step === 1 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Loan Details</CardTitle>
                                            <CardDescription>Choose your loan amount (in SepoliaETH) and term</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Amount in ETH */}
                                            <div className="space-y-3">
                                                <Label className="flex items-center justify-between">
                                                    <span>Loan Amount (SepoliaETH)</span>
                                                    <span className="text-2xl font-bold text-primary">{formatEth(amount)}</span>
                                                </Label>
                                                <Slider
                                                    value={[amount]}
                                                    onValueChange={(v) => setAmount(v[0])}
                                                    min={0.01}
                                                    max={10}
                                                    step={0.01}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>0.01 ETH</span>
                                                    <span>10 ETH</span>
                                                </div>
                                            </div>

                                            {/* Currency display (read-only) */}
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                                                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-blue-500">Ξ</span>
                                                </div>
                                                <span className="font-medium">SepoliaETH</span>
                                                <Badge variant="outline" className="ml-auto">Sepolia Testnet</Badge>
                                            </div>

                                            {/* Term */}
                                            <div className="space-y-3">
                                                <Label className="flex items-center justify-between">
                                                    <span>Loan Term</span>
                                                    <span className="font-semibold">{term} months</span>
                                                </Label>
                                                <Slider
                                                    value={[term]}
                                                    onValueChange={(v) => setTerm(v[0])}
                                                    min={1}
                                                    max={24}
                                                    step={1}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>1 month</span>
                                                    <span>24 months</span>
                                                </div>
                                            </div>

                                            <Button onClick={() => setStep(2)} className="w-full" variant="gradient">
                                                Continue
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {step === 2 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Purpose & Information</CardTitle>
                                            <CardDescription>Tell us about your loan purpose</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Loan Purpose</Label>
                                                <Select value={purpose} onValueChange={setPurpose}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a purpose" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loanPurposes.map((p) => (
                                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description (Optional)</Label>
                                                <Textarea
                                                    placeholder="Briefly describe what the loan will be used for..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                                    Back
                                                </Button>
                                                <Button variant="gradient" onClick={() => setStep(3)} className="flex-1" disabled={!purpose}>
                                                    Review Application
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {step === 3 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Review & Submit</CardTitle>
                                            <CardDescription>Verify your loan details — this will trigger a MetaMask transaction</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: "Amount", value: formatEth(amount) },
                                                    { label: "Currency", value: "SepoliaETH" },
                                                    { label: "Term", value: `${term} months` },
                                                    { label: "Interest Rate", value: `${interestRate}% APR` },
                                                    { label: "Monthly Payment", value: formatEth(monthlyPayment) },
                                                    { label: "Total Repayment", value: formatEth(totalPayment) },
                                                    { label: "Total Interest", value: formatEth(totalInterest) },
                                                    { label: "Purpose", value: purpose },
                                                ].map((item) => (
                                                    <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                                        <p className="font-semibold text-sm">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-muted-foreground">
                                                    By submitting, MetaMask will ask you to sign a transaction on Sepolia. Your loan will be recorded on-chain and managed by the smart contract.
                                                </p>
                                            </div>

                                            {isConfirming && (
                                                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                    <div className="h-4 w-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                                    <p className="text-xs text-blue-500">Waiting for transaction confirmation on Sepolia...</p>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isLoading}>
                                                    Back
                                                </Button>
                                                <Button variant="gradient" onClick={handleSubmit} className="flex-1" disabled={isLoading}>
                                                    {isLoading ? (
                                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            Submit via MetaMask
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Summary Sidebar */}
                            <div className="space-y-4">
                                <Card className="sticky top-20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Calculator className="h-5 w-5" />
                                            Loan Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <span className="text-xs font-bold">Ξ</span> Amount
                                                </span>
                                                <span className="font-medium">{formatEth(amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Term
                                                </span>
                                                <span className="font-medium">{term} months</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Percent className="h-3 w-3" /> Interest Rate
                                                </span>
                                                <span className="font-medium text-primary">{interestRate}% APR</span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Monthly Payment</span>
                                                <span className="font-bold text-lg">{formatEth(monthlyPayment)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Total Interest</span>
                                                <span>{formatEth(totalInterest)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Total Repayment</span>
                                                <span>{formatEth(totalPayment)}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Shield className="h-4 w-4 text-emerald-500" />
                                                <span className="text-muted-foreground">AI Risk Score:</span>
                                                <Badge variant="success">{scoreLoading ? "..." : aiScore}</Badge>
                                                <Badge variant="outline" className="text-xs">{aiTier}</Badge>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs text-muted-foreground">Sepolia Testnet</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
