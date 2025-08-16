
import { NextResponse } from 'next/server';
import { deletePool } from '@/services/pool-service';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await deletePool(id);
    return NextResponse.json({ message: 'Pool deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete pool ${id}:`, error);
    return NextResponse.json({ message: 'Failed to delete pool' }, { status: 500 });
  }
}
