import React from "react";

const LOGO = "https://base44.app/api/apps/6acfba2bbe6123d4e500ba2b/files/mp/public/6acfba2bbe6123d4e500ba2b/61a4ae7bc_pvsa_logo.png";
const PVSA = "https://base44.app/api/apps/6acfba2bbe6123d4e500ba2b/files/mp/public/6acfba2bbe6123d4e500ba2b/66fd6fb27_pvsa-logo.png";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-[linear-gradient(135deg,#0f2340_0%,#16386a_45%,#2a64b8_100%)]">
      <div className="absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-[#5b9be6]/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-[#9cc0f0]/20 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-[#e3c77a]/10 blur-3xl" />
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full h-40" aria-hidden>
        <path d="M0 120 Q360 70 720 120 T1440 120 V200 H0Z" fill="#ffffff" fillOpacity="0.06" />
        <path d="M0 150 Q360 110 720 150 T1440 150 V200 H0Z" fill="#ffffff" fillOpacity="0.08" />
      </svg>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <img src={LOGO} alt="PVSA Puerto Ventanas S.A." className="w-48 aspect-[2/1] object-cover rounded-2xl mx-auto mb-4 shadow-xl ring-4 ring-white/15" />
          <div className="font-mono text-[11px] tracking-[.16em] text-[#9cc0f0]">PUERTO VENTANA TAREAS</div>
          <h1 className="font-heading text-3xl text-white mt-1">{title}</h1>
          {subtitle && <p className="text-[#d6e2f5] mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-8">{children}</div>
          <div className="border-t border-[#e4ecf8] bg-[#f5f8fc] px-8 py-4 flex items-center justify-center gap-3">
            <span className="text-[11px] text-[#5b6b80]">Una plataforma de</span>
            <img src={PVSA} alt="Puerto Ventanas S.A." className="h-8 object-contain" />
          </div>
        </div>
        {footer && (
          <p className="text-center text-sm text-[#d6e2f5] mt-6 [&_a]:text-white [&_a]:font-medium">{footer}</p>
        )}
      </div>
    </div>
  );
}