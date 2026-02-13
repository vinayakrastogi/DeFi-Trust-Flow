"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp, DollarSign, PieChart, BarChart3,
    ArrowUpRight, ArrowDownRight, Wallet,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RechartPie, Pie, Cell,
} from "recharts";

const earningsData = [
    { month: "Sep", earnings: 32 }, { month: "Oct", earnings: 48 },
    { month: "Nov", earnings: 65 }, { month: "Dec", earnings: 89 },
    { month: "Jan", earnings: 110 }, { month: "Feb", earnings: 135 },
];

const portfolioDistribution = [
    { name: "Low Risk (750+)", value: 55, color: "#10b981" },
    { name: "Medium Risk (600-749)", value: 30, color: "#3b82f6" },
    { name: "High Risk (450-599)", value: 12, color: "#f59e0b" },
    { name: "Very High (<450)", value: 3, color: "#ef4444" },
];

const recentInvestments = [
    { id: "1", loanId: "LN-A7B3C2", borrowerScore: 780, amount: 200, rate: 9.5, term: 6, status: "active", purpose: "Education" },
    { id: "2", loanId: "LN-K4M2P8", borrowerScore: 650, amount: 150, rate: 13.0, term: 9, status: "active", purpose: "Business" },
    { id: "3", loanId: "LN-R6S1T5", borrowerScore: 820, amount: 300, rate: 8.0, term: 3, status: "completed", purpose: "Personal" },
    { id: "4", loanId: "LN-W3X9Y7", borrowerScore: 550, amount: 100, rate: 19.0, term: 12, status: "active", purpose: "Medical" },
    { id: "5", loanId: "LN-B2C8D4", borrowerScore: 710, amount: 250, rate: 11.0, term: 6, status: "active", purpose: "Business" },
];

export default function LenderDashboard() {
    const totalInvested = recentInvestments.reduce((s, i) => s + i.amount, 0);
    const activeInvestments = recentInvestments.filter((i) => i.status === "active");
    const totalInterestEarned = 135.42;
    const portfolioValue = totalInvested + totalInterestEarned;
    const avgReturn = 11.6;

    return (
        <DashboardLayout role="lender" navItems={NAV_ITEMS.lender}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Lender Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your investments, track returns, and explore the marketplace.
                        </p>
                    </div>
                    <Link href="/lender/marketplace">
                        <Button variant="gradient" className="group">
                            Browse Marketplace
                            <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Portfolio Value</p>
                                    <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
                                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        +{formatPercent(avgReturn)} APY
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <DollarSign className="h-7 w-7 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Invested</p>
                                    <p className="text-3xl font-bold">{formatCurrency(totalInvested)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Across {activeInvestments.length} active loans
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Wallet className="h-7 w-7 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Interest Earned</p>
                                    <p className="text-3xl font-bold text-emerald-500">{formatCurrency(totalInterestEarned)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-7 w-7 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Return</p>
                                    <p className="text-3xl font-bold">{formatPercent(avgReturn)}</p>
                                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        +2.1% vs platform avg
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <BarChart3 className="h-7 w-7 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Earnings Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Monthly Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={earningsData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                                color: "hsl(var(--foreground))",
                                            }}
                                            formatter={(value) => [`$${value}`, "Earnings"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="earnings"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Risk Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartPie>
                                        <Pie
                                            data={portfolioDistribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            innerRadius={50}
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {portfolioDistribution.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                                color: "hsl(var(--foreground))",
                                            }}
                                            formatter={(value) => [`${value}%`, "Portfolio"]}
                                        />
                                    </RechartPie>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4">
                                {portfolioDistribution.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-muted-foreground text-xs">{item.name}</span>
                                        </div>
                                        <span className="font-medium text-xs">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Investments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Investments</CardTitle>
                        <Link href="/lender/portfolio">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Loan ID</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Risk Score</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Rate</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Term</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Purpose</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentInvestments.map((inv) => (
                                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-2 font-mono">{inv.loanId}</td>
                                            <td className="py-3 px-2">
                                                <Badge
                                                    variant={inv.borrowerScore >= 700 ? "success" : inv.borrowerScore >= 500 ? "warning" : "destructive"}
                                                >
                                                    {inv.borrowerScore}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 font-medium">{formatCurrency(inv.amount)}</td>
                                            <td className="py-3 px-2">{inv.rate}%</td>
                                            <td className="py-3 px-2">{inv.term}mo</td>
                                            <td className="py-3 px-2">{inv.purpose}</td>
                                            <td className="py-3 px-2">
                                                <Badge variant={inv.status === "completed" ? "success" : "info"}>
                                                    {inv.status}
                                                </Badge>
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
