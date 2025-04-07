"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Quiz } from "@/models/quiz";

export default function ManageQuizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/quiz/teacher");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedQuiz) {
    return (
      <div className="relative min-h-screen p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => setSelectedQuiz(null)}
        >
          <X className="h-6 w-6" />
        </Button>
        <QuizDetailView quiz={selectedQuiz} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Quizzes</h1>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => <QuizCardSkeleton key={i} />)
        ) : (
          <>
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id?.toString()}
                quiz={quiz}
                onClick={() => setSelectedQuiz(quiz)}
              />
            ))}
            <NewQuizCard />
          </>
        )}
      </div>
    </div>
  );
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  return (
    <Card
      className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-2">
        <h3 className="font-semibold truncate">{quiz.name}</h3>
        <p className="text-sm text-muted-foreground">
          {quiz.questions.length} questions
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              quiz.status === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : quiz.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {quiz.status}
          </span>
        </div>
      </div>
    </Card>
  );
}

function NewQuizCard() {
  return (
    <Link href="/teacher/quizzes/create">
      <Card className="p-6 border-dashed hover:border-primary/50 transition-colors cursor-pointer h-full flex items-center justify-center">
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <span className="text-muted-foreground">Create New Quiz</span>
        </div>
      </Card>
    </Link>
  );
}

function QuizCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
      </div>
    </Card>
  );
}

function QuizDetailView({ quiz }: { quiz: Quiz }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{quiz.name}</h2>
      {/* Add detailed quiz management UI here */}
    </div>
  );
}