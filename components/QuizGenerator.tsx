import React, { useState } from 'react';
import { ICONS } from '../constants';
import { generateSkillQuiz } from '../services/geminiService';
import { QuizData, LoadingState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus(LoadingState.LOADING);
    setShowResults(false);
    setUserAnswers({});
    try {
        const data = await generateSkillQuiz(topic);
        setQuizData(data);
        setStatus(LoadingState.SUCCESS);
    } catch (e) {
        setStatus(LoadingState.ERROR);
    }
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    setUserAnswers(prev => ({
        ...prev,
        [qIndex]: option
    }));
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  const getChartData = () => {
      const score = calculateScore();
      return [
          { name: 'Correct', value: score, color: '#16a34a' }, // green-600
          { name: 'Incorrect', value: (quizData?.questions.length || 0) - score, color: '#ef4444' } // red-500
      ];
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-black">
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800">
                 <h2 className="text-2xl font-bold text-white mb-4">Skill Assessment Generator</h2>
                 <div className="flex gap-2 flex-col sm:flex-row">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic (e.g., 'Internet Safety', 'MS Word', 'Coding Basics')"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={status === LoadingState.LOADING || !topic.trim()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                         {status === LoadingState.LOADING ? <ICONS.Refresh className="animate-spin" /> : <ICONS.Brain />}
                         Generate Quiz
                    </button>
                 </div>
            </div>

            {status === LoadingState.ERROR && (
                 <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center gap-3">
                    <ICONS.Alert />
                    <p>Failed to generate quiz. Try a simpler topic.</p>
                </div>
            )}

            {quizData && status === LoadingState.SUCCESS && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">{quizData.title}</h3>
                        {!showResults && (
                            <button 
                                onClick={() => setShowResults(true)}
                                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                            >
                                Finish & Check
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {quizData.questions.map((q, idx) => (
                            <div key={idx} className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
                                <p className="font-medium text-lg mb-4 text-slate-200">{idx + 1}. {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = userAnswers[idx] === opt;
                                        const isCorrect = opt === q.correctAnswer;
                                        
                                        let btnClass = "w-full text-left p-3 rounded-xl border transition ";
                                        if (showResults) {
                                            if (isCorrect) btnClass += "bg-green-900/30 border-green-600 text-green-200";
                                            else if (isSelected && !isCorrect) btnClass += "bg-red-900/30 border-red-600 text-red-200";
                                            else btnClass += "border-slate-700 text-slate-500 opacity-60";
                                        } else {
                                            btnClass += isSelected ? "bg-indigo-900/30 border-indigo-500 text-indigo-200" : "border-slate-700 text-slate-400 hover:bg-slate-800";
                                        }

                                        return (
                                            <button 
                                                key={optIdx}
                                                onClick={() => !showResults && handleOptionSelect(idx, opt)}
                                                className={btnClass}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {showResults && (
                                    <div className="mt-4 p-3 bg-blue-900/30 text-blue-200 text-sm rounded-lg border border-blue-800">
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {showResults && (
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-center animate-fade-in-up">
                            <h3 className="text-2xl font-bold mb-4 text-white">Quiz Results</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getChartData()}>
                                        <XAxis dataKey="name" tick={{fill: '#cbd5e1'}} />
                                        <YAxis allowDecimals={false} tick={{fill: '#cbd5e1'}} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                            {getChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-lg mt-4 font-medium text-slate-300">
                                You scored {calculateScore()} out of {quizData.questions.length}!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};