"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { QuestionForm } from "@/components/question-form";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export function NewQuizForm() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState("");

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: "",
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updatedQuestion: Question) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? updatedQuestion : q))
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(
      (q) => !q.question.trim() || q.options.length < 2
    );
    if (invalidQuestions.length > 0) {
      toast.error(
        "All questions must have a title and at least two answer options"
      );
      return;
    }

    // TODO: Implement your API call here
    try {
      // const response = await fetch('/api/quizzes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ title: quizTitle, questions }),
      // });
      toast.success("Quiz created successfully!");
    } catch (error) {
      toast.error("Failed to create quiz");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Input
          placeholder="Enter quiz title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>

      {questions.map((question) => (
        <QuestionForm
          key={question.id}
          question={question}
          onUpdate={(updatedQuestion) =>
            updateQuestion(question.id, updatedQuestion)
          }
          onRemove={() => removeQuestion(question.id)}
        />
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

      <Button type="submit" className="w-full">
        Create Quiz
      </Button>
    </form>
  );
}
