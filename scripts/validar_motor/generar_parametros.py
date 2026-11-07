import openpyxl, json, sys, datetime
from openpyxl.utils import column_index_from_string as ci
f, out = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
H = {w.title[:6]: w for w in wb.worksheets}
def rows(ws, r0, r1): return list(ws.iter_rows(min_row=r0, max_row=r1, values_only=True))
g = lambda r, c: r[ci(c)-1] if ci(c)-1 < len(r) else None
num = lambda v: float(v) if isinstance(v, (int, float)) else 0.0

dist_ws = [w for w in wb.worksheets if w.title.startswith('Distribucion_NAC')][0]
distribucion, asignaciones = [], []
for r in rows(dist_ws, 7, 195):
    if g(r,'B') and str(g(r,'B')).strip().upper() != 'CARGO':  # salta el encabezado repetido en la hoja
        distribucion.append({
            'cargo': str(g(r,'B')).strip(), 'esp': g(r,'A') or '', 'unidad': g(r,'C') or '',
            'min_dir': num(g(r,'D')), 'min_ind': num(g(r,'E')),
            'alto':  {'dir': num(g(r,'F')), 'ind': num(g(r,'G')), 'nas': num(g(r,'H'))},
            'medio': {'dir': num(g(r,'I')), 'ind': num(g(r,'J')), 'nas': num(g(r,'K'))},
            'bajo':  {'dir': num(g(r,'L')), 'ind': num(g(r,'M')), 'nas': num(g(r,'N'))},
        })
    if g(r,'R'):
        desc = str(g(r,'T') or '')
        asignaciones.append({'nombre': str(g(r,'R')).strip(), 'horas': num(g(r,'S')), 'detalle': desc,
                             'requiere_autorizacion': 'autoriz' in desc.lower(), 'activa': True})

par = [w for w in wb.worksheets if w.title.startswith('Par')][0]
pr = rows(par, 1, 138)
grupal = [{'area': g(r,'F'), 'pct': num(g(r,'G')), 'pacientes_san_con': num(g(r,'H')), 'pacientes_otros': num(g(r,'I'))}
          for r in pr[3:8] if g(r,'F')]
feriados = []
for r in pr:
    d, tipo = g(r,'K'), g(r,'L')
    if isinstance(d, datetime.datetime) and tipo and 'Fines de Semana' not in tipo:
        feriados.append({'fecha': d.date().isoformat(), 'nombre': tipo.strip(),
                         'tipo': 'colectivo' if 'Colectivo' in tipo else 'nacional', 'region': None})
for r in pr[27:40]:  # bloque 'Feriado Arica' (S28...)
    if isinstance(g(r,'S'), datetime.datetime):
        feriados.append({'fecha': g(r,'S').date().isoformat(), 'nombre': 'Feriado regional Arica', 'tipo': 'regional', 'region': 'Ari'})
jornada_nacional = {g(r,'AB'): num(g(r,'AC')) for r in pr[34:44] if g(r,'AB')}

p = {
  'version': 1,
  'actualizado_en': None, 'actualizado_por': 'Carga inicial desde Nac - Planificación Asistencial x mes.xlsx',
  'tramos': {'alto_desde': 40, 'medio_desde': 22},
  'distribucion': distribucion,
  'asignaciones': {'max_por_profesional': 2, 'catalogo': asignaciones},
  'grupal': grupal,
  'calendario': {
    'anio': 2026, 'feriados': feriados,
    'redondeo_arriba_meses': [5, 7],
    'vacaciones': {'legales': 15, 'adicionales_staff': 5, 'adicionales_zona_extrema': 10},
    'dias_especiales': {'administrativos': 3.5, 'cumpleanos': 1, 'otros': 1},
    'jornada_nacional_por_area': jornada_nacional,
  },
  'jornada_meta': {
    'jornada_legal': [{'desde': '2026-01', 'horas': 44}, {'desde': '2026-05', 'horas': 42}],
    'pct_meta': 0.9,
    'pausa_saludable': {'pct_desde_40': 0.10, 'pct_bajo_40': 0.06},
  },
  'ajustes': [
    {'id_profesional': '71613', 'campo': 'distribucion', 'valor': {'dir': 0.10, 'ind': 0.0, 'nas': 0.90}, 'por_que': 'Usa los % de JEFE TERAPIA OCUPACIONAL AC (planilla 2026)'},
    *[{'id_profesional': i, 'campo': 'min_dir', 'valor': 60, 'por_que': 'Minutos de atención directa 60 en la planilla 2026 (su cargo dice 40)'} for i in ['71232','71292','71372','72458']],
    {'id_profesional': '134744', 'campo': 'ba', 'valor': 15, 'por_que': 'Atenciones directas por semana escritas a mano en la planilla 2026 (la fórmula da 14)'},
  ],
  'historial': [],
}
for a in p['ajustes']: a.update({'quien': 'Planilla 2026 (carga inicial)', 'fecha': '2026-11-07'})
json.dump(p, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(distribucion), 'cargos |', len(asignaciones), 'asignaciones |', len(grupal), 'grupal |', len(feriados), 'feriados')
