const COMPACT_CODE_PATTERN = /^LDR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/i;
const LEGACY_CODE_PATTERN = /^LDR-[A-F0-9]{24}$/i;

export function isValidOrderCode(code: string): boolean {
  return COMPACT_CODE_PATTERN.test(code) || LEGACY_CODE_PATTERN.test(code);
}
