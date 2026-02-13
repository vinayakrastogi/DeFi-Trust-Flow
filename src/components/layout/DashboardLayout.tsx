"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import {
    LayoutDashboard, FileText, Wallet, CreditCard, Shield, Store,
    PieChart, Zap, Users, Brain, Settings, Bell, Menu, X,
    ChevronLeft, LogOut, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, shortenAddress } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard, FileText, Wallet, CreditCard, Shield, Store,
    PieChart, Zap, Users, Brain, Settings,
};

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: "borrower" | "lender" | "admin";
    navItems: NavItem[];
    notificationCount?: number;
}

export default function DashboardLayout({
    children,
    role,
    navItems,
    notificationCount = 3,
}: DashboardLayoutProps) {
    const pathname = usePathname();
    const { address } = useAccount();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const displayName = address ? shortenAddress(address) : "Not Connected";
    const avatarInitials = address ? address.slice(2, 4).toUpperCase() : "??";

    const roleColors = {
        borrower: "bg-blue-500",
        lender: "bg-emerald-500",
        admin: "bg-purple-500",
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300",
                    sidebarOpen ? "w-64" : "w-20",
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            {sidebarOpen && (
                                <span className="text-lg font-bold text-gradient">TrustFlow</span>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex h-8 w-8"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <ChevronLeft
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    !sidebarOpen && "rotate-180"
                                )}
                            />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-8 w-8"
                            onClick={() => setMobileSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Role badge */}
                    {sidebarOpen && (
                        <div className="px-4 py-3">
                            <Badge className={cn(roleColors[role], "text-white capitalize")}>
                                {role} Dashboard
                            </Badge>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = iconMap[item.icon] || LayoutDashboard;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Role switcher */}
                    {sidebarOpen && (
                        <div className="px-3 py-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2 px-3">Switch View</p>
                            <div className="space-y-1">
                                {role !== "admin" && (
                                    <>
                                        <Link
                                            href="/borrower/dashboard"
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
                                                role === "borrower" ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <Wallet className="h-4 w-4" />
                                            Borrower
                                        </Link>
                                        <Link
                                            href="/lender/dashboard"
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
                                                role === "lender" ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <PieChart className="h-4 w-4" />
                                            Lender
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User section */}
                    <div className="border-t p-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={cn(roleColors[role], "text-white text-xs")}>
                                            {avatarInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    {sidebarOpen && (
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate font-mono">{displayName}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                                        </div>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/auth/login" className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div
                className={cn(
                    "transition-all duration-300",
                    sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                )}
            >
                {/* Top header */}
                <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
