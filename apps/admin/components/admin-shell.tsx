"use client";

import { getClientAuth } from "@dartbites/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@dartbites/ui";
import { useAuth } from "./auth-provider";

const links = [
  { href: "/orders", label: "Orders" },
  { href: "/menu", label: "Menu" },
  { href: "/analytics", label: "Analytics" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const logout = async () => {
    await signOut(getClientAuth());
    router.push("/login");
  };

  return (
    <div className="min-h-screen chalkboard-bg">
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/90 px-5 py-4 backdrop-blur-md md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="font-sora text-xl font-extrabold uppercase italic tracking-tighter text-secondary">
            Dart Bites Admin
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs uppercase tracking-widest text-on-surface-variant sm:inline">
              {user?.email ?? "Signed out"}
            </span>
            <Button className="!bg-secondary !text-on-secondary text-xs font-bold uppercase tracking-widest" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-[57px]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-8 md:grid-cols-[220px_1fr] md:px-16">
          <nav className="border border-white/10 bg-surface/80 p-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    active
                      ? "bg-secondary text-on-secondary"
                      : "text-on-surface-variant hover:text-white hover:border-white/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
