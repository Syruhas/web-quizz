// src/app/api/quiz/student/route.ts
import { auth } from '@/auth';
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { QuizSettings, Quiz } from '@/src/models/quiz';

interface QuizFromGroup extends Quiz {
  id?: string;
}

export async function GET() {
  try {
    // Récupérer la session utilisateur
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Récupérer l'utilisateur pour obtenir ses groupes inscrits
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: "student"
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé ou n'est pas un étudiant" }, { status: 404 });
    }

    // Récupérer tous les groupes auxquels l'étudiant est inscrit
    const enrolledGroupIds = (user.enrolledGroups || []).map((id: number) => new ObjectId(id));
    
    // Récupérer les groupes avec leurs détails
    const groups = await db.collection("groups")
      .find({ _id: { $in: enrolledGroupIds } })
      .toArray();
      
    // Extraire tous les IDs de quiz de ces groupes
    const quizIds = groups.flatMap(group => (group.quizzes || []).map((quiz: QuizFromGroup) => new ObjectId(quiz.id)));
      
    const quizzesSettings = groups.flatMap(group => (group.quizzes || []).map((quiz: {
        id:ObjectId;
        settings: QuizSettings
      }) => quiz));
    // Récupérer les quiz correspondants qui sont actifs ou terminés (pas en brouillon)
    const quizzes = await db.collection("quiz")
      .find({ 
        _id: { $in: quizIds },
        status: { $in: ["draft", "scheduled", "active", "closed"] }
      })
      .toArray();
      
    // Récupérer les tentatives de quiz de l'étudiant
    const attempts = await db.collection("quizAttempts")
      .find({
        studentId: new ObjectId(userId),
        quizId: { $in: quizIds }
      })
      .toArray();
      
    // Ajouter des informations sur les tentatives à chaque quiz
    const quizzesWithAttemptInfo = quizzes.map(quiz => {
      const quizAttempts = attempts.filter(attempt => 
        attempt.quizId.toString() === quiz._id.toString()
      );
      
      const quizSettings = quizzesSettings.find((q) => q.id.toString() === quiz._id.toString()).settings

      const attemptsCount = quizAttempts.length;
      const lastAttempt = quizAttempts.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )[0];
      
      // Vérifier si le quiz est disponible en fonction des dates
      const now = new Date();
      const startDate = quizSettings.startDate ? new Date(quizSettings.startDate) : null;
      const endDate = quizSettings.endDate ? new Date(quizSettings.endDate) : null;
      
      let availability = "available";
      if (startDate && now < startDate) {
        availability = "notStarted";
      } else if (endDate && now > endDate) {
        availability = "ended";
      }
      
      // Vérifier si l'étudiant a atteint le nombre maximum de tentatives
      const maxAttempts = quizSettings.attemptsAllowed;
      const canAttempt = maxAttempts === 0 || attemptsCount < maxAttempts;
      
      return {
        ...quiz,
        attemptsCount,
        lastAttempt,
        availability,
        canAttempt,
        quizSettings,
      };
    });
    return NextResponse.json({ quizzes: quizzesWithAttemptInfo });
  } catch (error) {
    console.error("Erreur lors de la récupération des quiz:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des quiz" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { quizId, answers, startedAt } = body;

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Vérifier si le quiz existe
    const quiz = await db.collection("quiz").findOne({
      _id: new ObjectId(quizId)
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 });
    }

    // Vérifier si l'utilisateur peut encore faire une tentative
    const existingAttempts = await db.collection("quizAttempts").countDocuments({
      quizId: new ObjectId(quizId),
      studentId: new ObjectId(userId)
    });

    const group = await db.collection("groups").findOne({
      students: new ObjectId(userId),
      quizzes: {
        $elemMatch: {
          id: new ObjectId(quiz._id)
        }
      }
    });

    console.log(group)


    const settings = group?.quizzes.find((q: { id: { toString: () => string; }; }) => q.id.toString() === quiz._id.toString()).settings
    quiz.settings = settings

    if (quiz.settings.attemptsAllowed !== 0 && existingAttempts >= quiz.settings.attemptsAllowed) {
      return NextResponse.json({ error: "Nombre maximum de tentatives atteint" }, { status: 400 });
    }

    // Calculer le score
    let score = 0;
    const totalQuestions = quiz.questions.length;
    
    answers.forEach((answer: { questionId: string; selectedOptions: string[] }) => {
      const question = quiz.questions.find((q: { _id: { toString: () => string; }; }) => 
        q._id.toString() === answer.questionId
      );
      
      if (question) {
        // Une question est correcte si toutes les options correctes sont sélectionnées
        // et aucune option incorrecte n'est sélectionnée
        const correctOptionIds = question.options
          .filter((opt: { isCorrect: any; }) => opt.isCorrect)
          .map((opt: { _id: { toString: () => any; }; }) => opt._id.toString());
          
        const selectedOptionIds = answer.selectedOptions;
        
        // Vérifier si les options sélectionnées correspondent exactement aux options correctes
        const allCorrectOptionsSelected = correctOptionIds.every((id: string) => 
          selectedOptionIds.includes(id)
        );
        
        const noIncorrectOptionsSelected = selectedOptionIds.every(id => 
          correctOptionIds.includes(id)
        );
        
        if (allCorrectOptionsSelected && noIncorrectOptionsSelected) {
          score += 1;
        }
      }
    });
    
    const percentageScore = (score / totalQuestions) * 100;

    // Créer une nouvelle tentative
    const quizAttempt = {
      quizId: new ObjectId(quizId),
      studentId: new ObjectId(userId),
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      answers: answers.map((answer: { questionId: string; selectedOptions: string[] }) => ({
        questionId: new ObjectId(answer.questionId),
        selectedOptions: answer.selectedOptions.map(id => new ObjectId(id))
      })),
      score: percentageScore,
      completed: true
    };

    const result = await db.collection("quizAttempts").insertOne(quizAttempt);

    return NextResponse.json({ 
      success: true, 
      attemptId: result.insertedId,
      score: percentageScore
    });
  } catch (error) {
    console.error("Erreur lors de la soumission de la tentative:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la tentative" },
      { status: 500 }
    );
  }
}
