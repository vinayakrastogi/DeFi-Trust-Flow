"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Shield,
    TrendingUp,
    Users,
    Zap,
    ArrowRight,
    CheckCircle2,
    Lock,
    BarChart3,
    Wallet,
    Globe,
    ChevronRight,
    Star,
    Brain,
    Coins,
    HandshakeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PLATFORM_STATS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

// Animated counter component
function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const increment = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return (
        <span ref={ref}>
            {prefix}
            {formatNumber(count)}
            {suffix}
        </span>
    );
}

// Intersection observer for fade-in
function FadeIn({ children, className = "", delay = 0 }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${className}`}
        >
            {children}
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">TrustFlow</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                How It Works
                            </a>
                            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Stats
                            </a>
                            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                FAQ
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button variant="gradient" size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <FadeIn>
                            <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm">
                                <Zap className="h-3 w-3 mr-1" />
                                AI-Powered DeFi Lending Protocol
                            </Badge>
                        </FadeIn>

                        <FadeIn delay={100}>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                                Lending Without{" "}
                                <span className="text-gradient">Barriers</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={200}>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                                TrustFlow breaks the Collateral Paradox with AI-driven risk
                                scoring. Get under-collateralized loans based on your on-chain
                                reputation, not just your crypto holdings.
                            </p>
                        </FadeIn>

                        <FadeIn delay={300}>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/auth/register?role=borrower">
                                    <Button variant="gradient" size="xl" className="group">
                                        Apply for a Loan
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/auth/register?role=lender">
                                    <Button variant="outline" size="xl" className="group">
                                        Start Lending
                                        <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </FadeIn>

                        <FadeIn delay={400}>
                            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    No credit check required
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    As low as 6% APR
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Smart contract secured
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Platform Stats */}
            <section id="stats" className="py-16 border-y bg-muted/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {[
                            { label: "Total Disbursed", value: PLATFORM_STATS.totalDisbursed, prefix: "$" },
                            { label: "Active Lenders", value: PLATFORM_STATS.totalLenders },
                            { label: "Loans Funded", value: PLATFORM_STATS.totalLoans },
                            { label: "Avg. Interest Rate", value: PLATFORM_STATS.averageRate, suffix: "%" },
                            { label: "Success Rate", value: PLATFORM_STATS.successRate, suffix: "%" },
                        ].map((stat, i) => (
                            <FadeIn key={stat.label} delay={i * 100}>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-foreground">
                                        <AnimatedCounter
                                            end={stat.value}
                                            prefix={stat.prefix}
                                            suffix={stat.suffix}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <Badge variant="outline" className="mb-4">How It Works</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Three Steps to Financial Freedom
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Whether you&#39;re borrowing or lending, TrustFlow makes DeFi
                                simple, transparent, and fair.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        {/* Borrower Steps */}
                        <div>
                            <FadeIn>
                                <h3 className="text-2xl font-semibold mb-8 flex items-center gap-2">
                                    <Wallet className="h-6 w-6 text-blue-500" />
                                    For Borrowers
                                </h3>
                            </FadeIn>
                            <div className="space-y-6">
                                {[
                                    {
                                        step: "01",
                                        title: "Build Your Trust Score",
                                        desc: "Connect your wallet and verify your identity. Our AI analyzes your on-chain activity, social profiles, and financial data to create a comprehensive trust score.",
                                        icon: Brain,
                                    },
                                    {
                                        step: "02",
                                        title: "Apply for a Loan",
                                        desc: "Choose your loan amount ($50-$5,000), term, and preferred currency. Optionally add partial collateral for better rates.",
                                        icon: Coins,
                                    },
                                    {
                                        step: "03",
                                        title: "Get Funded & Repay",
                                        desc: "Lenders fund your loan through smart contracts. Make monthly repayments to build your score and unlock even better terms.",
                                        icon: HandshakeIcon,
                                    },
                                ].map((item, i) => (
                                    <FadeIn key={item.step} delay={i * 150}>
                                        <div className="flex gap-4 group">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>

                        {/* Lender Steps */}
                        <div>
                            <FadeIn>
                                <h3 className="text-2xl font-semibold mb-8 flex items-center gap-2">
                                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                                    For Lenders
                                </h3>
                            </FadeIn>
                            <div className="space-y-6">
                                {[
                                    {
                                        step: "01",
                                        title: "Deposit Funds",
                                        desc: "Connect your wallet and deposit USDC, USDT, or DAI. Your funds are secured by audited smart contracts.",
                                        icon: Wallet,
                                    },
                                    {
                                        step: "02",
                                        title: "Browse & Invest",
                                        desc: "Explore the loan marketplace. Filter by risk score, interest rate, and loan term. Invest in individual loans or set up auto-invest.",
                                        icon: BarChart3,
                                    },
                                    {
                                        step: "03",
                                        title: "Earn Returns",
                                        desc: "Receive monthly interest payments. Track your portfolio performance with real-time analytics and diversify for optimal returns.",
                                        icon: TrendingUp,
                                    },
                                ].map((item, i) => (
                                    <FadeIn key={item.step} delay={i * 150}>
                                        <div className="flex gap-4 group">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-success flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-4 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <Badge variant="outline" className="mb-4">Features</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Built for the Future of Finance
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                A comprehensive suite of tools designed to make decentralized
                                lending accessible, secure, and profitable.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Brain,
                                title: "AI Risk Scoring",
                                desc: "Our proprietary algorithm analyzes 20+ data points across on-chain activity, identity verification, and social proof to generate accurate risk assessments.",
                                color: "from-blue-500 to-indigo-500",
                            },
                            {
                                icon: Shield,
                                title: "Under-Collateralized Loans",
                                desc: "Access loans with as little as 0-20% collateral. Your trust score is your collateral, opening DeFi lending to everyone.",
                                color: "from-purple-500 to-pink-500",
                            },
                            {
                                icon: Lock,
                                title: "Smart Contract Security",
                                desc: "All loans are managed by audited smart contracts on Polygon. Funds are secured, transparent, and automatically enforced.",
                                color: "from-emerald-500 to-teal-500",
                            },
                            {
                                icon: BarChart3,
                                title: "Real-Time Analytics",
                                desc: "Comprehensive dashboards for both borrowers and lenders. Track risk scores, portfolio performance, and market trends.",
                                color: "from-amber-500 to-orange-500",
                            },
                            {
                                icon: Zap,
                                title: "Auto-Invest",
                                desc: "Configure automated investment strategies. Set your risk tolerance and let our matching algorithm build your portfolio.",
                                color: "from-cyan-500 to-blue-500",
                            },
                            {
                                icon: Globe,
                                title: "Multi-Currency Support",
                                desc: "Borrow and lend in USDC, USDT, or DAI. Seamlessly switch between stablecoins with live exchange rates.",
                                color: "from-rose-500 to-red-500",
                            },
                        ].map((feature, i) => (
                            <FadeIn key={feature.title} delay={i * 100}>
                                <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
                                    <CardContent className="p-6">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                        >
                                            <feature.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <Badge variant="outline" className="mb-4">Testimonials</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Trusted by Thousands
                            </h2>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Alex Chen",
                                role: "Borrower",
                                text: "TrustFlow gave me access to my first DeFi loan with just 15% collateral. My risk score is now 780 and climbing!",
                                score: 780,
                            },
                            {
                                name: "Sarah Miller",
                                role: "Lender",
                                text: "I've been earning 12% APY consistently on my stablecoin portfolio. The auto-invest feature is a game changer.",
                                score: null,
                            },
                            {
                                name: "Raj Patel",
                                role: "Borrower & Lender",
                                text: "Coming from a country with limited banking, TrustFlow was the first platform that didn't require traditional credit history.",
                                score: 690,
                            },
                        ].map((testimonial, i) => (
                            <FadeIn key={testimonial.name} delay={i * 100}>
                                <Card className="h-full hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, j) => (
                                                <Star
                                                    key={j}
                                                    className="h-4 w-4 fill-amber-400 text-amber-400"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground mb-6 italic leading-relaxed">
                                            &quot;{testimonial.text}&quot;
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {testimonial.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                            {testimonial.score && (
                                                <Badge variant="success">
                                                    Score: {testimonial.score}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-4 bg-muted/30">
                <div className="max-w-3xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4">FAQ</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Frequently Asked Questions
                            </h2>
                        </div>
                    </FadeIn>

                    <FadeIn delay={200}>
                        <Accordion type="single" collapsible className="space-y-2">
                            {[
                                {
                                    q: "What is the Collateral Paradox?",
                                    a: "Traditional DeFi lending requires 150%+ collateral, meaning you need more crypto than you want to borrow. This defeats the purpose for those who need financing. TrustFlow solves this by using AI risk scoring as a trust layer, enabling loans with 0-40% collateral.",
                                },
                                {
                                    q: "How does the AI risk scoring work?",
                                    a: "Our algorithm analyzes 20+ data points across 5 categories: on-chain activity (wallet age, transaction history, DeFi usage), identity verification (KYC, email, phone), social proof (Twitter, LinkedIn), financial stability (employment, income), and collateral/platform history. Each category contributes to a 1000-point score.",
                                },
                                {
                                    q: "What interest rates can I expect?",
                                    a: "Interest rates range from 6% to 35% APR based on your risk score, loan term, and collateral provided. Borrowers with scores above 750 get rates as low as 6-8%. Adding collateral can reduce your rate further.",
                                },
                                {
                                    q: "Is my money safe as a lender?",
                                    a: "All loans are managed by audited smart contracts on the Polygon blockchain. Borrower risk is assessed by our AI, and partial collateral provides an additional safety net. Historically, our platform has maintained a 97.2% repayment success rate.",
                                },
                                {
                                    q: "Which currencies are supported?",
                                    a: "TrustFlow supports USDC, USDT, and DAI for both borrowing and lending. All three stablecoins are pegged to USD.",
                                },
                                {
                                    q: "How do I improve my risk score?",
                                    a: "Complete KYC verification, connect social accounts, maintain regular on-chain activity, repay loans on time, add collateral, and provide references. Each action adds points to your score across different categories.",
                                },
                                {
                                    q: "What happens if a borrower defaults?",
                                    a: "If a borrower misses payments, they receive automated reminders. After the grace period, collateral (if provided) is liquidated and distributed to lenders. Defaulted loans are marked on the borrower's record, preventing future borrowing until resolved.",
                                },
                            ].map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
                                    <AccordionTrigger className="text-left text-sm">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </FadeIn>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh opacity-50" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <FadeIn>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Break Free from the{" "}
                            <span className="text-gradient">Collateral Paradox</span>?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of borrowers and lenders building a more inclusive
                            financial future on TrustFlow.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register?role=borrower">
                                <Button variant="gradient" size="xl" className="group">
                                    Apply for a Loan
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/auth/register?role=lender">
                                <Button variant="outline" size="xl">
                                    Become a Lender
                                    <ChevronRight className="ml-1 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">TrustFlow</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Breaking the Collateral Paradox with AI-powered DeFi
                                micro-lending. Building a more inclusive financial future.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                                <li><a href="#stats" className="hover:text-foreground transition-colors">Statistics</a></li>
                                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Smart Contracts</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Disclaimer</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                        <p>© 2025 TrustFlow. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
                            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
                            <a href="#" className="hover:text-foreground transition-colors">Telegram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
