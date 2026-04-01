'use client'

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { FEATURES } from "@/lib/features";

const navLinks = [
  // { label: "About", href: "/#how-it-works" },
  { label: "Games", href: "/#games" },
  { label: "Prizes", href: "/#prizes" },
  { label: "Rules", href: "/#rules" },
  { label: "FAQ", href: "/#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useAppSelector((state) => state.auth.hydrated);

  const dashboardHref =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  const dashboardLabel =
    user?.role === "admin" ? "Admin Dashboard" : "Team Dashboard";


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg shadow-background/50" : "bg-transparent"
        }`}
    >
      <div className="section-container flex items-center justify-between h-16 sm:h-18">
        <a href="/" className="font-display text-xl sm:text-2xl font-bold text-primary tracking-wider neon-text">
          ClueLess
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}

          {hydrated ? (
            user && FEATURES.DASHBOARD ? (
              <a
                href={dashboardHref}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm neon-glow hover:neon-glow-strong transition-all duration-300"
              >
                {dashboardLabel}
              </a>
            ) : (
              <a
                href={FEATURES.LOGIN ? "/login" : "/register"}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm neon-glow hover:neon-glow-strong transition-all duration-300"
              >
                {FEATURES.LOGIN ? "Login" : "Register"}
              </a>
            )
          ) : (
            <div className="h-10 w-28" />
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border">
          <div className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {hydrated ? (
              user && FEATURES.DASHBOARD ? (
                <a
                  href={dashboardHref}
                  className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-center neon-glow"
                  onClick={() => setMobileOpen(false)}
                >
                  {dashboardLabel}
                </a>
              ) : (
                <a
                  href={FEATURES.LOGIN ? "/login" : "/register"}
                  className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-center neon-glow"
                  onClick={() => setMobileOpen(false)}
                >
                  {FEATURES.LOGIN ? "Login" : "Register"}
                </a>
              )
            ) : (
              <div className="mt-2 h-11" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
