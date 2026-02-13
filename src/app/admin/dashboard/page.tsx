"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Users, DollarSign, Shield, TrendingUp, AlertTriangle,
    CheckCircle2, Clock, Activity, ArrowUpRight, ArrowDownRight,
    FileText, Eye, BarChart3,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

const platformMetrics = {
    totalUsers: 2847,
    activeLoans: 156,
    totalDisbursed: 425000,
    repaymentRate: 97.2,
    avgRiskScore: 685,
    pendingApplications: 12,
    defaultRate: 2.8,
    monthlyGrowth: 14.5,
};

const recentActivity = [
    { type: "loan_created", user: "alexc.eth", amount: 1500, time: "2 min ago", status: "pending" },
    { type: "payment", user: "john.doe", amount: 275, time: "15 min ago", status: "completed" },
    { type: "investment", user: "sarah.m", amount: 500, time: "32 min ago", status: "completed" },
    { type: "kyc_submitted", user: "raj.p", amount: 0, time: "1 hr ago", status: "review" },
    { type: "loan_funded", user: "maria.k", amount: 2000, time: "2 hrs ago", status: "active" },
    { type: "default_warning", user: "anon.xyz", amount: 800, time: "3 hrs ago", status: "warning" },
];

const activityIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    loan_created: { icon: FileText, color: "text-blue-500" },
    payment: { icon: DollarSign, color: "text-emerald-500" },
    investment: { icon: TrendingUp, color: "text-purple-500" },
    kyc_submitted: { icon: Shield, color: "text-amber-500" },
    loan_funded: { icon: CheckCircle2, color: "text-emerald-500" },
    default_warning: { icon: AlertTriangle, color: "text-red-500" },
};

const activityLabels: Record<string, string> = {
    loan_created: "Loan application submitted",
    payment: "Repayment received",
    investment: "New investment made",
    kyc_submitted: "KYC document submitted",
    loan_funded: "Loan fully funded",
    default_warning: "Default warning issued",
};

export default function AdminDashboard() {
    return (
        <DashboardLayout role="admin" navItems={NAV_ITEMS.admin}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Platform overview and management console
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-3xl font-bold">{formatNumber(platformMetrics.totalUsers)}</p>
                                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        +{platformMetrics.monthlyGrowth}% this month
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Users className="h-7 w-7 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Disbursed</p>
                                    <p className="text-3xl font-bold">{formatCurrency(platformMetrics.totalDisbursed)}</p>
                                    <p className="text-xs text-emerald-500 mt-1">
                                        {platformMetrics.activeLoans} active loans
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <DollarSign className="h-7 w-7 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Repayment Rate</p>
                                    <p className="text-3xl font-bold text-emerald-500">{platformMetrics.repaymentRate}%</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Default rate: {platformMetrics.defaultRate}%
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                                    <p className="text-3xl font-bold text-amber-500">{platformMetrics.pendingApplications}</p>
                                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Action required
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <AlertTriangle className="h-7 w-7 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Platform Health */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Platform Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Average Risk Score", value: platformMetrics.avgRiskScore, max: 1000, color: "bg-blue-500" },
                                { label: "Repayment Rate", value: platformMetrics.repaymentRate, max: 100, color: "bg-emerald-500" },
                                { label: "Default Rate", value: platformMetrics.defaultRate, max: 10, color: "bg-red-500" },
                                { label: "User Growth (Monthly)", value: platformMetrics.monthlyGrowth, max: 50, color: "bg-purple-500" },
                            ].map((metric) => (
                                <div key={metric.label}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">{metric.label}</span>
                                        <span className="font-medium">
                                            {metric.label.includes("Rate") || metric.label.includes("Growth")
                                                ? `${metric.value}%`
                                                : metric.value}
                                        </span>
                                    </div>
                                    <Progress
                                        value={(metric.value / metric.max) * 100}
                                        indicatorClassName={metric.color}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivity.map((activity, i) => {
                                    const config = activityIcons[activity.type];
                                    const Icon = config?.icon || FileText;
                                    return (
                                        <div key={i} className="flex items-start gap-3 group">
                                            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`h-4 w-4 ${config?.color || "text-muted-foreground"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">
                                                    <span className="font-medium">{activity.user}</span>{" "}
                                                    <span className="text-muted-foreground">
                                                        {activityLabels[activity.type]}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{activity.time}</span>
                                                    {activity.amount > 0 && (
                                                        <span className="font-medium text-foreground">
                                                            {formatCurrency(activity.amount)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    activity.status === "completed" ? "success" :
                                                        activity.status === "warning" ? "destructive" :
                                                            activity.status === "review" ? "warning" :
                                                                "outline"
                                                }
                                                className="text-xs flex-shrink-0"
                                            >
                                                {activity.status}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Review Applications", icon: FileText, count: 12, color: "from-blue-500 to-indigo-500" },
                                { label: "KYC Verification", icon: Shield, count: 5, color: "from-amber-500 to-orange-500" },
                                { label: "View All Users", icon: Users, count: null, color: "from-purple-500 to-pink-500" },
                                { label: "Risk Analytics", icon: BarChart3, count: null, color: "from-emerald-500 to-teal-500" },
                            ].map((action) => (
                                <Button
                                    key={action.label}
                                    variant="outline"
                                    className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium">{action.label}</span>
                                    {action.count && (
                                        <Badge variant="destructive" className="text-xs">{action.count}</Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
