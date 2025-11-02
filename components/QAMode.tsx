
import React, { useState, useRef, useEffect } from 'react';
import { getQAResponse } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface QAContext {
  query: string;
  translation: string;
}

interface QAModeProps {
  context: QAContext;
  onBack: () => void;
}

const QAMode: React.FC<QAModeProps> = ({ context, onBack }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when a new message is added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendQuestion = async () => {
    const trimmedQuestion = currentQuestion.trim();
    if (!trimmedQuestion || isLoading) return;

    setError(null);
    setIsLoading(true);
    const newHistory: Message[] = [...chatHistory, { role: 'user', text: trimmedQuestion }];
    setChatHistory(newHistory);
    setCurrentQuestion('');

    try {
      const responseText = await getQAResponse(trimmedQuestion, context);
      setChatHistory([...newHistory, { role: 'model', text: responseText }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'یک خطای ناشناخته رخ داد.';
      setError(`خطا در دریافت پاسخ: ${errorMessage}`);
      // Revert user message on error if desired
      setChatHistory(chatHistory); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendQuestion();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="w-full max-w-3xl mx-auto flex flex-col" style={{height: 'calc(100vh - 4rem)'}}>
        
        <header className="flex-shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors mb-4 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 1.414L9.414 11l4.293 4.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5z" clipRule="evenodd" />
            </svg>
            <span>بازگشت به مترجم</span>
          </button>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400">موضوع گفتگو:</p>
            <p className="font-bold text-teal-400">{context.query}</p>
            <p className="mt-2 text-gray-300 whitespace-pre-wrap">{context.translation}</p>
          </div>
        </header>

        <main ref={chatContainerRef} className="flex-grow overflow-y-auto bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-teal-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <p className="whitespace-pre-wrap text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl bg-gray-700 text-gray-200 flex items-center">
                  <LoadingSpinner/>
                  <span className="mr-2">...</span>
              </div>
            </div>
          )}
        </main>

        <footer className="flex-shrink-0 mt-4">
          {error && (
            <div role="alert" className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-center mb-2">
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="سوال خود را درباره این آیه بپرسید..."
              className="flex-grow bg-gray-700 border border-gray-600 text-gray-200 text-lg rounded-md p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition duration-200"
              disabled={isLoading}
              aria-label="ورودی سوال"
            />
            <button
              onClick={handleSendQuestion}
              disabled={isLoading || !currentQuestion.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
              aria-busy={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'ارسال'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default QAMode;
