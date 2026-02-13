"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Shield, Mail, Lock, ArrowRight, Wallet, Eye, EyeOff,
    User, Briefcase, Users as UsersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const roles = [
    { id: "borrower", label: "Borrower", desc: "Apply for micro-loans", icon: User },
    { id: "lender", label: "Lender", desc: "Invest in loans & earn returns", icon: Briefcase },
    { id: "both", label: "Both", desc: "Borrow and lend", icon: UsersIcon },
];

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const defaultRole = searchParams.get("role") || "borrower";

    const [selectedRole, setSelectedRole] = useState(defaultRole);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            router.push(selectedRole === "lender" ? "/lender/dashboard" : "/borrower/dashboard");
        }
    }, [isConnected, address, router, selectedRole]);

    const handleWalletConnect = () => {
        if (openConnectModal) {
            openConnectModal();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            if (selectedRole === "lender") {
                router.push("/lender/dashboard");
            } else {
                router.push("/borrower/dashboard");
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            <div className="absolute inset-0 gradient-mesh" />

            <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>
                        Join TrustFlow and start your DeFi journey
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label>I want to</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={cn(
                                        "p-3 rounded-lg border text-center transition-all duration-200",
                                        selectedRole === role.id
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/50 text-muted-foreground"
                                    )}
                                >
                                    <role.icon className="h-5 w-5 mx-auto mb-1" />
                                    <div className="text-xs font-medium">{role.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-12 text-base"
                        onClick={handleWalletConnect}
                        disabled={loading}
                    >
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect Wallet
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or sign up with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading}>
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-xs text-center text-muted-foreground">
                        By creating an account, you agree to our{" "}
                        <a href="#" className="text-primary hover:underline">Terms</a>
                        {" "}and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>

                    <div className="text-center text-sm text-muted-foreground">
                        <span>Already have an account? </span>
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
