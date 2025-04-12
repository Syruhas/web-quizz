// src/app/api/grades/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/src/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // Vérification de l'authentification
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;
    
    // Connexion à la base de données
    const client = await clientPromise;
    const db = client.db();
    
    if (userRole === "student") {
      // Récupération des notes de l'étudiant connecté
      const attempts = await db.collection("quizAttempts")
        .find({
          studentId: new ObjectId(userId),
          completed: true,
          submittedAt: { $exists: true }
        })
        .toArray();
      
      // Récupération des noms de quiz
      const quizIds = attempts.map(attempt => attempt.quizId);
      const quizzes = await db.collection("quiz")
        .find({ _id: { $in: quizIds } })
        .project({ _id: 1, name: 1 })
        .toArray();
      
      // Formater les résultats
      const grades = attempts.map(attempt => {
        const quiz = quizzes.find(q => q._id.toString() === attempt.quizId.toString());
        
        return {
          _id: attempt._id.toString(),
          studentId: userId,
          studentName: session.user.name,
          quizId: attempt.quizId.toString(),
          quizName: quiz ? quiz.name : "Quiz inconnu",
          score: attempt.score || 0,
          completedAt: attempt.submittedAt.toISOString(),
          attemptId: attempt._id.toString()
        };
      });
      
      return NextResponse.json({ grades });
    } else if (userRole === "teacher") {
      // Récupération des notes de tous les étudiants des groupes du professeur
      
      // 1. Récupérer les groupes du professeur
      const groups = await db.collection("groups")
        .find({ teacherId: new ObjectId(userId) })
        .toArray();
      
      // 2. Récupérer les étudiants de ces groupes
      const studentIds = groups.flatMap(group => group.students || []);
      
      // 3. Récupérer les utilisateurs (pour les noms)
      const students = await db.collection("users")
        .find({ _id: { $in: studentIds }, role: "student" })
        .toArray();
      
      // 4. Récupérer les tentatives de quiz de ces étudiants
      const attempts = await db.collection("quizAttempts")
        .find({
          studentId: { $in: studentIds },
          completed: true,
          submittedAt: { $exists: true }
        })
        .toArray();
      
      // 5. Récupérer les informations des quiz
      const quizIds = attempts.map(attempt => attempt.quizId);
      const quizzes = await db.collection("quiz")
        .find({ _id: { $in: quizIds } })
        .project({ _id: 1, name: 1 })
        .toArray();
      
      // 6. Formater les résultats
      const allGrades = attempts.map(attempt => {
        const student = students.find(s => s._id.toString() === attempt.studentId.toString());
        const quiz = quizzes.find(q => q._id.toString() === attempt.quizId.toString());
        
        return {
          _id: attempt._id.toString(),
          studentId: attempt.studentId.toString(),
          studentName: student ? student.name : "Étudiant inconnu",
          quizId: attempt.quizId.toString(),
          quizName: quiz ? quiz.name : "Quiz inconnu",
          score: attempt.score || 0,
          completedAt: attempt.submittedAt.toISOString(),
          attemptId: attempt._id.toString()
        };
      });
      
      // 7. Formater les informations de groupes pour l'interface
      const groupGrades = groups.map(group => {
        const groupStudents = students
          .filter(student => group.students.some(id => id.toString() === student._id.toString()))
          .map(student => {
            const studentGrades = allGrades.filter(
              grade => grade.studentId === student._id.toString()
            );
            
            return {
              studentId: student._id.toString(),
              studentName: student.name,
              grades: studentGrades
            };
          });
        
        return {
          groupId: group._id.toString(),
          groupName: group.name,
          students: groupStudents
        };
      });
      
      return NextResponse.json({ allGrades, groupGrades });
    }
    
    // Pour tout autre rôle (n'est pas censé se produire)
    return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}