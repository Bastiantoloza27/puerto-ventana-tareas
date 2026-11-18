import { toast } from "@/components/ui/use-toast";

const msg = (e) => e?.response?.data?.error || e?.message || "Error desconocido";

// Ejecuta una acción de guardado/envío: nunca deja el botón pegado y avisa si algo falla.
// Devuelve el resultado (o true) si salió bien, y false si falló.
export async function attempt(fn, okTitle, failTitle = "No se pudo guardar") {
  try {
    const r = await fn();
    if (okTitle) toast({ title: okTitle });
    return r ?? true;
  } catch (e) {
    const permiso = e?.response?.status === 403 || /permission denied/i.test(msg(e));
    const detalle = permiso
      ? `${/permission denied/i.test(msg(e)) ? "No tienes permiso para este cambio" : msg(e)}. Avisa a Jefatura; lo que escribiste sigue en pantalla.`
      : `${msg(e)}. Revisa tu conexión e inténtalo de nuevo; lo que escribiste sigue en pantalla.`;
    toast({ variant: "destructive", title: failTitle, description: detalle });
    return false;
  }
}