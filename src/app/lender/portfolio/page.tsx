"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    PieChart, TrendingUp, DollarSign, Wallet, Clock, Loader2,
} from "lucide-react";
import { formatEth, shortenAddress } from "@/lib/utils";
import { useGetLoans, useLoanCount, useLenderInvestmentIds, type ContractLoan } from "@/hooks/useLending";
import { useAccount } from "wagmi";

export default function PortfolioPage() {
    const { address } = useAccount();
    const { data: loanCountRaw } = useLoanCount();
    const loanCount = loanCountRaw ? Number(loanCountRaw) : 0;
    const { loans: allLoans, isLoading } = useGetLoans(0, Math.max(loanCount, 50));
    const { data: investmentIds } = useLenderInvestmentIds(address);

    // Get unique loan IDs this lender has invested in
    const myLoanIds = investmentIds ? Array.from(new Set((investmentIds as bigint[]).map(Number))) : [];
    const myLoans = allLoans.filter((l) => myLoanIds.includes(l.id));

    // Basic portfolio stats
    const totalInvestedLoans = myLoans.length;
    const activeCount = myLoans.filter((l) => l.status === "active").length;

    // Note: detailed investment amounts per-lender require event log parsing
    // For now we show the loan-level data the lender has participated in
    const totalLoanValue = myLoans.reduce((s, l) => s + parseFloat(l.amount), 0);
    const totalRepaid = myLoans.reduce((s, l) => s + parseFloat(l.totalRepaid), 0);

    return (
        <DashboardLayout role="lender" navItems={NAV_ITEMS.lender}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Portfolio</h1>
                    <p className="text-muted-foreground">Track your on-chain investments and returns.</p>
                </div>

                {!address && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Connect your wallet to see your portfolio</p>
                        </CardContent>
                    </Card>
                )}

                {address && isLoading && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading portfolio from Sepolia...</p>
                        </CardContent>
                    </Card>
                )}

                {address && !isLoading && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card><CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Loans Funded</p>
                                        <p className="text-xl font-bold">{totalInvestedLoans}</p>
                                    </div>
                                </div>
                            </CardContent></Card>
                            <Card><CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Loan Value</p>
                                        <p className="text-xl font-bold">{formatEth(totalLoanValue)}</p>
                                    </div>
                                </div>
                            </CardContent></Card>
                            <Card><CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <PieChart className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Repaid</p>
                                        <p className="text-xl font-bold text-emerald-500">{formatEth(totalRepaid)}</p>
                                    </div>
                                </div>
                            </CardContent></Card>
                            <Card><CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Active Investments</p>
                                        <p className="text-xl font-bold">{activeCount}</p>
                                    </div>
                                </div>
                            </CardContent></Card>
                        </div>

                        {/* Investments Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Investments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {myLoans.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <PieChart className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                        <p>No investments yet. Visit the <a href="/lender/marketplace" className="text-primary underline">marketplace</a> to fund loans.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Loan</th>
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Borrower</th>
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Rate</th>
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                                    <th className="text-left p-3 font-medium text-muted-foreground">Repayment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myLoans.map((loan) => {
                                                    const amountNum = parseFloat(loan.amount);
                                                    const repaidNum = parseFloat(loan.totalRepaid);
                                                    const repPct = amountNum > 0 ? (repaidNum / amountNum) * 100 : 0;
                                                    const statusVariant = loan.status === "active" ? "success" : loan.status === "repaid" ? "default" : loan.status === "funding" || loan.status === "approved" ? "warning" : "outline";
                                                    return (
                                                        <tr key={loan.id} className="border-b border-border/50 hover:bg-muted/30">
                                                            <td className="p-3 font-mono">#{loan.id}</td>
                                                            <td className="p-3 font-mono text-xs">{shortenAddress(loan.borrower)}</td>
                                                            <td className="p-3 font-semibold">{formatEth(loan.amount)}</td>
                                                            <td className="p-3">{loan.interestRatePercent}%</td>
                                                            <td className="p-3">
                                                                <Badge variant={statusVariant as "default" | "success" | "warning" | "outline"} className="capitalize">{loan.status}</Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="w-20">
                                                                    <Progress value={Math.min(repPct, 100)} className="h-1.5" indicatorClassName="bg-emerald-500" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
