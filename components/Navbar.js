"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LeafIcon,
  LogoutIcon,
  MapIcon,
  ShieldIcon,
  TreeIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth/AuthProvider";

const LINKS = [
  { href: "/", label: "Trees", Icon: TreeIcon },
  { href: "/map", label: "Map", Icon: MapIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  if (!user) {
    return (
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="focus-ring rounded-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600 text-white shrink-0">
              <LeafIcon className="w-4.5 h-4.5" />
            </span>
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              VAGDO
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-2">
        <Link
          href="/"
          className="focus-ring rounded-lg flex items-center gap-2 shrink-0 min-w-0"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600 text-white shrink-0">
            <LeafIcon className="w-4.5 h-4.5" />
          </span>
          <span className="hidden min-[400px]:inline font-bold text-base sm:text-lg tracking-tight truncate text-slate-900 dark:text-white">
            VAGDO
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0" aria-label="Primary">
          {LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 sm:px-3.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} />
                <span className="hidden sm:inline">{label}</span>
                {active && (
                  <span className="absolute left-2.5 right-2.5 -bottom-[1px] h-0.5 rounded-full bg-green-600 dark:bg-green-400" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              className={`focus-ring relative flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 sm:px-3.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname.startsWith("/admin")
                  ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <ShieldIcon className="w-[18px] h-[18px] shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="flex items-center gap-0.5 sm:gap-2 md:ml-1 md:pl-3 md:border-l md:border-slate-200 dark:md:border-slate-700">
            <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
              {profile?.first_name || user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="focus-ring flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150"
            >
              <LogoutIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
