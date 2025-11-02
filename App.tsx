
import React, { useState, useCallback } from 'react';
import { getTranslation } from './services/geminiService';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import QAMode from './components/QAMode';

type AppMode = 'translate' | 'qa';
interface QAContext {
  query: string;
  translation: string;
}

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('مائده 6');
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<AppMode>('translate');
  const [qaContext, setQaContext] = useState<QAContext | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!query.trim()) {
      setError('لطفاً یک آیه، سوره یا شماره آیه را وارد کنید.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTranslation('');

    try {
        const result = await getTranslation(query);
        setTranslation(result);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'یک خطای ناشناخته رخ داد.';
        setError(`خطا در دریافت ترجمه: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }

  }, [query]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTranslate();
    }
  };

  const handleStartQA = () => {
    if (translation) {
      setQaContext({ query, translation });
      setMode('qa');
    }
  };

  const handleEndQA = () => {
    setMode('translate');
    setQaContext(null);
  };

  if (mode === 'qa' && qaContext) {
    return <QAMode context={qaContext} onBack={handleEndQA} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <Header />

        <main className="mt-8">
          <div className="bg-gray-800 shadow-lg rounded-lg p-6">
            <p className="text-gray-400 mb-4 text-center">
              نام سوره، شماره آیه یا متن عربی آیه مورد نظر را وارد کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: بقره ۲۵۵"
                className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-lg rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition duration-200"
                disabled={isLoading}
                aria-label="ورودی آیه"
              />
              <button
                onClick={handleTranslate}
                disabled={isLoading || !query.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                aria-busy={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'ترجمه کن'}
              </button>
            </div>
          </div>

          <div className="mt-8 min-h-[200px]">
            {error && (
              <div role="alert" className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            {isLoading && !translation && (
                 <div role="status" aria-live="polite" className="flex justify-center items-center h-full text-center text-gray-400 mt-8">
                    <LoadingSpinner />
                    <span className="mr-3">در حال دریافت ترجمه...</span>
                </div>
            )}
            
            {translation && !isLoading && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-teal-400 mb-4 border-b border-gray-700 pb-2">ترجمه آیه</h2>
                <div 
                  className="text-gray-200 leading-loose whitespace-pre-wrap text-lg"
                  style={{ direction: 'rtl' }}
                >
                  {translation}
                </div>
                <div className="mt-6 text-center border-t border-gray-700 pt-4">
                    <button
                        onClick={handleStartQA}
                        className="bg-gray-700 hover:bg-teal-800/50 border border-teal-800 text-teal-300 font-bold py-2 px-5 rounded-md transition duration-200 flex items-center justify-center gap-2 mx-auto"
                        aria-label="ورود به حالت پرسش و پاسخ درباره این آیه"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h7a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        پرسش درباره این آیه
                    </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
