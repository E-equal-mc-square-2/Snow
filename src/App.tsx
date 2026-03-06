import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Image as ImageIcon, 
  Mic2, 
  Send, 
  Upload, 
  Download, 
  Play, 
  User, 
  Lock, 
  Mail,
  Sparkles,
  Cpu,
  Cat,
  LogOut,
  Trash2,
  Maximize2,
  LayoutGrid,
  PlusCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithPersona, generateImage, editImage } from './services/geminiService';
import { db } from './services/storageService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const LoadingIndicator = ({ persona }: { persona: 'snow' | 'kilometres' }) => (
  <div className="flex justify-start items-center gap-3">
    <div className={cn(
      "w-7 h-7 rounded-full overflow-hidden border animate-pulse",
      persona === 'snow' ? "border-pink-500/50" : "border-orange-500/50"
    )}>
      <img 
        src={persona === 'snow' ? "https://picsum.photos/seed/snow-avatar-v3/100/100" : "https://picsum.photos/seed/kilometres-guru/100/100"} 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer" 
      />
    </div>
    <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
      <div className="flex gap-1">
        <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className={cn("w-1 h-1 rounded-full", persona === 'snow' ? "bg-pink-400" : "bg-orange-400")} />
        <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={cn("w-1 h-1 rounded-full", persona === 'snow' ? "bg-pink-400" : "bg-orange-400")} />
        <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={cn("w-1 h-1 rounded-full", persona === 'snow' ? "bg-pink-400" : "bg-orange-400")} />
      </div>
      <span className="text-[10px] text-white/40 font-display uppercase tracking-wider">
        {persona === 'snow' ? 'Snow' : 'Kilometres'}...
      </span>
    </div>
  </div>
);

const Navbar = ({ activeTab, setActiveTab, onLogout }: { activeTab: number, setActiveTab: (t: number) => void, onLogout: () => void }) => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 flex items-center gap-6 z-50 shadow-xl border border-white/10">
      <button 
        onClick={() => setActiveTab(1)}
        className={cn("transition-all duration-300 p-2 rounded-full", activeTab === 1 ? "bg-pink-500/20 text-pink-400 scale-110" : "text-white/40 hover:text-white")}
      >
        <Home size={22} />
      </button>
      <button 
        onClick={() => setActiveTab(2)}
        className={cn("transition-all duration-300 p-2 rounded-full", activeTab === 2 ? "bg-cyan-500/20 text-cyan-400 scale-110" : "text-white/40 hover:text-white")}
      >
        <LayoutGrid size={22} />
      </button>
      <button 
        onClick={() => setActiveTab(3)}
        className={cn("transition-all duration-300 p-2 rounded-full", activeTab === 3 ? "bg-purple-500/20 text-purple-400 scale-110" : "text-white/40 hover:text-white")}
      >
        <Info size={22} />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button 
        onClick={onLogout}
        className="text-white/40 hover:text-red-400 transition-colors p-2"
      >
        <LogOut size={18} />
      </button>
    </nav>
  );
};

// --- Pages ---

