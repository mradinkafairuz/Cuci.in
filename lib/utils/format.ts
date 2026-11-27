// Format angka menjadi Rupiah, contoh: 7000 -> "Rp 7.000"
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/ /g, " ");
}
