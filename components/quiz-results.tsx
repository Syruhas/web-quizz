// src/components/quiz-results.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuizResultsProps {
  attemptId: string;
}

interface QuizResultsData {
  attempt: {
    _id: string;
    quizId: string;
    studentId: string;
    startedAt: string;
    submittedAt: string;
    answers: {
      questionId: string;
      selectedOptions: string[];
    }[];
    score: number;
    completed: boolean;
  };
  quiz: {
    _id: string;
    name: string;
    description?: string;
    questions: {
      _id: string;
      question: string;
      options: {
        _id: string;
        text: string;
        isCorrect: boolean;
      }[];
    }[];
    settings: {
      passingScore?: number;
      showResults: boolean;
    };
  };
}

export default function QuizResults({ attemptId }: QuizResultsProps) {
  const [resultsData, setResultsData] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/quiz/attempts/${attemptId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des résultats');
        }
        
        const data = await response.json();
        setResultsData(data);
      } catch (err) {
        setError('Impossible de charger les résultats. Veuillez réessayer plus tard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [attemptId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeTaken = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffMs = end - start;
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes} min ${seconds} sec`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des résultats...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!resultsData) {
    return <div className="text-center p-8">Résultats non trouvés.</div>;
  }

  const { attempt, quiz } = resultsData;

  // Vérifier si le quiz permet d'afficher les résultats détaillés
  const showDetailedResults = quiz.settings.showResults;
  
  // Vérifier si le score est suffisant pour réussir le quiz
  const isPassing = quiz.settings.passingScore 
    ? attempt.score >= quiz.settings.passingScore 
    : true;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h1 className="text-xl font-bold">{quiz.name} - Résultats</h1>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${
                  isPassing ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attempt.score.toFixed(0)}%
                </div>
                <div className="text-gray-600">
                  {isPassing ? 'Réussi' : 'Non réussi'}
                  {quiz.settings.passingScore && (
                    <span> (Score minimum requis: {quiz.settings.passingScore}%)</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold">Date de début:</span> {formatDate(attempt.startedAt)}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold">Date de fin:</span> {formatDate(attempt.submittedAt)}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold">Temps écoulé:</span> {calculateTimeTaken(attempt.startedAt, attempt.submittedAt)}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-semibold">Questions:</span> {quiz.questions.length}
              </div>
            </div>
          </div>
          
          {showDetailedResults ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Réponses détaillées</h2>
              
              {quiz.questions.map((question, index) => {
                const userAnswer = attempt.answers.find(a => a.questionId === question._id);
                const userSelectedOptions = userAnswer ? userAnswer.selectedOptions : [];
                
                // Vérifier si la réponse de l'utilisateur est correcte
                const correctOptionIds = question.options
                  .filter(opt => opt.isCorrect)
                  .map(opt => opt._id);
                
                const allCorrectOptionsSelected = correctOptionIds.every(id => 
                  userSelectedOptions.includes(id)
                );
                
                const noIncorrectOptionsSelected = userSelectedOptions.every(id => 
                  correctOptionIds.includes(id)
                );
                
                const isCorrect = allCorrectOptionsSelected && noIncorrectOptionsSelected;
                
                return (
                  <div key={question._id} className="border rounded-lg overflow-hidden">
                    <div className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          Question {index + 1}: {question.question}
                        </h3>
                        <span className={`px-2 py-1 rounded text-sm ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {question.options.map(option => {
                          const isSelected = userSelectedOptions.includes(option._id);
                          
                          // Déterminer la classe CSS en fonction de la sélection et de l'exactitude
                          let optionClass = 'border p-2 rounded ';
                          
                          if (option.isCorrect && isSelected) {
                            optionClass += 'bg-green-100 border-green-500';
                          } else if (option.isCorrect && !isSelected) {
                            optionClass += 'bg-blue-50 border-blue-300'; // Option correcte non sélectionnée
                          } else if (!option.isCorrect && isSelected) {
                            optionClass += 'bg-red-100 border-red-500'; // Option incorrecte sélectionnée
                          } else {
                            optionClass += 'bg-gray-50 border-gray-300'; // Option incorrecte non sélectionnée
                          }
                          
                          return (
                            <div key={option._id} className={optionClass}>
                              <div className="flex items-start">
                                <div className="mr-2">
                                  {isSelected ? (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  {option.text}
                                  {option.isCorrect && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">
                                      (Réponse correcte)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              Les réponses détaillées ne sont pas disponibles pour ce quiz.
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/quiz')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
            >
              Retour aux quiz
            </button>
            
            <button
              onClick={() => router.push(`/quiz/attempt/${quiz._id}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Retenter le quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}