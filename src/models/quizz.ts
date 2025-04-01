// src/models/quiz.ts
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
  points?: number; // Optional points override
  type: "single" | "multiple"; // Single or multiple correct answers
  options: string[];
  correctAnswers: number[]; // Indices of correct options
}

// Quiz interface
export interface Quiz {
  _id?: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId; // Reference to teacher
  groupId: ObjectId; // Reference to the group this quiz belongs to
  questions: Question[];
  status: QuizStatus;
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz settings/configuration
export interface QuizSettings {
  startDate?: Date; // If scheduled
  endDate?: Date; // Optional end date
  timeLimit?: number; // Time limit in minutes, if any
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean; // Show results immediately after submission
  attemptsAllowed: number; // Number of attempts allowed
  passingScore?: number; // Minimum score to pass
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
