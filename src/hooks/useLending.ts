"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "wagmi/chains";
import { LENDING_ABI, LENDING_CONTRACT_ADDRESS, LOAN_STATUS_MAP } from "@/lib/contracts";

const CHAIN_ID = sepolia.id; // 11155111

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContractLoan {
    id: number;
    borrower: string;
    amount: string;        // ETH string
    amountWei: bigint;
    interestRate: number;  // basis points
    interestRatePercent: number;
    termMonths: number;
    riskScore: number;
    purpose: string;
    status: string;
    statusCode: number;
    totalFunded: string;
    totalFundedWei: bigint;
    totalRepaid: string;
    totalRepaidWei: bigint;
    createdAt: number;
    fundedAt: number;
    monthlyPayment: string;
    monthlyPaymentWei: bigint;
    fundingProgress: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseLoan(raw: readonly [
    bigint, string, bigint, bigint, bigint, bigint, string,
    number, bigint, bigint, bigint, bigint, bigint, bigint
]): ContractLoan {
    const [id, borrower, amount, interestRate, termMonths, riskScore, purpose,
        status, totalFunded, totalRepaid, createdAt, fundedAt, monthlyPayment] = raw;

    const amountNum = Number(formatEther(amount));
    const fundedNum = Number(formatEther(totalFunded));

    return {
        id: Number(id),
        borrower,
        amount: formatEther(amount),
        amountWei: amount,
        interestRate: Number(interestRate),
        interestRatePercent: Number(interestRate) / 100,
        termMonths: Number(termMonths),
        riskScore: Number(riskScore),
        purpose,
        status: LOAN_STATUS_MAP[status] || "unknown",
        statusCode: status,
        totalFunded: formatEther(totalFunded),
        totalFundedWei: totalFunded,
        totalRepaid: formatEther(totalRepaid),
        totalRepaidWei: totalRepaid,
        createdAt: Number(createdAt),
        fundedAt: Number(fundedAt),
        monthlyPayment: formatEther(monthlyPayment),
        monthlyPaymentWei: monthlyPayment,
        fundingProgress: amountNum > 0 ? Math.round((fundedNum / amountNum) * 100) : 0,
    };
}

// ─── Check if contract is configured ─────────────────────────────────────────

export function useContractEnabled() {
    return !!LENDING_CONTRACT_ADDRESS;
}

// ─── Read Hooks ──────────────────────────────────────────────────────────────

export function useLoanCount() {
    return useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getLoanCount",
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS },
    });
}

export function useGetLoan(loanId: number | undefined) {
    const result = useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getLoan",
        args: loanId !== undefined ? [BigInt(loanId)] : undefined,
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS && loanId !== undefined },
    });

    return {
        ...result,
        loan: result.data ? parseLoan(result.data as any) : undefined,
    };
}

export function useGetLoans(offset: number, limit: number) {
    const result = useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getLoans",
        args: [BigInt(offset), BigInt(limit)],
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS },
    });

    return {
        ...result,
        loans: result.data ? (result.data as any[]).map(parseLoan) : [],
    };
}

export function useBorrowerLoanIds(address: string | undefined) {
    return useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getBorrowerLoanIds",
        args: address ? [address as `0x${string}`] : undefined,
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS && !!address },
    });
}

export function useLenderInvestmentIds(address: string | undefined) {
    return useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getLenderInvestmentIds",
        args: address ? [address as `0x${string}`] : undefined,
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS && !!address },
    });
}

export function useTotalOwed(loanId: number | undefined) {
    return useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "getTotalOwed",
        args: loanId !== undefined ? [BigInt(loanId)] : undefined,
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS && loanId !== undefined },
    });
}

export function useContractOwner() {
    return useReadContract({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_ABI,
        functionName: "owner",
        chainId: CHAIN_ID,
        query: { enabled: !!LENDING_CONTRACT_ADDRESS },
    });
}

// ─── Write Hooks ─────────────────────────────────────────────────────────────

export function useCreateLoan() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createLoan = (
        amountEth: string,
        interestRateBps: number,
        termMonths: number,
        riskScore: number,
        purpose: string
    ) => {
        if (!LENDING_CONTRACT_ADDRESS) return;
        writeContract({
            address: LENDING_CONTRACT_ADDRESS,
            abi: LENDING_ABI,
            functionName: "createLoan",
            chainId: CHAIN_ID,
            args: [
                parseEther(amountEth),
                BigInt(interestRateBps),
                BigInt(termMonths),
                BigInt(riskScore),
                purpose,
            ],
        });
    };

    return { createLoan, hash, isPending, isConfirming, isSuccess, error };
}

export function useFundLoan() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const fundLoan = (loanId: number, amountEth: string) => {
        if (!LENDING_CONTRACT_ADDRESS) return;
        writeContract({
            address: LENDING_CONTRACT_ADDRESS,
            abi: LENDING_ABI,
            functionName: "fundLoan",
            chainId: CHAIN_ID,
            args: [BigInt(loanId)],
            value: parseEther(amountEth),
        });
    };

    return { fundLoan, hash, isPending, isConfirming, isSuccess, error };
}

export function useRepayLoan() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const repayLoan = (loanId: number, amountEth: string) => {
        if (!LENDING_CONTRACT_ADDRESS) return;
        writeContract({
            address: LENDING_CONTRACT_ADDRESS,
            abi: LENDING_ABI,
            functionName: "repayLoan",
            chainId: CHAIN_ID,
            args: [BigInt(loanId)],
            value: parseEther(amountEth),
        });
    };

    return { repayLoan, hash, isPending, isConfirming, isSuccess, error };
}

export function useApproveLoan() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const approveLoan = (loanId: number) => {
        if (!LENDING_CONTRACT_ADDRESS) return;
        writeContract({
            address: LENDING_CONTRACT_ADDRESS,
            abi: LENDING_ABI,
            functionName: "approveLoan",
            chainId: CHAIN_ID,
            args: [BigInt(loanId)],
        });
    };

    return { approveLoan, hash, isPending, isConfirming, isSuccess, error };
}

export function useRejectLoan() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const rejectLoan = (loanId: number) => {
        if (!LENDING_CONTRACT_ADDRESS) return;
        writeContract({
            address: LENDING_CONTRACT_ADDRESS,
            abi: LENDING_ABI,
            functionName: "rejectLoan",
            chainId: CHAIN_ID,
            args: [BigInt(loanId)],
        });
    };

    return { rejectLoan, hash, isPending, isConfirming, isSuccess, error };
}
