// src/app/quiz/results/[id]/page.tsx
"use client";
import { Suspense } from 'react';
import QuizResults from '@/components/quiz-results';
import { useParams } from "next/navigation";

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Chargement...</div>}>
        <QuizResults attemptId={id} />
      </Suspense>
    </div>
  );
}