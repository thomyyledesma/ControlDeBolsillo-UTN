export function validarPeriodo(desde: string, hasta: string): string | null {
  if (!desde || !hasta) return 'Indicá la fecha de inicio y la fecha final.';
  if (desde > hasta) return 'La fecha de inicio no puede ser posterior a la fecha final.';
  return null;
}

export function limpiarMarkdown(texto: string): string {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}
