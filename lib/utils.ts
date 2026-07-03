export function toAr(num: number | string): string {
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return num.toString().replace(/\d/g, d => ar[parseInt(d)]);
}

export function fmtMoney(num: number): string {
  return toAr(Math.round(num).toLocaleString('en-US')) + ' ج';
}

export function fmtDateTime(date: Date | string): string {
  const d = new Date(date);
  let h = d.getHours(), m = d.getMinutes().toString().padStart(2,'0');
  const p = h >= 12 ? 'م' : 'ص'; h = h % 12 || 12;
  const day = toAr(d.getDate())+'/'+toAr(d.getMonth()+1)+'/'+toAr(d.getFullYear());
  return day + ' — ' + toAr(h) + ':' + toAr(m) + ' ' + p;
}

export function parseNum(val: string): number {
  const en = (val||'').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return parseFloat(en.replace(/[^\d.]/g,'')) || 0;
}
