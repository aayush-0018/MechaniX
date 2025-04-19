import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '');
  const lng = parseFloat(url.searchParams.get('lng') || '');
  const sortBy = url.searchParams.get('sortBy') || 'distance';
  const radius = parseFloat(url.searchParams.get('radius') || '5'); // default to 5 km

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }

  try {
    const radiusInMeters = radius * 1000;

    const workers: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        id, name, image, "isAvailable", skills, latitude, longitude,
        ST_Distance(geo_location, ST_MakePoint(${lng}, ${lat})::geography) AS distance
      FROM "User"
      WHERE role = 'worker'
        AND geo_location IS NOT NULL
        AND ST_DWithin(geo_location, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})
    `);

    const workerIds = workers.map(w => w.id);

    const ratings = await prisma.review.groupBy({
      by: ['workerId'],
      where: { workerId: { in: workerIds } },
      _avg: { rating: true },
    });

    const ratingMap: Record<string, number> = {};
    ratings.forEach(r => {
      ratingMap[r.workerId] = parseFloat((r._avg.rating ?? 0).toFixed(2));
    });

    const enriched = workers.map(w => ({
      ...w,
      distance: parseFloat((w.distance / 1000).toFixed(2)), // convert to km
      avgRating: ratingMap[w.id] || 0,
    }));

    let sorted = enriched;
    if (sortBy === 'rating') {
      sorted = enriched.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === 'distance') {
      sorted = enriched.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'both') {
      sorted = enriched.sort((a, b) => {
        const aScore = a.avgRating * 0.7 + (1 / (a.distance + 1)) * 0.3;
        const bScore = b.avgRating * 0.7 + (1 / (b.distance + 1)) * 0.3;
        return bScore - aScore;
      });
    }

    return NextResponse.json(sorted);
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
