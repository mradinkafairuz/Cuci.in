export function isValidIndonesianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return /^08\d{7,11}$/.test(normalized);
}
