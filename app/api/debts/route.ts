import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const debts = await prisma.debt.findMany({
    where: { settled: false },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(debts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const debt = await prisma.debt.create({ data: body });
  return NextResponse.json(debt);
}
