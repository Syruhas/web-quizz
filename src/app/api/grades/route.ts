import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { Grade } from "@/src/models/grade";
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';


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
      const users = db.collection<Grade>("grades");

      // Récupération des notes de l'utilisateur
      const grades = await db.collection("grades")
      .find({ studentId: new ObjectId(userId) })
      .toArray();
    
      // Récupération des quizz correspondants
      const quizIds = grades.map(grade => grade.quizzId);
      const quizzes = await db.collection("quizzes")
        .find({ _id: { $in: quizIds.map(id => new ObjectId(id)) } })
        .toArray();
      
      // Construction des données à retourner
      const gradesWithDetails = grades.map(grade => {
        const quiz = quizzes.find(q => q._id.toString() === grade.quizzId.toString());
        return {
          id: grade.id,
          score: grade.score,
          quizId: grade.quizzId,
          quizTitle: quiz ? quiz.title : "Quiz inconnu",
          createdAt: grade.createdAt || new Date(),
        };
      });
      
      return NextResponse.json(gradesWithDetails);
  
    } catch (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des notes" },
        { status: 500 }
      );
    }
  }