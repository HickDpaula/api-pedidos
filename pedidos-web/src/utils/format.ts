export function formatarData(valor?: string | null) {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('pt-BR')
}
