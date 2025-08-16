
import { NextResponse } from 'next/server';
import { checkPoolsAndNotify } from '@/services/monitoring-service';

export async function GET() {
  try {
    await checkPoolsAndNotify();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
