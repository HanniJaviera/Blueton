/** Horas para mostrar: máximo 1 decimal, formato chileno (25,3 · 42). Solo presentación; los cálculos usan el valor exacto. */
export const horas = (n: unknown) => (Number(n) || 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })
