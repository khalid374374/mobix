// Thin wrappers around fetch for each API endpoint

export const api = {
  // INVENTORY
  getInventory: (search='', category='') =>
    fetch(`/api/inventory?search=${search}&category=${category}`).then(r => r.json()),
  addInventoryItem: (data: object) =>
    fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  updateInventoryItem: (id: number, data: object) =>
    fetch(`/api/inventory/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  deleteInventoryItem: (id: number) =>
    fetch(`/api/inventory/${id}`, { method:'DELETE' }).then(r => r.json()),

  // INVOICES
  getInvoices: () => fetch('/api/invoices').then(r => r.json()),
  addInvoice: (data: object) =>
    fetch('/api/invoices', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),

  // DEBTS
  getDebts: () => fetch('/api/debts').then(r => r.json()),
  addDebt: (data: object) =>
    fetch('/api/debts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  settleDebt: (id: number) =>
    fetch(`/api/debts/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ settled: true }) }).then(r => r.json()),

  // TRANSFERS
  getTransfers: () => fetch('/api/transfers').then(r => r.json()),
  addTransfer: (data: object) =>
    fetch('/api/transfers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),

  // USED DEVICES
  getUsedDevices: () => fetch('/api/used-devices').then(r => r.json()),
  addUsedDevice: (data: object) =>
    fetch('/api/used-devices', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),

  // BALANCES
  getBalances: () => fetch('/api/balances').then(r => r.json()),
  updateBalances: (data: object) =>
    fetch('/api/balances', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),

  // SHIFTS
  getShift: () => fetch('/api/shifts').then(r => r.json()),
  closeShift: (data: object) =>
    fetch('/api/shifts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
};
