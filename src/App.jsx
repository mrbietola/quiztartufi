import React, { useState } from 'react';
import quizData from './data/quizData.json';
import StudyMode from './StudyMode';
import TartufiQuiz from './TartufiQuiz';
import SectionQuiz from './SectionQuiz';

const App = () => {
  const [mode, setMode] = useState('quiz'); // 'quiz', 'section-quiz', or 'study'
  
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Toggle di modalità */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
            <button
              onClick={() => setMode('quiz')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'quiz'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Quiz Casuale
            </button>
            <button
              onClick={() => setMode('section-quiz')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'section-quiz'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Quiz per Sezione
            </button>
            <button
              onClick={() => setMode('study')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'study'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Modalità Studio
            </button>
          </div>
        </div>

        {/* Contenuto principale */}
        {mode === 'quiz' && <TartufiQuiz quizData={quizData} />}
        {mode === 'section-quiz' && <SectionQuiz quizData={quizData} />}
        {mode === 'study' && <StudyMode quizData={quizData} />}
      </div>
    </div>
  );
};

export default App;