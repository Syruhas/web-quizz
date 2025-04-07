import { ObjectId } from "mongodb";

// Quiz status
export type QuizStatus = "draft" | "scheduled" | "active" | "closed";

// Difficulty levels
export enum QuestionDifficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

// Base question interface
export interface Question {
  _id?: ObjectId;
  text: string;
  difficulty: QuestionDifficulty;
  points?: number;
  type: "single" | "multiple";
  options: string[];
  correctAnswers: number[];
}

// Quiz interface
export interface Quiz {
  _id?: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId;
  groupId: ObjectId;
  questions: Question[];
  status: QuizStatus;
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz settings/configuration
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

// Student's quiz attempt
export interface QuizAttempt {
  _id?: ObjectId;
  quizId: ObjectId;
  studentId: ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  answers: {
    questionId: ObjectId;
    selectedAnswers: number[];
  }[];
  score?: number;
  completed: boolean;
}