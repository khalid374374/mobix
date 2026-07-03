import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const items = await prisma.inventoryItem.findMany({
    where: {
      name: { contains: search, mode: 'insensitive' },
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.inventoryItem.create({ data: body });
  return NextResponse.json(item);
}
