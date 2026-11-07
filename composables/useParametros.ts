// Reglas parametrizables, de SOLO LECTURA en el dashboard: se editan en
// Parametros.xlsx, que lee Blue Prism (no hay API para guardarlas).
// ponytail: muestra la copia en mocks/parametros.json; si Blue Prism sube
// un parametros.json al blob, basta con leerlo aquí con useDatosBlob.
import parametros from '~/mocks/parametros.json'

export function useParametros() {
  async function obtener() {
    return structuredClone(parametros) as any
  }

  async function guardar(_parametros: any): Promise<{ ok: boolean }> {
    throw new Error('Las reglas se editan en Parametros.xlsx, que lee Blue Prism.')
  }

  return { obtener, guardar }
}
