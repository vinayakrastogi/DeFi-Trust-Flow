"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    CreditCard, CheckCircle2, Clock, Wallet, Loader2,
} from "lucide-react";
import { formatEth } from "@/lib/utils";
import { useGetLoans, useLoanCount, useRepayLoan, type ContractLoan } from "@/hooks/useLending";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function RepayPage() {
    const { address } = useAccount();
    const { data: loanCountRaw } = useLoanCount();
    const loanCount = loanCountRaw ? Number(loanCountRaw) : 0;
    const { loans: allLoans, isLoading, refetch } = useGetLoans(0, Math.max(loanCount, 50));
    const { repayLoan, isPending, isConfirming, isSuccess, error } = useRepayLoan();
    const [payingLoanId, setPayingLoanId] = useState<number | null>(null);

    // Filter active loans for this borrower
    const activeLoans = allLoans.filter(
        (l) => l.borrower.toLowerCase() === (address?.toLowerCase() ?? "") && l.status === "active"
    );

    useEffect(() => {
        if (isSuccess) {
            toast.success("Repayment confirmed on-chain!");
            setPayingLoanId(null);
            refetch();
        }
    }, [isSuccess, refetch]);

    useEffect(() => {
        if (error) {
            toast.error("Repayment failed", { description: error.message.slice(0, 120) });
            setPayingLoanId(null);
        }
    }, [error]);

    const handlePay = (loan: ContractLoan) => {
        if (!address) return;
        setPayingLoanId(loan.id);
        // Pay the monthly payment amount
        const payAmount = parseFloat(loan.monthlyPayment);
        const remaining = parseFloat(loan.amount) - parseFloat(loan.totalRepaid);
        const actual = Math.min(payAmount > 0 ? payAmount : remaining, remaining);
        repayLoan(loan.id, actual.toString());
    };

    const isPayingAny = isPending || isConfirming;

    return (
        <DashboardLayout role="borrower" navItems={NAV_ITEMS.borrower}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Repayments</h1>
                    <p className="text-muted-foreground">Make payments on your active loans — ETH is sent via MetaMask.</p>
                </div>

                {!address && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Connect your wallet to manage repayments</p>
                        </CardContent>
                    </Card>
                )}

                {address && isLoading && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading loans from Sepolia...</p>
                        </CardContent>
                    </Card>
                )}

                {address && !isLoading && (
                    <>
                        <h2 className="text-xl font-semibold">Due Payments</h2>
                        {activeLoans.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                                    <p className="font-medium">No payments due</p>
                                    <p className="text-sm text-muted-foreground">You don&apos;t have any active loans requiring payment.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {activeLoans.map((loan) => {
                                    const amountNum = parseFloat(loan.amount);
                                    const repaidNum = parseFloat(loan.totalRepaid);
                                    const totalOwed = amountNum * (1 + loan.interestRatePercent / 100 * (loan.termMonths / 12));
                                    const remaining = Math.max(0, totalOwed - repaidNum);
                                    const pct = totalOwed > 0 ? (repaidNum / totalOwed) * 100 : 0;
                                    const monthlyAmt = parseFloat(loan.monthlyPayment);
                                    const payAmt = monthlyAmt > 0 ? Math.min(monthlyAmt, remaining) : remaining;
                                    const isThisOne = payingLoanId === loan.id && isPayingAny;

                                    return (
                                        <Card key={loan.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-5">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-mono font-medium">Loan #{loan.id}</span>
                                                            <Badge variant="success">Active</Badge>
                                                            <Badge variant="outline">SepoliaETH</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Loan Amount</p>
                                                                <p className="font-semibold">{formatEth(loan.amount)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Monthly Payment</p>
                                                                <p className="font-semibold">{formatEth(payAmt)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Remaining</p>
                                                                <p className="font-semibold text-amber-500">{formatEth(remaining)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Rate</p>
                                                                <p className="font-semibold">{loan.interestRatePercent}% APR</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">Overall Progress</span>
                                                            <span>{Math.round(pct)}%</span>
                                                        </div>
                                                        <Progress value={Math.min(pct, 100)} indicatorClassName="bg-emerald-500" className="h-2" />
                                                    </div>
                                                    <Button
                                                        onClick={() => handlePay(loan)}
                                                        disabled={isPayingAny}
                                                        className="whitespace-nowrap"
                                                    >
                                                        {isThisOne ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Pay {formatEth(payAmt)}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                                {isThisOne && isConfirming && (
                                                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                                        <p className="text-xs text-blue-500">Waiting for on-chain confirmation...</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
