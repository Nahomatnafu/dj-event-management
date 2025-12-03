import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hourLogs, users } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

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

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    let conditions = [];

    if (user.role === 'staff') {
      conditions.push(eq(hourLogs.userId, user.id));
    } else if (staffId) {
      conditions.push(eq(hourLogs.userId, parseInt(staffId)));
    }

    if (startDate) {
      conditions.push(gte(hourLogs.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(hourLogs.date, endDate));
    }
    if (status) {
      conditions.push(eq(hourLogs.status, status));
    }

    const logs = await db.query.hourLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(hourLogs.date), desc(hourLogs.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            serviceCategory: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch hour logs error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const newLog = await db.insert(hourLogs).values({
      userId: userId,
      date: data.date,
      serviceCategory: data.serviceCategory,
      eventType: data.eventType,
      clientName: data.clientName,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      totalHours: data.totalHours,
      notes: data.notes || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // DJ-specific fields
      equipmentPickupTime: data.equipmentPickupTime || null,
      mileage: data.mileage || null,
    }).returning();

    return NextResponse.json({ log: newLog[0] });
  } catch (error) {
    console.error('Create hour log error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}