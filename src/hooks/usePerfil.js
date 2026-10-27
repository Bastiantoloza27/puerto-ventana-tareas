import { useAuth } from "@/lib/AuthContext";

export const VIEW_KEY = "apr_ver_como";

export default function usePerfil() {
  const { user } = useAuth();
  const realAdmin = user?.role === "admin";
  const perfil = realAdmin ? localStorage.getItem(VIEW_KEY) || "jefatura" : user?.perfil === "gerencia" ? "gerencia" : "asesor";
  return { realAdmin, perfil, isAdmin: perfil === "jefatura", readOnly: perfil === "gerencia", canPlan: perfil === "jefatura" };
}