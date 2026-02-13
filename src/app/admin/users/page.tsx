"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Users, Search, Shield, Wallet, UserCheck, UserX, MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

// Mock users for the admin view
const MOCK_USERS = [
    { id: "1", name: "Alex Chen", email: "alex@demo.com", role: "borrower", wallet: "0x71C7...3aB1", riskScore: 720, status: "verified", loans: 3, joinedAt: "2025-09-15T10:00:00Z" },
    { id: "2", name: "Sarah Mitchell", email: "sarah@demo.com", role: "lender", wallet: "0x8aD3...f2E4", riskScore: null, status: "verified", loans: 0, joinedAt: "2025-08-20T14:30:00Z" },
    { id: "3", name: "Raj Patel", email: "raj@demo.com", role: "borrower", wallet: "0x45B2...c9D7", riskScore: 620, status: "verified", loans: 1, joinedAt: "2025-11-02T08:45:00Z" },
    { id: "4", name: "Mike Rogers", email: "mike@demo.com", role: "lender", wallet: "0x2fA6...e1C8", riskScore: null, status: "verified", loans: 0, joinedAt: "2025-10-10T16:20:00Z" },
    { id: "5", name: "Lisa Wang", email: "lisa@demo.com", role: "both", wallet: "0x9cE1...b4F2", riskScore: 810, status: "pending", loans: 2, joinedAt: "2025-12-01T12:00:00Z" },
    { id: "6", name: "James Oliver", email: "james@demo.com", role: "borrower", wallet: "", riskScore: 450, status: "suspended", loans: 1, joinedAt: "2025-07-05T09:15:00Z" },
    { id: "7", name: "Emma Davis", email: "emma@demo.com", role: "lender", wallet: "0x6Bd4...a3E9", riskScore: null, status: "verified", loans: 0, joinedAt: "2025-11-20T11:30:00Z" },
];

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");

    const filtered = MOCK_USERS.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalUsers = MOCK_USERS.length;
    const verifiedCount = MOCK_USERS.filter((u) => u.status === "verified").length;
    const borrowerCount = MOCK_USERS.filter((u) => u.role === "borrower" || u.role === "both").length;
    const lenderCount = MOCK_USERS.filter((u) => u.role === "lender" || u.role === "both").length;

    return (
        <DashboardLayout role="admin" navItems={NAV_ITEMS.admin}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">View and manage platform users.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-5 text-center">
                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-2xl font-bold">{totalUsers}</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <UserCheck className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                        <p className="text-2xl font-bold">{verifiedCount}</p>
                        <p className="text-xs text-muted-foreground">Verified</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <p className="text-2xl font-bold">{borrowerCount}</p>
                        <p className="text-xs text-muted-foreground">Borrowers</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-5 text-center">
                        <p className="text-2xl font-bold">{lenderCount}</p>
                        <p className="text-xs text-muted-foreground">Lenders</p>
                    </CardContent></Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Wallet</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Risk Score</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user) => (
                                        <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                            </td>
                                            <td className="p-3 font-mono text-xs">
                                                {user.wallet ? (
                                                    <span className="flex items-center gap-1">
                                                        <Wallet className="h-3 w-3" />
                                                        {user.wallet}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Not connected</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {user.riskScore !== null ? (
                                                    <span className={`font-semibold ${user.riskScore >= 700 ? "text-emerald-500" : user.riskScore >= 500 ? "text-amber-500" : "text-red-500"}`}>
                                                        {user.riskScore}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={user.status === "verified" ? "success" : user.status === "pending" ? "warning" : "destructive"} className="capitalize">
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-muted-foreground">
                                                {format(new Date(user.joinedAt), "MMM d, yyyy")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
