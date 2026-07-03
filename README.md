# نظام إدارة محل تليفونات — Next.js + Vercel

## طريقة الرفع على Vercel (مجاناً)

### الخطوة ١ — رفع الكود على GitHub
1. اعمل حساب على github.com
2. اعمل repo جديد اسمه `phone-shop`
3. ارفع الملفات دي كلها جوا الـ repo

### الخطوة ٢ — قاعدة البيانات (Neon - مجاناً)
1. اعمل حساب على neon.tech
2. اعمل database جديدة
3. انسخ الـ Connection String (بتبدأ بـ postgresql://...)

### الخطوة ٣ — الرفع على Vercel
1. اعمل حساب على vercel.com
2. اضغط "New Project" وربطه بالـ GitHub repo
3. في إعدادات الـ Environment Variables ضيف:
   - `DATABASE_URL` = الـ Connection String من Neon

### الخطوة ٤ — إعداد قاعدة البيانات
بعد ما Vercel يعمل أول build، افتح terminal وشغّل:
```
npx prisma db push
```

---

## تشغيل محلي للتطوير

1. ثبّت الباكدجات:
```
npm install
```

2. اعمل ملف `.env`:
```
DATABASE_URL="postgresql://..."
```

3. اعمل الجداول:
```
npx prisma db push
```

4. شغّل:
```
npm run dev
```

---

## هيكل المشروع
```
app/
  api/              ← API Routes (قاعدة البيانات)
    inventory/
    invoices/
    debts/
    transfers/
    used-devices/
    balances/
    shifts/
  layout.tsx
  page.tsx          ← الصفحة الرئيسية
  globals.css       ← كل الـ CSS

components/
  Navbar.tsx
  HomePage.tsx
  InvoicePage.tsx   ← متصلة بالمخزن (Autocomplete)
  InventoryPage.tsx
  ClientsDebtPage.tsx
  TransfersPage.tsx
  BalancesPage.tsx
  UsedDevicesPage.tsx

lib/
  prisma.ts         ← Prisma Client
  api.ts            ← fetch wrappers
  utils.ts          ← أرقام عربية، تنسيق

prisma/
  schema.prisma     ← تعريف قاعدة البيانات
```
