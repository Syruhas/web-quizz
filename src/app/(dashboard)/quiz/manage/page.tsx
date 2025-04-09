"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewQuizForm } from "@/components/new-quiz-form";
import { QuizCard, QuizDetailView, QuizCardSkeleton, NewQuizCard} from '@/components/manage-quiz'
import { Quiz } from "@/models/quiz";

export default function ManageQuizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
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

  if (isCreating) {
    return (
      <div className="relative min-h-screen p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={() => setIsCreating(false)}
        >
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Create New Quiz
        </h2>
        <NewQuizForm onSuccess={() => {
            setIsCreating(false);
            fetchQuizzes();
        }} />
      </div>
    );
  }

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
            <NewQuizCard onClick={() => setIsCreating(true)} />
          </>
        )}
      </div>
    </div>
  );
}