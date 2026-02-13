// Force dynamic rendering for auth routes (wallet connect needs client-side APIs)
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
