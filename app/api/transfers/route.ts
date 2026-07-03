import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const transfers = await prisma.transfer.findMany({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(transfers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const transfer = await prisma.transfer.create({ data: body });
  return NextResponse.json(transfer);
}
