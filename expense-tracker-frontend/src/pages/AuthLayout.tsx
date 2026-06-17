// src/pages/auth/AuthLayout.tsx
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShieldCheck, Zap, PieChart } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  { icon: PieChart,    text: "Visual spending breakdowns" },
  { icon: ShieldCheck, text: "Bank-level data encryption" },
  { icon: Zap,         text: "Instant budget alerts" },
];

const stats = [
  { value: "₹18,400", label: "avg. monthly saved" },
  { value: "94%",     label: "budgets on track"   },
  { value: "2,318",   label: "expenses tracked"   },
];

const testimonial = {
  quote: "Expenzo is the first finance app that actually changed my habits — not just tracked them.",
  author: "Priya M.",
  role: "Product Designer, Bangalore",
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f1a]">

      {/* ── Left branding panel ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between bg-[#0c1222] relative overflow-hidden p-10 xl:p-14">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-700/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-[300px] h-[300px] rounded-full bg-violet-700/15 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 group-hover:bg-indigo-500 transition-colors">
              <TrendingUp size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white text-lg font-semibold tracking-tight">Expenzo</span>
          </Link>
        </div>

        {/* Hero copy + features */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <p className="text-indigo-400 text-xs font-semibold tracking-[0.18em] uppercase mb-3">
              Financial clarity
            </p>
            <h2 className="text-white text-[2.2rem] xl:text-[2.6rem] font-bold leading-[1.15] tracking-tight">
              Know exactly where
              <br />
              <span className="text-indigo-400">your money goes.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-xs">
              Track every rupee, plan every month, and finally hit your savings goals — without the spreadsheet chaos.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-indigo-400" />
                </span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Mini stat row */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3.5 backdrop-blur-sm"
              >
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-slate-500 text-xs mt-1.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border-t border-white/[0.08] pt-5">
          <p className="text-slate-400 text-sm italic leading-relaxed">"{testimonial.quote}"</p>
          <p className="text-slate-500 text-xs mt-2">
            — {testimonial.author}, <span className="text-slate-600">{testimonial.role}</span>
          </p>
        </div>
      </aside>

      {/* ── Right content panel ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-slate-800 dark:text-white font-semibold text-base">Expenzo</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>
    </div>
  );
}