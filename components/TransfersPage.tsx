'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, fmtDateTime } from '@/lib/utils';

interface Transfer { id: number; type: string; customer?: string; amount: number; fee: number; createdAt: string }

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [type, setType] = useState('فودافون كاش');
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');

  const load = async () => setTransfers(await api.getTransfers());
  useEffect(() => { load(); }, []);

  const totalAmt = transfers.reduce((s, t) => s + t.amount, 0);
  const totalFees = transfers.reduce((s, t) => s + t.fee, 0);

  async function add() {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) { alert('أدخل مبلغ التحويل'); return; }
    await api.addTransfer({ type, customer: customer || '—', amount: amt, fee: parseFloat(fee) || 0 });
    setCustomer(''); setAmount(''); setFee('');
    load();
  }

  return (
    <div className="page active">
      <div className="card">
        <div className="section-title">تسجيل تحويل جديد</div>
        <div className="input-row">
          <div className="input-group"><label>نوع الخدمة</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>فودافون كاش</option><option>انستا باي</option>
            </select>
          </div>
          <div className="input-group"><label>اسم العميل (اختياري)</label><input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="مثلاً: محمد علي" /></div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>المبلغ المحوّل</label><input value={amount} onChange={e => setAmount(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>العمولة المحصّلة</label><input value={fee} onChange={e => setFee(e.target.value)} placeholder="٠ ج" /></div>
        </div>
        <button className="btn btn-primary" onClick={add}><i className="ti ti-check" /> تسجيل التحويل</button>
      </div>
      <div className="card">
        <div className="section-title">تحويلات اليوم</div>
        <table>
          <thead><tr><th>الخدمة</th><th>العميل</th><th>المبلغ</th><th>العمولة</th><th>الوقت</th></tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id}>
                <td><span className={`badge ${t.type === 'فودافون كاش' ? 'badge-red' : 'badge-blue'}`}>{t.type === 'فودافون كاش' ? 'ف. كاش' : 'انستا باي'}</span></td>
                <td>{t.customer || '—'}</td>
                <td>{fmtMoney(t.amount)}</td>
                <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtMoney(t.fee)}</td>
                <td><span className="timestamp">{fmtDateTime(t.createdAt)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals-footer">
          <span style={{ color: 'var(--text-secondary)' }}>إجمالي التحويلات</span>
          <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{fmtMoney(totalAmt)}</span>
          <span style={{ color: 'var(--text-secondary)' }}>إجمالي العمولات</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtMoney(totalFees)}</span>
        </div>
      </div>
    </div>
  );
}
