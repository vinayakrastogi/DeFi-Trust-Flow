import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoanStatus = "pending" | "approved" | "funding" | "active" | "repaid" | "defaulted" | "rejected";

export interface DemoLoan {
    id: string;
    loanId: string;
    borrowerAddress: string;
    borrowerName: string;
    amount: number;
    currency: string;
    interestRate: number;
    termMonths: number;
    collateralPercent: number;
    purpose: string;
    description: string;
    status: LoanStatus;
    riskScore: number;
    fundingProgress: number;
    totalRepaid: number;
    monthlyPayment: number;
    nextPaymentDue: string;
    createdAt: string;
    fundedAt?: string;
    investors: DemoInvestment[];
}

export interface DemoInvestment {
    id: string;
    loanId: string;
    lenderAddress: string;
    lenderName: string;
    amount: number;
    createdAt: string;
}

export interface DemoRepayment {
    id: string;
    loanId: string;
    borrowerAddress: string;
    amount: number;
    createdAt: string;
}

export interface AutoInvestSettings {
    enabled: boolean;
    maxAmount: number;
    minRiskScore: number;
    maxRiskScore: number;
    preferredTerms: number[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let counter = 100;
const genId = () => `${Date.now()}-${++counter}`;
const genLoanId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "LN-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
};

function calcMonthlyPayment(amount: number, rate: number, months: number) {
    const r = rate / 100 / 12;
    if (r === 0) return amount / months;
    return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function futureDate(daysFromNow: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString();
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_LOANS: DemoLoan[] = [
    {
        id: "seed-1", loanId: "LN-A7B3C2",
        borrowerAddress: "0xSeedBorrower1", borrowerName: "Alex C.",
        amount: 1500, currency: "USDC", interestRate: 10.5, termMonths: 6,
        collateralPercent: 15, purpose: "Education",
        description: "Online blockchain development course and certification.",
        status: "active", riskScore: 720, fundingProgress: 100,
        totalRepaid: 530, monthlyPayment: 259.58,
        nextPaymentDue: futureDate(5), createdAt: futureDate(-60),
        fundedAt: futureDate(-55),
        investors: [
            { id: "inv-s1", loanId: "LN-A7B3C2", lenderAddress: "0xSeedLender1", lenderName: "Sarah M.", amount: 1500, createdAt: futureDate(-55) },
        ],
    },
    {
        id: "seed-2", loanId: "LN-D9E4F1",
        borrowerAddress: "0xSeedBorrower1", borrowerName: "Alex C.",
        amount: 800, currency: "USDT", interestRate: 12.0, termMonths: 3,
        collateralPercent: 10, purpose: "Business",
        description: "Inventory purchase for small e-commerce store.",
        status: "active", riskScore: 720, fundingProgress: 100,
        totalRepaid: 290, monthlyPayment: 275.47,
        nextPaymentDue: futureDate(10), createdAt: futureDate(-45),
        fundedAt: futureDate(-40),
        investors: [
            { id: "inv-s2", loanId: "LN-D9E4F1", lenderAddress: "0xSeedLender1", lenderName: "Sarah M.", amount: 500, createdAt: futureDate(-40) },
            { id: "inv-s3", loanId: "LN-D9E4F1", lenderAddress: "0xSeedLender2", lenderName: "Mike R.", amount: 300, createdAt: futureDate(-39) },
        ],
    },
    {
        id: "seed-3", loanId: "LN-G5H8J6",
        borrowerAddress: "0xSeedBorrower2", borrowerName: "Raj P.",
        amount: 2000, currency: "USDC", interestRate: 14.0, termMonths: 9,
        collateralPercent: 20, purpose: "Medical",
        description: "Medical treatment expenses not covered by insurance.",
        status: "funding", riskScore: 620, fundingProgress: 65,
        totalRepaid: 0, monthlyPayment: 234.89,
        nextPaymentDue: "", createdAt: futureDate(-5),
        investors: [
            { id: "inv-s4", loanId: "LN-G5H8J6", lenderAddress: "0xSeedLender1", lenderName: "Sarah M.", amount: 1300, createdAt: futureDate(-3) },
        ],
    },
];

const SEED_REPAYMENTS: DemoRepayment[] = [
    { id: "rep-s1", loanId: "LN-A7B3C2", borrowerAddress: "0xSeedBorrower1", amount: 259.58, createdAt: futureDate(-30) },
    { id: "rep-s2", loanId: "LN-A7B3C2", borrowerAddress: "0xSeedBorrower1", amount: 270.42, createdAt: futureDate(-1) },
    { id: "rep-s3", loanId: "LN-D9E4F1", borrowerAddress: "0xSeedBorrower1", amount: 290.00, createdAt: futureDate(-15) },
];

// ─── Store ───────────────────────────────────────────────────────────────────

interface DemoState {
    loans: DemoLoan[];
    repayments: DemoRepayment[];
    autoInvestSettings: AutoInvestSettings;

    // Actions
    createLoan: (loan: Omit<DemoLoan, "id" | "loanId" | "status" | "fundingProgress" | "totalRepaid" | "monthlyPayment" | "nextPaymentDue" | "createdAt" | "investors">) => string;
    fundLoan: (loanId: string, investment: Omit<DemoInvestment, "id" | "createdAt">) => void;
    makeRepayment: (loanId: string, borrowerAddress: string, amount: number) => void;
    approveLoan: (loanId: string) => void;
    rejectLoan: (loanId: string) => void;
    setAutoInvestSettings: (settings: Partial<AutoInvestSettings>) => void;
    resetStore: () => void;

    // Selectors
    getLoansByBorrower: (address: string) => DemoLoan[];
    getLoansByLender: (address: string) => DemoLoan[];
    getInvestmentsByLender: (address: string) => DemoInvestment[];
    getFundableLoans: () => DemoLoan[];
    getAllLoans: () => DemoLoan[];
}

export const useDemoStore = create<DemoState>()(
    persist(
        (set, get) => ({
            loans: SEED_LOANS,
            repayments: SEED_REPAYMENTS,
            autoInvestSettings: {
                enabled: false,
                maxAmount: 500,
                minRiskScore: 600,
                maxRiskScore: 1000,
                preferredTerms: [3, 6, 9, 12],
            },

            createLoan: (loanData) => {
                const loanId = genLoanId();
                const monthlyPayment = calcMonthlyPayment(loanData.amount, loanData.interestRate, loanData.termMonths);
                const newLoan: DemoLoan = {
                    ...loanData,
                    id: genId(),
                    loanId,
                    status: "funding",
                    fundingProgress: 0,
                    totalRepaid: 0,
                    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                    nextPaymentDue: "",
                    createdAt: new Date().toISOString(),
                    investors: [],
                };
                set((state) => ({ loans: [newLoan, ...state.loans] }));
                return loanId;
            },

            fundLoan: (loanId, investmentData) => {
                set((state) => {
                    const loans = state.loans.map((loan) => {
                        if (loan.loanId !== loanId) return loan;
                        const investment: DemoInvestment = {
                            ...investmentData,
                            id: genId(),
                            createdAt: new Date().toISOString(),
                        };
                        const newInvestors = [...loan.investors, investment];
                        const totalFunded = newInvestors.reduce((s, i) => s + i.amount, 0);
                        const progress = Math.min(100, Math.round((totalFunded / loan.amount) * 100));
                        const isFull = totalFunded >= loan.amount;
                        return {
                            ...loan,
                            investors: newInvestors,
                            fundingProgress: progress,
                            status: isFull ? "active" as const : loan.status,
                            fundedAt: isFull ? new Date().toISOString() : loan.fundedAt,
                            nextPaymentDue: isFull ? futureDate(30) : loan.nextPaymentDue,
                        };
                    });
                    return { loans };
                });
            },

            makeRepayment: (loanId, borrowerAddress, amount) => {
                const repayment: DemoRepayment = {
                    id: genId(),
                    loanId,
                    borrowerAddress,
                    amount,
                    createdAt: new Date().toISOString(),
                };
                set((state) => {
                    const repayments = [repayment, ...state.repayments];
                    const loans = state.loans.map((loan) => {
                        if (loan.loanId !== loanId) return loan;
                        const newTotalRepaid = loan.totalRepaid + amount;
                        const totalOwed = loan.amount * (1 + loan.interestRate / 100 * (loan.termMonths / 12));
                        const isRepaid = newTotalRepaid >= totalOwed;
                        return {
                            ...loan,
                            totalRepaid: Math.round(newTotalRepaid * 100) / 100,
                            status: isRepaid ? "repaid" as const : loan.status,
                            nextPaymentDue: isRepaid ? "" : futureDate(30),
                        };
                    });
                    return { loans, repayments };
                });
            },

            approveLoan: (loanId) => {
                set((state) => ({
                    loans: state.loans.map((l) =>
                        l.loanId === loanId ? { ...l, status: "funding" as const } : l
                    ),
                }));
            },

            rejectLoan: (loanId) => {
                set((state) => ({
                    loans: state.loans.map((l) =>
                        l.loanId === loanId ? { ...l, status: "rejected" as const } : l
                    ),
                }));
            },

            setAutoInvestSettings: (settings) => {
                set((state) => ({
                    autoInvestSettings: { ...state.autoInvestSettings, ...settings },
                }));
            },

            resetStore: () => {
                set({ loans: SEED_LOANS, repayments: SEED_REPAYMENTS });
            },

            // Selectors
            getLoansByBorrower: (address) => get().loans.filter((l) => l.borrowerAddress.toLowerCase() === address.toLowerCase()),
            getLoansByLender: (address) => get().loans.filter((l) => l.investors.some((i) => i.lenderAddress.toLowerCase() === address.toLowerCase())),
            getInvestmentsByLender: (address) => get().loans.flatMap((l) => l.investors.filter((i) => i.lenderAddress.toLowerCase() === address.toLowerCase())),
            getFundableLoans: () => get().loans.filter((l) => l.status === "funding"),
            getAllLoans: () => get().loans,
        }),
        { name: "trustflow-demo" }
    )
);
