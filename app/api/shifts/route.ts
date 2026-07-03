import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Get active shift or create one
  let shift = await prisma.shift.findFirst({ where: { isActive: true } });
  if (!shift) {
    shift = await prisma.shift.create({ data: { startTime: new Date(), isActive: true } });
  }
  return NextResponse.json(shift);
}

export async function POST(req: NextRequest) {
  // Close current shift
  const body = await req.json();
  const { shiftId, totalSales, totalFees, netIncome, invoiceCount } = body;

  const closed = await prisma.shift.update({
    where: { id: shiftId },
    data: { endTime: new Date(), totalSales, totalFees, netIncome, invoiceCount, isActive: false },
  });

  // Open new shift
  await prisma.shift.create({ data: { startTime: new Date(), isActive: true } });

  return NextResponse.json(closed);
}
