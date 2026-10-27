import React from "react";

const ICON = "https://media.base44.com/images/public/6acfba2bbe6123d4e500ba2b/938b6a967_icono-192.png";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-[#0e2a2b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1b4a4a_0%,#0e2a2b_55%,#081a1b_100%)]" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#e0a82e]/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-[#00abac]/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src={ICON} alt="Programa APR" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg ring-1 ring-white/10" />
          <h1 className="font-heading text-3xl text-white">{title}</h1>
          {subtitle && <p className="text-[#a9c1c0] mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-2xl border border-white/10 p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-[#a9c1c0] mt-6 [&_a]:text-white">{footer}</p>
        )}
      </div>
    </div>
  );
}