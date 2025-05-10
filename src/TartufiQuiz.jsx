import React, { useState, useEffect } from 'react';

const TartufiQuiz = ({ quizData }) => {
  const [testQuestions, setTestQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  const resetCurrentTest = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentPage(1);
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
      
      // Mescola con Fisher‑Yates
      for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
      }
      
      // Prendi le prime 30
      const selectedQuestions = allQuestions.slice(0, 30);
      
      setTestQuestions(selectedQuestions);
      setUserAnswers({});
      setShowResults(false);
      setCurrentPage(1);
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
    console.log("Errori totali:", totalErrors, "di cui sbagliati:", wrongAnswers, "e non risposti:", notAnswered);
    const testPassed = totalErrors <= 5;
    
    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered: notAnswered,
      percentage: (correctAnswers / totalQuestions) * 100,
      testPassed
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
  
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-20 w-full">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-900 dark:text-indigo-200">Esame Tartufi</h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-indigo-800 dark:text-indigo-300">Test - 30 domande casuali</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">Per superare l'esame devi commettere massimo 5 errori su 30 domande.</p>
          
          <div className="text-center mb-4">
            <button
              onClick={generateRandomQuestions}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 rounded font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors border border-indigo-600 dark:border-indigo-400"
            >
              Genera nuovo test
            </button>
          </div>
          
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: Math.ceil(testQuestions.length / questionsPerPage) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-full transition-colors focus:outline-none flex items-center justify-center ${
                  currentPage === page 
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-semibold' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Visualizzando domande {(currentPage - 1) * questionsPerPage + 1} - {Math.min(currentPage * questionsPerPage, testQuestions.length)} di {testQuestions.length}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="space-y-8">
            {getCurrentPageQuestions().map((question, index) => {
              const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;
              const answerStatus = getAnswerStatus(question.section, question.questionId);
              
              return (
                <div 
                  key={`${question.section}-${question.questionId}`} 
                  className={`p-6 rounded-lg shadow-sm ${
                    answerStatus === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700' : 
                    answerStatus === 'incorrect' ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700' : 
                    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium mb-3">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">{questionNumber}.</span> 
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 ml-2">[{question.section}]</span> 
                    <span className="ml-2 text-gray-800 dark:text-gray-200">{question.text}</span>
                  </div>

                  {question.image && (
                    <div className="my-4">
                      <img
                        src={getImagePath(question.image)}
                        alt={`Immagine per la domanda ${questionNumber}`}
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
                          className="mt-1 mr-2"
                        />
                        <label 
                          htmlFor={`test-${question.section}-${question.questionId}-${optionKey}`}
                          className={`
                            ${showResults && optionKey === question.correctAnswer ? 'text-emerald-700 dark:text-emerald-400 font-medium' : ''}
                            ${showResults && userAnswers[`${question.section}-${question.questionId}`] === optionKey && optionKey !== question.correctAnswer ? 'text-rose-700 dark:text-rose-400 line-through' : ''}
                          `}
                        >
                          {optionKey}) {question.options[optionKey]}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {showResults && (
                    <div className="mt-3 text-sm">
                      {answerStatus === 'unanswered' && (
                        <p className="text-amber-600 dark:text-amber-400">Non hai risposto a questa domanda. La risposta corretta è: {question.correctAnswer}</p>
                      )}
                      {answerStatus === 'incorrect' && (
                        <p className="text-rose-600 dark:text-rose-400">Risposta errata. La risposta corretta è: {question.correctAnswer}</p>
                      )}
                      {answerStatus === 'correct' && (
                        <p className="text-emerald-600 dark:text-emerald-400">Risposta corretta!</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800 transition-colors"
          >
            Pagina precedente
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(testQuestions.length / questionsPerPage)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800 transition-colors"
          >
            Pagina successiva
          </button>
        </div>
        
        <div className="mt-8 text-center space-x-4">
          {!showResults ? (
            <button
              onClick={() => setShowResults(true)}
              className="px-6 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-50 transition-colors border border-indigo-600 dark:border-indigo-500"
            >
              Verifica Risposte
            </button>
          ) : (
            <>
              <button
                onClick={generateRandomQuestions}
                className="px-6 py-2 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-lg font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors border border-emerald-600 dark:border-emerald-500"
              >
                Nuovo Test
              </button>
              <button
                onClick={resetCurrentTest}
                className="px-6 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border border-blue-600 dark:border-blue-500"
              >
                Rifai il Test
              </button>
            </>
          )}
        </div>
        
        {showResults && (
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-700 shadow-sm">
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
                  className={`h-4 rounded-full transition-all ${score.testPassed ? 'bg-emerald-600' : 'bg-rose-600'}`}
                  style={{ width: `${score.percentage}%` }}
                ></div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg font-bold text-lg inline-block border-2 border-indigo-100 dark:border-indigo-700">
                {score.testPassed ? (
                  <div className="text-emerald-600 dark:text-emerald-400">
                    ESAME SUPERATO! 
                    <div className="text-sm font-normal mt-1 text-gray-700 dark:text-gray-300">
                      Hai fatto {score.wrongAnswers + score.unanswered} errori totali
                      (massimo consentito: 5)
                    </div>
                  </div>
                ) : (
                  <div className="text-rose-600 dark:text-rose-400">
                    ESAME NON SUPERATO
                    <div className="text-sm font-normal mt-1 text-gray-700 dark:text-gray-300">
                      Hai fatto {score.wrongAnswers + score.unanswered} errori totali
                      (massimo consentito: 5)
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
        )}
      </div>
    </div>
  );
};

export default TartufiQuiz;