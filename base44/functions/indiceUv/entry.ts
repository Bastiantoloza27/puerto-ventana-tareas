import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FUENTE = 'https://archivos.meteochile.gob.cl/portaldmc/meteochile/js/indice_radiacion.js';
const ESTACION = '330120'; // Litoral Central (Valparaíso)
const TZ = 'America/Santiago';

const ENT = { aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', nbsp: ' ' };
const decode = (s) => String(s || '').replace(/&(\w+);/g, (m, k) => ENT[k] ?? m);
const split = (s) => { const [valor, riesgo] = String(s || '').split(':'); return valor ? { valor, riesgo: riesgo || '' } : null; };
const riesgo = (v) => (v < 3 ? 'Bajo' : v < 6 ? 'Moderado' : v < 8 ? 'Alto' : v < 11 ? 'Muy alto' : 'Extremo');
const horaLocal = (fecha, hh, mm) => new Intl.DateTimeFormat('es-CL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(`${fecha}T${hh}:${mm}:00Z`));

// Mediciones cada 5 minutos del día (tabla de climatología, horas UTC).
async function medicionesDelDia(fecha) {
  const [y, m, d] = fecha.split('-');
  const res = await fetch(`https://climatologia.meteochile.gob.cl/application/diario/indiceUvbDiario/${ESTACION}/${y}/${m}/${d}`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return null;
  const html = await res.text();
  const i = html.indexOf('<table');
  if (i < 0) return null;
  const tabla = html.slice(i, html.indexOf('</table>', i));
  const filas = [...tabla.matchAll(/<tr class="text-center">([\s\S]*?)<\/tr>/g)]
    .map((f) => [...f[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1].replace(/<[^>]+>/g, '').trim()));

  let actual = null, maximo = null;
  const horas = [];
  for (const f of filas) {
    const hh = f[0];
    const vals = f.slice(1, 13).map(Number).map((v, k) => (f[k + 1] === '.' || Number.isNaN(v) ? null : v));
    vals.forEach((v, k) => {
      if (v === null) return;
      const mm = String(k * 5).padStart(2, '0');
      actual = { valor: v, hora: horaLocal(fecha, hh, mm) };
      if (!maximo || v > maximo.valor) maximo = { valor: v, hora: horaLocal(fecha, hh, mm) };
    });
    const conDato = vals.filter((v) => v !== null);
    if (conDato.length) horas.push({ hora: horaLocal(fecha, hh, '00').slice(0, 2), valor: Math.max(...conDato) });
  }
  if (!actual) return null;
  return { actual: { ...actual, riesgo: riesgo(actual.valor) }, maximo: { ...maximo, riesgo: riesgo(maximo.valor) }, horas };
}

async function pronostico() {
  const res = await fetch(FUENTE, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return {};
  const bloque = (await res.text()).split('RadiacionUVB.push(').find((b) => b.includes(`indice : "${ESTACION}"`));
  if (!bloque) return {};
  const campo = (k) => (bloque.match(new RegExp(`${k}\\s*:\\s*"([^"]*)"`)) || [])[1] || '';
  return {
    pronostico: split(campo('indicepron')) && { ...split(campo('indicepron')), fecha: campo('fechapron') },
    recomendaciones: decode(campo('recomendacion')).split(/<br\s*\/?>/i).map((x) => x.trim()).filter(Boolean),
  };
}

// Índice UV del día (mediciones cada 5 min) + pronóstico y recomendaciones de Meteochile, litoral central.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
    const [hoy, pron] = await Promise.allSettled([medicionesDelDia(fecha), pronostico()]);
    return Response.json({
      estacion: 'Litoral Central',
      fecha,
      hoy: hoy.status === 'fulfilled' ? hoy.value : null,
      ...(pron.status === 'fulfilled' ? pron.value : {}),
      consultado: new Intl.DateTimeFormat('es-CL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}