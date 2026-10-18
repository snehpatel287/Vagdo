"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon, MapIcon, PlusIcon, TreeIcon } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Trees", Icon: TreeIcon },
  { href: "/map", label: "Map", Icon: MapIcon },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="focus-ring rounded-lg flex items-center gap-2 shrink-0 min-w-0"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shrink-0 shadow-sm shadow-green-600/30">
            <LeafIcon className="w-4.5 h-4.5" />
          </span>
          <span className="font-bold text-base sm:text-lg truncate bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
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
                className={`focus-ring flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 sm:px-3.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          <ThemeToggle />

          <Link
            href="/add"
            className="focus-ring flex items-center gap-1.5 min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 text-white px-3 sm:px-4 rounded-lg text-sm font-semibold shadow-sm shadow-green-600/25 transition-all duration-200 ml-0.5"
          >
            <PlusIcon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Add Tree</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
