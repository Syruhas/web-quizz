"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MoveUp, MoveDown } from "lucide-react";
import { QuestionForm } from "@/components/question-form";
import { toast } from "sonner";
import { QuizFormQuestion, QuizFormData } from "@/types/quiz-form";

export function NewQuizForm() { 
  const [questions, setQuestions] = useState<QuizFormQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuizFormQuestion = {
      id: crypto.randomUUID(),
      question: "",
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updatedQuestion: QuizFormQuestion) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? updatedQuestion : q))
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!quizTitle.trim()) {
        toast.error("Please enter a quiz title");
        return;
      }

      if (questions.length === 0) {
        toast.error("Please add at least one question");
        return;
      }

      const invalidQuestions = questions.filter(
        (q) => 
          !q.question.trim() || 
          q.options.length < 2 || 
          q.options.some(opt => !opt.text.trim()) ||
          !q.options.some(opt => opt.isCorrect)
      );

      if (invalidQuestions.length > 0) {
        toast.error(
          "All questions must have a title, at least two options, and one correct answer"
        );
        return;
      }

      // Prepare quiz data
      const quizData: QuizFormData = {
        name: quizTitle,
        description: "",
        groupId: "default",
        questions: questions,
        settings: {
          shuffleQuestions: false,
          shuffleOptions: false,
          showResults: true,
          attemptsAllowed: 1
        }
      };
      
      const response = await fetch("/api/quiz/newquiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      toast.success("Quiz created successfully!");
      // Optional: Reset form or redirect
      setQuestions([]);
      setQuizTitle("");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-3xl mx-auto">
      <div className="space-y-2">
        <Input
          placeholder="Enter quiz title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="relative">
          <div className="absolute -left-12 top-4 flex flex-col gap-1">
            {index !== 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveQuestion(index, "up")}
                className="h-8 w-8"
              >
                <MoveUp className="h-4 w-4" />
              </Button>
            )}
            {index !== questions.length - 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveQuestion(index, "down")}
                className="h-8 w-8"
              >
                <MoveDown className="h-4 w-4" />
              </Button>
            )}
          </div>
          <QuestionForm
            question={question}
            onUpdate={(updatedQuestion) =>
              updateQuestion(question.id, updatedQuestion)
            }
            onRemove={() => removeQuestion(question.id)}
          />
        </div>
      ))}

      <Card
        className="flex items-center justify-center p-6 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
        onClick={addQuestion}
      >
        <Button type="button" variant="ghost" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
      </Button>
    </form>
  );
}
