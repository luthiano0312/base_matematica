/**
 * Extrai o ID de um vídeo do YouTube a partir de qualquer formato comum de
 * URL: watch?v= (com ou sem parâmetros extras), youtu.be/, embed/ e shorts/.
 * Retorna null quando o ID não pode ser extraído — quem chama decide o
 * fallback (link simples em vez de iframe).
 */
const PADRAO_YT =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export function extrairYoutubeId(url: string): string | null {
  return url.match(PADRAO_YT)?.[1] ?? null;
}
