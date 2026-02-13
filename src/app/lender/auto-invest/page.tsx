"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Info, Shield, DollarSign } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AutoInvestPage() {
    const settings = useDemoStore((s) => s.autoInvestSettings);
    const setSettings = useDemoStore((s) => s.setAutoInvestSettings);

    const handleToggle = (enabled: boolean) => {
        setSettings({ enabled });
        toast.success(enabled ? "Auto-Invest enabled" : "Auto-Invest disabled");
    };

    const handleSave = () => {
        toast.success("Auto-Invest settings saved");
    };

    const termOptions = [3, 6, 9, 12, 18, 24];

    const toggleTerm = (t: number) => {
        const current = settings.preferredTerms;
        const updated = current.includes(t) ? current.filter((x) => x !== t) : [...current, t];
        setSettings({ preferredTerms: updated });
    };

    return (
        <DashboardLayout role="lender" navItems={NAV_ITEMS.lender}>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Zap className="h-7 w-7 text-amber-500" />
                        Auto-Invest
                    </h1>
                    <p className="text-muted-foreground">Automatically fund loans matching your criteria.</p>
                </div>

                {/* Main Toggle */}
                <Card className={settings.enabled ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${settings.enabled ? "bg-emerald-500/20" : "bg-muted"}`}>
                                    <Zap className={`h-5 w-5 ${settings.enabled ? "text-emerald-500" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                    <p className="font-medium">Auto-Invest</p>
                                    <p className="text-sm text-muted-foreground">{settings.enabled ? "Active — loans will be auto-funded" : "Disabled — manual mode"}</p>
                                </div>
                            </div>
                            <Switch checked={settings.enabled} onCheckedChange={handleToggle} />
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Investment Limits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Max Investment Per Loan</Label>
                            <Input
                                type="number"
                                value={settings.maxAmount}
                                onChange={(e) => setSettings({ maxAmount: Number(e.target.value) })}
                                min={50}
                                max={10000}
                            />
                            <p className="text-xs text-muted-foreground">Maximum amount to auto-invest in any single loan.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Risk Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Minimum Risk Score: {settings.minRiskScore}</Label>
                            <Slider
                                value={[settings.minRiskScore]}
                                onValueChange={([v]) => setSettings({ minRiskScore: v })}
                                min={0}
                                max={1000}
                                step={50}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>High Risk (0)</span>
                                <span>Low Risk (1000)</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Maximum Risk Score: {settings.maxRiskScore}</Label>
                            <Slider
                                value={[settings.maxRiskScore]}
                                onValueChange={([v]) => setSettings({ maxRiskScore: v })}
                                min={0}
                                max={1000}
                                step={50}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferred Loan Terms</CardTitle>
                        <CardDescription>Select which loan durations you want to auto-invest in.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {termOptions.map((t) => (
                                <Button
                                    key={t}
                                    variant={settings.preferredTerms.includes(t) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleTerm(t)}
                                >
                                    {t} months
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    <Button variant="gradient" onClick={handleSave}>Save Settings</Button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        <span>Settings are saved locally for this demo.</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
