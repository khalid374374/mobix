'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, parseNum, toAr } from '@/lib/utils';

interface InvItem { id?: number; name: string; qty: number; price: number; inventoryId?: number }
interface InventoryProduct { id: number; name: string; price: number; qty: number }

export default function InvoicePage() {
  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvItem[]>([]);
  const [prodName, setProdName] = useState('');
  const [prodQty, setProdQty] = useState(1);
  const [prodPrice, setProdPrice] = useState('');
  const [prodInvId, setProdInvId] = useState<number | null>(null);
  const [method, setMethod] = useState('كاش');
  const [paid, setPaid] = useState('');
  const [suggestions, setSuggestions] = useState<InventoryProduct[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const paidNum = parseNum(paid);
  const remaining = Math.max(total - paidNum, 0);

  // Autocomplete
  useEffect(() => {
    if (!prodName.trim()) { setSuggestions([]); setShowSugg(false); return; }
    const t = setTimeout(async () => {
      const data = await api.getInventory(prodName);
      const filtered = data.filter((p: InventoryProduct) => p.qty > 0);
      setSuggestions(filtered);
      setShowSugg(filtered.length > 0);
    }, 200);
    return () => clearTimeout(t);
  }, [prodName]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  function selectSuggestion(item: InventoryProduct) {
    setProdName(item.name);
    setProdPrice(String(item.price));
    setProdInvId(item.id);
    setShowSugg(false);
  }

  function addItem() {
    const price = parseNum(prodPrice);
    if (!prodName.trim() || price <= 0) { alert('أدخل اسم المنتج والسعر'); return; }
    if (prodInvId) {
      const inv = suggestions.find(s => s.id === prodInvId);
      if (inv && inv.qty < prodQty) { alert(`الكمية المطلوبة أكبر من المتوفر (${toAr(inv.qty)})`); return; }
    }
    setItems([...items, { name: prodName, qty: prodQty, price, inventoryId: prodInvId || undefined }]);
    setProdName(''); setProdQty(1); setProdPrice(''); setProdInvId(null);
  }

  async function confirmInvoice() {
    if (!items.length) { alert('أضف منتج واحد على الأقل'); return; }
    await api.addInvoice({ customer: customer || 'عميل', method, total, paid: paidNum, remaining, items });
    alert(`تم تأكيد الفاتورة ✅\nالإجمالي: ${fmtMoney(total)}\nالمتبقي: ${fmtMoney(remaining)}`);
    setItems([]); setCustomer(''); setPaid('');
  }

  return (
    <div className="page active">
      <div className="card">
        <div className="section-title">بيانات الفاتورة</div>
        <div className="input-row">
          <div className="input-group"><label>اسم العميل</label><input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="مثلاً: أحمد محمد" /></div>
          <div className="input-group" style={{ maxWidth: 160 }}><label>التاريخ</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <div className="divider" />
        <div className="section-title" style={{ marginTop: 12 }}>المنتجات</div>
        <div className="input-row">
          <div className="input-group autocomplete-wrap" ref={wrapRef}>
            <label>المنتج</label>
            <input value={prodName} onChange={e => { setProdName(e.target.value); setProdInvId(null); }}
              placeholder="ابدأ الكتابة للبحث في المخزن..." autoComplete="off" />
            {showSugg && (
              <div className="autocomplete-list">
                {suggestions.map(s => (
                  <div key={s.id} className="autocomplete-item" onClick={() => selectSuggestion(s)}>
                    <span>{s.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{fmtMoney(s.price)} · كمية: {toAr(s.qty)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="input-group" style={{ maxWidth: 80 }}><label>الكمية</label><input type="number" min={1} value={prodQty} onChange={e => setProdQty(+e.target.value)} /></div>
          <div className="input-group" style={{ maxWidth: 120 }}><label>السعر</label><input value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="٠ ج" /></div>
        </div>
        <button className="btn btn-full" style={{ marginBottom: 12 }} onClick={addItem}><i className="ti ti-plus" /> إضافة منتج</button>

        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th /></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td><td>{toAr(item.qty)}</td>
                <td>{fmtMoney(item.price)}</td><td>{fmtMoney(item.qty * item.price)}</td>
                <td><button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={() => setItems(items.filter((_, j) => j !== i))}><i className="ti ti-trash" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary-total">
          <span className="total-label">إجمالي الفاتورة</span>
          <span className="total-val">{fmtMoney(total)}</span>
        </div>
        <div className="divider" style={{ marginBottom: 12 }} />
        <div className="input-row">
          <div className="input-group"><label>طريقة الدفع</label>
            <select value={method} onChange={e => setMethod(e.target.value)}>
              <option>كاش</option><option>فودافون كاش</option><option>انستا باي</option><option>آجل (دين)</option>
            </select>
          </div>
          <div className="input-group"><label>المبلغ المدفوع</label><input value={paid} onChange={e => setPaid(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>الباقي</label><input readOnly value={fmtMoney(remaining)} style={{ color: 'var(--red)' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmInvoice}><i className="ti ti-check" /> تأكيد الفاتورة</button>
          <button className="btn" onClick={() => window.print()}><i className="ti ti-printer" /> طباعة</button>
        </div>
      </div>
    </div>
  );
}
