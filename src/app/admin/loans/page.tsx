"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText, Search, CheckCircle2, XCircle, Clock, Filter,
    DollarSign, AlertTriangle, Loader2,
} from "lucide-react";
import { useGetLoans, useLoanCount, useApproveLoan, useRejectLoan, useContractOwner } from "@/hooks/useLending";
import { formatEth, shortenAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "outline" }> = {
    pending: { label: "Pending", variant: "outline" },
    approved: { label: "Approved", variant: "info" },
    funding: { label: "Funding", variant: "warning" },
    active: { label: "Active", variant: "success" },
    repaid: { label: "Repaid", variant: "default" },
    defaulted: { label: "Defaulted", variant: "destructive" },
    rejected: { label: "Rejected", variant: "destructive" },
};

export default function AdminLoansPage() {
    const { address } = useAccount();
    const { data: ownerAddress, isLoading: isOwnerLoading } = useContractOwner();
    const { data: loanCountRaw } = useLoanCount();
    const loanCount = loanCountRaw ? Number(loanCountRaw) : 0;
    const { loans, isLoading, refetch } = useGetLoans(0, Math.max(loanCount, 50));
    const { approveLoan, isPending: approvePending, isSuccess: approveSuccess, error: approveError } = useApproveLoan();
    const { rejectLoan, isPending: rejectPending, isSuccess: rejectSuccess, error: rejectError } = useRejectLoan();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");

    // Debugging owner check
    useEffect(() => {
        console.log("Admin Check:", {
            connected: address,
            owner: ownerAddress,
            match: address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase()
        });
    }, [address, ownerAddress]);

    const isOwner = Boolean(address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase());

    useEffect(() => {
        if (approveSuccess) {
            toast.success("Loan approved on-chain!");
            refetch();
        }
    }, [approveSuccess, refetch]);

    useEffect(() => {
        if (rejectSuccess) {
            toast.success("Loan rejected on-chain!");
            refetch();
        }
    }, [rejectSuccess, refetch]);

    useEffect(() => {
        if (approveError) toast.error("Approve failed", { description: approveError.message.slice(0, 120) });
    }, [approveError]);

    useEffect(() => {
        if (rejectError) toast.error("Reject failed", { description: rejectError.message.slice(0, 120) });
    }, [rejectError]);

    const filtered = loans
        .filter((l) => filter === "all" || l.status === filter)
        .filter((l) =>
            `Loan #${l.id}`.toLowerCase().includes(search.toLowerCase()) ||
            l.borrower.toLowerCase().includes(search.toLowerCase()) ||
            l.purpose.toLowerCase().includes(search.toLowerCase())
        );

    const totalVolume = loans.reduce((s, l) => s + parseFloat(l.amount), 0);
    const activeCount = loans.filter((l) => l.status === "active").length;
    const pendingCount = loans.filter((l) => l.status === "pending").length;

    const handleApprove = (loanId: number) => {
        approveLoan(loanId);
    };

    const handleReject = (loanId: number) => {
        rejectLoan(loanId);
    };

    const isBusy = approvePending || rejectPending;

    return (
        <DashboardLayout role="admin" navItems={NAV_ITEMS.admin}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Loan Management</h1>
                    <p className="text-muted-foreground">
                        {isOwner
                            ? "Review and manage all on-chain loans (you are the contract owner)."
                            : `View all loans. You are connected as ${address ? shortenAddress(address) : "..."}, but the contract owner is ${ownerAddress ? shortenAddress(ownerAddress as string) : "loading..."}.`}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-5 text-center">
                        <FileText className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-2xl font-bold">{loans.length}</p>
                        <p className="text-xs text-muted-foreground">Total Loans</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                        <p className="text-2xl font-bold">{formatEth(totalVolume)}</p>
                        <p className="text-xs text-muted-foreground">Total Volume</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                        <p className="text-2xl font-bold">{activeCount}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-2xl font-bold">{pendingCount}</p>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                    </CardContent></Card>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by loan ID, borrower, or purpose..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        {["all", "pending", "approved", "active", "repaid", "rejected"].map((f) => (
                            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
                        ))}
                    </div>
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

                {/* Table */}
                {!isLoading && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium text-muted-foreground">Loan</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Borrower</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Rate</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Term</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Risk</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((loan) => {
                                            const sc = statusConfig[loan.status] || statusConfig.pending;
                                            const createdDate = loan.createdAt > 0
                                                ? new Date(loan.createdAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                : "—";
                                            return (
                                                <tr key={loan.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 font-mono font-medium">#{loan.id}</td>
                                                    <td className="p-3">
                                                        <p className="font-mono text-xs">{shortenAddress(loan.borrower)}</p>
                                                    </td>
                                                    <td className="p-3 font-semibold">{formatEth(loan.amount)}</td>
                                                    <td className="p-3">{loan.interestRatePercent}%</td>
                                                    <td className="p-3">{loan.termMonths}m</td>
                                                    <td className="p-3">
                                                        <span className={`font-semibold ${loan.riskScore >= 700 ? "text-emerald-500" : loan.riskScore >= 500 ? "text-amber-500" : "text-red-500"}`}>
                                                            {loan.riskScore}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant={sc.variant} className="capitalize">{sc.label}</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        {loan.status === "pending" && isOwner && (
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="default" onClick={() => handleApprove(loan.id)} disabled={isBusy}>
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleReject(loan.id)} disabled={isBusy}>
                                                                    <XCircle className="h-3 w-3 mr-1" />Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {loan.status === "pending" && !isOwner && (
                                                            <span className="text-xs text-muted-foreground">Owner only</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {filtered.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No loans match your search criteria.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
