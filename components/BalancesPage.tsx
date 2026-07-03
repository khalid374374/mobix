'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, toAr } from '@/lib/utils';

export default function BalancesPage() {
  const [amanBefore, setAmanBefore] = useState('');
  const [amanNow, setAmanNow] = useState('');
  const [forriBefore, setForriBefore] = useState('');
  const [forriNow, setForriNow] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getBalances().then(b => {
      if (!b) return;
      setAmanBefore(String(b.amanBefore || ''));
      setAmanNow(String(b.amanNow || ''));
      setForriBefore(String(b.forriBefore || ''));
      setForriNow(String(b.forriNow || ''));
    });
  }, []);

  async function save() {
    await api.updateBalances({
      amanBefore: parseFloat(amanBefore) || 0,
      amanNow: parseFloat(amanNow) || 0,
      forriBefore: parseFloat(forriBefore) || 0,
      forriNow: parseFloat(forriNow) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const amanB = parseFloat(amanBefore) || 0;
  const amanN = parseFloat(amanNow) || 0;
  const forriB = parseFloat(forriBefore) || 0;
  const forriN = parseFloat(forriNow) || 0;
  const amanPct = amanB > 0 ? Math.round(((amanB - amanN) / amanB) * 100) : 0;
  const forriPct = forriB > 0 ? Math.round(((forriB - forriN) / forriB) * 100) : 0;

  return (
    <div className="page active">
      <div className="card">
        <div className="section-title">مكنة أمان</div>
        <div className="input-row">
          <div className="input-group"><label>كان فيها</label><input value={amanBefore} onChange={e => setAmanBefore(e.target.value)} placeholder="٠" /></div>
          <div className="input-group"><label>دلوقتي فيها</label><input value={amanNow} onChange={e => setAmanNow(e.target.value)} placeholder="٠" style={{ color: 'var(--blue)' }} /></div>
        </div>
        <div className="progress-wrap">
          <div className="progress-label"><span>تم صرف {fmtMoney(amanB - amanN)}</span><span>{toAr(amanPct)}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${amanPct}%`, background: 'var(--blue)' }} /></div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">فوري</div>
        <div className="input-row">
          <div className="input-group"><label>كان فيها</label><input value={forriBefore} onChange={e => setForriBefore(e.target.value)} placeholder="٠" /></div>
          <div className="input-group"><label>دلوقتي فيها</label><input value={forriNow} onChange={e => setForriNow(e.target.value)} placeholder="٠" style={{ color: 'var(--amber)' }} /></div>
        </div>
        <div className="progress-wrap">
          <div className="progress-label"><span>تم صرف {fmtMoney(forriB - forriN)}</span><span>{toAr(forriPct)}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${forriPct}%`, background: 'var(--amber)' }} /></div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={save}>
        <i className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`} /> {saved ? 'تم الحفظ ✅' : 'حفظ الأرصدة'}
      </button>

      <div className="card">
        <div className="section-title">الرصيد الإجمالي</div>
        <div className="row"><span className="row-key">مكنة أمان</span><span className="row-val" style={{ color: 'var(--blue)' }}>{fmtMoney(amanN)}</span></div>
        <div className="row"><span className="row-key">فوري</span><span className="row-val" style={{ color: 'var(--amber)' }}>{fmtMoney(forriN)}</span></div>
        <div className="summary-total">
          <span className="total-label">الإجمالي الكلي</span>
          <span className="total-val" style={{ fontSize: 24 }}>{fmtMoney(amanN + forriN)}</span>
        </div>
      </div>
    </div>
  );
}
