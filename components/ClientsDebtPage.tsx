'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, fmtDateTime } from '@/lib/utils';

interface Debt { id: number; name: string; phone?: string; amount: number; note?: string; createdAt: string }

export default function ClientsDebtPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('');

  const load = async () => setDebts(await api.getDebts());
  useEffect(() => { load(); }, []);

  const total = debts.reduce((s, d) => s + d.amount, 0);

  async function addDebt() {
    const amt = parseFloat(amount.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))) || 0;
    if (!name || amt <= 0) { alert('أدخل اسم العميل والمبلغ'); return; }
    await api.addDebt({ name, phone, amount: amt, note, settled: false });
    setName(''); setPhone(''); setAmount(''); setNote('');
    load();
  }

  async function settle(id: number) {
    await api.settleDebt(id);
    load();
  }

  return (
    <div className="page active">
      <div className="card">
        <div className="section-title">تسجيل دين جديد</div>
        <div className="input-row">
          <div className="input-group"><label>اسم العميل</label><input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم بالكامل" /></div>
          <div className="input-group"><label>رقم التليفون</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01x..." /></div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>المبلغ</label><input value={amount} onChange={e => setAmount(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>السبب / الملاحظة</label><input value={note} onChange={e => setNote(e.target.value)} placeholder="مثلاً: iPhone 15 آجل" /></div>
        </div>
        <button className="btn btn-primary" onClick={addDebt}><i className="ti ti-plus" /> إضافة</button>
      </div>
      <div className="card">
        <div className="section-title">قائمة المديونيات</div>
        <table>
          <thead><tr><th>العميل</th><th>التليفون</th><th>المبلغ</th><th>التاريخ والوقت</th><th /></tr></thead>
          <tbody>
            {debts.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td style={{ direction: 'ltr', textAlign: 'right' }}>{d.phone || '—'}</td>
                <td style={{ color: 'var(--red)', fontWeight: 600 }}>{fmtMoney(d.amount)}</td>
                <td><span className="timestamp">{fmtDateTime(d.createdAt)}</span></td>
                <td><button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => settle(d.id)}><i className="ti ti-check" /> سدّد</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-total">
          <span className="total-label">إجمالي الديون</span>
          <span className="total-val" style={{ color: 'var(--red)' }}>{fmtMoney(total)}</span>
        </div>
      </div>
    </div>
  );
}
