import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { QuizAttempt, Quiz, Question } from "@/src/models/quizz";


export async function GET() {
    try {
      // Vérifier si l'utilisateur est connecté
      const session = await auth();
      
      if (!session || !session.user?.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = session.user.id;

      const client = await clientPromise;
      const db = client.db("web-quizz");


      const attempts = await db.collection("quizAttempts")
      .find({ 
        studentId: new ObjectId(userId),
        completed: true  // On ne récupère que les tentatives terminées
      })
      .toArray() as QuizAttempt[];
    
    // Récupération des quiz correspondants
    const quizIds = attempts.map(attempt => attempt.quizId);
    const quizzes = await db.collection("quizzes")
      .find({ _id: { $in: quizIds.map(id => new ObjectId(id)) } })
      .toArray() as Quiz[];
    
    // Construction des données à retourner
    const gradesWithDetails = await Promise.all(attempts.map(async (attempt) => {
      const quiz = quizzes.find(q => q._id?.toString() === attempt.quizId.toString());
      
      if (!quiz) {
        return null;
      }
      
      // Calcul du total des points possibles
      const totalPossiblePoints = quiz.questions.reduce((sum, question) => 
        sum + (question.points || 1), 0);
      
      // Préparation des détails des questions pour l'affichage
      const questionDetails = quiz.questions.map((question, index) => {
        const attemptAnswer = attempt.answers.find(ans => 
          ans.questionId.toString() === question._id?.toString()
        );
        
        const isCorrect = attemptAnswer ? 
          JSON.stringify(attemptAnswer.selectedAnswers.sort()) === 
          JSON.stringify(question.correctAnswers.sort()) : false;
        
        const earnedPoints = isCorrect ? (question.points || 1) : 0;
        
        return {
          id: question._id,
          text: question.text,
          difficulty: question.difficulty,
          points: question.points || 1,
          type: question.type,
          selectedAnswers: attemptAnswer?.selectedAnswers || [],
          correctAnswers: question.correctAnswers,
          options: question.options,
          isCorrect,
          earnedPoints
        };
      });
      
      return {
        id: attempt._id,
        quizId: attempt.quizId,
        quizName: quiz.name,
        score: attempt.score || 0,
        totalPossiblePoints,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt || attempt.startedAt,
        questionDetails
      };
    }));
    
    // Filtrer les résultats null (au cas où un quiz aurait été supprimé)
    const validGrades = gradesWithDetails.filter(grade => grade !== null);
    
    return NextResponse.json(validGrades);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}