import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ICONS } from '../constants';
import { ChatMessage } from '../types';
import { chatWithTutor, generateSpeech, transcribeAudio } from '../services/geminiService';

export const ChatTutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Tutor (powered by Gemini 3 Pro). I can help you with complex questions. Enable 'Deep Think' for hard problems, or use the microphone to speak.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
      }));

      const responseText = await chatWithTutor(history, userMsg.text, isThinkingMode);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        isThinking: isThinkingMode
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your internet connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                setIsLoading(true);
                try {
                    const text = await transcribeAudio(base64Audio);
                    setInput(text);
                } catch (e) {
                    console.error("Transcription failed", e);
                } finally {
                    setIsLoading(false);
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Mic permission denied", err);
        alert("Microphone permission required.");
    }
  };

  const playText = async (id: string, text: string) => {
    if (playingId) return; 
    setPlayingId(id);
    try {
        if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if(ctx?.state === 'suspended') await ctx.resume();

        const audioBufferData = await generateSpeech(text.substring(0, 300)); 
        const audioBuffer = await ctx?.decodeAudioData(audioBufferData);
        
        if (audioBuffer && ctx) {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => setPlayingId(null);
            source.start();
        }
    } catch (e) {
        console.error("Audio playback failed", e);
        setPlayingId(null);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Chat cleared. How can I help you today?",
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                <ICONS.Chat size={20} />
            </div>
            <div>
                <h2 className="font-bold text-white text-lg">AI Tutor Pro</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsThinkingMode(!isThinkingMode)}
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border transition ${isThinkingMode ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        {isThinkingMode ? 'Deep Think On' : 'Deep Think Off'}
                    </button>
                </div>
            </div>
         </div>
         <button 
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition"
            title="Clear Chat History"
         >
            <ICONS.Trash size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-hide">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}>
                {!isUser && (
                   <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                     <ICONS.Brain size={14} /> {msg.isThinking ? 'Thinking Mode' : 'AI Tutor'}
                   </div>
                )}
                <div className={`prose prose-sm ${isUser ? 'prose-invert' : 'text-slate-300 prose-invert'}`}>
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {!isUser && (
                    <button 
                        onClick={() => playText(msg.id, msg.text)}
                        disabled={playingId !== null}
                        className={`mt-2 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition flex items-center gap-1 text-xs ${playingId === msg.id ? 'animate-pulse text-indigo-400' : ''}`}
                    >
                        <ICONS.Speaker className="w-4 h-4" />
                        {playingId === msg.id ? 'Speaking...' : 'Listen'}
                    </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
            <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm rounded-bl-none flex items-center gap-2">
                    {isRecording ? (
                        <span className="text-sm text-red-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            Transcribing audio...
                        </span>
                    ) : (
                        <>
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                        </>
                    )}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <button
            onClick={handleRecord}
            className={`p-3 rounded-full transition shadow-md ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Hold to speak (Click to start/stop)"
          >
            <ICONS.Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isThinkingMode ? "Ask a complex question..." : "Type a message..."}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            <ICONS.Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};