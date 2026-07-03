import { PageId } from '@/app/page';

const nav = [
  { id: 'home',      label: 'الرئيسية',    icon: 'ti-layout-dashboard' },
  { id: 'invoice',   label: 'فاتورة بيع',   icon: 'ti-receipt' },
  { id: 'used',      label: 'مستعملة',      icon: 'ti-refresh' },
  { id: 'clients',   label: 'ديون العملاء', icon: 'ti-users' },
  { id: 'transfers', label: 'تحويلات',      icon: 'ti-arrows-exchange' },
  { id: 'balances',  label: 'الأرصدة',      icon: 'ti-wallet' },
  { id: 'inventory', label: 'المخزن',       icon: 'ti-package' },
];

export default function Navbar({ activePage, setActivePage }: { activePage: PageId; setActivePage: (p: PageId) => void }) {
  return (
    <nav className="topbar">
      <div className="topbar-brand"><i className="ti ti-device-mobile" /> المحل</div>
      {nav.map(item => (
        <button key={item.id} className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id as PageId)}>
          <i className={`ti ${item.icon}`} /> {item.label}
        </button>
      ))}
    </nav>
  );
}
