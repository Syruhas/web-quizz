// /api/(quiz)/newquiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { Quiz, Question } from "@/models/quiz";


interface QuizFormQuestion {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

interface QuizFormData extends Omit<Quiz, '_id' | 'ownerId' | 'groupId' | 'questions'> {
  groupId: string;
  questions: QuizFormQuestion[];
}

export async function POST(req: NextRequest) {
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
        { error: "Only teachers can create quizzes" },
        { status: 403 }
      );
    }

    const quizData: QuizFormData = await req.json();

    if (!quizData.name?.trim()) {
      return NextResponse.json(
        { error: "Quiz name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      return NextResponse.json(
        { error: "Quiz must have at least one question" },
        { status: 400 }
      );
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.question?.trim()) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have text` },
          { status: 400 }
        );
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least 2 options` },
          { status: 400 }
        );
      }

      if (question.options.some((opt) => !opt.text?.trim())) {
        return NextResponse.json(
          { error: `Question ${i + 1} has empty options` },
          { status: 400 }
        );
      }

      const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least one correct answer` },
          { status: 400 }
        );
      }
    }

    // Transform questions to add ObjectIds
    const transformedQuestions: Question[] = quizData.questions.map((q) => ({
      _id: new ObjectId(),
      question: q.question,
      options: q.options.map((opt) => ({
        _id: new ObjectId(),
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    }));

    // Prepare quiz document
    const quiz: Quiz = {
      name: quizData.name,
      description: quizData.description || "",
      ownerId: new ObjectId(session.user.id),
      questions: transformedQuestions,
      status: "draft",
      settings: {
        shuffleQuestions: quizData.settings?.shuffleQuestions ?? false,
        shuffleOptions: quizData.settings?.shuffleOptions ?? false,
        showResults: quizData.settings?.showResults ?? true,
        attemptsAllowed: quizData.settings?.attemptsAllowed ?? 1,
        startDate: quizData.settings?.startDate ? new Date(quizData.settings.startDate) : undefined,
        endDate: quizData.settings?.endDate ? new Date(quizData.settings.endDate) : undefined,
        timeLimit: quizData.settings?.timeLimit,
        passingScore: quizData.settings?.passingScore
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Insert the quiz
    const result = await db.collection("quiz").insertOne(quiz);

    return NextResponse.json({
      message: "Quiz created successfully",
      quizId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
