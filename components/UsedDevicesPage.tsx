'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtMoney } from '@/lib/utils';

interface Device { id: number; name: string; condition: string; buyPrice: number; sellPrice: number; notes?: string; sold: boolean }

export default function UsedDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState(''); const [condition, setCondition] = useState('ممتاز');
  const [buyPrice, setBuyPrice] = useState(''); const [sellPrice, setSellPrice] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => setDevices(await api.getUsedDevices());
  useEffect(() => { load(); }, []);

  async function add() {
    const buy = parseFloat(buyPrice) || 0, sell = parseFloat(sellPrice) || 0;
    if (!name || buy <= 0 || sell <= 0) { alert('أدخل بيانات الجهاز بشكل صحيح'); return; }
    await api.addUsedDevice({ name, condition, buyPrice: buy, sellPrice: sell, notes, sold: false });
    setName(''); setBuyPrice(''); setSellPrice(''); setNotes('');
    load();
  }

  return (
    <div className="page active">
      <div className="card">
        <div className="section-title">إضافة جهاز مستعمل</div>
        <div className="input-row">
          <div className="input-group"><label>نوع الجهاز</label><input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: Samsung S24" /></div>
          <div className="input-group" style={{ maxWidth: 130 }}><label>الحالة</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}>
              <option>ممتاز</option><option>جيد جداً</option><option>جيد</option><option>عادي</option>
            </select>
          </div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>سعر الشراء</label><input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>سعر البيع</label><input value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>ملاحظات</label><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="مثلاً: شاشة مكسورة" /></div>
        </div>
        <button className="btn btn-primary" onClick={add}><i className="ti ti-plus" /> إضافة الجهاز</button>
      </div>
      <div className="card">
        <div className="section-title">الأجهزة الموجودة</div>
        <table>
          <thead><tr><th>الجهاز</th><th>الحالة</th><th>شراء</th><th>بيع</th><th>الربح</th><th>الوضع</th></tr></thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td>{d.name}{d.notes && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> ({d.notes})</span>}</td>
                <td>{d.condition}</td>
                <td>{fmtMoney(d.buyPrice)}</td>
                <td>{fmtMoney(d.sellPrice)}</td>
                <td style={{ color: 'var(--green)' }}>{fmtMoney(d.sellPrice - d.buyPrice)}</td>
                <td><span className={`badge ${d.sold ? 'badge-green' : 'badge-amber'}`}>{d.sold ? 'تم البيع' : 'معروض'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
