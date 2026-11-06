import { agregarEnvio } from './opsMail.ts';

const TZ = 'America/Santiago';
const hora = () => new Intl.DateTimeFormat('es-CL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
const limpio = (s) => { const v = String(s || '').trim(); return /^(N\/?A|-|NINGUNO)$/i.test(v) ? '' : v.slice(0, 300); };
const NUM = { UNO: 1, DOS: 2, TRES: 3, CUATRO: 4, CINCO: 5, SEIS: 6, SIETE: 7, OCHO: 8, NUEVE: 9, DIEZ: 10 };
const numSitio = (s) => { const t = norm(s); const d = t.match(/\b(\d{1,2})\b/); if (d) return Number(d[1]); const w = Object.keys(NUM).find((k) => new RegExp(`\\b${k}\\b`).test(t)); return w ? NUM[w] : null; };

// Arma la faena final: solo cargos clave con nombre, el resto como conteo por cargo.
function cerrarFaena(f) {
  const cargos = {};
  const clave = { jefe: [], sup: [], cap: [] };
  for (const p of f.personas) {
    const c = norm(p.calif) || 'SIN CARGO';
    cargos[c] = (cargos[c] || 0) + 1;
    if (c === 'JEFE NAVE') clave.jefe.push(p.nombre);
    else if (/^(SUPERVISOR|SUP\.)/.test(c)) clave.sup.push(p.nombre);
    else if (/^CAPATAZ/.test(c)) clave.cap.push(p.nombre);
  }
  return {
    faena: limpio(f.faena), nave: limpio(f.nave), sitio: limpio(f.sitio),
    jefe_nave: limpio(clave.jefe.join(', ')), supervisor: limpio(clave.sup.join(', ')), capataces: limpio(clave.cap.join(', ')),
    dotacion: f.personas.length, cargos,
  };
}

// Lectura exacta del PDF: ubica cada palabra por su posición (columna de turno y columna COD/NOMBRE/CALIF.).
async function leerPorPosicion(buf) {
  const { getDocumentProxy } = await import('npm:unpdf@0.12.1');
  const pdf = await getDocumentProxy(buf);
  const out = { T1: [], T2: [], T3: [] };
  let fecha = null;
  for (let p = 1; p <= Math.min(pdf.numPages, 5); p++) {
    const items = (await (await pdf.getPage(p)).getTextContent()).items.filter((i) => i.str?.trim())
      .map((i) => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5], w: i.width || 0 }));
    if (!fecha) { const m = items.map((i) => i.s).join(' ').match(/(\d{2})-(\d{2})-(\d{4})/); if (m) fecha = `${m[3]}-${m[2]}-${m[1]}`; }
    const heads = [['T1', /PRIMER TURNO/i], ['T2', /SEGUNDO TURNO/i], ['T3', /TERCER TURNO/i]]
      .map(([t, re]) => { const h = items.find((i) => re.test(i.s)); return h && { t, c: h.x + h.w / 2 }; }).filter(Boolean);
    const cods = [...new Set(items.filter((i) => i.s === 'COD').map((i) => Math.round(i.x)))].sort((a, b) => a - b).filter((x, k, a) => k === 0 || x - a[k - 1] > 20);
    if (!heads.length || !cods.length) continue;
    const corr = Math.min(...items.filter((i) => /^\d{1,3}$/.test(i.s) && i.x < cods[0] && i.x > cods[0] - 40).map((i) => i.x), cods[0] - 12);
    const margen = cods[0] - corr + 2;
    const ancho = cods.length > 1 ? cods[1] - cods[0] : 170;
    cods.forEach((codX, k) => {
      const ini = codX - margen, fin = k + 1 < cods.length ? cods[k + 1] - margen : Infinity;
      const turno = heads.reduce((b, h) => (Math.abs(h.c - (codX + ancho / 2)) < Math.abs(b.c - (codX + ancho / 2)) ? h : b)).t;
      const col = items.filter((i) => i.x >= ini && i.x < fin);
      const xNom = col.find((i) => i.s === 'NOMBRE')?.x ?? codX + 30;
      const xCal = col.find((i) => /^CALIF/.test(i.s))?.x ?? codX + ancho * 0.7;
      const filas = [];
      for (const i of col.sort((a, b) => b.y - a.y || a.x - b.x)) {
        const f = filas.find((r) => Math.abs(r.y - i.y) <= 2);
        f ? f.items.push(i) : filas.push({ y: i.y, items: [i] });
      }
      let cur = null;
      for (const { items: r } of filas) {
        r.sort((a, b) => a.x - b.x);
        const txt = r.map((i) => i.s).join(' ');
        const m = txt.match(/^(FAENA|NAVE|SITIO)\s+(.+)$/);
        if (m) {
          if (m[1] === 'FAENA') { cur = { faena: m[2], nave: '', sitio: '', personas: [] }; out[turno].push(cur); }
          else if (cur) cur[m[1].toLowerCase()] = m[2];
          continue;
        }
        if (!cur || !/^\d{1,3}$/.test(r[0].s) || r[0].x >= codX - 2) continue;
        // Fila ordenada por posición: correlativo, código, nombre…, cargo (última celda).
        const celdas = /^\d+$/.test(r[1]?.s || '') ? r.slice(2) : r.slice(1);
        const conCargo = celdas.length >= 2 || (celdas[0] && celdas[0].x >= xCal - 12);
        const calif = conCargo ? celdas[celdas.length - 1].s : '';
        const nombre = (conCargo ? celdas.slice(0, -1) : celdas).map((i) => i.s).join(' ');
        cur.personas.push({ nombre, calif });
      }
    });
  }
  const turnos = Object.entries(out).map(([turno, fs]) => ({ turno, faenas: fs.map(cerrarFaena).filter((f) => f.faena) }));
  return { fecha, turnos };
}

