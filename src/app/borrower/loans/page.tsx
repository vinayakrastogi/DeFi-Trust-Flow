"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Wallet, Clock, ArrowRight, FileText, CheckCircle2,
    AlertCircle, XCircle, Filter, Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatEth, shortenAddress } from "@/lib/utils";
import { useGetLoans, useLoanCount, type ContractLoan } from "@/hooks/useLending";
import { useAccount } from "wagmi";
import { useState } from "react";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending", variant: "outline", icon: Clock },
    approved: { label: "Approved", variant: "info", icon: CheckCircle2 },
    funding: { label: "Seeking Funding", variant: "warning", icon: AlertCircle },
    active: { label: "Active", variant: "success", icon: CheckCircle2 },
    repaid: { label: "Repaid", variant: "default", icon: CheckCircle2 },
    defaulted: { label: "Defaulted", variant: "destructive", icon: XCircle },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export default function MyLoansPage() {
    const { address } = useAccount();
    const { data: loanCountRaw } = useLoanCount();
    const loanCount = loanCountRaw ? Number(loanCountRaw) : 0;
    const { loans: allLoans, isLoading } = useGetLoans(0, Math.max(loanCount, 50));
    const [filter, setFilter] = useState<string>("all");

    // Filter loans for the connected borrower
    const myLoans = allLoans.filter(
        (l) => l.borrower.toLowerCase() === (address?.toLowerCase() ?? "")
    );

    const filtered = filter === "all" ? myLoans : myLoans.filter((l) => l.status === filter);

    const totalBorrowed = myLoans.reduce((s, l) => s + parseFloat(l.amount), 0);
    const totalRepaid = myLoans.reduce((s, l) => s + parseFloat(l.totalRepaid), 0);
    const activeCount = myLoans.filter((l) => l.status === "active").length;

    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Loans</h1>
                        <p className="text-muted-foreground">Track all your on-chain loan applications.</p>
                    </div>
                    <Link href="/borrower/apply">
                        <Button variant="gradient">Apply for New Loan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">Total Borrowed</p>
                        <p className="text-2xl font-bold">{formatEth(totalBorrowed)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">Total Repaid</p>
                        <p className="text-2xl font-bold text-emerald-500">{formatEth(totalRepaid)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">Active Loans</p>
                        <p className="text-2xl font-bold">{activeCount}</p>
                    </CardContent></Card>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {["all", "pending", "approved", "active", "repaid", "rejected"].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className="capitalize"
                        >
                            {f}
                        </Button>
                    ))}
                </div>

                {/* No wallet connected */}
                {!address && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Connect your wallet to view your loans</p>
                            <p className="text-sm text-muted-foreground mt-1">Go to login page and connect your MetaMask wallet.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Loading state */}
                {address && isLoading && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading loans from Sepolia...</p>
                        </CardContent>
                    </Card>
                )}

                {/* No loans */}
                {address && !isLoading && filtered.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium">No loans found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filter === "all" ? "Apply for your first loan to get started." : `No ${filter} loans.`}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Loans List */}
                <div className="space-y-3">
                    {filtered.map((loan) => {
                        const sc = statusConfig[loan.status] || statusConfig.pending;
                        const StatusIcon = sc.icon;
                        const amountNum = parseFloat(loan.amount);
                        const repaidNum = parseFloat(loan.totalRepaid);
                        const repayPct = amountNum > 0 ? (repaidNum / amountNum) * 100 : 0;
                        const createdDate = loan.createdAt > 0
                            ? new Date(loan.createdAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—";
                        return (
                            <Card key={loan.id} className="hover:shadow-lg transition-all">
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="font-mono text-sm font-medium">Loan #{loan.id}</span>
                                                <Badge variant={sc.variant}><StatusIcon className="h-3 w-3 mr-1" />{sc.label}</Badge>
                                                <Badge variant="outline">{loan.purpose}</Badge>
                                                <Badge variant="outline">SepoliaETH</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Amount</p>
                                                    <p className="font-semibold">{formatEth(loan.amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Rate</p>
                                                    <p className="font-semibold">{loan.interestRatePercent}% APR</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Term</p>
                                                    <p className="font-semibold">{loan.termMonths} months</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Created</p>
                                                    <p className="font-semibold">{createdDate}</p>
                                                </div>
                                            </div>
                                            {(loan.status === "active" || loan.status === "repaid") && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-muted-foreground">Repayment</span>
                                                        <span>{formatEth(loan.totalRepaid)} / {formatEth(loan.amount)} ({Math.round(repayPct)}%)</span>
                                                    </div>
                                                    <Progress value={Math.min(repayPct, 100)} indicatorClassName="bg-emerald-500" className="h-2" />
                                                </div>
                                            )}
                                            {(loan.status === "approved" || loan.status === "funding") && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-muted-foreground">Funding Progress</span>
                                                        <span>{loan.fundingProgress}%</span>
                                                    </div>
                                                    <Progress value={loan.fundingProgress} indicatorClassName="bg-blue-500" className="h-2" />
                                                </div>
                                            )}
                                        </div>
                                        {loan.status === "active" && (
                                            <Link href="/borrower/repay">
                                                <Button size="sm">Pay Now</Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
