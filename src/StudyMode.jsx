import React, { useState } from 'react';

const StudyMode = ({ quizData }) => {
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estrai tutte le sezioni dal quizData
  const sections = Object.keys(quizData);

  // Filtra le domande in base alla sezione selezionata e al termine di ricerca
  const getFilteredQuestions = () => {
    let questions = [];
    
    // Se è selezionato 'all', prendi tutte le sezioni, altrimenti solo quella selezionata
    const sectionsToProcess = selectedSection === 'all' 
      ? sections 
      : [selectedSection];

    sectionsToProcess.forEach(section => {
      const sectionQuestions = Object.entries(quizData[section].questions).map(([id, question]) => ({
        ...question,
        id,
        section
      }));
      questions = [...questions, ...sectionQuestions];
    });

    // Applica il filtro di ricerca se presente
    if (searchTerm) {
      questions = questions.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(q.options).some(option => 
          option.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return questions;
  };

  const getImagePath = (imageName) => {
    try {
      return new URL(`./assets/images/${imageName}`, import.meta.url).href;
    } catch (error) {
      return `/images/${imageName}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900 dark:text-indigo-200">
        Modalità Studio
      </h1>

      {/* Controlli di filtro */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1"
          >
            <option value="all">Tutte le sezioni</option>
            {sections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cerca nelle domande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1"
          />
        </div>
      </div>

      {/* Lista delle domande */}
      <div className="space-y-8">
        {getFilteredQuestions().map((question, index) => (
          <div 
            key={`${question.section}-${question.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="font-medium mb-4">
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                [{question.section}]
              </span>
              <div className="mt-2 text-gray-800 dark:text-gray-200">
                {question.text}
              </div>
            </div>

            {question.image && (
              <div className="my-4">
                <img
                  src={getImagePath(question.image)}
                  alt={`Immagine della domanda ${index + 1}`}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error(`Errore nel caricamento dell'immagine: ${question.image}`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="space-y-2 ml-4">
              {Object.entries(question.options).map(([key, value]) => (
                <div 
                  key={key}
                  className={`p-2 rounded ${
                    key === question.correctAnswer 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700'
                      : 'bg-gray-50 dark:bg-gray-700/30'
                  }`}
                >
                  <span className={`${
                    key === question.correctAnswer 
                      ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {key}) {value}
                  </span>
                  {key === question.correctAnswer && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                      ✓ Risposta corretta
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMode;