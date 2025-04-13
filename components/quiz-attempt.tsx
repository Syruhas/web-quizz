// src/components/quiz-attempt.tsx
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, Question, QuizSettings} from '@/models/quiz';
import { ObjectId } from 'mongodb';

interface QuizAttemptProps {
  quizId: string;
}

interface QuizWithResponseTracking extends Quiz {
  settings : QuizSettings,
  currentQuestionIndex: number;
  responses: {
    questionId: string;
    selectedOptions: string[];
  }[];
  timeRemaining?: number;
}

export default function QuizAttempt({ quizId }: QuizAttemptProps) {
  const [quiz, setQuiz] = useState<QuizWithResponseTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        // Récupérer les détails du quiz
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du quiz');
        }
        
        const data = await response.json();
        
        // Préparer le quiz avec les structures pour le suivi des réponses
        const preparedQuiz: QuizWithResponseTracking = {
          ...data.quiz,
          currentQuestionIndex: 0,
          responses: data.quiz.questions.map((q: Question) => ({
            questionId: q._id.toString(),
            selectedOptions: []
          })),
        };
        
        // Si le quiz a un temps limite, configurer le timer
        if (preparedQuiz.settings.timeLimit) {
          preparedQuiz.timeRemaining = preparedQuiz.settings.timeLimit * 60; // en secondes
          
          const timerInterval = setInterval(() => {
            setQuiz(prevQuiz => {
              if (!prevQuiz || prevQuiz.timeRemaining === undefined) return prevQuiz;
              
              const newTimeRemaining = prevQuiz.timeRemaining - 1;
              
              // Si le temps est écoulé, soumettre automatiquement
              if (newTimeRemaining <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
                return { ...prevQuiz, timeRemaining: 0 };
              }
              
              return { ...prevQuiz, timeRemaining: newTimeRemaining };
            });
          }, 1000);
          
          setTimer(timerInterval);
        }
        
        setQuiz(preparedQuiz);
      } catch (err) {
        setError('Impossible de charger le quiz. Veuillez réessayer plus tard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
    
    // Nettoyage du timer quand le composant est démonté
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizId]);

  const handleOptionChange = (questionId: string, optionId: string, isMultipleChoice: boolean) => {
    if (!quiz) return;
    
    setQuiz(prevQuiz => {
      if (!prevQuiz) return null;
      
      const updatedResponses = prevQuiz.responses.map(response => {
        if (response.questionId === questionId) {
          if (isMultipleChoice) {
            // Pour les questions à choix multiples, nous basculons l'option
            const optionIndex = response.selectedOptions.indexOf(optionId);
            if (optionIndex === -1) {
              return { ...response, selectedOptions: [...response.selectedOptions, optionId] };
            } else {
              return { 
                ...response, 
                selectedOptions: response.selectedOptions.filter(id => id !== optionId)
              };
            }
          } else {
            // Pour les questions à choix unique, nous remplaçons la sélection
            return { ...response, selectedOptions: [optionId] };
          }
        }
        return response;
      });
      
      return { ...prevQuiz, responses: updatedResponses };
    });
  };

  const navigateToQuestion = (index: number) => {
    if (!quiz) return;
    
    setQuiz(prevQuiz => {
      if (!prevQuiz) return null;
      return { ...prevQuiz, currentQuestionIndex: index };
    });
  };

  const submitQuiz = async () => {
    if (!quiz || submitting) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/quiz/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizId,
          answers: quiz.responses,
          startedAt: startTime.toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du quiz');
      }
      
      const data = await response.json();
      
      // Rediriger vers la page des résultats
      router.push(`/quiz/results/${data.attemptId}`);
    } catch (err) {
      setError('Erreur lors de la soumission du quiz. Veuillez réessayer.');
      console.error(err);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement du quiz...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-center p-8">Quiz non trouvé.</div>;
  }

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const isMultipleChoice = currentQuestion.options.filter(opt => opt.isCorrect).length > 1;
  const currentResponse = quiz.responses.find(
    r => r.questionId === currentQuestion._id.toString()
  );
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{quiz.name}</h1>
          {quiz.timeRemaining !== undefined && (
            <div className={`font-mono text-lg ${quiz.timeRemaining < 60 ? 'text-red-600' : ''}`}>
              Temps: {formatTime(quiz.timeRemaining)}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">
              Question {quiz.currentQuestionIndex + 1} sur {quiz.questions.length}
            </h2>
            <p className="text-gray-700">{currentQuestion.question}</p>
          </div>
          
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <div key={option._id.toString()} className="flex items-start space-x-3">
                <input
                  type={isMultipleChoice ? "checkbox" : "radio"}
                  id={option._id.toString()}
                  name={`question-${currentQuestion._id.toString()}`}
                  checked={currentResponse?.selectedOptions.includes(option._id.toString()) || false}
                  onChange={() => handleOptionChange(
                    currentQuestion._id.toString(), 
                    option._id.toString(), 
                    isMultipleChoice
                  )}
                  className="mt-1"
                />
                <label htmlFor={option._id.toString()} className="text-gray-700">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          
          {isMultipleChoice && (
            <p className="text-sm text-gray-500 mt-4">
              * Cette question accepte plusieurs réponses
            </p>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-between">
          <div>
            <button
              onClick={() => navigateToQuestion(quiz.currentQuestionIndex - 1)}
              disabled={quiz.currentQuestionIndex === 0}
              className={`px-4 py-2 rounded ${
                quiz.currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Précédent
            </button>
          </div>
          
          <div>
            {quiz.currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => navigateToQuestion(quiz.currentQuestionIndex + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className={`px-4 py-2 rounded ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {submitting ? 'Soumission...' : 'Terminer le quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="mb-2 text-sm text-gray-600">Navigation rapide :</p>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => {
            const response = quiz.responses[index];
            const hasAnswer = response.selectedOptions.length > 0;
            
            return (
              <button
                key={index}
                onClick={() => navigateToQuestion(index)}
                className={`w-8 h-8 flex items-center justify-center rounded ${
                  index === quiz.currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : hasAnswer
                    ? 'bg-green-100 border border-green-500 text-green-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}