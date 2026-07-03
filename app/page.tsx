'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import HomePage from '@/components/HomePage';
import InvoicePage from '@/components/InvoicePage';
import UsedDevicesPage from '@/components/UsedDevicesPage';
import ClientsDebtPage from '@/components/ClientsDebtPage';
import TransfersPage from '@/components/TransfersPage';
import BalancesPage from '@/components/BalancesPage';
import InventoryPage from '@/components/InventoryPage';

export type PageId = 'home'|'invoice'|'used'|'clients'|'transfers'|'balances'|'inventory';

export default function Home() {
  const [page, setPage] = useState<PageId>('home');
  return (
    <>
      <Navbar activePage={page} setActivePage={setPage} />
      <div className="main">
        {page === 'home'      && <HomePage setPage={setPage} />}
        {page === 'invoice'   && <InvoicePage />}
        {page === 'used'      && <UsedDevicesPage />}
        {page === 'clients'   && <ClientsDebtPage />}
        {page === 'transfers' && <TransfersPage />}
        {page === 'balances'  && <BalancesPage />}
        {page === 'inventory' && <InventoryPage />}
      </div>
    </>
  );
}
