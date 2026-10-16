import { useEffect, useState } from "react";
import { LOGO } from "@/lib/apr";
import SecurityBadges from "@/components/apr/SecurityBadges";

const FULL = 1400;

export default function Splash() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 80),
      setTimeout(() => setStep(2), FULL),
      setTimeout(() => setStep(3), FULL + 520),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  if (step === 3) return null;
  const out = step >= 2;
  return (
    <div
      aria-hidden="true"
      className={"fixed inset-0 z-[100] bg-[#0e2a2b] grid place-items-center transition-opacity duration-500 " + (out ? "opacity-0 pointer-events-none" : "opacity-100")}
    >
      <div className={"flex flex-col items-center gap-5 px-6 transition-all duration-700 ease-out " + (step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
        <img src={LOGO} alt="PVSA Puerto Ventanas S.A." className="h-16 w-auto" />
        <div className="text-center">
          <div className="font-heading text-[30px] leading-tight text-white">Programa APR</div>
          <div className="font-mono text-[11px] tracking-[.16em] text-[#7fd6d6] mt-1.5">PUERTO VENTANAS S.A.</div>
        </div>
        <div className="w-[132px] h-[3px] rounded-full bg-[#1f4344] overflow-hidden">
          <div className="h-full bg-[#7fd6d6] rounded-full" style={{ width: step >= 1 ? "100%" : "0%", transition: "width 1300ms cubic-bezier(.2,.7,.3,1)" }} />
        </div>
        <SecurityBadges />
      </div>
    </div>
  );
}