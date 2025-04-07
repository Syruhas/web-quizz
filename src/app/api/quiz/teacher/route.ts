import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { Quiz } from "@/models/quiz";

export async function GET(req: NextRequest) {
  try {

    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Only teachers can access this endpoint" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const quizzes = await db
      .collection<Quiz>("quiz")
      .find({
        ownerId: new ObjectId(session.user.id)
      })
      //.sort({ updatedAt: -1 })
      .toArray();

    const serializedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      _id: quiz._id.toString(),
      ownerId: quiz.ownerId.toString(),
      questions: quiz.questions.map(question => ({
        ...question,
        _id: question._id.toString(),
        options: question.options.map(option => ({
          ...option,
          _id: option._id.toString()
        }))
      }))
    }));
    
    return NextResponse.json(serializedQuizzes);

  } catch (error) {
    console.error("Error fetching teacher quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
