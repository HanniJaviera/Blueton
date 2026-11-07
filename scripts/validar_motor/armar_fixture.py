import openpyxl, json, sys, collections, datetime
from openpyxl.utils import column_index_from_string as ci
plan, buk, out = sys.argv[1], sys.argv[2], sys.argv[3]
# Horas BUK por persona y mes (solo personas con una fila por mes)
wb = openpyxl.load_workbook(buk, read_only=True, data_only=True)
ws = wb.worksheets[0]
horas = collections.defaultdict(dict); dup = set()
for r in ws.iter_rows(min_row=3, values_only=True):
    pid, per, hs = r[2], r[7], r[12]
    if pid is None or not isinstance(per, datetime.datetime): continue
    k = (str(pid), per.month)
    if k[1] in horas[k[0]]: dup.add(k[0])
    horas[k[0]][k[1]] = float(hs or 0)
wb = openpyxl.load_workbook(plan, read_only=True, data_only=True)
ws = [w for w in wb.worksheets if w.title.startswith('Dotacion_Asistencial')][0]
g = lambda r, c: r[ci(c)-1]
col = lambda c, k: openpyxl.utils.get_column_letter(ci(c)+k)
casos = []
for r in ws.iter_rows(min_row=5, max_row=475, values_only=True):
    pid = g(r,'K')
    if pid is None or g(r,'F') or g(r,'L') == 'R' or str(pid) in dup or str(pid) not in horas: continue
    T, U = g(r,'T'), g(r,'U')
    if not isinstance(T, datetime.datetime) or not isinstance(U, datetime.datetime): continue
    hb = horas[str(pid)]; ult = max(hb)
    filas, esperado = [], []
    for m in range(T.month, U.month + 1):
        h = hb.get(m, hb[ult] if m > ult else 0)
        filas.append({'id_profesional': str(pid), 'mes': f'2026-{m:02d}', 'horas_contratadas': h,
                      'sem_habiles': float(g(r, col('DZ', m-1)) or 0), 'semanas': float(g(r, col('BI', m-1)) or 0),
                      'cargo': g(r,'M'), 'area': g(r,'P'), 'cod_esp': g(r,'N'), 'instituto': g(r,'D'),
                      'meta_atenciones': g(r, col('GA', m-1)) or 0, 'nombre': f"{g(r,'M').title()} {pid}",
                      'colacion_contrato_h': float(g(r,'AC') or 0), 'h_asignaciones': float(g(r,'AS') or 0)})
        esperado.append([g(r, col(c, m-1)) or 0 for c in ('EN','FA','FN','GA')])
    casos.append({'id': str(pid), 'filas': filas, 'esperado': esperado})
json.dump(casos, open(out,'w'))
print(len(casos), 'profesionales en el fixture')
