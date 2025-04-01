"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

interface QuestionFormProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onRemove: () => void;
}

export function QuestionForm({ question, onUpdate, onRemove }: QuestionFormProps) {
  const addOption = () => {
    const newOption: Option = {
      id: crypto.randomUUID(),
      text: "",
      isCorrect: false,
    };
    onUpdate({
      ...question,
      options: [...question.options, newOption],
    });
  };

  const updateOption = (optionId: string, updates: Partial<Option>) => {
    onUpdate({
      ...question,
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const removeOption = (optionId: string) => {
    onUpdate({
      ...question,
      options: question.options.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Input
          placeholder="Enter your question"
          value={question.question}
          onChange={(e) =>
            onUpdate({ ...question, question: e.target.value })
          }
          className="flex-1 mr-4"
        />
        <Button
          variant="destructive"
          size="icon"
          type="button"
          onClick={onRemove}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-4"
          >
            <Checkbox
              checked={option.isCorrect}
              onCheckedChange={(checked) =>
                updateOption(option.id, {
                  isCorrect: checked as boolean,
                })
              }
            />
            <Input
              placeholder="Enter answer option"
              value={option.text}
              onChange={(e) =>
                updateOption(option.id, { text: e.target.value })
              }
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => removeOption(option.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      </CardContent>
    </Card>
  );
}
