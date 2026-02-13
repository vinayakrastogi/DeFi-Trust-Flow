"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    // WagmiProvider always wraps children (safe with ssr:true in config).
    // RainbowKitProvider only renders on the client (it needs the DOM for modals).
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {mounted ? (
                    <RainbowKitProvider
                        theme={darkTheme({
                            accentColor: "hsl(217, 91%, 60%)",
                            accentColorForeground: "white",
                            borderRadius: "medium",
                            overlayBlur: "small",
                        })}
                    >
                        {children}
                    </RainbowKitProvider>
                ) : (
                    children
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
