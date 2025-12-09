import React from "react";

const BackgroundCircles = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient for all devices */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50" />

      {/* ========== MOBILE VERSION ========== */}
      {/* Simple, static, non-animated circles for mobile */}
      <div className="md:hidden">
        {/* Main larger circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-red-500/5 blur-xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-xl" />

        {/* Medium accent circles */}
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-blue-500/3 blur-lg" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-500/3 blur-lg" />

        {/* Small decorative circles */}
        <div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full border border-amber-300/20" />
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full border border-cyan-300/25" />

        {/* Very subtle accent */}
        <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-pink-500/2 blur-md" />
        <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-teal-500/2 blur-md" />
      </div>

      {/* ========== DESKTOP VERSION ========== */}
      {/* Full animated background (hidden on mobile) */}
      <div className="hidden md:block">
        {/* Your original beautiful animated background */}
        <div className="absolute -left-40 -top-10 w-[520px] h-[520px] rounded-full bg-red-500/10 blur-3xl animate-blob" />
        <div className="absolute -right-40 bottom-0 w-[520px] h-[520px] rounded-full bg-red-400/8 blur-3xl animate-blob animation-delay-2000" />

        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-emerald-500/12 blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/3 -right-24 w-72 h-72 rounded-full bg-green-500/10 blur-3xl animate-blob animation-delay-6000" />

        <div className="absolute -top-6 left-40 w-64 h-64 rounded-full border border-red-400/30 ring-float" />
        <div className="absolute bottom-12 left-72 w-40 h-40 rounded-full border border-red-300/25 ring-float animation-delay-1000" />

        <div className="absolute top-24 right-64 w-52 h-52 rounded-full border border-emerald-400/35 ring-float animation-delay-2000" />
        <div className="absolute bottom-16 right-40 w-60 h-60 rounded-full border border-green-400/40 ring-float animation-delay-3000" />

        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full border border-gray-300/50 ring-float animation-delay-4000" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full border border-gray-400/40 ring-float animation-delay-5000" />

        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-red-500/5 to-pink-500/3 blur-2xl opacity-20" />
        <div className="absolute bottom-20 left-20 w-36 h-36 rounded-full bg-gradient-to-r from-emerald-500/8 to-teal-500/4 blur-2xl opacity-15" />

        <div className="absolute top-40 left-10 w-24 h-24 bg-white/20 rounded-full mix-blend-soft-light filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-white/15 rounded-full mix-blend-soft-light filter blur-xl opacity-8 animate-pulse animation-delay-1000" />
      </div>
    </div>
  );
};

export default BackgroundCircles;
