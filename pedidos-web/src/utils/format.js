export function formatarData(valor) {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('pt-BR')
}
