'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtMoney, toAr } from '@/lib/utils';

interface Item { id: number; name: string; category: string; cost: number; price: number; qty: number; minQty: number }

function stockStatus(item: Item) {
  if (item.qty === 0) return { label: 'نفد', cls: 'badge-red', key: 'out' };
  if (item.qty <= item.minQty) return { label: 'كمية قليلة', cls: 'badge-amber', key: 'low' };
  return { label: 'متوفر', cls: 'badge-green', key: 'available' };
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [editing, setEditing] = useState<Item | null>(null);
  const [name, setName] = useState(''); const [cat, setCat] = useState('كفرات');
  const [cost, setCost] = useState(''); const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1'); const [minQty, setMinQty] = useState('3');

  const load = async () => {
    const data = await api.getInventory(search, catFilter);
    setItems(data);
  };
  useEffect(() => { load(); }, [search, catFilter]);

  const filtered = stockFilter ? items.filter(i => stockStatus(i).key === stockFilter) : items;
  const totalValue = items.reduce((s, i) => s + i.cost * i.qty, 0);
  const lowCount = items.filter(i => i.qty > 0 && i.qty <= i.minQty).length;
  const outCount = items.filter(i => i.qty === 0).length;

  async function addItem() {
    if (!name) { alert('أدخل اسم المنتج'); return; }
    if (!parseFloat(price)) { alert('أدخل سعر البيع'); return; }
    await api.addInventoryItem({ name, category: cat, cost: parseFloat(cost)||0, price: parseFloat(price), qty: parseInt(qty)||0, minQty: parseInt(minQty)||3 });
    setName(''); setCost(''); setPrice(''); setQty('1'); setMinQty('3');
    load();
  }

  async function changeQty(item: Item, delta: number) {
    await api.updateInventoryItem(item.id, { qty: Math.max(0, item.qty + delta) });
    load();
  }

  async function deleteItem(id: number) {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await api.deleteInventoryItem(id);
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    await api.updateInventoryItem(editing.id, {
      name: editing.name, category: editing.category,
      cost: editing.cost, price: editing.price,
      qty: editing.qty, minQty: editing.minQty,
    });
    setEditing(null); load();
  }

  const cats = ['كفرات','شواحن','سماعات','جلاس','كابلات','بطاريات','أجهزة','إكسسوار','أخرى'];

  return (
    <div className="page active">
      <div className="cards-grid">
        <div className="metric"><div className="metric-label"><i className="ti ti-package" /> إجمالي المنتجات</div><div className="metric-val blue">{toAr(items.length)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-alert-triangle" /> كمية قليلة</div><div className="metric-val amber">{toAr(lowCount)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-circle-x" /> نفذت</div><div className="metric-val red">{toAr(outCount)}</div></div>
        <div className="metric"><div className="metric-label"><i className="ti ti-cash" /> قيمة المخزن</div><div className="metric-val green">{fmtMoney(totalValue)}</div></div>
      </div>

      <div className="card">
        <div className="section-title">إضافة منتج جديد</div>
        <div className="input-row">
          <div className="input-group"><label>اسم المنتج</label><input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: كفر iPhone 15" /></div>
          <div className="input-group" style={{ maxWidth: 140 }}><label>التصنيف</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div className="input-row">
          <div className="input-group"><label>سعر الشراء</label><input value={cost} onChange={e => setCost(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group"><label>سعر البيع</label><input value={price} onChange={e => setPrice(e.target.value)} placeholder="٠ ج" /></div>
          <div className="input-group" style={{ maxWidth: 100 }}><label>الكمية</label><input type="number" value={qty} onChange={e => setQty(e.target.value)} min={0} /></div>
          <div className="input-group" style={{ maxWidth: 110 }}><label>حد التنبيه ⚠️</label><input type="number" value={minQty} onChange={e => setMinQty(e.target.value)} min={0} /></div>
        </div>
        <button className="btn btn-primary" onClick={addItem}><i className="ti ti-plus" /> إضافة للمخزن</button>
      </div>

      <div className="card" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <i className="ti ti-search" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..." style={{ paddingRight: 30 }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ maxWidth: 130 }}>
            <option value="">كل التصنيفات</option>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ maxWidth: 130 }}>
            <option value="">كل الحالات</option>
            <option value="available">متوفر</option>
            <option value="low">كمية قليلة</option>
            <option value="out">نفد</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="section-title">المنتجات في المخزن</div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>#</th><th>المنتج</th><th>التصنيف</th><th>شراء</th><th>بيع</th><th>الربح</th><th>الكمية</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {filtered.map((item, i) => {
                const st = stockStatus(item);
                const profit = item.price - item.cost;
                const margin = item.cost > 0 ? Math.round((profit/item.cost)*100) : 0;
                return (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{toAr(i+1)}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td><span className="badge badge-blue">{item.category}</span></td>
                    <td>{fmtMoney(item.cost)}</td>
                    <td>{fmtMoney(item.price)}</td>
                    <td style={{ color: 'var(--green)' }}>{fmtMoney(profit)} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({toAr(margin)}%)</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => changeQty(item,-1)} style={{ width:24,height:24,borderRadius:4,border:'0.5px solid var(--border-strong)',background:'transparent',color:'var(--text-primary)',cursor:'pointer',fontSize:16 }}>−</button>
                        <span style={{ fontWeight:600,minWidth:28,textAlign:'center' }}>{toAr(item.qty)}</span>
                        <button onClick={() => changeQty(item,1)} style={{ width:24,height:24,borderRadius:4,border:'0.5px solid var(--border-strong)',background:'transparent',color:'var(--text-primary)',cursor:'pointer',fontSize:16 }}>+</button>
                      </div>
                    </td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ padding:'4px 8px',fontSize:12 }} onClick={() => setEditing({...item})}><i className="ti ti-pencil" /></button>
                        <button className="btn btn-danger" style={{ padding:'4px 8px',fontSize:12 }} onClick={() => deleteItem(item.id)}><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center',padding:30,color:'var(--text-muted)' }}>
              <i className="ti ti-package" style={{ fontSize:32,display:'block',marginBottom:8 }} />
              لا توجد منتجات. ابدأ بإضافة منتج!
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={{ display:'flex',position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,alignItems:'center',justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div style={{ background:'var(--surface-1)',border:'0.5px solid var(--border)',borderRadius:12,padding:20,width:'90%',maxWidth:480,position:'relative' }}>
            <button onClick={() => setEditing(null)} style={{ position:'absolute',left:12,top:12,background:'transparent',border:'none',color:'var(--text-muted)',fontSize:18,cursor:'pointer' }}><i className="ti ti-x" /></button>
            <div className="section-title" style={{ marginBottom:14 }}>تعديل المنتج</div>
            <div className="input-row">
              <div className="input-group"><label>اسم المنتج</label><input value={editing.name} onChange={e => setEditing({...editing,name:e.target.value})} /></div>
              <div className="input-group" style={{ maxWidth:140 }}><label>التصنيف</label>
                <select value={editing.category} onChange={e => setEditing({...editing,category:e.target.value})}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="input-row">
              <div className="input-group"><label>سعر الشراء</label><input value={editing.cost} onChange={e => setEditing({...editing,cost:parseFloat(e.target.value)||0})} /></div>
              <div className="input-group"><label>سعر البيع</label><input value={editing.price} onChange={e => setEditing({...editing,price:parseFloat(e.target.value)||0})} /></div>
            </div>
            <div className="input-row">
              <div className="input-group" style={{ maxWidth:110 }}><label>الكمية</label><input type="number" value={editing.qty} onChange={e => setEditing({...editing,qty:parseInt(e.target.value)||0})} /></div>
              <div className="input-group" style={{ maxWidth:110 }}><label>حد التنبيه</label><input type="number" value={editing.minQty} onChange={e => setEditing({...editing,minQty:parseInt(e.target.value)||0})} /></div>
            </div>
            <div style={{ display:'flex',gap:8,marginTop:4 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={saveEdit}><i className="ti ti-check" /> حفظ التعديلات</button>
              <button className="btn" onClick={() => setEditing(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
