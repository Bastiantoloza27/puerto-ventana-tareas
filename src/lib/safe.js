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
    toast({ variant: "destructive", title: failTitle, description: `${msg(e)}. Revisa tu conexión e inténtalo de nuevo; lo que escribiste sigue en pantalla.` });
    return false;
  }
}