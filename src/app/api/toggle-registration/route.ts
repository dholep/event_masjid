import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const existingEvent = await prisma.eventConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!existingEvent) {
    return NextResponse.json({ error: "No event config found" }, { status: 404 });
  }

  const updated = await prisma.eventConfig.update({
    where: { id: existingEvent.id },
    data: { isRegistrationClosed: !existingEvent.isRegistrationClosed },
  });

  return NextResponse.json({
    success: true,
    isRegistrationClosed: updated.isRegistrationClosed,
  });
}
