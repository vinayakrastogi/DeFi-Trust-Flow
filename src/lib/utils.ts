import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

export function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

export function shortenAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getRiskColor(score: number): string {
    if (score >= 750) return "text-emerald-500";
    if (score >= 600) return "text-green-500";
    if (score >= 450) return "text-yellow-500";
    if (score >= 300) return "text-orange-500";
    return "text-red-500";
}

export function getRiskBgColor(score: number): string {
    if (score >= 750) return "bg-emerald-500";
    if (score >= 600) return "bg-green-500";
    if (score >= 450) return "bg-yellow-500";
    if (score >= 300) return "bg-orange-500";
    return "bg-red-500";
}

export function getRiskLabel(score: number): string {
    if (score >= 750) return "Excellent";
    if (score >= 600) return "Good";
    if (score >= 450) return "Fair";
    if (score >= 300) return "Poor";
    return "Very Poor";
}

export function calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termMonths: number
): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return (
        (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
}

export function generateLoanId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "LN-";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function generateBorrowerId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BRW-${num}`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatEth(value: string | number): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0 ETH";
    return `${num.toFixed(4)} ETH`;
}
