// Agrega un correo nuevo al turno, manteniendo cada envío separado (misma lógica que el servidor).
export function agregarEnvio(prev, { asunto, hora, remitente, lineas }) {
  const envios = prev?.envios || (prev ? [{ n: 1, asunto: prev.asunto, hora: prev.hora, remitente: "", lineas: prev.lineas || [] }] : []);
  const nuevo = { n: envios.length + 1, asunto: asunto || "Correo de Operaciones", hora, remitente: remitente || "", lineas };
  return { asunto: prev?.asunto || nuevo.asunto, hora: prev?.hora || hora, lineas: [...(prev?.lineas || []), ...lineas], envios: [...envios, nuevo] };
}

export const envioLabel = (n) => (n === 1 ? "Nombrada" : `Actualización ${n - 1}`);
export const TURNO_LABEL = { T1: "1° turno", T2: "2° turno", T3: "3° turno" };