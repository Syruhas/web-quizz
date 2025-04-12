// src/components/grades-display.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowUpDown, Search, Download, User, Users, BookOpen } from 'lucide-react';
import { QuizAttempt, Quiz } from '@/models/quiz';
import { User as UserModel } from '@/models/user';

interface StudentGrade {
  _id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizName: string;
  score: number;
  completedAt: string;
  attemptId: string;
}

interface GroupGrades {
  groupId: string;
  groupName: string;
  students: {
    studentId: string;
    studentName: string;
    grades: StudentGrade[];
  }[];
}

export function GradesDisplay() {
  const { data: session, status } = useSession();
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [groupGrades, setGroupGrades] = useState<GroupGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentGrade;
    direction: 'asc' | 'desc';
  }>({ key: 'completedAt', direction: 'desc' });
  const [selectedGroup, setSelectedGroup] = useState<string | 'all'>('all');

  useEffect(() => {
    async function fetchGrades() {
      try {
        setLoading(true);
        const response = await fetch('/api/grades');
        
        if (!response.ok) {
          throw new Error('Échec du chargement des notes');
        }
        
        const data = await response.json();
        
        if (session?.user?.role === 'student') {
          setGrades(data.grades);
        } else {
          setGrades(data.allGrades || []);
          setGroupGrades(data.groupGrades || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des notes:', err);
        setError('Impossible de charger les notes. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    }
    
    if (status === 'authenticated') {
      fetchGrades();
    }
  }, [session, status]);

  // Fonction de tri
  const sortData = (key: keyof StudentGrade) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Fonction pour filtrer les données
  const filteredGrades = grades.filter(grade => {
    const searchLower = searchTerm.toLowerCase();
    return (
      grade.quizName.toLowerCase().includes(searchLower) ||
      grade.studentName.toLowerCase().includes(searchLower)
    );
  });

  // Fonction pour trier les données
  const sortedGrades = [...filteredGrades].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Exporter au format CSV
  const exportToCSV = () => {
    const headers = ['Étudiant', 'Quiz', 'Score', 'Date de soumission'];
    const dataRows = sortedGrades.map(grade => [
      grade.studentName,
      grade.quizName,
      `${grade.score}%`,
      new Date(grade.completedAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'notes.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Chargement...
            </span>
          </div>
          <p className="mt-2 text-gray-600">Chargement des notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (session?.user?.role === 'student') {
    // Vue étudiant
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mes notes</h1>
        
        {grades.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">Vous n'avez pas encore de notes.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un quiz..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => sortData('quizName')}
                    >
                      <div className="flex items-center">
                        Quiz
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => sortData('score')}
                    >
                      <div className="flex items-center">
                        Score
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => sortData('completedAt')}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGrades.map((grade) => (
                    <tr key={grade.attemptId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grade.quizName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          grade.score >= 80 ? 'text-green-600' : 
                          grade.score >= 60 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {grade.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(grade.completedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                          href={`/quiz/results/${grade.attemptId}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir les détails
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  } else {
    // Vue enseignant
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Notes des étudiants</h1>
        
        <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un étudiant ou un quiz..."
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="all">Tous les groupes</option>
              {groupGrades.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
            
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <Download className="h-5 w-5 mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>
        
        {grades.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">Aucune note n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('studentName')}
                  >
                    <div className="flex items-center">
                      Étudiant
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('quizName')}
                  >
                    <div className="flex items-center">
                      Quiz
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('score')}
                  >
                    <div className="flex items-center">
                      Score
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('completedAt')}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGrades
                  .filter(grade => selectedGroup === 'all' || 
                    groupGrades.find(g => g.groupId === selectedGroup)?.students
                      .some(s => s.studentId === grade.studentId))
                  .map((grade) => (
                    <tr key={grade.attemptId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{grade.studentName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grade.quizName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          grade.score >= 80 ? 'bg-green-100 text-green-800' : 
                          grade.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(grade.completedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                          href={`/quiz/results/${grade.attemptId}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir les détails
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Section d'analyse par groupe si un groupe est sélectionné */}
        {selectedGroup !== 'all' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Analyse du groupe: {groupGrades.find(g => g.groupId === selectedGroup)?.groupName}
            </h2>
            
            {/* Statistiques du groupe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Score moyen */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Score moyen</h3>
                <p className="text-3xl font-bold">
                  {sortedGrades
                    .filter(grade => 
                      groupGrades.find(g => g.groupId === selectedGroup)?.students
                        .some(s => s.studentId === grade.studentId)
                    )
                    .reduce((sum, grade) => sum + grade.score, 0) / 
                      Math.max(
                        1, 
                        sortedGrades.filter(grade => 
                          groupGrades.find(g => g.groupId === selectedGroup)?.students
                            .some(s => s.studentId === grade.studentId)
                        ).length
                      )
                    }%
                </p>
              </div>
              
              {/* Meilleur score */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Meilleur score</h3>
                <p className="text-3xl font-bold text-green-600">
                  {Math.max(
                    0,
                    ...sortedGrades
                      .filter(grade => 
                        groupGrades.find(g => g.groupId === selectedGroup)?.students
                          .some(s => s.studentId === grade.studentId)
                      )
                      .map(grade => grade.score)
                  )}%
                </p>
              </div>
              
              {/* Nombre de quiz complétés */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Quiz complétés</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {sortedGrades.filter(grade => 
                    groupGrades.find(g => g.groupId === selectedGroup)?.students
                      .some(s => s.studentId === grade.studentId)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}