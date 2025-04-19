import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Haversine function to calculate distance between two coordinates
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userLat = searchParams.get('lat');
  const userLng = searchParams.get('lng');

  try {
    const worker = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        isAvailable: true,
        skills: true,
        location: true,
        latitude: true,
        longitude: true
      },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    let distance = null;

    if (userLat && userLng && worker.latitude && worker.longitude) {
      const lat1 = parseFloat(userLat);
      const lon1 = parseFloat(userLng);
      const lat2 = worker.latitude;
      const lon2 = worker.longitude;

      distance = haversine(lat1, lon1, lat2, lon2);
    }

    return NextResponse.json({ ...worker, distance }, { status: 200 });
  } catch (error) {
    console.error('Error fetching worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
  
    try {
      const { isAvailable } = await request.json();
  
      if (typeof isAvailable !== 'boolean') {
        return NextResponse.json({ error: '`isAvailable` must be a boolean' }, { status: 400 });
      }
  
      const updatedWorker = await prisma.user.update({
        where: { id },
        data: { isAvailable },
      });
  
      return NextResponse.json({ success: true, updatedWorker }, { status: 200 });
    } catch (error) {
      console.error('Error updating worker availability:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
