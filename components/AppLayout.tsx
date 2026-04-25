"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CookingPot, 
  Calculator, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  HelpCircle,
  ChevronDown,
  Grid,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/constants";

const navItems = [
  { label: "Trang Chủ", href: "/dashboard", icon: LayoutDashboard, roles: [ROLES.QUAN_LY] },
  { label: "Đơn hàng", href: "/don-hang", icon: ClipboardList, roles: [ROLES.QUAN_LY, ROLES.BEP, ROLES.KE_TOAN] },
  { label: "Khách hàng", href: "/khach-hang", icon: Users, roles: [ROLES.QUAN_LY, ROLES.BEP, ROLES.KE_TOAN] },
  { label: "Thực đơn", href: "/ke-mon", icon: CookingPot, roles: [ROLES.QUAN_LY, ROLES.BEP, ROLES.KE_TOAN] },
  { label: "Bếp & Chế biến", href: "/bep", icon: CookingPot, roles: [ROLES.QUAN_LY, ROLES.BEP] },
  { label: "Tài chính", href: "/ke-toan", icon: Calculator, roles: [ROLES.QUAN_LY, ROLES.KE_TOAN] },
  { label: "Hệ thống", href: "/cai-dat", icon: Settings, roles: [ROLES.QUAN_LY, ROLES.BEP, ROLES.KE_TOAN] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole as "quan_ly" | "bep" | "ke_toan");
  });

  return (
    <div className="flex h-screen bg-[#f2f5f8]">
      {/* Sidebar - MISA Style: Slim, white, clean icons */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[240px] bg-[#1e293b] text-slate-300 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-14 flex items-center px-5 bg-[#0072bc] text-white">
            <Grid className="w-5 h-5 mr-3" />
            <span className="font-bold text-base tracking-tight uppercase">RICENOW CRM <span className="text-[10px] opacity-70 ml-1">v1.0.2</span></span>
          </div>

          <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-5 py-3 text-sm font-medium transition-all duration-150 relative group",
                  pathname === item.href
                    ? "bg-[#334155] text-white"
                    : "hover:bg-[#334155] hover:text-white"
                )}
              >
                {pathname === item.href && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0072bc]" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 mr-3",
                  pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
             <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - MISA Style: White, top border blue, user on right */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 shadow-sm relative z-30">
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center ml-4 font-medium gap-3">
               <div className="flex items-center space-x-2 text-sm text-slate-500">
                 <span>Đơn vị:</span>
                 <span className="text-slate-900 font-bold">RICENOW KITCHEN</span>
               </div>
               <button
                 onClick={() => alert("Tạo bếp mới sẽ được triển khai ở phiên bản sau.")}
                 className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                 title="Tạo bếp mới"
               >
                 <Plus className="w-3.5 h-3.5" />
                 Bếp mới
               </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 border-r border-slate-200 pr-6">
              <button
                onClick={() => alert("Bạn chưa có thông báo mới.")}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert("Hướng dẫn: vào từng module để xem tooltip thao tác nhanh.")}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center group cursor-pointer relative">
              <div className="w-8 h-8 rounded-full bg-[#0072bc] flex items-center justify-center text-white text-xs font-bold mr-3">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="hidden sm:flex items-center"
              >
              <div className="text-right mr-2">
                <p className="text-xs font-bold text-slate-900 leading-none">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{userRole?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-md py-1 w-36 z-40">
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
