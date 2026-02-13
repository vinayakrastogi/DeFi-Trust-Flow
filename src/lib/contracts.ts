// Contract ABI and address configuration for TrustFlowLending
// ABI is extracted from the Hardhat compilation artifacts

import { type Abi } from "viem";

// ─── Contract Address ────────────────────────────────────────────────────────

export const LENDING_CONTRACT_ADDRESS =
    (process.env.NEXT_PUBLIC_LENDING_CONTRACT_ADDRESS as `0x${string}`) || undefined;

// ─── Chain Config ────────────────────────────────────────────────────────────

export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia

// ─── Contract ABI ────────────────────────────────────────────────────────────

export const LENDING_ABI = [
    // ── Constructor ──
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    { type: "receive", stateMutability: "payable" },

    // ── Read Functions ──
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "platformFeeBps",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "loanCount",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalPlatformFees",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoan",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "id", type: "uint256" },
                    { name: "borrower", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "interestRate", type: "uint256" },
                    { name: "termMonths", type: "uint256" },
                    { name: "riskScore", type: "uint256" },
                    { name: "purpose", type: "string" },
                    { name: "status", type: "uint8" },
                    { name: "totalFunded", type: "uint256" },
                    { name: "totalRepaid", type: "uint256" },
                    { name: "createdAt", type: "uint256" },
                    { name: "fundedAt", type: "uint256" },
                    { name: "monthlyPayment", type: "uint256" },
                    { name: "platformFee", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoans",
        inputs: [
            { name: "_offset", type: "uint256" },
            { name: "_limit", type: "uint256" },
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "id", type: "uint256" },
                    { name: "borrower", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "interestRate", type: "uint256" },
                    { name: "termMonths", type: "uint256" },
                    { name: "riskScore", type: "uint256" },
                    { name: "purpose", type: "string" },
                    { name: "status", type: "uint8" },
                    { name: "totalFunded", type: "uint256" },
                    { name: "totalRepaid", type: "uint256" },
                    { name: "createdAt", type: "uint256" },
                    { name: "fundedAt", type: "uint256" },
                    { name: "monthlyPayment", type: "uint256" },
                    { name: "platformFee", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoanCount",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoanInvestments",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "lender", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "timestamp", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLoanRepayments",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "borrower", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "timestamp", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getBorrowerLoanIds",
        inputs: [{ name: "_borrower", type: "address" }],
        outputs: [{ name: "", type: "uint256[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getLenderInvestmentIds",
        inputs: [{ name: "_lender", type: "address" }],
        outputs: [{ name: "", type: "uint256[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getTotalOwed",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },

    // ── Write Functions ──
    {
        type: "function",
        name: "createLoan",
        inputs: [
            { name: "_amount", type: "uint256" },
            { name: "_interestRate", type: "uint256" },
            { name: "_termMonths", type: "uint256" },
            { name: "_riskScore", type: "uint256" },
            { name: "_purpose", type: "string" },
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "fundLoan",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "repayLoan",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "approveLoan",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "rejectLoan",
        inputs: [{ name: "_loanId", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "setPlatformFee",
        inputs: [{ name: "_newFeeBps", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "withdrawFees",
        inputs: [{ name: "_to", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "transferOwnership",
        inputs: [{ name: "_newOwner", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },

    // ── Events ──
    {
        type: "event",
        name: "LoanCreated",
        inputs: [
            { name: "loanId", type: "uint256", indexed: true },
            { name: "borrower", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "interestRate", type: "uint256", indexed: false },
            { name: "termMonths", type: "uint256", indexed: false },
            { name: "purpose", type: "string", indexed: false },
        ],
    },
    {
        type: "event",
        name: "LoanApproved",
        inputs: [{ name: "loanId", type: "uint256", indexed: true }],
    },
    {
        type: "event",
        name: "LoanRejected",
        inputs: [{ name: "loanId", type: "uint256", indexed: true }],
    },
    {
        type: "event",
        name: "LoanFunded",
        inputs: [
            { name: "loanId", type: "uint256", indexed: true },
            { name: "lender", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "totalFunded", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "LoanActivated",
        inputs: [{ name: "loanId", type: "uint256", indexed: true }],
    },
    {
        type: "event",
        name: "LoanRepayment",
        inputs: [
            { name: "loanId", type: "uint256", indexed: true },
            { name: "borrower", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "totalRepaid", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "LoanFullyRepaid",
        inputs: [{ name: "loanId", type: "uint256", indexed: true }],
    },
    {
        type: "event",
        name: "PlatformFeeUpdated",
        inputs: [{ name: "newFeeBps", type: "uint256", indexed: false }],
    },
    {
        type: "event",
        name: "FundsWithdrawn",
        inputs: [
            { name: "to", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
] as const satisfies Abi;

// ─── Status Mapping ──────────────────────────────────────────────────────────

export const LOAN_STATUS_MAP: Record<number, string> = {
    0: "pending",
    1: "approved",
    2: "funding",
    3: "active",
    4: "repaid",
    5: "rejected",
    6: "defaulted",
};
