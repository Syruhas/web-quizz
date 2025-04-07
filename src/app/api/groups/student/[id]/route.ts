import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const studentId = context.params.id;

    if (!studentId || !ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("web-quizz");
    const groups = db.collection("groups");

    // Trouver tous les groupes où l'ID de l'étudiant est présent dans le tableau students
    const results = await groups.find({
      students: new ObjectId(studentId)
    }).toArray();

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error retrieving student groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}