const AuthPage = ({ onLogin }: { onLogin: (user: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const data = db.login(email, password);
        onLogin(data.username);
      } else {
        const data = db.signup(username, email, password);
        onLogin(data.username);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Anime Girls */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="grid grid-cols-2 h-full">
          <img src="https://picsum.photos/seed/anime-girl-1/1920/1080" className="w-full h-full object-cover blur-sm" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/anime-girl-2/1920/1080" className="w-full h-full object-cover blur-sm" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/anime-girl-3/1920/1080" className="w-full h-full object-cover blur-sm" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/anime-girl-4/1920/1080" className="w-full h-full object-cover blur-sm" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl z-10 relative"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            Snow & Kilometres
          </h1>
          <p className="text-white/60 italic">"Chill, smart, and wise..."</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="text" 
                placeholder="Unique Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button className="w-full anime-gradient py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ChatPage = ({ username }: { username: string }) => {
  const [messages, setMessages] = useState<{ role: string, content: string, image?: string, persona?: 'snow' | 'kilometres', session_id?: string }[]>([
    { role: 'assistant', content: 'Hello. I am Snow. What is on your mind?', persona: 'snow', session_id: 'initial' },
    { role: 'assistant', content: 'Peace be with you. I am Kilometres. How can I guide you?', persona: 'kilometres', session_id: 'initial' }
  ]);
  const [sessionIds, setSessionIds] = useState<Record<'snow' | 'kilometres', string>>({ snow: 'initial', kilometres: 'initial' });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<'snow' | 'kilometres'>('snow');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Switch to false to prevent echo issues, we can restart if needed

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        const trimmedNew = finalTranscript.trim();
        setInput(prev => {
          const trimmedPrev = prev.trim();
          // Case-insensitive check to prevent duplicates
          if (trimmedPrev.toLowerCase().endsWith(trimmedNew.toLowerCase())) return prev;
          return trimmedPrev ? `${trimmedPrev} ${trimmedNew}` : trimmedNew;
        });
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setSpeechError("No speech detected. Try again?");
      } else if (event.error === 'not-allowed') {
        setSpeechError("Microphone access denied.");
      } else {
        setSpeechError(`Error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition", err);
      setIsRecording(false);
    }
  };

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Update greeting if it's the only message and persona changes
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const snowGreeting = 'Hello. I am Snow. What is on your mind?';
      const kmGreeting = 'Peace be with you. I am Kilometres. How can I guide you?';
      
      if (activePersona === 'snow' && messages[0].content === kmGreeting) {
        setMessages([{ role: 'assistant', content: snowGreeting, persona: 'snow' }]);
      } else if (activePersona === 'kilometres' && messages[0].content === snowGreeting) {
        setMessages([{ role: 'assistant', content: kmGreeting, persona: 'kilometres' }]);
      }
    }
  }, [activePersona]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // First get latest session IDs for both personas
        const snowSessionId = db.getLatestSession(username, 'snow');
        const kmSessionId = db.getLatestSession(username, 'kilometres');

        const newSessionIds = {
          snow: snowSessionId || `session-${Date.now()}-snow`,
          kilometres: kmSessionId || `session-${Date.now()}-km`
        };
        setSessionIds(newSessionIds);

        // Fetch history for both personas' latest sessions
        const snowHistory = db.getHistory(username, 'snow', newSessionIds.snow);
        const kmHistory = db.getHistory(username, 'kilometres', newSessionIds.kilometres);

        const combinedHistory = [
          ...(snowHistory.length > 0 ? snowHistory : [{ role: 'assistant', content: 'Hello. I am Snow. What is on your mind?', persona: 'snow', session_id: newSessionIds.snow }]),
          ...(kmHistory.length > 0 ? kmHistory : [{ role: 'assistant', content: 'Peace be with you. I am Kilometres. How can I guide you?', persona: 'kilometres', session_id: newSessionIds.kilometres }])
        ];

        setMessages(combinedHistory);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    loadHistory();
  }, [username]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() && !image) return;
    
    const currentSessionId = sessionIds[activePersona];
    const userMsg = { role: 'user', content: input, image: image || undefined, persona: activePersona, session_id: currentSessionId };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      // Save user message
      db.saveMessage({ username, ...userMsg });

      const personaMessages = messages.filter(m => m.persona === activePersona && m.session_id === currentSessionId);
      const history = personaMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const response = await chatWithPersona(input, activePersona, history, image?.split(',')[1]);
      const assistantMsg = { role: 'assistant', content: response || '...', persona: activePersona, session_id: currentSessionId };
      
      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message
      db.saveMessage({ username, ...assistantMsg });
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage = err.message || 'Sorry, I am having trouble connecting right now.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage, 
        persona: activePersona, 
        session_id: currentSessionId 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      // Clear history for this persona in storage
      db.clearHistory(username, activePersona);
      
      const newSessionId = `session-${Date.now()}-${activePersona}`;
      setSessionIds(prev => ({ ...prev, [activePersona]: newSessionId }));
      
      const greeting = activePersona === 'snow' 
        ? 'Hello. I am Snow. What is on your mind?' 
        : 'Peace be with you. I am Kilometres. How can I guide you?';

      // Force a clean state for the active persona
      setMessages(prev => [
        ...prev.filter(m => m.persona !== activePersona),
        { 
          role: 'assistant', 
          content: greeting, 
          persona: activePersona,
          session_id: newSessionId
        }
      ]);
      
      // Scroll to top/bottom reset
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error("Failed to clear chat", err);
      alert("Connection error. History might not have cleared.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto p-4 pb-20 relative">
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none overflow-hidden">
        <img src="https://picsum.photos/seed/anime-chat-bg/1920/1080" className="w-full h-full object-cover scale-110" referrerPolicy="no-referrer" />
      </div>

      <div className="flex items-center justify-between mb-4 z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activePersona}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3"
          >
            <div className={cn(
              "w-10 h-10 rounded-full overflow-hidden border-2 shadow-lg transition-all duration-500 relative",
              activePersona === 'snow' ? "border-pink-500 shadow-pink-500/20" : "border-orange-500 shadow-orange-500/20"
            )}>
              <img 
                src={activePersona === 'snow' ? "https://picsum.photos/seed/snow-avatar-v3/100/100" : "https://picsum.photos/seed/kilometres-guru/100/100"} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={cn("w-2 h-2 rounded-full", activePersona === 'snow' ? "bg-pink-400" : "bg-orange-400")}
                  />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg transition-colors duration-500">
                {activePersona === 'snow' ? 'Snow' : 'Kilometres'}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                </p>
                {loading && (
                  <span className="text-[10px] text-white/40 animate-pulse italic">typing...</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl p-1 flex gap-1">
            <button 
              onClick={() => setActivePersona('snow')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                activePersona === 'snow' ? "bg-pink-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              Snow
            </button>
            <button 
              onClick={() => setActivePersona('kilometres')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                activePersona === 'kilometres' ? "bg-orange-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              Kilometres
            </button>
          </div>
          <button 
            onClick={handleNewChat} 
            className="text-white/40 hover:text-pink-400 transition-all p-2.5 glass rounded-lg flex items-center gap-2 group active:scale-95" 
            title="New Chat"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[10px] font-bold hidden sm:inline tracking-tighter">NEW CHAT</span>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide z-10">
        <AnimatePresence initial={false}>
          {messages.filter(m => m.persona === activePersona && m.session_id === sessionIds[activePersona]).map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ 
                opacity: 0, 
                x: msg.role === 'user' ? 20 : -20,
                y: 10, 
                scale: 0.95 
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: 0, 
                scale: 1 
              }}
              transition={{ 
                duration: 0.4, 
                ease: [0.23, 1, 0.32, 1] // Custom cubic-bezier for smoother feel
              }}
              className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 shadow-xl",
                msg.role === 'user' ? "bg-white/5 border border-white/10" : 
                msg.persona === 'snow' ? "bg-pink-500/20 border border-pink-500/30" : "bg-orange-500/20 border border-orange-500/30"
              )}>
                {msg.image && (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={msg.image} 
                    className="max-w-full rounded-lg mb-2 border border-white/10" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && <LoadingIndicator persona={activePersona} />}
      </div>

      <div className="mt-2 glass rounded-xl p-1.5 flex flex-col gap-1 z-10">
        {speechError && (
          <div className="px-3 py-1.5 text-[10px] text-red-400 flex items-center justify-between bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2">
              <span>{speechError}</span>
              <button 
                onClick={() => { setSpeechError(null); toggleRecording(); }}
                className="underline hover:text-white font-bold"
              >
                Retry
              </button>
            </div>
            <button onClick={() => setSpeechError(null)} className="hover:text-white p-1">✕</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <label className={cn(
              "p-2 cursor-pointer transition-colors",
              activePersona === 'snow' ? "text-white/40 hover:text-pink-400" : "text-white/40 hover:text-orange-400"
            )}>
              <Upload size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
            <button 
              onClick={toggleRecording}
              className={cn(
                "p-2 transition-all rounded-lg flex items-center gap-2",
                isRecording ? "bg-red-500/20 text-red-400 animate-pulse" : 
                activePersona === 'snow' ? "text-white/40 hover:text-pink-400" : "text-white/40 hover:text-orange-400"
              )}
            >
              <Mic2 size={18} />
              {isRecording && <span className="text-[10px] font-display uppercase tracking-wider">Listening...</span>}
            </button>
          </div>
          <div className="flex-1 flex flex-col">
          {image && (
            <div className="relative w-12 h-12 mb-1 ml-1">
              <img src={image} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              <button onClick={() => setImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5"><LogOut size={10} /></button>
            </div>
          )}
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={activePersona === 'snow' ? "Snow..." : "Kilometres..."}
            className="w-full bg-transparent border-none focus:ring-0 p-2 resize-none max-h-24 text-sm font-sans"
            rows={1}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={loading}
          className={cn(
            "p-2.5 rounded-lg transition-all disabled:opacity-50 shadow-md",
            activePersona === 'snow' ? "bg-pink-500 hover:bg-pink-600 shadow-pink-500/20" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  </div>
);
};

const ImagePage = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit' | 'expander' | 'watermark'>('generate');
  const [ratio, setRatio] = useState<string>("1:1");
  const [customRatio, setCustomRatio] = useState('');
  const [upload, setUpload] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    try {
      let finalPrompt = prompt;
      if (mode === 'expander') finalPrompt = `Expand this image, fill background, high resolution, seamless: ${prompt}`;
      if (mode === 'watermark') finalPrompt = `Remove watermark from this image, clean background, retouch: ${prompt}`;

      const finalRatio = customRatio.trim() || ratio;

      if (mode === 'generate') {
        const url = await generateImage(finalPrompt, finalRatio);
        setResult(url);
      } else if (upload) {
        const url = await editImage(upload, finalPrompt, mode === 'expander' ? finalRatio : undefined);
        setResult(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `snow-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUpload(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 max-w-6xl mx-auto relative">
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img src="https://picsum.photos/seed/anime-lab-bg/1920/1080" className="w-full h-full object-cover scale-105" referrerPolicy="no-referrer" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 z-10 relative">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Cpu className="text-cyan-400" /> Image Lab
          </h1>
          <p className="text-white/40">Advanced sci-fi generation & editing</p>
        </div>
        <div className="flex flex-wrap glass rounded-xl p-1 gap-1">
          {['generate', 'edit', 'expander', 'watermark'].map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all text-sm capitalize", 
                mode === m ? "bg-cyan-500 text-black font-bold" : "text-white/60 hover:text-white"
              )}
            >
              {m === 'expander' ? 'Image Expander' : m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 relative">
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} className="text-cyan-400" /> Parameters</h3>
            </div>

            {(mode === 'generate' || mode === 'expander') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Aspect Ratio</p>
                  {customRatio && <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Custom Active</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["1:1", "3:4", "4:3", "9:16", "16:9"].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRatio(r); setCustomRatio(''); }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold border transition-all",
                        ratio === r && !customRatio ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-white/10 text-white/40 hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Custom Ratio (e.g. 2:3, 21:9)" 
                    value={customRatio}
                    onChange={(e) => setCustomRatio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-white/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {customRatio && (
                      <button onClick={() => setCustomRatio('')} className="text-white/20 hover:text-white transition-colors">
                        <LogOut size={12} className="rotate-45" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-white/20 italic">Note: Custom ratios work best with standard formats like 2:3 or 16:10.</p>
              </div>
            )}
            
            {mode !== 'generate' && (
              <div className="space-y-2">
                <p className="text-sm text-white/60">Upload Source Photo</p>
                <label className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors overflow-hidden">
                  {upload ? (
                    <img src={upload} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <Upload className="text-white/20 mb-2" size={32} />
                      <span className="text-white/40 text-sm">Click to upload</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-white/60">Instructions</p>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'generate' ? "Describe your vision..." : 
                  mode === 'expander' ? "Describe how to expand the image..." :
                  mode === 'watermark' ? "Where is the watermark located?" :
                  "e.g. Change hair color to blue..."
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-cyan-500 min-h-[120px] font-sans"
              />
            </div>

            <button 
              onClick={handleAction}
              disabled={loading || (mode !== 'generate' && !upload) || (!prompt && mode === 'generate')}
              className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-sm"
            >
              {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
              {mode === 'generate' ? 'Generate' : `Process ${mode}`}
            </button>
          </div>

          <div className="glass p-6 rounded-3xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Cat size={18} className="text-cyan-400" /> Waifu's Tip</h3>
            <p className="text-sm text-white/60 italic">
              "I've added {mode} support just for you. Don't make me wait too long for the results..."
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl overflow-hidden relative min-h-[400px] flex items-center justify-center bg-black/20 shadow-2xl">
            {result ? (
              <div className="relative group w-full h-full">
                <img src={result} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadImage(result)}
                      className="p-4 bg-cyan-500 text-black rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                    >
                      <Download size={24} /> Download
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setResult(null)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 border-2 border-cyan-500/20 rounded-full mx-auto flex items-center justify-center">
                  <ImageIcon className="text-cyan-500/20" size={40} />
                </div>
                <p className="text-white/20 font-display uppercase tracking-widest">Awaiting Input Signal...</p>
              </div>
            )}
          </div>
          
          {result && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => downloadImage(result)}
              className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download size={20} /> Download Generated Photo
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="min-h-screen p-4 pb-32 max-w-4xl mx-auto relative flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img src="https://picsum.photos/seed/about-bg/1920/1080" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-3xl z-10 relative space-y-8 max-w-2xl"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            About Us
          </h1>
          <div className="w-24 h-1 anime-gradient mx-auto rounded-full" />
        </div>

        <div className="space-y-6 text-white/80 leading-relaxed">
          <p className="text-lg italic">
            "Snow & Kilometres is a sanctuary for the curious mind and the creative soul."
          </p>
          <p>
            Born from the fusion of advanced AI and artistic vision, this platform offers two unique companions: 
            <span className="text-pink-400 font-bold"> Snow</span>, the vibrant and smart guide, and 
            <span className="text-orange-400 font-bold"> Kilometres De Venta</span>, the wise and patient guru.
          </p>
          <p>
            Whether you're here to chat, generate stunning artwork, or simply find a moment of peace, 
            we are here to accompany you on your journey.
          </p>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-[0.3em] mb-2">Developed with Love</p>
          <p className="text-sm font-display font-bold text-white/60">
            Credit: Kilometres De Venta
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(1); // 1: Chat, 2: Image

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 1 && <ChatPage username={user} />}
          {activeTab === 2 && <ImagePage />}
          {activeTab === 3 && <AboutPage />}
        </motion.div>
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUser(null)} />
    </div>
  );
}
