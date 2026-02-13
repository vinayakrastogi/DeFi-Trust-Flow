"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
    Search, Filter, Shield, TrendingUp, Clock,
    ArrowUpRight, Users, Star, Loader2, Wallet,
} from "lucide-react";
import { formatEth, getRiskColor, getRiskLabel, shortenAddress, cn } from "@/lib/utils";
import { useGetLoans, useLoanCount, useFundLoan, type ContractLoan } from "@/hooks/useLending";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function MarketplacePage() {
    const { address } = useAccount();
    const { data: loanCountRaw } = useLoanCount();
    const loanCount = loanCountRaw ? Number(loanCountRaw) : 0;
    const { loans: allLoans, isLoading, refetch } = useGetLoans(0, Math.max(loanCount, 50));
    const { fundLoan, isPending, isConfirming, isSuccess, error } = useFundLoan();

    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedLoan, setSelectedLoan] = useState<ContractLoan | null>(null);
    const [investAmount, setInvestAmount] = useState(0.01);

    // Show only approved loans (ready for funding) that aren't fully funded AND not my own loans
    const fundableLoans = allLoans.filter(
        (l) => (l.status === "approved" || l.status === "funding")
            && l.fundingProgress < 100
            && l.borrower.toLowerCase() !== address?.toLowerCase()
    );

    const filteredLoans = fundableLoans
        .filter((l) => {
            if (search && !l.purpose.toLowerCase().includes(search.toLowerCase()) && !`Loan #${l.id}`.includes(search)) return false;
            if (riskFilter === "excellent" && l.riskScore < 750) return false;
            if (riskFilter === "good" && (l.riskScore < 600 || l.riskScore >= 750)) return false;
            if (riskFilter === "risky" && l.riskScore >= 600) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "newest") return b.createdAt - a.createdAt;
            if (sortBy === "rate_high") return b.interestRatePercent - a.interestRatePercent;
            if (sortBy === "rate_low") return a.interestRatePercent - b.interestRatePercent;
            if (sortBy === "score_high") return b.riskScore - a.riskScore;
            return 0;
        });

    useEffect(() => {
        if (isSuccess) {
            toast.success("Investment confirmed on-chain!", {
                description: "Your ETH has been sent to fund this loan.",
            });
            setSelectedLoan(null);
            refetch();
        }
    }, [isSuccess, refetch]);

    useEffect(() => {
        if (error) {
            toast.error("Investment failed", { description: error.message.slice(0, 120) });
        }
    }, [error]);

    const handleInvest = () => {
        if (!selectedLoan || !address) return;
        fundLoan(selectedLoan.id, investAmount.toString());
    };

    const isBusy = isPending || isConfirming;

    return (
        <DashboardLayout role="lender" navItems={NAV_ITEMS.lender}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Loan Marketplace</h1>
                        <p className="text-muted-foreground">
                            Fund loans with SepoliaETH — your MetaMask wallet sends real ETH
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground">Sepolia • {fundableLoans.length} available</span>
                    </div>
                </div>

                {!address && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-6 text-center">
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-medium">Connect your wallet to invest in loans</p>
                        </CardContent>
                    </Card>
                )}

                {address && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by loan ID or purpose..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={riskFilter} onValueChange={setRiskFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Risk</SelectItem>
                                    <SelectItem value="excellent">Excellent (750+)</SelectItem>
                                    <SelectItem value="good">Good (600-749)</SelectItem>
                                    <SelectItem value="risky">Risky (&lt;600)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="rate_high">Highest Rate</SelectItem>
                                    <SelectItem value="rate_low">Lowest Rate</SelectItem>
                                    <SelectItem value="score_high">Best Score</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Loading loans from Sepolia...</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* No loans */}
                        {!isLoading && filteredLoans.length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                    <p className="font-medium">No loans available for funding</p>
                                    <p className="text-sm text-muted-foreground mt-1">Check back later for new loan applications.</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Loan Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLoans.map((loan) => {
                                const amountNum = parseFloat(loan.amount);
                                const fundedNum = parseFloat(loan.totalFunded);
                                const remaining = amountNum - fundedNum;
                                return (
                                    <Card key={loan.id} className="hover:shadow-lg transition-all group cursor-pointer" onClick={() => { setSelectedLoan(loan); setInvestAmount(Math.min(0.01, remaining)); }}>
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-mono text-sm font-medium">Loan #{loan.id}</span>
                                                <Badge variant="outline">{loan.purpose}</Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Amount</span>
                                                    <span className="font-semibold">{formatEth(loan.amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Interest Rate</span>
                                                    <span className="font-semibold text-emerald-500">{loan.interestRatePercent}% APR</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Term</span>
                                                    <span className="font-semibold">{loan.termMonths} months</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Borrower</span>
                                                    <span className="font-mono text-xs">{shortenAddress(loan.borrower)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Risk Score</span>
                                                    <span className={cn("font-semibold", getRiskColor(loan.riskScore))}>
                                                        {loan.riskScore} • {getRiskLabel(loan.riskScore)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Funded: {formatEth(loan.totalFunded)}</span>
                                                    <span>{loan.fundingProgress}%</span>
                                                </div>
                                                <Progress value={loan.fundingProgress} indicatorClassName="bg-blue-500" className="h-2" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatEth(remaining)} remaining
                                                </p>
                                            </div>

                                            <Button className="w-full mt-4" size="sm" variant="gradient">
                                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                                Fund This Loan
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Investment Dialog */}
                        <Dialog open={!!selectedLoan} onOpenChange={(open) => { if (!open) setSelectedLoan(null); }}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Fund Loan #{selectedLoan?.id}</DialogTitle>
                                    <DialogDescription>
                                        Send SepoliaETH to fund this loan. MetaMask will confirm the transaction.
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedLoan && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Loan Amount</p>
                                                <p className="font-semibold">{formatEth(selectedLoan.amount)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Interest Rate</p>
                                                <p className="font-semibold">{selectedLoan.interestRatePercent}% APR</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Borrower</p>
                                                <p className="font-mono text-xs">{shortenAddress(selectedLoan.borrower)}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Remaining</p>
                                                <p className="font-semibold">{formatEth(parseFloat(selectedLoan.amount) - parseFloat(selectedLoan.totalFunded))}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Investment Amount (ETH)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={investAmount}
                                                    onChange={(e) => setInvestAmount(parseFloat(e.target.value) || 0)}
                                                    min={0.001}
                                                    max={parseFloat(selectedLoan.amount) - parseFloat(selectedLoan.totalFunded)}
                                                    step={0.001}
                                                />
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">ETH</span>
                                            </div>
                                            <Slider
                                                value={[investAmount]}
                                                onValueChange={(v) => setInvestAmount(v[0])}
                                                min={0.001}
                                                max={Math.max(0.001, parseFloat(selectedLoan.amount) - parseFloat(selectedLoan.totalFunded))}
                                                step={0.001}
                                            />
                                        </div>

                                        {isConfirming && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                <p className="text-xs text-blue-500">Waiting for on-chain confirmation...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedLoan(null)} disabled={isBusy}>
                                        Cancel
                                    </Button>
                                    <Button variant="gradient" onClick={handleInvest} disabled={isBusy || investAmount <= 0}>
                                        {isBusy ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                                Send {formatEth(investAmount)}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
