import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Il componente SectionSelector rimane identico e corretto.
const SectionSelector = ({ show, onClose, sections, selectedSection, onSectionSelect }) => {
  useEffect(() => {
    if (show) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    };
  }, [show]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full m-4 transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-5 text-indigo-900 dark:text-indigo-200 text-center">Seleziona una Sezione</h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          <button onClick={() => onSectionSelect('all')} className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${selectedSection === 'all' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold border-indigo-500' : 'text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            Tutte le sezioni
          </button>
          {sections.map(section => (
            <button key={section} onClick={() => onSectionSelect(section)} className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${selectedSection === section ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold border-indigo-500' : 'text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {section}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors">
          Chiudi
        </button>
      </div>
    </div>
  );
};

const StudyMode = ({ quizData }) => {
  // MODIFICA: Inizializza a stringa vuota per la schermata di benvenuto
  const [selectedSection, setSelectedSection] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const questionsPerPage = 10;

  const sections = Object.keys(quizData);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSection, searchTerm]);
  
  const getFilteredQuestions = () => {
    // Se nessuna sezione è selezionata, non mostrare domande
    if (!selectedSection) return [];

    let questions = [];
    const sectionsToProcess = selectedSection === 'all' ? sections : [selectedSection];
    sectionsToProcess.forEach(section => {
      const sectionQuestions = Object.entries(quizData[section].questions).map(([id, question]) => ({ ...question, id, section }));
      questions = [...questions, ...sectionQuestions];
    });
    if (searchTerm.trim()) {
      questions = questions.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(q.options).some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setShowSectionSelector(false);
  };

  const filteredQuestions = getFilteredQuestions();
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + questionsPerPage);
  };

  // ===== NUOVA LOGICA DI RENDER =====
  // Schermata di benvenuto se nessuna sezione è selezionata
  if (!selectedSection) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-center mb-4 text-indigo-900 dark:text-indigo-200">
            Modalità Studio
          </h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8">
            Esercitati visualizzando le risposte corrette alle domande.
          </p>
          <button
            onClick={() => setShowSectionSelector(true)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl text-lg"
          >
            Seleziona una Sezione
          </button>
        </div>
        <SectionSelector
          show={showSectionSelector }
          onClose={() => setShowSectionSelector(false)}
          sections={sections}
          selectedSection={selectedSection}
          onSectionSelect={handleSectionSelect}
        />
      </>
    );
  }

  // Schermata di studio attiva dopo aver selezionato una sezione
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900 dark:text-indigo-200">
          Modalità Studio: <span className="text-indigo-600">{selectedSection === 'all' ? 'Tutte le sezioni' : selectedSection}</span>
        </h1>

        {/* Controlli di filtro */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => setShowSectionSelector(true)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Cambia Sezione
            </button>
            <input
              type="text"
              placeholder="Cerca nelle domande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 dark:text-gray-400">Nessuna domanda trovata con i filtri attuali.</p>
          </div>
        ) : (
          <>
            {/* Navigazione Pagine (Superiore) */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">Pagina {currentPage} di {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Lista delle domande */}
            <div className="space-y-8 mt-6">
              {getCurrentPageQuestions().map((question, index) => {
                const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;
                return (
                  <div key={`${question.section}-${question.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="font-medium mb-4 flex items-start">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 mr-2">{questionNumber}.</span>
                      <div className="flex-1">
                        <span className="text-sm text-indigo-600 dark:text-indigo-400">[{question.section}]</span>
                        <p className="mt-1 text-gray-800 dark:text-gray-200">{question.text}</p>
                      </div>
                    </div>
                    {question.image && (<div className="my-4"><img src={getImagePath(question.image)} alt={`Immagine della domanda ${index + 1}`} className="max-w-full h-auto rounded-lg shadow-sm" /></div>)}
                    <div className="space-y-2 ml-4">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div key={key} className={`p-3 rounded-md ${ key === question.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                          <span className={` ${ key === question.correctAnswer ? 'text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                            {key}) {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigazione Pagine (Inferiore) */}
            <div className="flex justify-between mt-8">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 shadow-md">
                <ChevronLeft className="w-5 h-5" />
                <span>Precedente</span>
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 shadow-md">
                <span>Successiva</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      <SectionSelector
        show={showSectionSelector}
        onClose={() => setShowSectionSelector(false)}
        sections={sections}
        selectedSection={selectedSection}
        onSectionSelect={handleSectionSelect}
      />
    </>
  );
};

export default StudyMode;