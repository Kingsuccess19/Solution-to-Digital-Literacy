import React, { useState } from 'react';
import { ICONS } from '../constants';
import { findResources } from '../services/geminiService';
import { LoadingState } from '../types';
import ReactMarkdown from 'react-markdown';

export const ResourceFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [useMaps, setUseMaps] = useState(false);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [results, setResults] = useState<{text: string, chunks: any[]} | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setStatus(LoadingState.LOADING);
    setResults(null);
    try {
        // Basic location assumption for demo, ideally use navigator.geolocation
        const location = useMaps ? { lat: 6.5244, lng: 3.3792 } : undefined; // Default to Lagos coords for Maps grounding example if no real gps
        
        const data = await findResources(query, useMaps, location);
        setResults(data);
        setStatus(LoadingState.SUCCESS);
    } catch (e) {
        console.error(e);
        setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-black">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-lg text-white border border-slate-700">
            <h2 className="text-2xl font-bold mb-2">Find Resources</h2>
            <p className="text-slate-300 mb-6">Find local tech hubs, libraries, and events using Google Search or Maps.</p>
            
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-700/30 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setUseMaps(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!useMaps ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2"><ICONS.Search size={14}/> Google Search</div>
                    </button>
                    <button 
                        onClick={() => setUseMaps(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${useMaps ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                         <div className="flex items-center gap-2"><ICONS.MapIcon size={14}/> Google Maps</div>
                    </button>
                </div>

                <div className="space-y-1">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={useMaps ? "Italian restaurants nearby..." : "Coding bootcamps in Nairobi..."}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400"
                    />
                </div>
            </div>
            
            <button 
                onClick={handleSearch}
                disabled={status === LoadingState.LOADING || !query.trim()}
                className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {status === LoadingState.LOADING ? <ICONS.Refresh className="animate-spin" /> : <ICONS.Map />}
                Find Now
            </button>
        </div>

        {status === LoadingState.ERROR && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center gap-3">
                <ICONS.Alert />
                <p>Could not fetch resources. Please verify your connection.</p>
            </div>
        )}

        {results && status === LoadingState.SUCCESS && (
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                     <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
                        <div className="prose prose-sm max-w-none text-slate-300 prose-invert">
                            <ReactMarkdown>{results.text}</ReactMarkdown>
                        </div>
                     </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-300">Sources</h3>
                    {results.chunks.length > 0 ? (
                        results.chunks.map((chunk, i) => {
                            const uri = chunk.web?.uri || chunk.web?.url || (chunk.maps ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title)}` : '#');
                            const title = chunk.web?.title || chunk.maps?.title || "Source Link";
                            
                            return (
                                <a 
                                    key={i}
                                    href={uri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-indigo-500 hover:shadow-md transition group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-medium text-sm text-indigo-400 group-hover:underline truncate w-full">
                                            {title}
                                        </div>
                                        <ICONS.Book size={14} className="text-slate-500 flex-shrink-0 mt-1" />
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <p className="text-sm text-slate-500 italic">No direct links found.</p>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};