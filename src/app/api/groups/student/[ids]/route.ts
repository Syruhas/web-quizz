import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        { error: "Missing ids parameter" },
        { status: 400 }
      );
    }

    const userIds = ids.split(',');

    const objectIds = userIds.map(id => {
      try {
        return new ObjectId(id.trim());
      } catch (error) {
        throw new Error(`Invalid ID format: ${id}`);
      }
    });

    const client = await clientPromise;
    const db = client.db("web-quizz");
    const users = db.collection<User>("users");

    const userNames = await users
      .find(
        { _id: { $in: objectIds } },
        { projection: { name: 1, _id: 1 } }
      )
      .toArray();

    const result = userNames.map(user => ({
      id: user._id?.toString(),
      name: user.name
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching user names:", error);
    
    if (error instanceof Error && error.message.includes("Invalid ID format")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
