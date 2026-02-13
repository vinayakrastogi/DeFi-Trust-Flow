"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Settings, Shield, DollarSign, Percent, Clock, AlertTriangle, Brain,
    Globe, Lock, Bell,
} from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <DashboardLayout role="admin" navItems={NAV_ITEMS.admin}>
            <div className="space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings className="h-7 w-7" />
                        Platform Settings
                    </h1>
                    <p className="text-muted-foreground">Configure platform parameters and risk model.</p>
                </div>

                {/* Loan Parameters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Loan Parameters</CardTitle>
                        <CardDescription>Configure loan amount and term limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Minimum Loan Amount</Label>
                            <Input value="$100" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Maximum Loan Amount</Label>
                            <Input value="$50,000" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum Term</Label>
                            <Input value="1 month" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Maximum Term</Label>
                            <Input value="24 months" disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Model */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-500" />
                            Risk Model Configuration
                            <Badge variant="outline" className="ml-auto">v2.1</Badge>
                        </CardTitle>
                        <CardDescription>AI risk scoring model weights and thresholds.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: "On-Chain Activity", weight: 30, color: "text-blue-500" },
                                { name: "Identity Verification", weight: 20, color: "text-emerald-500" },
                                { name: "Social Reputation", weight: 15, color: "text-purple-500" },
                                { name: "Financial History", weight: 20, color: "text-amber-500" },
                                { name: "Collateral & History", weight: 15, color: "text-pink-500" },
                            ].map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <span className={`font-medium text-sm ${cat.color}`}>{cat.name}</span>
                                    <Badge variant="outline">{cat.weight}%</Badge>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Min Score for Approval</Label>
                                <p className="text-lg font-bold text-emerald-500">400</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Base Interest Rate</Label>
                                <p className="text-lg font-bold">8.5%</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Max Risk Multiplier</Label>
                                <p className="text-lg font-bold text-amber-500">3.0x</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Structure */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" /> Fee Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-2xl font-bold">1.5%</p>
                            <p className="text-xs text-muted-foreground">Platform Fee</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-2xl font-bold">0.5%</p>
                            <p className="text-xs text-muted-foreground">Late Payment Fee</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 text-center">
                            <p className="text-2xl font-bold">0%</p>
                            <p className="text-xs text-muted-foreground">Early Repayment Fee</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Network & Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Network & Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-purple-500" />
                                <div>
                                    <p className="font-medium text-sm">Network</p>
                                    <p className="text-xs text-muted-foreground">Polygon Amoy Testnet</p>
                                </div>
                            </div>
                            <Badge variant="success">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-emerald-500" />
                                <div>
                                    <p className="font-medium text-sm">Smart Contracts</p>
                                    <p className="text-xs text-muted-foreground">Audited & Verified</p>
                                </div>
                            </div>
                            <Badge variant="success">Secure</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="font-medium text-sm">Notifications</p>
                                    <p className="text-xs text-muted-foreground">Email + In-App enabled</p>
                                </div>
                            </div>
                            <Badge variant="outline">On</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
