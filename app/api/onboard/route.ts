import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, skills, isAvailable, latitude, longitude } = body;

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
  }

  try {
    // First, update other fields
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        skills,
        isAvailable,
        role: "worker",
        latitude,
        longitude,
      },
    });

    // Then update the geo_location using PostGIS via raw SQL
    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET geo_location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      WHERE email = '${session.user.email}'
    `);

    return NextResponse.json({ message: "Onboarding complete" }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
