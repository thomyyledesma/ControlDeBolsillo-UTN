import { hoyISO } from '../../shared/utils/fechas';

export function validarPeriodo(
  desde: string,
  hasta: string,
  hoy: string = hoyISO(),
): string | null {
  if (!desde || !hasta) return 'Indicá la fecha de inicio y la fecha final.';
  if (desde > hasta) return 'La fecha de inicio no puede ser posterior a la fecha final.';
  if (hasta > hoy) return 'El período no puede incluir fechas futuras.';
  return null;
}

export function limpiarMarkdown(texto: string): string {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}
