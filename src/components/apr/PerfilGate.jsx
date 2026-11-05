import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SinAcceso from "@/components/apr/SinAcceso";

// Asigna el perfil del equipo oficial al ingresar y bloquea a quien no pertenece al equipo.
export default function PerfilGate({ children }) {
  const { user, checkUserAuth } = useAuth();
  const [checking, setChecking] = useState(!user?.perfil);

  useEffect(() => {
    if (user?.perfil) return setChecking(false);
    base44.functions.invoke("asignarPerfil", {}).then(async (r) => {
      if (r.data?.perfil) await checkUserAuth();
      setChecking(false);
    });
  }, [user?.id, user?.perfil]);

  if (checking) return <div className="min-h-screen grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#2a64b8] rounded-full animate-spin" /></div>;
  if (!user?.perfil && user?.role !== "admin") return <SinAcceso email={user?.email} />;
  return children;
}