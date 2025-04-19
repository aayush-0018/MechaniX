import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { rating, comment, workerId, customerId, bookingId } = body;

    if (!rating || !workerId || !customerId || !bookingId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                workerId,
                customerId,
                bookingId,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
