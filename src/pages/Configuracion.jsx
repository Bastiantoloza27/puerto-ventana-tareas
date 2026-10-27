import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { card, MINS } from "@/lib/apr";
import SetupStep from "@/components/apr/SetupStep";

export default function Configuracion() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["config-inicial"],
    queryFn: async () => {
      const [users, acts, cerrados, cfg] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Actividad.count({}),
        base44.entities.Programacion.count({ estado: "cerrada" }),
        base44.entities.ConfiguracionInicial.list("-created_date", 1),
      ]);
      return { users: users.length, acts, cerrados, cfg: cfg[0] || null };
    },
  });
  if (isLoading) return <div className="py-24 grid place-items-center"><div className="w-7 h-7 border-[3px] border-[#cdd4d4] border-t-[#007f80] rounded-full animate-spin" /></div>;

  const pasos = data.cfg?.pasos || [];
  const toggle = async (p) => {
    const next = pasos.includes(p) ? pasos.filter((x) => x !== p) : [...pasos, p];
    if (data.cfg) await base44.entities.ConfiguracionInicial.update(data.cfg.id, { pasos: next });
    else await base44.entities.ConfiguracionInicial.create({ pasos: next });
    qc.invalidateQueries({ queryKey: ["config-inicial"] });
  };
  const steps = [
    { title: "Equipo", desc: "Invita a asesores y gerencia con su correo y asigna el perfil de cada uno.", detail: `${data.users} usuarios registrados`, done: data.users > 1, to: "/usuarios", cta: "Ir a usuarios" },
    { title: "Catálogo de actividades", desc: "Revisa y ajusta las actividades prevencionistas que se programan por turno.", detail: `${data.acts} actividades en el catálogo`, done: data.acts > 0, to: "/catalogo", cta: "Ir al catálogo" },
    { title: "Mínimos mensuales", desc: "Confirma las metas mensuales por asesor.", detail: MINS.map(([, l, m]) => `${l}: ${m ?? "cada vez"}`).join(" · "), done: pasos.includes("minimos"), onConfirm: () => toggle("minimos") },
    { title: "Correos de reportes", desc: "Confirma que Jefatura y Gerencia tienen correo registrado para recibir los cierres de turno.", done: pasos.includes("correos"), to: "/usuarios", cta: "Revisar correos", onConfirm: () => toggle("correos") },
    { title: "Primer turno de prueba", desc: "Programa, publica y cierra un turno de ejemplo para verificar el flujo completo.", detail: `${data.cerrados} turnos cerrados`, done: data.cerrados > 0, to: "/programacion", cta: "Programar turno" },
  ];
  const ok = steps.filter((s) => s.done).length;

  return (
    <>
      <div className={card + " p-4 md:p-5 flex flex-col gap-2"}>
        <div className="flex justify-between items-baseline"><span className="font-heading text-xl">{ok === steps.length ? "Plataforma lista" : "Avance de configuración"}</span><span className="font-mono text-sm">{ok} de {steps.length}</span></div>
        <div className="h-2 rounded bg-[#eef1f1] overflow-hidden"><div className="h-full bg-[#00abac] transition-all duration-500" style={{ width: (ok / steps.length) * 100 + "%" }} /></div>
      </div>
      {steps.map((s, i) => <SetupStep key={s.title} n={i + 1} {...s} />)}
    </>
  );
}