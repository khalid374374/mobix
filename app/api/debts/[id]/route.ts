import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const debt = await prisma.debt.update({
    where: { id: parseInt(params.id) },
    data: body,
  });
  return NextResponse.json(debt);
}
