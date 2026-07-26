const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

export function normalizeDigits(str) {
  if (!str) return ''
  let s = String(str)
  for (let i = 0; i < 10; i++) {
    s = s.replace(new RegExp(persianDigits[i], 'g'), String(i))
    s = s.replace(new RegExp(arabicDigits[i], 'g'), String(i))
  }
  return s
}

export function parsePrice(val) {
  if (val == null) return 0
  const num = parseInt(normalizeDigits(String(val)).replace(/,/g, ''))
  return Number.isFinite(num) && num > 0 ? num : 0
}
