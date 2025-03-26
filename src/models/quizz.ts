import { ObjectId } from "mongodb";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: "single" | "multiple"; // Indicates if it's single or multiple choice
  options: Option[];
  points: number; // Optional: points for this question
}

export interface Quiz {
  _id?: ObjectId;
  title: string;
  teacherId: ObjectId;
  groupId: ObjectId;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
