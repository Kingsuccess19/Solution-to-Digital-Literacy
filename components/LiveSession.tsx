import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { ICONS, MODEL_LIVE } from '../constants';

export const LiveSession: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Ready to Connect');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs for cleanup
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const connect = async () => {
    setStatus('Connecting...');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        // Setup Audio Contexts
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = audioCtx;
        
        // Get Mic Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect to Live API
        const sessionPromise = ai.live.connect({
            model: MODEL_LIVE,
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                systemInstruction: "You are a friendly digital literacy assistant. Keep answers concise and helpful.",
            },
            callbacks: {
                onopen: () => {
                    setStatus('Connected! Speak now.');
                    setIsConnected(true);
                    
                    // Start Audio Stream Input
                    const source = audioCtx.createMediaStreamSource(stream);
                    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        if (isMuted) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        
                        // Convert to PCM
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        
                        // Send to API
                        const base64Data = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
                        sessionPromise.then(session => {
                             session.sendRealtimeInput({
                                 media: {
                                     mimeType: 'audio/pcm;rate=16000',
                                     data: base64Data
                                 }
                             });
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(audioCtx.destination);
                    
                    sourceNodeRef.current = source;
                    processorRef.current = processor;
                },
                onmessage: async (msg: any) => {
                    // Handle Audio Output
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                         const binaryString = atob(audioData);
                         const bytes = new Uint8Array(binaryString.length);
                         for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                         
                         // Decode Float32 from PCM (Simple assumption for demo, ideally use full decode helper)
                         // Since we can't use full decodeAudioData on raw PCM easily without header, 
                         // we construct buffer manually if needed.
                         // For Live API, output is usually PCM 24kHz.
                         
                         // Simplified play for demo (assuming standard decoding path available or use audio worklet)
                         // Implementing full PCM decode:
                         const dataInt16 = new Int16Array(bytes.buffer);
                         const buffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
                         const channel = buffer.getChannelData(0);
                         for(let i=0; i<dataInt16.length; i++) {
                             channel[i] = dataInt16[i] / 32768.0;
                         }
                         
                         const src = outputCtx.createBufferSource();
                         src.buffer = buffer;
                         src.connect(outputCtx.destination);
                         src.start();
                    }
                },
                onclose: () => {
                    setStatus('Disconnected');
                    setIsConnected(false);
                },
                onerror: (err) => {
                    console.error(err);
                    setStatus('Error connecting');
                    setIsConnected(false);
                }
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error(e);
        setStatus('Connection Failed');
    }
  };

  const disconnect = () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (sessionRef.current) {
          sessionRef.current.then((s: any) => s.close());
      }
      setIsConnected(false);
      setStatus('Disconnected');
  };

  useEffect(() => {
      return () => disconnect();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black p-6">
         <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 text-center shadow-2xl border border-slate-800">
             <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 transition-all duration-500 ${isConnected ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-slate-800'}`}>
                 <ICONS.Live size={40} className={isConnected ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
             </div>
             
             <h2 className="text-2xl font-bold text-white mb-2">Live Voice Chat</h2>
             <p className="text-slate-400 mb-8">{status}</p>

             {!isConnected ? (
                 <button 
                    onClick={connect}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
                 >
                    <ICONS.Mic /> Start Conversation
                 </button>
             ) : (
                 <div className="space-y-4">
                    <button 
                        onClick={disconnect}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition shadow-lg"
                    >
                        End Session
                    </button>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`text-sm ${isMuted ? 'text-red-400' : 'text-slate-400'}`}
                    >
                        {isMuted ? 'Microphone Muted' : 'Mute Microphone'}
                    </button>
                 </div>
             )}
         </div>
    </div>
  );
};