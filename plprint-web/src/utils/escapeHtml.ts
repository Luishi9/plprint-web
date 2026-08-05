const AMP = String.fromCharCode(38);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const QUOT = String.fromCharCode(34);
const APOS = String.fromCharCode(39);
const BTICK = String.fromCharCode(96);

const HTML_ESCAPE: Record<string, string> = {
  [AMP]: AMP + 'amp;',
  [LT]: LT + 'lt;',
  [GT]: GT + 'gt;',
  [QUOT]: QUOT + 'quot;',
  [APOS]: APOS + '#39;',
  [BTICK]: BTICK + '#96;',
};

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPE[ch] ?? ch);
}
