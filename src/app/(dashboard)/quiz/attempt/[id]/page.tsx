// src/app/quiz/attempt/[id]/page.tsx
"use client";
import { Suspense } from 'react';
import QuizAttempt from '@/components/quiz-attempt';
import { useParams } from "next/navigation";

export default function QuizAttemptPage({ params }: { params: { id: string } }) {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Chargement...</div>}>
        <QuizAttempt quizId={id} />
      </Suspense>
    </div>
  );
}