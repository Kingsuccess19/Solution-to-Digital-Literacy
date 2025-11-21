import { 
  BookOpen, 
  Camera, 
  MessageCircle, 
  MapPin, 
  Brain, 
  Menu, 
  X, 
  Send, 
  Image as ImageIcon,
  Mic,
  Volume2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Github,
  Mail,
  Phone,
  Trash2,
  Video,
  Wand2,
  Radio,
  Sparkles,
  Search,
  Loader2,
  Map as MapIcon
} from 'lucide-react';

export const ICONS = {
  Book: BookOpen,
  Camera: Camera,
  Chat: MessageCircle,
  Map: MapPin,
  Brain: Brain,
  Menu: Menu,
  Close: X,
  Send: Send,
  Image: ImageIcon,
  Mic: Mic,
  Speaker: Volume2,
  Refresh: RefreshCw,
  Check: CheckCircle,
  Alert: AlertCircle,
  Github: Github,
  Mail: Mail,
  Phone: Phone,
  Trash: Trash2,
  Video: Video,
  Wand: Wand2,
  Live: Radio,
  Sparkles: Sparkles,
  Search: Search,
  Loader: Loader2,
  MapIcon: MapIcon
};

export const COUNTRIES = [
  { name: 'Nigeria', color: 'green-600', flag: '🇳🇬' },
  { name: 'Sierra Leone', color: 'blue-600', flag: '🇸🇱' },
  { name: 'Kenya', color: 'red-600', flag: '🇰🇪' },
];

// Models
export const MODEL_FLASH = 'gemini-2.5-flash';
export const MODEL_FLASH_LITE = 'gemini-2.5-flash-lite';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_FLASH_IMAGE = 'gemini-2.5-flash-image'; // For editing / basic vision
export const MODEL_PRO_IMAGE = 'gemini-3-pro-image-preview'; // For high quality generation
export const MODEL_VEO = 'veo-3.1-fast-generate-preview';
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';
