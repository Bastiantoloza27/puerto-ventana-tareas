import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FUENTE = 'https://meteoarmada.directemar.cl';
// Zonas de aviso de la Armada que cubren la bahía de Quintero / Valparaíso.
const ZONA = /CALDERA A PUNTA BOYERUCA|HASTA ARICA|VALPARA|QUINTERO|LITORAL CENTRAL/i;

const ENT = { aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', nbsp: ' ', amp: '&' };
const limpiar = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&(\w+);/g, (m, k) => ENT[k] ?? m).replace(/\s+/g, ' ').trim();
const campo = (html, cls) => limpiar((html.match(new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)<\\/`)) || [])[1]);
const tipoDe = (d) => (/MAREJAD/i.test(d) ? 'marejadas' : /MAL TIEMPO|TEMPORAL/i.test(d) ? 'mal_tiempo' : /VIENTO/i.test(d) ? 'viento' : 'otro');

// Avisos meteorológicos vigentes de la Armada (mal tiempo, marejadas) para la zona de Quintero.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(FUENTE + '/', { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return Response.json({ error: `Armada respondió ${res.status}` }, { status: 502 });
    const html = await res.text();
    const i = html.indexOf('class="alert"');
    const seccion = i >= 0 ? html.slice(i, html.indexOf('</section>', i)) : '';
    const avisos = [...seccion.matchAll(/<article class="swiper-slide">([\s\S]*?)<\/article>/g)].map(([, a]) => {
      const href = (a.match(/href="([^"]+)"/) || [])[1] || '';
      const descripcion = campo(a, 'alert__description');
      return { zona: campo(a, 'alert__subtitle'), descripcion, fecha: campo(a, 'alert__date'), tipo: tipoDe(descripcion), url: href.startsWith('http') ? href : FUENTE + href };
    });
    const zona = avisos.filter((a) => ZONA.test(a.zona));

    return Response.json({
      malTiempo: zona.some((a) => a.tipo === 'mal_tiempo'),
      marejadas: zona.some((a) => a.tipo === 'marejadas'),
      avisos: zona,
      consultado: new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}