import { ObjectId } from "mongodb";
import { QuizSettings } from "@/src/models/quiz";

export interface Group {
  _id?: ObjectId;
  name: string;
  description?: string;
  teacherId: ObjectId;
  students: ObjectId[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  quizzes: {
    id:ObjectId;
    settings: QuizSettings
  }[]
}