// Respaldo con IA si el PDF viene en otro formato (por ejemplo, escaneado).
async function leerConIA(sr, fileUrl) {
  const res = await sr.integrations.Core.InvokeLLM({
    file_urls: [fileUrl],
    prompt: `Es la "nombrada" diaria de Operaciones de Puerto Ventanas. Arriba indica la fecha. Columnas por turno: PRIMER TURNO = T1, SEGUNDO TURNO = T2, TERCER TURNO = T3. Cada columna tiene bloques FAENA con NAVE (opcional), SITIO y una lista numerada de personas con su CALIF. (cargo).
Para cada turno y faena devuelve faena, nave, sitio y "personas": una entrada por CADA fila numerada con su nombre y calif. No omitas filas. turno exactamente T1, T2 o T3; fecha YYYY-MM-DD.`,
    response_json_schema: {
      type: 'object',
      properties: {
        fecha: { type: 'string' },
        turnos: { type: 'array', items: { type: 'object', properties: {
          turno: { type: 'string' },
          faenas: { type: 'array', items: { type: 'object', properties: {
            faena: { type: 'string' }, nave: { type: 'string' }, sitio: { type: 'string' },
            personas: { type: 'array', items: { type: 'object', properties: { nombre: { type: 'string' }, calif: { type: 'string' } } } },
          } } },
        } } },
      },
    },
  });
  const turnos = (res?.turnos || []).filter((t) => ['T1', 'T2', 'T3'].includes(t.turno))
    .map((t) => ({ turno: t.turno, faenas: (t.faenas || []).slice(0, 40).map((f) => cerrarFaena({ ...f, personas: (f.personas || []).slice(0, 200) })).filter((f) => f.faena) }));
  return { fecha: /^\d{4}-\d{2}-\d{2}$/.test(res?.fecha || '') ? res.fecha : null, turnos };
}

// Lee el PDF de la nombrada (todo el día, los 3 turnos) y devuelve las faenas con sus cargos clave.
export async function leerNombradaPdf(sr, fileUrl) {
  const buf = new Uint8Array(await (await fetch(fileUrl, { signal: AbortSignal.timeout(30000) })).arrayBuffer());
  const exacta = await leerPorPosicion(buf).catch((e) => { console.log('Lectura por posición falló:', e.message); return null; });
  if (exacta?.fecha && exacta.turnos.some((t) => t.faenas.length)) return exacta;
  return await leerConIA(sr, fileUrl);
}

// Regla: una actividad aplica a la faena si alguna de sus palabras está en la faena/sitio
// y, cuando la actividad es de un "Sitio N", el sitio de la faena es el mismo.
export function actividadesDeFaena(catalog, f) {
  const texto = norm(`${f.faena} ${f.sitio}`);
  const n = numSitio(f.sitio);
  return catalog.filter((a) => {
    const claves = (a.faenas || []).map(norm).filter(Boolean);
    if (!claves.some((k) => texto.includes(k))) return false;
    const s = norm(a.sitio).match(/^SITIO (\d+)/);
    return !s || Number(s[1]) === n;
  }).map((a) => a.id);
}

// Carga la nombrada en la programación de cada turno del día (crea el turno si no existe).
export async function aplicarNombrada(sr, { fecha, turnos, asunto, remitente, origen }) {
  const catalog = await sr.entities.Actividad.list('orden', 500);
  const { items: existentes } = await sr.entities.Programacion.filter({ fecha }, { limit: 10 });
  const h = hora();
  const resumen = [];
  for (const t of turnos) {
    if (!t.faenas.length) continue;
    let plan = existentes.find((p) => p.turno === t.turno);
    if (plan?.estado === 'cerrada') { resumen.push({ turno: t.turno, estado: 'cerrado' }); continue; }
    if (!plan) plan = await sr.entities.Programacion.create({ fecha, turno: t.turno, estado: 'borrador' });
    const faenas = t.faenas.map((f) => ({ ...f, actividad_ids: actividadesDeFaena(catalog, f) }));
    const sugeridas = [...new Set(faenas.flatMap((f) => f.actividad_ids))];
    const dotacion = faenas.reduce((s, f) => s + f.dotacion, 0);
    const lineas = faenas.map((f) => ({ texto: `${f.faena}${f.nave ? ' · Nave ' + f.nave : ''} · Sitio ${f.sitio} · ${f.dotacion} pers.`, actividad_id: f.actividad_ids[0] || '' }));
    const correo = agregarEnvio(plan.correo, { asunto: asunto || 'Nombrada de Operaciones', hora: h, remitente: remitente || '', lineas });
    const etiqueta = correo.envios.length === 1 ? 'Nombrada' : `Actualización ${correo.envios.length - 1}`;
    const nuevas = sugeridas.filter((id) => !(plan.actividad_ids || []).includes(id));
    await sr.entities.Programacion.update(plan.id, {
      faenas, dotacion, correo,
      actividad_ids: [...new Set([...(plan.actividad_ids || []), ...sugeridas])],
      bitacora: [...(plan.bitacora || []), { hora: h, texto: `${etiqueta} (PDF, ${origen}) · ${faenas.length} faenas · ${dotacion} personas · ${nuevas.length} actividades sugeridas` }],
    });
    resumen.push({ turno: t.turno, estado: 'aplicado', faenas: faenas.length, dotacion, sugeridas: nuevas.length, sinRegla: faenas.filter((f) => !f.actividad_ids.length).map((f) => f.faena) });
  }
  return resumen;
}