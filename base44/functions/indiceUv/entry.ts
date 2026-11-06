import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FUENTE = 'https://archivos.meteochile.gob.cl/portaldmc/meteochile/js/indice_radiacion.js';
const ESTACION = '330120'; // Litoral Central (Valparaíso)

const ENT = { aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', nbsp: ' ' };
const decode = (s) => String(s || '').replace(/&(\w+);/g, (m, k) => ENT[k] ?? m);

// "8:Muy alto" o "8-10:Muy alto" → { valor, riesgo }
const split = (s) => { const [valor, riesgo] = String(s || '').split(':'); return valor ? { valor, riesgo: riesgo || '' } : null; };

// Índice UV observado y pronosticado de Meteochile para el litoral central.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(FUENTE, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return Response.json({ error: `Meteochile respondió ${res.status}` }, { status: 502 });
    const js = await res.text();
    const bloque = js.split('RadiacionUVB.push(').find((b) => b.includes(`indice : "${ESTACION}"`));
    if (!bloque) return Response.json({ error: 'Estación no encontrada' }, { status: 404 });
    const campo = (k) => (bloque.match(new RegExp(`${k}\\s*:\\s*"([^"]*)"`)) || [])[1] || '';

    return Response.json({
      estacion: decode(campo('nombre')),
      observado: split(campo('indiceobs')) && { ...split(campo('indiceobs')), fecha: campo('fechaobs'), hora: campo('horaobs') },
      pronostico: split(campo('indicepron')) && { ...split(campo('indicepron')), fecha: campo('fechapron') },
      recomendaciones: decode(campo('recomendacion')).split(/<br\s*\/?>/i).map((x) => x.trim()).filter(Boolean),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}