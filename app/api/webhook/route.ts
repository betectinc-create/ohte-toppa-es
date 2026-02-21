import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('=== Webhook Called ===');
  return NextResponse.json({ received: true }, { status: 200 });
}