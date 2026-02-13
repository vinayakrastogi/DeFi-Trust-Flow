// Platform constants
export const PLATFORM_NAME = "TrustFlow";
export const PLATFORM_TAGLINE = "DeFi Micro-Lending, Reimagined";

export const SUPPORTED_CURRENCIES = [
    { symbol: "USDC", name: "USD Coin", icon: "💲" },
    { symbol: "USDT", name: "Tether", icon: "💵" },
    { symbol: "DAI", name: "Dai", icon: "🔶" },
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]["symbol"];

export const LOAN_PARAMS = {
    minAmount: 50,
    maxAmount: 5000,
    minTerm: 3,
    maxTerm: 12,
    maxCollateral: 40,
} as const;

export const LOAN_PURPOSES = [
    "Education",
    "Business",
    "Medical",
    "Emergency",
    "Personal",
    "Other",
] as const;
export type LoanPurpose = (typeof LOAN_PURPOSES)[number];

export const LOAN_TERMS = [3, 6, 9, 12] as const;
export type LoanTerm = (typeof LOAN_TERMS)[number];

export const EMPLOYMENT_STATUSES = [
    "Employed",
    "Self-Employed",
    "Student",
    "Unemployed",
] as const;

export const INCOME_RANGES = [
    "Under $20,000",
    "$20,000 - $35,000",
    "$35,000 - $50,000",
    "$50,000 - $75,000",
    "$75,000 - $100,000",
    "Over $100,000",
] as const;

export const LOAN_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    FUNDING: "funding",
    ACTIVE: "active",
    REPAID: "repaid",
    DEFAULTED: "defaulted",
    REJECTED: "rejected",
} as const;

export const KYC_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
} as const;

export const USER_ROLES = {
    BORROWER: "borrower",
    LENDER: "lender",
    BOTH: "both",
    ADMIN: "admin",
} as const;

export const MIN_LOAN_AMOUNT = 50;
export const MAX_LOAN_AMOUNT = 5000;
export const MIN_INVESTMENT = 10;
export const PLATFORM_FEE_PERCENT = 1.5;

export const RISK_SCORE_MAX = 1000;
export const RISK_CATEGORIES = {
    ON_CHAIN: { label: "On-Chain Activity", maxPoints: 250 },
    IDENTITY: { label: "Identity Verification", maxPoints: 200 },
    SOCIAL: { label: "Social Verification", maxPoints: 150 },
    FINANCIAL: { label: "Financial Stability", maxPoints: 200 },
    COLLATERAL: { label: "Collateral & History", maxPoints: 200 },
} as const;

// Mock platform stats
export const PLATFORM_STATS = {
    totalLoans: 2847,
    totalLenders: 1293,
    totalDisbursed: 4_200_000,
    averageRate: 11.5,
    successRate: 97.2,
    tvl: 8_500_000,
};

export const NAV_ITEMS = {
    borrower: [
        { label: "Dashboard", href: "/borrower/dashboard", icon: "LayoutDashboard" },
        { label: "Apply for Loan", href: "/borrower/apply", icon: "FileText" },
        { label: "My Loans", href: "/borrower/loans", icon: "Wallet" },
        { label: "Repayments", href: "/borrower/repay", icon: "CreditCard" },
        { label: "Risk Score", href: "/borrower/risk-score", icon: "Shield" },
    ],
    lender: [
        { label: "Dashboard", href: "/lender/dashboard", icon: "LayoutDashboard" },
        { label: "Marketplace", href: "/lender/marketplace", icon: "Store" },
        { label: "Portfolio", href: "/lender/portfolio", icon: "PieChart" },
        { label: "Auto-Invest", href: "/lender/auto-invest", icon: "Zap" },
    ],
    admin: [
        { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
        { label: "Users", href: "/admin/users", icon: "Users" },
        { label: "Loans", href: "/admin/loans", icon: "FileText" },
        { label: "Risk Model", href: "/admin/settings", icon: "Brain" },
        { label: "Settings", href: "/admin/settings", icon: "Settings" },
    ],
};
