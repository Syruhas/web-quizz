// src/app/api/quiz/attempts/[id]/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  context : { params: { id: string } }
) {
  try {
    const attemptId = await context.params;
    
    // Récupérer la session utilisateur
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Récupérer la tentative
    const attempt = await db.collection("quizAttempts").findOne({
      _id: new ObjectId(attemptId)
    });

    if (!attempt) {
      return NextResponse.json({ error: "Tentative non trouvée" }, { status: 404 });
    }

    // Vérifier si l'utilisateur est autorisé à voir cette tentative
    // (soit c'est sa propre tentative, soit c'est le professeur qui a créé le quiz)
    const isStudent = attempt.studentId.toString() === userId;
    
    if (!isStudent) {
      // Récupérer le quiz pour vérifier si l'utilisateur est le propriétaire
      const quiz = await db.collection("quiz").findOne({
        _id: attempt.quizId
      });
      
      if (!quiz || quiz.ownerId.toString() !== userId) {
        return NextResponse.json({ error: "Non autorisé à voir cette tentative" }, { status: 403 });
      }
    }
    
    // Récupérer le quiz complet
    const quiz = await db.collection("quiz").findOne({
      _id: attempt.quizId
    });
    
    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 });
    }
    
    // Si c'est un étudiant qui consulte et que le quiz ne permet pas de voir les résultats détaillés,
    // ne pas renvoyer les options correctes
    if (isStudent && !quiz.settings.showResults) {
      // Supprimer les informations sur les réponses correctes
      quiz.questions = quiz.questions.map(question => {
        return {
          ...question,
          options: question.options.map(option => {
            const { isCorrect, ...safeOption } = option;
            return safeOption;
          })
        };
      });
    }
    
    return NextResponse.json({ attempt, quiz });
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats" },
      { status: 500 }
    );
  }
}