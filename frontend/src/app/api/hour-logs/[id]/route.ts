import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hourLogs, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

function getUserIdFromToken(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userId = parseInt(decoded.split(':')[0]);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const updated = await db
      .update(hourLogs)
      .set({
        status: data.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(hourLogs.id, parseInt(id)))
      .returning();

    return NextResponse.json({ log: updated[0] });
  } catch (error) {
    console.error('Update hour log error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}