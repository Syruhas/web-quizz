// app/api/settings/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

interface UpdateSettingsRequest {
  name?: string;
  oldPassword?: string;
  newPassword?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateSettingsRequest = await req.json();
    const { name, oldPassword, newPassword } = body;

    if (!name && !newPassword) {
      return NextResponse.json(
        { error: "No changes requested" },
        { status: 400 }
      );
    }

    if (newPassword && !oldPassword) {
      return NextResponse.json(
        { error: "Current password is required to set new password" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("web-quizz");
    const users = db.collection<User>("users");

    const userId = new ObjectId(session.user.id);
    const currentUser = await users.findOne({ _id: userId });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    if (newPassword) {
      const isValidPassword = await bcrypt.compare(
        oldPassword!,
        currentUser.password
      );

    if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

    updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (name) {
      updateData.name = name.trim();
    }

    const result = await users.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      updated: {
        name: name ? true : false,
        password: newPassword ? true : false,
      },
    });

  } catch (error) {
    console.error("Settings update error:", error);
    
    if (error instanceof Error) {
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
