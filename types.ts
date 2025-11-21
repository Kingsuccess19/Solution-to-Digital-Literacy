import { Modality } from "@google/genai";

export enum AppView {
  HOME = 'HOME',
  TUTOR = 'TUTOR',
  MEDIA = 'MEDIA', // Was VISION
  CREATIVE = 'CREATIVE', // New: Image/Video Gen
  LIVE = 'LIVE', // New: Live API
  QUIZ = 'QUIZ',
  RESOURCES = 'RESOURCES'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
  isThinking?: boolean; // For thinking model output
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  title: string;
  description: string;
  usage: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  THINKING = 'THINKING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";
