import fs from 'node:fs'
const { calcularProfesional, semanasDelMes } = await import(process.argv[2])
const p = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))
const casos = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'))
console.log('semanas:', Array.from({length:12},(_,i)=>semanasDelMes(p,i+1)).join(' '))
const ok = [0,0,0,0]; let celdas = 0, profOk = 0; const malos = []
for (const c of casos) {
  const r = calcularProfesional(p, c.filas); let todo = true
  r.meses.forEach((m, i) => {
    const e = c.esperado[i]; celdas++
    ;[m.plan_dir, m.plan_total, m.meta_dir, m.meta_total].forEach((v, k) => { if (v === e[k]) ok[k]++; else todo = false })
  })
  if (todo) profOk++; else malos.push(c.id)
}
const pct = (n) => `${n}/${celdas} (${(100*n/celdas).toFixed(1)}%)`
console.log('plan dir   :', pct(ok[0])); console.log('plan total :', pct(ok[1]))
console.log('meta dir   :', pct(ok[2])); console.log('meta total :', pct(ok[3]))
console.log('profesionales idénticos:', profOk, '/', casos.length)
console.log('distintos:', malos.slice(0, 40).join(' '))
const c = casos.find(c => c.id === '71580'); const r = calcularProfesional(p, c.filas)
console.log('71580 plan:', r.meses.map(m => m.plan_dir).join(' '), '| esperado:', c.esperado.map(e => e[0]).join(' '))
