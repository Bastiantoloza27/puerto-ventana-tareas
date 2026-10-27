import { useAuth } from "@/lib/AuthContext";

export default function usePerfil() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return { isAdmin, readOnly: !isAdmin && user?.perfil === "gerencia" };
}