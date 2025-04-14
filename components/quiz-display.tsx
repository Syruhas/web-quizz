// src/components/quiz-display.tsx
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizSettings } from '@/models/quiz';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuizWithAttemptInfo extends Quiz {
  attemptsCount: number;
  lastAttempt?: any;
  availability: 'available' | 'notStarted' | 'ended';
  canAttempt: boolean;
  quizSettings: QuizSettings;
}

export function QuizDisplay() {
  const [quizzes, setQuizzes] = useState<QuizWithAttemptInfo[]>([]);
  const [settings, setSettings] = useState<QuizSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch('/api/quiz/student');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des quiz');
        }
        
        const data = await response.json();
        setQuizzes(data.quizzes);
      } catch (err) {
        setError('Impossible de charger les quiz. Veuillez réessayer plus tard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  const startQuiz = (quizId: string) => {
    router.push(`/quiz/attempt/${quizId}`);
  };

  const getStatusBadge = (quiz: QuizWithAttemptInfo) => {
    switch (quiz.availability) {
      case 'notStarted':
        return <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">À venir</span>;
      case 'ended':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Terminé</span>;
      default:
        if (quiz.status === 'active') {
          return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Actif</span>;
        } else if (quiz.status === 'scheduled') {
          return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Planifié</span>;
        } else {
          // return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Fermé</span>;
          return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Actif</span>;
        }
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Non défini';
    return format(new Date(date), 'dd/MM/yyyy à HH:mm', { locale: fr });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des quiz...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Aucun quiz disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Mes Quiz</h1>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <div key={quiz._id?.toString()} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{quiz.name}</h2>
                {getStatusBadge(quiz)}
              </div>
              
              <p className="text-gray-600 mt-2 text-sm">{quiz.description || 'Pas de description'}</p>
              
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Questions:</span> {quiz.questions.length}
                </p>
                
                {quiz.quizSettings.timeLimit && (
                  <p>
                    <span className="font-medium">Temps limite:</span> {quiz.quizSettings.timeLimit} minutes
                  </p>
                )}
                
                <p>
                  <span className="font-medium">Tentatives:</span> {quiz.attemptsCount}/ 
                  {quiz.quizSettings.attemptsAllowed === 0 ? '∞' : quiz.quizSettings.attemptsAllowed}
                </p>
                
                {quiz.quizSettings.startDate && (
                  <p>
                    <span className="font-medium">Début:</span> {formatDate(quiz.quizSettings.startDate)}
                  </p>
                )}
                
                {quiz.quizSettings.endDate && (
                  <p>
                    <span className="font-medium">Fin:</span> {formatDate(quiz.quizSettings.endDate)}
                  </p>
                )}
                
                {quiz.lastAttempt && (
                  <p>
                    <span className="font-medium">Dernier score:</span> {quiz.lastAttempt.score?.toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t">
              <button
                onClick={() => startQuiz(quiz._id!.toString())}
                disabled={!quiz.canAttempt || quiz.availability !== 'available'}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                  quiz.canAttempt && quiz.availability === 'available'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!quiz.canAttempt 
                  ? 'Tentatives maximales atteintes' 
                  : quiz.availability === 'notStarted'
                    ? 'Quiz pas encore disponible'
                    : quiz.availability === 'ended'
                      ? 'Quiz terminé'
                      : quiz.attemptsCount > 0
                        ? 'Retenter le quiz'
                        : 'Commencer le quiz'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
