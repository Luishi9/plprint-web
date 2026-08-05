import DOMPurify from 'dompurify';

const BASE_TAGS = [
  'html', 'head', 'body', 'style', 'title', 'meta',
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'strong', 'b', 'em', 'i', 'br', 'hr', 'img', 'button',
];

const ALLOWED_ATTR = [
  'class', 'style', 'src', 'alt', 'width', 'height',
  'colspan', 'rowspan', 'id', 'charset', 'name', 'content',
];

const DOC_CONFIG = {
  ALLOWED_TAGS: BASE_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  // Para documentos completos (<!DOCTYPE html><html>...<body>...</body></html>).
  // Conserva <html>, <head>, <body> y <style>. Sin esta opción, DOMPurify devuelve
  // solo el innerHTML del body, lo que produce el "bug del contenido movido"
  // porque el navegador improvisa el wrap y los estilos de @page/@media print
  // no se aplican correctamente.
  WHOLE_DOCUMENT: true,
};

const FRAGMENT_CONFIG = {
  ALLOWED_TAGS: BASE_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  // Sin WHOLE_DOCUMENT. Para fragmentos de React (innerHTML) que el llamador
  // concatena dentro de su propio <body>. Si se activase WHOLE_DOCUMENT el
  // output se wrappear-a en <html> lo que duplica el wrap del llamador.
};

/**
 * Sanitiza un documento HTML completo (con <!DOCTYPE>, <html>, <head>, <body>).
 * Preserva la estructura para que renderice correctamente en la ventana de
 * impresion del navegador.
 */
export function sanitizePrintHtml(html: string): string {
  return DOMPurify.sanitize(html, DOC_CONFIG);
}

/**
 * Sanitiza un fragmento de HTML (sin wrap de documento).
 * Usar en innerHTML de un sub-arbol renderizado por React, donde el
 * llamador concatena el resultado dentro de su propio <body>.
 */
export function sanitizePrintFragment(html: string): string {
  return DOMPurify.sanitize(html, FRAGMENT_CONFIG);
}
