import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
    title: "TrustFlow | DeFi Micro-Lending Platform",
    description:
        "AI-powered under-collateralized micro-lending. Build your on-chain credit score and access fair loans without traditional credit history.",
    keywords: ["DeFi", "micro-lending", "crypto", "blockchain", "credit score", "under-collateralized"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background antialiased">
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: "hsl(var(--card))",
                                color: "hsl(var(--card-foreground))",
                                border: "1px solid hsl(var(--border))",
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
