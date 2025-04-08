import { ObjectId } from "mongodb";

export type QuizStatus = "draft" | "scheduled" | "active" | "closed";

export interface Question {
  _id: ObjectId;
  question: string;
  difficulty?: number;
  options: {
    _id: ObjectId;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface Quiz {
  _id?: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId;
  questions: Question[];
  status: QuizStatus;
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSettings {
  startDate?: Date;
  endDate?: Date;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  attemptsAllowed: number;
  passingScore?: number;
}

export interface QuizAttempt {
  _id?: ObjectId;
  quizId: ObjectId;
  studentId: ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  answers: {
    questionId: ObjectId;
    selectedOptions: ObjectId[];
  }[];
  score?: number;
  completed: boolean;
}
