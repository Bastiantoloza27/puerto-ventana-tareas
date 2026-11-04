import { useAuth } from "@/lib/AuthContext";

export const VIEW_KEY = "apr_ver_como";

export default function usePerfil() {
  const { user } = useAuth();
  const realAdmin = user?.role === "admin";
  const perfil = realAdmin ? (localStorage.getItem(VIEW_KEY) === "asesor" ? "asesor" : "jefatura") : "asesor";
  return { realAdmin, perfil, isAdmin: perfil === "jefatura", readOnly: false, canPlan: perfil === "jefatura" };
}