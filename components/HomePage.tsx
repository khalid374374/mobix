'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, fmtDateTime, toAr } from '@/lib/utils';
import { PageId } from '@/app/page';

export default function HomePage({ setPage }: { setPage: (p: PageId) => void }) {
  const [stats, setStats] = useState({ sales: 0, debts: 0, transfers: 0, usedCount: 0 });
  const [shift, setShift] = useState<{ id: number; startTime: string; isActive: boolean } | null>(null);
  const [shiftSales, setShiftSales] = useState(0);
  const [shiftCount, setShiftCount] = useState(0);
  const [elapsed, setElapsed] = useState('—');
  const [balances, setBalances] = useState({ amanNow: 0, forriNow: 0 });

  const load = useCallback(async () => {
    const [invoices, debts, transfers, used, bal, shiftData] = await Promise.all([
      api.getInvoices(), api.getDebts(), api.getTransfers(),
      api.getUsedDevices(), api.getBalances(), api.getShift(),
    ]);
    setStats({
      sales: invoices.reduce((s: number, i: { total: number }) => s + i.total, 0),
      debts: debts.reduce((s: number, d: { amount: number }) => s + d.amount, 0),
      transfers: transfers.reduce((s: number, t: { amount: number }) => s + t.amount, 0),
      usedCount: used.filter((d: { sold: boolean }) => !d.sold).length,
    });
    setShift(shiftData);
    if (shiftData) {
      const shiftInvs = invoices.filter((i: { createdAt: string }) =>
        new Date(i.createdAt) >= new Date(shiftData.startTime));
      setShiftSales(shiftInvs.reduce((s: number, i: { total: number }) => s + i.total, 0));
      setShiftCount(shiftInvs.length);
    }
    setBalances({ amanNow: bal?.amanNow || 0, forriNow: bal?.forriNow || 0 });
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!shift) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(shift.startTime).getTime()) / 60000);
      const h = Math.floor(diff / 60), m = diff % 60;
      setElapsed(toAr(h) + ' ساعة ' + toAr(m) + ' دقيقة');
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [shift]);

  async function closeShift() {
    if (!shift || !confirm('هل أنت متأكد من إقفال الوردية؟ سيتم تصدير تقرير Excel.')) return;
    const [invoices, transfers] = await Promise.all([api.getInvoices(), api.getTransfers()]);
    const shiftInvs = invoices.filter((i: { createdAt: string }) =>
      new Date(i.createdAt) >= new Date(shift.startTime));
    const shiftTrans = transfers.filter((t: { createdAt: string }) =>
      new Date(t.createdAt) >= new Date(shift.startTime));
    const totalSales = shiftInvs.reduce((s: number, i: { total: number }) => s + i.total, 0);
    const totalFees = shiftTrans.reduce((s: number, t: { fee: number }) => s + t.fee, 0);
    const netIncome = totalSales + totalFees;

    // Export Excel CSV
    const BOM = '\uFEFF';
    const rows: (string | number)[][] = [
      ['تقرير الوردية'],
      ['بداية الوردية', fmtDateTime(shift.startTime)],
      ['نهاية الوردية', fmtDateTime(new Date())],
      [],
      ['=== ملخص ==='],
      ['إجمالي المبيعات', totalSales],
      ['إجمالي عمولات التحويل', totalFees],
      ['صافي الدخل', netIncome],
      ['عدد الفواتير', shiftInvs.length],
      [],
      ['=== الفواتير ==='],
      ['العميل', 'الإجمالي', 'المدفوع', 'المتبقي', 'طريقة الدفع', 'الوقت'],
      ...shiftInvs.map((i: { customer: string; total: number; paid: number; remaining: number; method: string; createdAt: string }) =>
        [i.customer, i.total, i.paid, i.remaining, i.method, fmtDateTime(i.createdAt)]),
      [],
      ['=== التحويلات ==='],
      ['النوع', 'العميل', 'المبلغ', 'العمولة', 'الوقت'],
      ...shiftTrans.map((t: { type: string; customer: string; amount: number; fee: number; createdAt: string }) =>
        [t.type, t.customer, t.amount, t.fee, fmtDateTime(t.createdAt)]),
    ];
    const csv = BOM + rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `تقرير_وردية_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);

    await api.closeShift({ shiftId: shift.id, totalSales, totalFees, netIncome, invoiceCount: shiftInvs.length });
    alert('تم إقفال الوردية ✅\nصافي الدخل: ' + fmtMoney(netIncome));
    load();
  }

  return (
    <div className="page active">
      <div className="cards-grid">
        <div className="metric"><div className="metric-label"><i className="ti ti-cash" /> مبيعات اليوم</div><div className="metric-val green">{fmtMoney(stats.sales)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-users" /> ديون العملاء</div><div className="metric-val red">{fmtMoney(stats.debts)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-arrows-exchange" /> تحويلات اليوم</div><div className="metric-val blue">{fmtMoney(stats.transfers)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-device-mobile" /> أجهزة مستعملة</div><div className="metric-val amber">{toAr(stats.usedCount)} جهاز</div></div>
      </div>

      <div className="card">
        <div className="section-title">الوردية الحالية</div>
        <div className="shift-box">
          <div className="shift-row"><span className="shift-key">بداية الوردية</span><span className="shift-val">{shift ? fmtDateTime(shift.startTime) : '—'}</span></div>
          <div className="shift-row"><span className="shift-key">الوقت المنقضي</span><span className="shift-val">{elapsed}</span></div>
          <div className="shift-row"><span className="shift-key">عدد الفواتير</span><span className="shift-val">{toAr(shiftCount)} فاتورة</span></div>
          <div className="shift-row"><span className="shift-key">إجمالي المبيعات</span><span className="shift-val" style={{ color: 'var(--green)' }}>{fmtMoney(shiftSales)}</span></div>
        </div>
        <button className="btn btn-danger btn-full" style={{ marginTop: '10px' }} onClick={closeShift}>
          <i className="ti ti-player-stop" /> إقفال الوردية وتصدير Excel
        </button>
      </div>

      <div className="card">
        <div className="section-title">ملخص الأرصدة</div>
        <div className="row"><span className="row-key">مكنة أمان</span><span className="row-val" style={{ color: 'var(--blue)' }}>{fmtMoney(balances.amanNow)}</span></div>
        <div className="row"><span className="row-key">فوري</span><span className="row-val" style={{ color: 'var(--blue)' }}>{fmtMoney(balances.forriNow)}</span></div>
        <div className="summary-total">
          <span className="total-label">الإجمالي</span>
          <span className="total-val">{fmtMoney(balances.amanNow + balances.forriNow)}</span>
        </div>
      </div>
    </div>
  );
}
