// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role'); // 'customer' or 'worker'
  
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }
  
    try {
      const bookings = await prisma.booking.findMany({
        where: role === 'customer' ? { customerId: userId } : { workerId: userId },
        include: {
          worker: true,
          customer: true,
          payment: true,
          review: true,
        },
        orderBy: {
          bookedAt: 'desc',
        },
      });
  
      return NextResponse.json(bookings);
    } catch (error) {
      console.error('Fetch Bookings error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      workerId,
      amount,
      mediaUrls,
    }: {
      customerId: string;
      workerId: string;
      amount: number;
      mediaUrls: string[];
    } = body;

    if (!customerId || !workerId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Create Booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        workerId,
        amount,
        mediaUrls,
      },
    });

    // Step 2: Create Payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount,
      },
    });

    return NextResponse.json(
      { success: true, bookingId: booking.id, amount: booking.amount, mediaUrls: booking.mediaUrls },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
