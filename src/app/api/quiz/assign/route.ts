// app/api/quiz/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { QuizSettings, QuizStatus } from "@/models/quiz";
import { Group } from "@/models/group";


interface AssignQuizRequest {
  quizId: string;
  groupId: string;
  settings: QuizSettings;
}

interface QuizAssignment {
    id: ObjectId;
    settings: QuizSettings;
  }

export async function POST(req: NextRequest) {
  try {
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: AssignQuizRequest = await req.json();
    const { quizId, groupId, settings } = body;


    console.log(body)
    if (!quizId || !groupId || !settings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let quizObjectId: ObjectId;
    let groupObjectId: ObjectId;
    
    try {
      quizObjectId = new ObjectId(quizId);
      groupObjectId = new ObjectId(groupId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // existence
    const client = await clientPromise;
    const db = client.db("web-quizz");
    
    const quiz = await db.collection("quiz").findOne({
      _id: quizObjectId
    });

    const group = await db.collection("groups").findOne({
      _id: groupObjectId
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // ownership
    if (quiz.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to assign this quiz" },
        { status: 403 }
      );
    }

    if (group.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this group" },
        { status: 403 }
      );
    }

    // assignement to group
    const existingAssignment = await db.collection("groups").findOne({
      _id: groupObjectId,
      "quizzes.id": quizObjectId
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Quiz is already assigned to this group" },
        { status: 400 }
      );
    }

    // settings
    if (
      settings.startDate && 
      settings.endDate && 
      new Date(settings.startDate) > new Date(settings.endDate)
    ) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    if (settings.timeLimit && settings.timeLimit < 0) {
      return NextResponse.json(
        { error: "Time limit cannot be negative" },
        { status: 400 }
      );
    }

    if (settings.attemptsAllowed < 1) {
      return NextResponse.json(
        { error: "Must allow at least one attempt" },
        { status: 400 }
      );
    }

    // 10. Update group with new quiz assignment
    const result = await db.collection<Group>("groups").updateOne(
      { _id: groupObjectId },
      {
        $push: {
          quizzes: {
            id: quizObjectId,
            settings: settings
          } as QuizAssignment
        }
      }
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: "Failed to assign quiz" },
        { status: 500 }
      );
    }

    // response
    return NextResponse.json({
      message: "Quiz assigned successfully",
      groupId: groupId,
      quizId: quizId
    }, { status: 200 });

  } catch (error) {
    console.error("Error assigning quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
