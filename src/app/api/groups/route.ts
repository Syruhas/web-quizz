import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route.ts"
import { nanoid } from 'nanoid'; // You'll need to install this
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const group = {
      name,
      description,
      ownerId: new ObjectId(session.user.id),
      inviteCode: nanoid(10), // Generate unique invite code
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("groups").insertOne(group);

    return NextResponse.json({
      _id: result.insertedId,
      ...group,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
