import { base44 } from "@/api/base44Client";
import { ShieldAlert } from "lucide-react";

// Se muestra a quien inició sesión pero no está registrado en el equipo oficial.
export default function SinAcceso({ email }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[#eef2f6] px-4 font-body">
      <div className="max-w-md w-full rounded-xl bg-white border border-[#dde5e4] p-7 text-center flex flex-col items-center gap-3 shadow-sm">
        <ShieldAlert className="w-10 h-10 text-[#2a64b8]" />
        <h1 className="font-heading text-2xl text-[#0f2340]">Acceso pendiente</h1>
        <p className="text-sm text-[#3c4849]">La cuenta <b>{email}</b> no está registrada en el equipo de Prevención. Pide a Jefatura que te agregue y vuelve a ingresar.</p>
        <button onClick={() => base44.auth.logout("/login")} className="mt-2 px-4 py-2.5 rounded-md bg-[#16386a] hover:bg-[#2a64b8] text-white text-sm">Cerrar sesión</button>
      </div>
    </div>
  );
}