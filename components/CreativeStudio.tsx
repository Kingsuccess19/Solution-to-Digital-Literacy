import React, { useState } from 'react';
import { ICONS } from '../constants';
import { generateImage, generateVideo } from '../services/geminiService';
import { LoadingState } from '../types';

type GenMode = 'IMAGE' | 'VIDEO';

export const CreativeStudio: React.FC = () => {
  const [mode, setMode] = useState<GenMode>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configs
  const [imageSize, setImageSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // 16:9 for video default
  const [refImage, setRefImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedMedia(null);

    try {
        // Check for API Key Selection for Veo/Pro
        if (!(window as any).aistudio?.hasSelectedApiKey && !(process.env.API_KEY)) {
             // If not selected, try to open selector
             try {
                 if ((window as any).aistudio) {
                    await (window as any).aistudio.openSelectKey();
                 }
             } catch(e) {
                 console.warn("Key selector not available");
             }
        }

        if (mode === 'IMAGE') {
            const result = await generateImage(prompt, imageSize, aspectRatio);
            setGeneratedMedia(result);
        } else {
            // Video
            const vidRatio = aspectRatio === '9:16' ? '9:16' : '16:9'; // Veo only supports these roughly
            const imageBytes = refImage ? refImage.split(',')[1] : undefined;
            const result = await generateVideo(prompt, vidRatio, imageBytes);
            setGeneratedMedia(result);
        }
    } catch (e: any) {
        console.error(e);
        if (e.message?.includes("Requested entity was not found")) {
             setError("API Key invalid or not selected. Please select a paid project key.");
             try { await (window as any).aistudio?.openSelectKey(); } catch(e){}
        } else {
            setError("Generation failed. Please try again.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = () => setRefImage(reader.result as string);
          reader.readAsDataURL(e.target.files[0]);
      }
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-black">
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                    <ICONS.Wand className="text-indigo-500" /> Creative Studio
                </h2>
                <p className="text-slate-400 mt-2">Generate High-Quality Images (Gemini 3 Pro) & Videos (Veo).</p>
                <p className="text-xs text-slate-600 mt-1">Requires Paid API Key Selection</p>
            </div>

            {/* Mode Switch */}
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                <button 
                    onClick={() => { setMode('IMAGE'); setAspectRatio('1:1'); }}
                    className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${mode === 'IMAGE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <ICONS.Image size={18} /> Generate Image
                </button>
                <button 
                    onClick={() => { setMode('VIDEO'); setAspectRatio('16:9'); }}
                    className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${mode === 'VIDEO' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <ICONS.Video size={18} /> Generate Video
                </button>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl">
                 {/* Controls */}
                 <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={mode === 'IMAGE' ? "A futuristic African city with flying cars..." : "A cinematic video of a lion running in the savannah..."}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspect Ratio</label>
                            <select 
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                            >
                                {mode === 'IMAGE' ? (
                                    <>
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="2:3">2:3 (Portrait)</option>
                                        <option value="3:2">3:2 (Landscape)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                        <option value="4:3">4:3 (Landscape)</option>
                                        <option value="9:16">9:16 (Story)</option>
                                        <option value="16:9">16:9 (Wide)</option>
                                        <option value="21:9">21:9 (Ultrawide)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                    </>
                                )}
                            </select>
                        </div>
                        {mode === 'IMAGE' ? (
                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Size</label>
                                <select 
                                    value={imageSize}
                                    onChange={(e) => setImageSize(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="1K">1K</option>
                                    <option value="2K">2K (HD)</option>
                                    <option value="4K">4K (Ultra HD)</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ref Image (Optional)</label>
                                <label className="flex items-center justify-center w-full h-[50px] border border-slate-700 rounded-xl bg-slate-950 cursor-pointer hover:bg-slate-800 text-slate-400 text-xs">
                                    {refImage ? "Image Selected" : "Upload Reference"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleRefImage} />
                                </label>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-3 ${mode === 'IMAGE' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
                    >
                        {isLoading ? (
                            <>
                                <ICONS.Loader className="animate-spin" /> Generating... {mode === 'VIDEO' && '(Takes ~1m)'}
                            </>
                        ) : (
                            <>
                                <ICONS.Sparkles /> Generate {mode === 'IMAGE' ? 'Artwork' : 'Video'}
                            </>
                        )}
                    </button>
                 </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex items-center gap-3">
                    <ICONS.Alert />
                    <p>{error}</p>
                </div>
            )}

            {generatedMedia && (
                <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 animate-fade-in-up">
                    {mode === 'IMAGE' ? (
                        <div className="relative">
                             <img src={generatedMedia} alt="Generated" className="w-full rounded-2xl" />
                             <a href={generatedMedia} download="gemini-gen.png" className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full text-sm hover:bg-black">Download</a>
                        </div>
                    ) : (
                        <video src={generatedMedia} controls className="w-full rounded-2xl" autoPlay loop />
                    )}
                </div>
            )}
        </div>
    </div>
  );
};