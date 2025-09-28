import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TartufiQuiz = ({ quizData }) => {
  const [testQuestions, setTestQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minuti in secondi
  const questionsPerPage = 10;
  const resultsRef = useRef(null);
  const questionRefs = useRef({});
  
  const resetCurrentTest = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentPage(1);
    setTimeLeft(1800);
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    try {
      setLoading(false);
      generateRandomQuestions();
    } catch (error) {
      console.error("Errore nell'inizializzazione dei dati del quiz:", error);
      setError("Si è verificato un errore nel caricamento del quiz. Riprova più tardi.");
      setLoading(false);
    }
  }, [quizData]);
  
  // Timer effect
  useEffect(() => {
    if (timerEnabled && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerEnabled && timeLeft === 0 && !showResults) {
      setShowResults(true);
    }
  }, [timeLeft, timerEnabled, showResults]);
  
  // Scroll to results effect
  useEffect(() => {
    if (showResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showResults]);
  
  const generateRandomQuestions = () => {
    try {
      const allQuestions = [];
      Object.keys(quizData).forEach(section => {
        Object.keys(quizData[section].questions).forEach(questionId => {
          allQuestions.push({
            section,
            questionId: parseInt(questionId),
            ...quizData[section].questions[questionId]
          });
        });
      });
      
      // Fisher-Yates shuffle
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      
      const selectedQuestions = allQuestions.slice(0, 30);
      
      setTestQuestions(selectedQuestions);
      setUserAnswers({});
      setShowResults(false);
      setCurrentPage(1);
      setTimeLeft(1800);
      setTimerEnabled(false);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Errore nella generazione del test:", error);
      setError("Si è verificato un errore nella creazione del test. Riprova più tardi.");
    }
  };
  
  const getImagePath = (imageName) => {
    try {
      return new URL(`./assets/images/${imageName}`, import.meta.url).href;
    } catch (error) {
      return `/images/${imageName}`;
    }
  };
  
  const handleAnswerChange = (section, questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${section}-${questionId}`]: answer
    }));
    
    // Feedback visivo immediato
    const element = document.getElementById(`question-${section}-${questionId}`);
    if (element) {
      element.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50', 'transition-all');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
      }, 300);
    }
  };
  
  const scrollToQuestion = (question) => {
    const questionIndex = testQuestions.findIndex(
      q => q.section === question.section && q.questionId === question.questionId
    );
    const targetPage = Math.floor(questionIndex / questionsPerPage) + 1;
    
    setCurrentPage(targetPage);
    
    setTimeout(() => {
      const element = document.getElementById(`question-${question.section}-${question.questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-red-500', 'ring-opacity-50');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };
  
  const calculateScore = () => {
    let totalQuestions = testQuestions.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let notAnswered = 0;
    
    testQuestions.forEach(question => {
      const userAnswer = userAnswers[`${question.section}-${question.questionId}`];
      if (!userAnswer) {
        notAnswered++;
      } else if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });
    
    const totalErrors = wrongAnswers + notAnswered;
    const testPassed = totalErrors <= 4;
    
    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered: notAnswered,
      percentage: (correctAnswers / totalQuestions) * 100,
      testPassed,
      totalErrors
    };
  };
  
  const getAnswerStatus = (section, questionId) => {
    if (!showResults) return "pending";
    
    const userAnswer = userAnswers[`${section}-${questionId}`];
    if (!userAnswer) return "unanswered";
    
    const question = testQuestions.find(q => q.section === section && q.questionId === parseInt(questionId));
    return userAnswer === question?.correctAnswer ? "correct" : "incorrect";
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };
  
  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return testQuestions.slice(startIndex, endIndex);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Caricamento del quiz in corso...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl font-semibold text-red-600 mb-4">Errore</div>
        <div className="text-lg">{error}</div>
      </div>
    );
  }
  
  const score = calculateScore();
  const answeredCount = Object.keys(userAnswers).length;
  const totalPages = Math.ceil(testQuestions.length / questionsPerPage);
  
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-20 w-full">
      {/* Timer fisso */}
      {timerEnabled && !showResults && (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center space-x-2">
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
            <p className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-500 font-bold' : ''}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      )}
      
      <div className="w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-900 dark:text-indigo-200">Esame Tartufi</h1>
        
        {/* Indicatore di progresso globale */}
        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(answeredCount / 30) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">
            {answeredCount}/30 domande risposte
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-indigo-800 dark:text-indigo-300">Test - 30 domande casuali</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Per superare l'esame devi commettere massimo 4 errori su 30 domande.</p>
          
          {/* Controlli timer */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <button
              onClick={generateRandomQuestions}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Genera nuovo test
            </button>
            
            {!showResults && (
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg ${
                  timerEnabled 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{timerEnabled ? 'Disattiva timer' : 'Attiva timer (30 min)'}</span>
                </div>
              </button>
            )}
          </div>
          
          {/* Navigazione migliorata - PULSANTI CORRETTI */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Pagina precedente"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-full transition-colors focus:outline-none flex items-center justify-center ${
                    currentPage === page 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 font-bold border-2 border-indigo-600 dark:border-indigo-400' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                  aria-label={`Vai a pagina ${page}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Pagina successiva"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Pagina {currentPage} di {totalPages} • 
            Domande {(currentPage - 1) * questionsPerPage + 1}-{Math.min(currentPage * questionsPerPage, testQuestions.length)}
          </div>
        </div>
        
        {/* Domande */}
        <div className="mb-8">
          <div className="space-y-8">
            {getCurrentPageQuestions().map((question, index) => {
              const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;
              const answerStatus = getAnswerStatus(question.section, question.questionId);
              
              return (
                <div 
                  key={`${question.section}-${question.questionId}`}
                  id={`question-${question.section}-${question.questionId}`}
                  className={`p-6 rounded-lg shadow-sm transition-all duration-300 ${
                    answerStatus === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700' : 
                    answerStatus === 'incorrect' ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700' : 
                    answerStatus === 'unanswered' && showResults ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700' :
                    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium mb-3 flex items-start">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 mr-2">{questionNumber}.</span>
                    <div className="flex-1">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">[{question.section}]</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">{question.text}</span>
                    </div>
                    {showResults && (
                      <div className="ml-2">
                        {answerStatus === 'correct' && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                        {answerStatus === 'incorrect' && <XCircle className="w-6 h-6 text-rose-600" />}
                        {answerStatus === 'unanswered' && <AlertCircle className="w-6 h-6 text-amber-600" />}
                      </div>
                    )}
                  </div>

                  {question.image && (
                    <div className="my-4">
                      <img
                        src={getImagePath(question.image)}
                        alt={`Immagine per la domanda ${questionNumber}`}
                        loading="lazy"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        onError={(e) => {
                          console.error(`Errore nel caricamento dell'immagine: ${question.image}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 ml-4">
                    {Object.keys(question.options).map(optionKey => (
                      <div key={optionKey} className="flex items-start">
                        <input
                          type="radio"
                          id={`test-${question.section}-${question.questionId}-${optionKey}`}
                          name={`test-${question.section}-${question.questionId}`}
                          value={optionKey}
                          checked={userAnswers[`${question.section}-${question.questionId}`] === optionKey}
                          onChange={() => handleAnswerChange(question.section, question.questionId, optionKey)}
                          disabled={showResults}
                          className="mt-1 mr-2 cursor-pointer"
                        />
                        <label 
                          htmlFor={`test-${question.section}-${question.questionId}-${optionKey}`}
                          className={`cursor-pointer ${
                            showResults && optionKey === question.correctAnswer ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''
                          } ${
                            showResults && userAnswers[`${question.section}-${question.questionId}`] === optionKey && optionKey !== question.correctAnswer ? 'text-rose-700 dark:text-rose-400 line-through' : ''
                          }`}
                        >
                          {optionKey}) {question.options[optionKey]}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {showResults && (
                    <div className="mt-3 text-sm">
                      {answerStatus === 'unanswered' && (
                        <p className="text-amber-600 dark:text-amber-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Non hai risposto. La risposta corretta è: <strong className="ml-1">{question.correctAnswer}</strong>
                        </p>
                      )}
                      {answerStatus === 'incorrect' && (
                        <p className="text-rose-600 dark:text-rose-400 flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Risposta errata. La risposta corretta è: <strong className="ml-1">{question.correctAnswer}</strong>
                        </p>
                      )}
                      {answerStatus === 'correct' && (
                        <p className="text-emerald-600 dark:text-emerald-400 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Risposta corretta!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Navigazione inferiore */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-2 border-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 hover:border-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Precedente</span>
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-2 border-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 hover:border-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
          >
            <span>Successiva</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Controlli azioni */}
        <div className="mt-8 text-center space-x-4">
          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Visualizza Risultati
            </button>
          ) : (
            <>
              <button
                onClick={generateRandomQuestions}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Nuovo Test
              </button>
              <button
                onClick={resetCurrentTest}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Rifai il Test
              </button>
            </>
          )}
        </div>
        
        {/* Risultati */}
        {showResults && (
          <>
            <div 
              ref={resultsRef}
              className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-700 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900 dark:text-indigo-200">Risultati</h2>
              
              <div className="text-center">
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  Hai risposto correttamente a <span className="font-bold text-indigo-700 dark:text-indigo-400">{score.correctAnswers}</span> domande su <span className="font-bold">{score.totalQuestions}</span>.
                </p>
                <p className="text-lg mt-2 text-gray-800 dark:text-gray-200">
                  Risposte errate: <span className="font-bold text-rose-600 dark:text-rose-400">{score.wrongAnswers}</span>
                </p>
                <p className="text-lg mt-2 text-gray-800 dark:text-gray-200">
                  Domande senza risposta: <span className="font-bold text-amber-600 dark:text-amber-400">{score.unanswered}</span>
                </p>
                <p className="text-lg mt-2 text-gray-800 dark:text-gray-200">
                  Punteggio: <span className="font-bold text-indigo-700 dark:text-indigo-400">{score.percentage.toFixed(1)}%</span>
                </p>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-6">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 ${score.testPassed ? 'bg-emerald-600' : 'bg-rose-600'}`}
                    style={{ width: `${score.percentage}%` }}
                  ></div>
                </div>
                
                <div className="mt-6 p-4 rounded-lg font-bold text-lg inline-block border-2 border-indigo-100 dark:border-indigo-700">
                  {score.testPassed ? (
                    <div className="text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                      ESAME SUPERATO! 
                      <div className="text-sm font-normal mt-1 text-gray-700 dark:text-gray-300">
                        Hai fatto {score.totalErrors} errori totali
                        (massimo consentito: 4)
                      </div>
                    </div>
                  ) : (
                    <div className="text-rose-600 dark:text-rose-400">
                      <XCircle className="w-10 h-10 mx-auto mb-2" />
                      ESAME NON SUPERATO
                      <div className="text-sm font-normal mt-1 text-gray-700 dark:text-gray-300">
                        Hai fatto {score.totalErrors} errori totali
                        (massimo consentito: 4)
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-center">
                  {score.percentage === 100 ? (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Perfetto! Complimenti!</p>
                  ) : score.percentage >= 90 ? (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Ottimo risultato!</p>
                  ) : score.percentage >= 80 ? (
                    <p className="text-emerald-600 dark:text-emerald-400">Molto bene!</p>
                  ) : score.percentage >= 70 ? (
                    <p className="text-emerald-600 dark:text-emerald-400">Buon risultato!</p>
                  ) : score.testPassed ? (
                    <p className="text-indigo-600 dark:text-indigo-400">Hai superato l'esame, ma puoi fare meglio!</p>
                  ) : (
                    <p className="text-rose-600 dark:text-rose-400">Continua a studiare e riprova!</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Riepilogo errori */}
            {(score.wrongAnswers > 0 || score.unanswered > 0) && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Domande da rivedere ({score.totalErrors}):
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testQuestions.filter(q => {
                    const answer = userAnswers[`${q.section}-${q.questionId}`];
                    return !answer || answer !== q.correctAnswer;
                  }).map((q, index) => {
                    const questionNumber = testQuestions.indexOf(q) + 1;
                    const answer = userAnswers[`${q.section}-${q.questionId}`];
                    const isUnanswered = !answer;
                    
                    return (
                      <button
                        key={`${q.section}-${q.questionId}`}
                        onClick={() => scrollToQuestion(q)}
                        className="text-left w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center"
                      >
                        <span className="mr-2">
                          {isUnanswered ? 
                            <AlertCircle className="w-4 h-4 text-amber-500" /> : 
                            <XCircle className="w-4 h-4 text-rose-500" />
                          }
                        </span>
                        <span className="flex-1">
                          <span className="font-semibold">Domanda {questionNumber}:</span> {q.text.substring(0, 50)}...
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TartufiQuiz;