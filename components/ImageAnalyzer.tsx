import React, { useState } from 'react';
import { ICONS } from '../constants';
import { analyzeMedia, editImage } from '../services/geminiService';
import { AnalysisResult, LoadingState } from '../types';

export const ImageAnalyzer: React.FC = () => {
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'ANALYZE' | 'EDIT'>('ANALYZE');
  const [prompt, setPrompt] = useState('');

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFileData(base64String);
        setMimeType(file.type);
        setResult(null);
        setEditedImage(null);
        setStatus(LoadingState.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!fileData) return;
    setStatus(LoadingState.LOADING);
    try {
        const base64 = fileData.split(',')[1];
        
        if (mode === 'ANALYZE') {
            const data = await analyzeMedia(base64, mimeType);
            setResult(data);
            setStatus(LoadingState.SUCCESS);
        } else {
            // EDIT Mode
            if (!prompt) {
                alert("Please enter a prompt for editing.");
                setStatus(LoadingState.IDLE);
                return;
            }
            const newImage = await editImage(base64, mimeType, prompt);
            setEditedImage(newImage);
            setStatus(LoadingState.SUCCESS);
        }
    } catch (e) {
        console.error(e);
        setStatus(LoadingState.ERROR);
    }
  };

  const isVideo = mimeType.startsWith('video/');

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-black">
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Media Studio</h2>
                <p className="text-slate-400">Analyze Photos & Videos with Gemini Pro, or Edit Images with Flash.</p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-800">
                {!fileData ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-800 hover:bg-slate-700/50 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ICONS.Camera className="w-12 h-12 text-slate-500 mb-3" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Upload Image or Video</span></p>
                            <p className="text-xs text-slate-500">PNG, JPG, MP4 (Max 10MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden max-h-80 flex justify-center bg-black">
                            {isVideo ? (
                                <video src={fileData} controls className="h-full w-full" />
                            ) : (
                                <img src={editedImage || fileData} alt="Preview" className="object-contain h-full w-full" />
                            )}
                            <button 
                                onClick={() => { setFileData(null); setEditedImage(null); }}
                                className="absolute top-2 right-2 bg-slate-800/90 p-2 rounded-full text-white hover:text-red-400"
                            >
                                <ICONS.Close size={20} />
                            </button>
                        </div>

                        {/* Mode Toggle (Only for Images) */}
                        {!isVideo && (
                            <div className="flex bg-slate-800 p-1 rounded-xl">
                                <button 
                                    onClick={() => setMode('ANALYZE')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'ANALYZE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Analyze
                                </button>
                                <button 
                                    onClick={() => setMode('EDIT')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'EDIT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Edit (Magic)
                                </button>
                            </div>
                        )}
                        
                        {mode === 'EDIT' && !isVideo && (
                             <input 
                                type="text" 
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="E.g., 'Add a retro filter', 'Remove background'"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                             />
                        )}

                        {status !== LoadingState.SUCCESS && (
                             <button
                                onClick={handleAction}
                                disabled={status === LoadingState.LOADING}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {status === LoadingState.LOADING ? (
                                    <>
                                        <ICONS.Loader className="animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        {mode === 'ANALYZE' ? <ICONS.Brain /> : <ICONS.Wand />} 
                                        {mode === 'ANALYZE' ? 'Analyze Media' : 'Generate Edit'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {status === LoadingState.ERROR && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center gap-3">
                    <ICONS.Alert />
                    <p>Operation failed. Please try again.</p>
                </div>
            )}

            {/* Analysis Result */}
            {result && mode === 'ANALYZE' && (
                <div className="bg-slate-900 rounded-3xl p-6 shadow-lg border border-indigo-500/30 animate-fade-in-up">
                    <h3 className="text-2xl font-bold text-white mb-2">{result.title}</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                            <p className="text-slate-300 leading-relaxed">{result.description}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-1">Usage</h4>
                            <p className="text-indigo-100 leading-relaxed">{result.usage}</p>
                        </div>
                    </div>
                </div>
            )}

             {/* Edited Image Result */}
             {editedImage && mode === 'EDIT' && (
                <div className="text-center space-y-4">
                    <p className="text-green-400 font-medium flex items-center justify-center gap-2"><ICONS.Check size={16}/> Edit Complete!</p>
                    <a href={editedImage} download="edited-image.png" className="inline-block text-indigo-400 hover:underline text-sm">Download Image</a>
                </div>
            )}
        </div>
    </div>
  );
};