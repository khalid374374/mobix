import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const invoices = await prisma.invoice.findMany({
    where: { createdAt: { gte: today } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer, method, total, paid, remaining, items } = body;

  // Create invoice with items in a transaction
  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        customer, method, total, paid, remaining,
        items: {
          create: items.map((item: { name: string; qty: number; price: number; inventoryId?: number }) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            inventoryId: item.inventoryId || null,
          })),
        },
      },
      include: { items: true },
    });

    // Deduct from inventory
    for (const item of items) {
      if (item.inventoryId) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryId },
          data: { qty: { decrement: item.qty } },
        });
      }
    }

    // Auto-create debt if remaining > 0
    if (remaining > 0) {
      await tx.debt.create({
        data: {
          name: customer,
          amount: remaining,
          note: `فاتورة رقم ${inv.id}`,
          settled: false,
        },
      });
    }

    return inv;
  });

  return NextResponse.json(invoice);
}
