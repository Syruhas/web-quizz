// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("web-quizz");
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
