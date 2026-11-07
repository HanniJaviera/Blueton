# Validación del motor (utils/motor.ts) contra la planilla

Los Excel del kit **no van al repo** (están en `.gitignore`). Colócalos en `Blueton/` y corre:

```bash
pip install openpyxl
# 1. Parámetros iniciales (data/parametros.base.json) desde la planilla
python scripts/validar_motor/generar_parametros.py "Nac - Planificación Asistencial x mes.xlsx" data/parametros.base.json
# 2. Casos de prueba: horas del BUK + semanas hábiles y resultados esperados de Dotacion_Asistencial
python scripts/validar_motor/armar_fixture.py "Nac - Planificación Asistencial x mes.xlsx" "Nac - Base contratos x mes.xlsx" fixture.json
# 3. Comparar celda a celda
node --experimental-strip-types scripts/validar_motor/validar.mjs "file:///$PWD/utils/motor.ts" data/parametros.base.json fixture.json
```

Resultado al 07-11-2026: 99,5% de las celdas de plan mensual idénticas (5.220 de 5.244) y 432 de 455
profesionales con todo el año idéntico. Las diferencias son los casos documentados en `logica.md` §9
(ajustes manuales y datos viejos de la planilla). `fixture.json` tiene datos del personal: no lo subas.
