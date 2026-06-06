"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Settings, LogOut, Shield, ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign, FileCheck, X } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/kyc", label: "KYC Management", icon: FileCheck },
  { href: "/admin/funding", label: "Funding", icon: DollarSign },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownCircle },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
  { href: "/admin/trades", label: "Trades", icon: TrendingUp },
  { href: "/admin/announcements", label: "Announcements", icon: Settings },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-border flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 flex items-center justify-center">
          <img src="/leverfi.png" alt="TradeFast Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-lg sm:text-xl font-bold text-foreground truncate">
          <Link href="/">TradeFast</Link>
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#00FE01]/10 text-[#00FE01]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-border shrink-0">
        <button
          onClick={() => { window.location.href = "/"; }}
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 flex-shrink-0 border-r border-border bg-card">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-card border-r border-border shadow-2xl animate-in slide-in-from-left">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}