// src/app/api/quiz/[id]/route.ts

import { auth } from '@/auth';
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
   context : { params: { id: string } }
) {
  try {
    const quizId = await context.params;
    
    // Récupérer la session utilisateur
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Récupérer le quiz
    const quiz = await db.collection("quiz").findOne({
      _id: new ObjectId(quizId)
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 });
    }

    // Récupérer l'utilisateur pour vérifier s'il est propriétaire ou étudiant
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const isOwner = quiz.ownerId.toString() === userId;
    
    // Si l'utilisateur n'est pas le propriétaire et est un étudiant,
    // on doit vérifier s'il a accès à ce quiz via ses groupes
    if (!isOwner && user.role === "student") {
      // Récupérer tous les groupes auxquels l'étudiant est inscrit
      const enrolledGroupIds = (user.enrolledGroups || []).map(id => new ObjectId(id));
      
      const hasAccess = await db.collection("groups").findOne({
        _id: { $in: enrolledGroupIds },
        quizzes: { $elemMatch: { id: new ObjectId(quizId) } }
      });


      if (!hasAccess) { 
        return NextResponse.json({ error: "Accès non autorisé à ce quiz" }, { status: 403 });
      }

      const quizSettings = hasAccess.quizzes.find((q) => q.id.toString() === quizId.id);
      quiz.settings = quizSettings.settings;
      // Pour les étudiants, vérifier si le quiz est disponible selon les dates
      const now = new Date();
      if (quizSettings.startDate && new Date(quizSettings.startDate) > now) {
        return NextResponse.json({ error: "Ce quiz n'est pas encore disponible" }, { status: 403 });
      }
      
      if (quizSettings.endDate && new Date(quizSettings.endDate) < now) {
        return NextResponse.json({ error: "Ce quiz est terminé" }, { status: 403 });
      }
      
      // Pour les étudiants, vérifier le nombre de tentatives
      const attemptsCount = await db.collection("quizAttempts").countDocuments({
        quizId: new ObjectId(quizId),
        studentId: new ObjectId(userId)
      });
      
      if (quizSettings.attemptsAllowed !== 0 && attemptsCount >= quizSettings.attemptsAllowed) {
        return NextResponse.json({ error: "Nombre maximum de tentatives atteint" }, { status: 403 });
      }
      // Copier les questions pour ne pas modifier l'original
      let quizQuestions = [...quiz.questions];
      
      // Mélanger les questions si l'option est activée
      if (quizSettings.shuffleQuestions) {
        quizQuestions = shuffleArray(quizQuestions);
      }
      
      // src/app/api/quiz/[id]/route.ts (suite)
      // Mélanger les options pour chaque question si l'option est activée
      if (quizSettings.shuffleOptions) {
        quizQuestions = quizQuestions.map(question => {
          return {
            ...question,
            options: shuffleArray([...question.options])
          };
        });
      }
      
      // Remplacer les questions originales par les questions potentiellement mélangées
      quiz.questions = quizQuestions;
      
      // Pour les étudiants, supprimer les informations sensibles (isCorrect)
      // quiz.questions = quiz.questions.map(question => {
      //   return {
      //     ...question,
      //     options: question.options.map(option => {
      //       // Créer une copie sans la propriété isCorrect
      //       const { isCorrect, ...safeOption } = option;
      //       return safeOption;
      //     })
      //   };
      // });
    }

    // // Si c'est un étudiant, mélanger les questions et les options si nécessaire
    // if (user.role === "student") {
    //   // Copier les questions pour ne pas modifier l'original
    //   let quizQuestions = [...quiz.questions];
      
    //   // Mélanger les questions si l'option est activée
    //   if (quizSettings.shuffleQuestions) {
    //     quizQuestions = shuffleArray(quizQuestions);
    //   }
      
    //   // src/app/api/quiz/[id]/route.ts (suite)
    //   // Mélanger les options pour chaque question si l'option est activée
    //   if (quizSettings.shuffleOptions) {
    //     quizQuestions = quizQuestions.map(question => {
    //       return {
    //         ...question,
    //         options: shuffleArray([...question.options])
    //       };
    //     });
    //   }
      
    //   // Remplacer les questions originales par les questions potentiellement mélangées
    //   quiz.questions = quizQuestions;
      
    //   // Pour les étudiants, supprimer les informations sensibles (isCorrect)
    //   // quiz.questions = quiz.questions.map(question => {
    //   //   return {
    //   //     ...question,
    //   //     options: question.options.map(option => {
    //   //       // Créer une copie sans la propriété isCorrect
    //   //       const { isCorrect, ...safeOption } = option;
    //   //       return safeOption;
    //   //     })
    //   //   };
    //   // });
    // }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du quiz" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}