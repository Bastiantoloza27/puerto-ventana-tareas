// Misma regla que al cargar la nombrada, calculada con el catálogo actual.
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
const NUM = { UNO: 1, DOS: 2, TRES: 3, CUATRO: 4, CINCO: 5, SEIS: 6, SIETE: 7, OCHO: 8, NUEVE: 9, DIEZ: 10 };
const numSitio = (s) => { const t = norm(s); const d = t.match(/\b(\d{1,2})\b/); if (d) return Number(d[1]); const w = Object.keys(NUM).find((k) => new RegExp(`\\b${k}\\b`).test(t)); return w ? NUM[w] : null; };

export function actividadesDeFaena(catalog, f) {
  const texto = norm(`${f.faena} ${f.sitio}`);
  const n = numSitio(f.sitio);
  return catalog.filter((a) => {
    const claves = (a.faenas || []).map(norm).filter(Boolean);
    if (!claves.some((k) => texto.includes(k))) return false;
    const s = norm(a.sitio).match(/^SITIO (\d+)/);
    return !s || Number(s[1]) === n;
  });
}