// src/app/api/groups/route.ts (Move it here instead of [inviteCode] folder)
import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inviteCode = searchParams.get('inviteCode');

  if (!inviteCode) {
    return NextResponse.json(
      { error: "Invite code is required" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("web-quizz");

    const group = await db.collection("groups").findOne({ inviteCode });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: group._id,
      name: group.name,
      teacherId: group.teacherId,
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
