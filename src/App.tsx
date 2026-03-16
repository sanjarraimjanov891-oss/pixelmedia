/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Heart, 
  GraduationCap, 
  Megaphone, 
  BarChart3, 
  Calendar as CalendarIcon,
  Play,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  MapPin,
  Video,
  Info,
  FileText,
  Camera,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Zap,
  Activity,
  Palette,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'dashboard' | 'wedding' | 'project_details' | 'add_order' | 'orders_list' | 'school_list' | 'add_school_order' | 'trash';

interface Order {
  id: number;
  customerName: string;
  date: string;
  details: string;
  phone: string;
  deposit: string;
  status: string;
  type: string;
  operator: string;
  deletedAt?: number;
}

interface SchoolOrder {
  id: number;
  schoolName: string;
  className: string;
  vignetteType: string;
  price: string;
  monitorPhone: string;
  date: string;
  status: string;
  deletedAt?: number;
}

const modules = [
  { id: 'wedding', icon: Heart, label: 'Той', subLabel: 'Үйлөнүү үлпөтү' },
  { id: 'school', icon: GraduationCap, label: 'Мектеп', subLabel: 'Мектептик сессиялар' },
  { id: 'ads', icon: Megaphone, label: 'Жарнама', subLabel: 'Коммерциялык буйрутмалар' },
  { id: 'reports', icon: BarChart3, label: 'Отчёт', subLabel: 'Студиялык аналитика' },
  { id: 'calendar', icon: CalendarIcon, label: 'Календарь', subLabel: 'Бронь графиги' },
  { id: 'design', icon: Palette, label: 'Дизайн', subLabel: 'Графикалык иштер' },
];

const activeOrders = [
  { id: 1, title: 'Азамат & Айпери', date: '12-март, 2026', status: 'Монтаж', type: 'Премиум', operator: 'Санжар' },
  { id: 2, title: 'Нурбек & Мээрим', date: '14-март, 2026', status: 'Тартуу', type: 'Стандарт', operator: 'Нурболот' },
  { id: 3, title: 'Бакыт & Гүлнур', date: '16-март, 2026', status: 'Күтүүдө', type: 'VIP', operator: 'Санжар' },
];

const readyOrders = [
  { id: 4, title: 'Эрмек & Каныкей', date: '10-март, 2026', status: 'Даяр', type: 'Премиум', operator: 'Нурболот' },
  { id: 5, title: 'Улан & Назгүл', date: '08-март, 2026', status: 'Даяр', type: 'Стандарт', operator: 'Санжар' },
];

const AIChatModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Саламатсызбы! Мен Pixe1.media студиясынын AI жардамчысымын. Сизге кантип жардам бере алам?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', text: userMessage }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI request failed');
      }

      const data = await response.json();
      const modelText = data?.text || "РљРµС‡РёСЂРµСЃРёР·, РєР°С‚Р° РєРµС‚С‚Рё. РљР°Р№СЂР° Р°СЂР°РєРµС‚ РєС‹Р»С‹Рї РєУ©СЂТЇТЈТЇР·.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "РљРµС‡РёСЂРµСЃРёР·, Р±Р°Р№Р»Р°РЅС‹С€С‚Р° РєР°С‚Р° РєРµС‚С‚Рё. РРЅС‚РµСЂРЅРµС‚С‚Рё С‚РµРєС€РµСЂРёРї РєУ©СЂТЇТЈТЇР·." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[500px] h-[600px] bg-[#0a0f1d] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-[#08c4e5]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Жардамчы</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Онлайн</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-[#08c4e5] text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10 bg-slate-900/30">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Сурооңузду жазыңыз..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:ring-2 focus:ring-[#08c4e5] outline-none transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#08c4e5] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OPERATOR_PHOTOS: Record<string, string> = {
  'Санжар': 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop',
  'Нурболот': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop'
};

const OrderHistogram = () => {
  const [data, setData] = useState([
    { label: 'Той', value: 12 },
    { label: 'Мектеп', value: 8 },
    { label: 'Жарнама', value: 15 },
    { label: 'Отчёт', value: 5 },
    { label: 'Календарь', value: 10 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        value: Math.max(2, Math.min(20, item.value + (Math.random() > 0.5 ? 1 : -1)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const max = 20; // Fixed max for stability during animation

  return (
    <div className="flex items-end gap-3 h-20 w-full px-4 py-3 bg-slate-900/50 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md overflow-hidden">
      <div className="flex-1 flex items-end justify-between gap-2 h-full">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 group relative h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-4 rounded-t-md bg-[#08c4e5] shadow-[0_0_10px_rgba(8,196,229,0.2)] group-hover:bg-[#07b3d1] transition-colors relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-md"></div>
            </motion.div>
            <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">{item.label[0]}</span>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-20 shadow-xl font-bold">
              {item.label}: {item.value}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats to fill the right side */}
      <div className="flex flex-col justify-center border-l border-white/10 pl-3 h-full">
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Жалпы</p>
        <p className="text-sm font-black text-[#08c4e5] leading-none">
          {data.reduce((acc, curr) => acc + curr.value, 0)}
        </p>
        <p className="text-[5px] font-medium text-slate-500 uppercase tracking-tighter">заказ</p>
      </div>
    </div>
  );
};

const VideoPlayer = () => {
  const videos = [
    "https://v1.pinimg.com/videos/mc/expMp4/d7/c0/ea/d7c0eaff69cc104f6357b94002f7015a_t1.mp4",
    "https://v1.pinimg.com/videos/mc/expMp4/85/68/7c/85687c8623b7267831b9a89666795671_t1.mp4"
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    handleVideoEnd();
  };

  return (
    <div className="rotating-border-content w-full h-full relative overflow-hidden bg-slate-900">
      <video
        key={currentVideoIndex}
        className="w-full h-full object-cover opacity-80"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        src={videos[currentVideoIndex]}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
    </div>
  );
};

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative group">
      {/* Animated Glow Background - Cyberpunk style */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#08c4e5] via-blue-500 to-[#08c4e5] rounded-full blur-[2px] opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      {/* Main Container */}
      <div className="relative flex items-center gap-3 px-4 py-2 bg-slate-950/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_0_20px_rgba(8,196,229,0.15)] overflow-hidden">
        
        {/* Animated Icon with Ring */}
        <div className="relative flex items-center justify-center w-7 h-7">
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute inset-1 bg-cyan-500/5 rounded-full border border-cyan-500/10 animate-[pulse_2s_ease-in-out_infinite]"></div>
          <Zap size={16} className="text-[#08c4e5] relative z-10 drop-shadow-[0_0_8px_rgba(8,196,229,0.8)]" />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-black text-white tracking-tight tabular-nums font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] md:text-xs font-bold text-[#08c4e5] animate-pulse font-mono opacity-80">
              {currentTime.toLocaleTimeString('ru-RU', { second: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 -mt-0.5">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="w-1 h-1 rounded-full bg-emerald-500/40"></span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">
              System Live
            </span>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-xl"></div>
      </div>
    </div>
  );
};

const Dashboard = ({ onNavigate, orders }: { onNavigate: (page: Page) => void, orders: Order[], key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
  >
    {/* Header */}
    <header className="flex items-center justify-between border-b border-white/10 py-4 md:py-6 mb-6 md:mb-8">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="bg-[#08c4e5] p-1.5 md:p-2 rounded-lg shadow-sm">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
          </svg>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">Pixe1.media</h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Sparkles size={18} className="md:w-5 md:h-5" />
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">AI Chat</span>
        </button>
        <button className="p-1.5 md:p-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer">
          <Bell size={18} className="md:w-5 md:h-5" />
        </button>
        <button className="p-1.5 md:p-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer">
          <Settings size={18} className="md:w-5 md:h-5" />
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 overflow-hidden border border-white/20">
          <img 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/user123/100/100" 
            alt="User profile"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>

    {/* Hero Section: Current Order */}
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#08c4e5] animate-pulse"></span>
            Учурдагы буйрутма
          </h3>
        </div>
        <div className="scale-90 md:scale-100 origin-right">
          <LiveClock />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rotating-border-container shadow-2xl hover:shadow-blue-900/40 transition-all duration-500"
      >
        <div className="rotating-border-content bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-3 md:p-8">
          <div className="flex flex-col gap-3 md:gap-6">
            {/* Top Row: Shrunk Video + Title/Histogram */}
            <div className="flex flex-row gap-3 md:gap-6 items-stretch">
              <div className="w-20 md:w-48 rounded-xl md:rounded-2xl overflow-hidden relative group rotating-border-red flex-shrink-0">
                <VideoPlayer />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2 md:mb-4">
                  <div className="flex flex-col gap-1 md:gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-slate-900 rounded-lg shadow-sm border border-white/10">
                        <CalendarIcon size={10} className="text-[#08c4e5] md:w-[14px] md:h-[14px]" />
                      </div>
                      <p className="text-[7px] md:text-[10px] font-bold text-[#08c4e5] uppercase tracking-[0.2em]">Өндүрүш баскычы</p>
                    </div>
                    <h4 className="text-base md:text-4xl font-black text-white leading-tight tracking-tight truncate">АКЫРКЫ ЗАКАЗ</h4>
                    <p className="text-[7px] md:text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                      12-март • Премиум
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 md:px-5 py-1 md:py-2 rounded-full text-[6px] md:text-[10px] font-black bg-slate-900 text-[#08c4e5] border border-white/10 shadow-sm uppercase tracking-widest">
                    Монтаж
                  </span>
                </div>
                
                <div className="flex flex-col items-start">
                  <p className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5">Заказдардын бөлүштүрүлүшү</p>
                  <div className="w-full scale-[0.5] md:scale-100 origin-left">
                    <OrderHistogram />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Operator/Next Order/Buttons Card */}
            <div className="p-3 md:p-8 rounded-[1.25rem] md:rounded-[2rem] bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-2xl">
              <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-3 md:gap-8">
                <div className="space-y-1.5 md:space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[6px] md:text-[10px] font-black text-[#08c4e5] uppercase tracking-[0.2em] mb-1 md:mb-4">Учурдагы буйрутма</span>
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <div className="w-5 h-5 md:w-10 md:h-10 rounded-full bg-slate-800 overflow-hidden ring-1 md:ring-4 ring-slate-700 shadow-md">
                        <img 
                          className="w-full h-full object-cover" 
                          src={OPERATOR_PHOTOS['Санжар']} 
                          alt="Operator Sanjar"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[5px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">ОПЕРАТОР</p>
                        <span className="text-[8px] md:text-sm font-black text-white">САНЖАР</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center border-l border-white/10 pl-3 md:pl-8 lg:border-y-0 lg:border-x lg:py-0 lg:px-8">
                  <p className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-3">КИЙИНКИ ЗАКАЗ</p>
                  <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-sm font-bold text-slate-200">
                    <div className="p-1 bg-slate-800 rounded-lg">
                      <CalendarIcon size={8} className="text-slate-400 md:w-4 md:h-4" />
                    </div>
                    <span className="tracking-tight">15-март</span>
                  </div>
                </div>

                <div className="col-span-2 lg:flex-1 flex flex-row items-center justify-center lg:justify-end gap-2 md:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('orders_list')}
                    className="flex-1 lg:flex-none px-2 py-2 md:px-6 md:py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-lg md:rounded-2xl transition-all border border-white/10 text-[6px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <FileText size={10} className="text-[#08c4e5] md:w-4 md:h-4" />
                    Заказдар
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('project_details')}
                    className="flex-1 lg:flex-none px-2 py-2 md:px-8 md:py-4 bg-[#08c4e5] hover:bg-[#07b3d1] text-white font-black rounded-lg md:rounded-2xl transition-all shadow-xl shadow-cyan-500/30 text-[6px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Play size={10} fill="currentColor" className="md:w-4 md:h-4" />
                    Инфо заказа
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    {/* Navigation: Grid Modules */}
    <section className="pb-16">
      <h3 className="text-sm md:text-lg font-semibold text-white mb-4 md:mb-6">Башкаруу модулдары</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        {modules.map((module, index) => (
          <motion.button
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (module.id === 'wedding') onNavigate('wedding');
              if (module.id === 'school') onNavigate('school_list');
            }}
            className="relative flex flex-col items-center justify-center p-3 md:p-8 rounded-xl md:rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-[#08c4e5] transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('trash');
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
            <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-cyan-500/10 transition-colors">
              <module.icon className="w-4 h-4 md:w-8 md:h-8 text-slate-400 group-hover:text-[#08c4e5] transition-colors" />
            </div>
            <span className="text-[10px] md:text-sm font-bold text-slate-200">{module.label}</span>
            <span className="text-[7px] md:text-[10px] font-medium text-slate-500 mt-0.5">{module.subLabel}</span>
          </motion.button>
        ))}
      </div>
    </section>
  </motion.div>
);

const SchoolListPage = ({ onNavigate, schoolOrders, onDeleteOrder }: { onNavigate: (page: Page) => void, schoolOrders: SchoolOrder[], onDeleteOrder: (id: number) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Мектептер</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_school_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Заказ кошуу
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {schoolOrders.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">Азырынча мектеп заказдары жок</p>
        </div>
      ) : (
        schoolOrders.map(order => (
          <motion.div 
            key={order.id}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm space-y-4 relative group"
          >
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">{order.schoolName}</h4>
                <p className="text-sm text-[#08c4e5] font-bold">{order.className}-класс</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {order.status}
              </span>
            </div>
            
            <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Винетка:</span>
                <span className="text-slate-200 font-bold">{order.vignetteType}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Баасы:</span>
                <span className="text-emerald-500 font-bold">{order.price}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Староста:</span>
                <span className="text-slate-200 font-bold">{order.monitorPhone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Дата:</span>
                <span className="text-slate-200 font-bold">{order.date}</span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const AddSchoolOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<SchoolOrder, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    className: '',
    vignetteType: '',
    price: '',
    monitorPhone: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      status: 'Күтүүдө'
    });
    onNavigate('school_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('school_list')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h2 className="text-xl md:text-2xl font-bold text-white">Мектеп заказын кошуу</h2>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Мектептин аты</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: №1 орто мектеп"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.schoolName}
            onChange={e => setFormData({...formData, schoolName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Канчанчы класс</label>
            <input 
              required
              type="text" 
              placeholder="Мисалы: 11-Б"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.className}
              onChange={e => setFormData({...formData, className: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Дата</label>
            <input 
              required
              type="date" 
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Кандай винетка</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: Премиум 3D"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.vignetteType}
            onChange={e => setFormData({...formData, vignetteType: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ценасы</label>
            <input 
              required
              type="text" 
              placeholder="Мисалы: 2500 сом"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Старостанын тел номери</label>
            <input 
              required
              type="tel" 
              placeholder="+996 700 000 000"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.monitorPhone}
              onChange={e => setFormData({...formData, monitorPhone: e.target.value})}
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 md:py-5 bg-[#08c4e5] text-white font-black rounded-2xl shadow-lg shadow-cyan-200/50 uppercase tracking-widest text-[10px] md:text-xs transition-all"
        >
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const TrashPage = ({ 
  onNavigate, 
  deletedOrders, 
  deletedSchoolOrders,
  onRestoreOrder,
  onRestoreSchoolOrder
}: { 
  onNavigate: (page: Page) => void, 
  deletedOrders: Order[],
  deletedSchoolOrders: SchoolOrder[],
  onRestoreOrder: (id: number) => void,
  onRestoreSchoolOrder: (id: number) => void,
  key?: string
}) => {
  const allDeleted = [
    ...deletedOrders.map(o => ({ ...o, itemType: 'order' as const })),
    ...deletedSchoolOrders.map(o => ({ ...o, itemType: 'school' as const }))
  ].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

  const getRemainingTime = (deletedAt?: number) => {
    if (!deletedAt) return '';
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const remaining = threeDaysInMs - (Date.now() - deletedAt);
    if (remaining <= 0) return 'Мөөнөтү бүттү';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} күн калды`;
    return `${hours} саат калды`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-[800px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('dashboard')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Корзина</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Өчүрүлгөн заказдар 3 күн сакталат</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
          <Trash2 size={24} />
        </div>
      </header>

      <div className="space-y-4">
        {allDeleted.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
            <Trash2 size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-medium">Корзина бош</p>
          </div>
        ) : (
          allDeleted.map((item) => (
            <motion.div 
              key={`${item.itemType}-${item.id}`}
              layout
              className="bg-slate-900/40 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.itemType === 'school' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {item.itemType === 'school' ? <GraduationCap size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    {'schoolName' in item ? item.schoolName : item.customerName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {item.itemType === 'school' ? 'Мектеп' : 'Жалпы'}
                    </span>
                    <span className="text-[10px] text-red-400/80 font-bold flex items-center gap-1">
                      <Clock size={10} />
                      {getRemainingTime(item.deletedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => item.itemType === 'school' ? onRestoreSchoolOrder(item.id) : onRestoreOrder(item.id)}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Калыбына келтирүү
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const WeddingPage = ({ onNavigate }: { onNavigate: (page: Page) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    {/* Header */}
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Той</h2>
          <p className="text-sm md:text-slate-400 font-medium">Үйлөнүү үлпөтүн башкаруу</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={20} />
          Заказ кошуу
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Active Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock className="text-[#08c4e5]" size={24} />
            Заказдар
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activeOrders.length} активдүү</span>
        </div>
        
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ x: 4 }}
              className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center text-[#08c4e5]">
                  {OPERATOR_PHOTOS[order.operator] ? (
                    <img 
                      src={OPERATOR_PHOTOS[order.operator]} 
                      alt={order.operator}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white">{order.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{order.date} • {order.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'Монтаж' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  order.status === 'Тартуу' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {order.status}
                </span>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-[#08c4e5] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ready Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={24} />
            Даяр заказдар
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{readyOrders.length} аяктады</span>
        </div>

        <div className="space-y-4">
          {readyOrders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ x: 4 }}
              className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 overflow-hidden border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  {OPERATOR_PHOTOS[order.operator] ? (
                    <img 
                      src={OPERATOR_PHOTOS[order.operator]} 
                      alt={order.operator}
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CheckCircle2 size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white">{order.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{order.date} • {order.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {order.status}
                </span>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  </motion.div>
);

const ProjectDetailsPage = ({ onNavigate }: { onNavigate: (page: Page) => void, key?: string }) => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Баландын үйүнө баруу убактысы:', time: '09:00' },
    { id: 2, text: 'Ресторанга баруу убактысы:', time: '18:00' },
  ]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: 'Жаңы эскертүү:',
      time: '12:00'
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const updateNote = (id: number, field: 'text' | 'time', value: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[550px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-6 md:py-8 mb-4 md:mb-6">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('dashboard')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </motion.button>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Заказ маалыматы</h2>
        </div>
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={18} className="md:w-5 md:h-5" />
        </button>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          {/* Who is getting married */}
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-[8px] md:text-[9px] font-bold text-[#08c4e5] uppercase tracking-[0.2em]">Кимдер үйлөнүп жатат?</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Азамат & Айпери</h1>
            <div className="w-8 md:w-10 h-1 bg-cyan-500/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* When */}
            <div className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2 md:p-3 rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-2 md:mb-3">
                <CalendarIcon size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ДАТАСЫ</p>
              <p className="text-sm md:text-base font-bold text-slate-200">12-март, 2026</p>
            </div>

            {/* Where */}
            <div className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2 md:p-3 rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-2 md:mb-3">
                <MapPin size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ЛОКАЦИЯ</p>
              <p className="text-sm md:text-base font-bold text-slate-200">"Ала-Тоо" рестораны</p>
            </div>
          </div>

          {/* Time Reminders */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Убакыт жана Эскертүүлөр</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-[#08c4e5] text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
              >
                <Plus size={12} />
                Кошуу
              </motion.button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-1.5 rounded-full bg-slate-900 text-[#08c4e5] shadow-sm shrink-0">
                        <Clock size={14} />
                      </div>
                      <input 
                        type="text"
                        value={note.text}
                        onChange={(e) => updateNote(note.id, 'text', e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-300 w-full focus:text-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <input 
                        type="text"
                        value={note.time}
                        onChange={(e) => updateNote(note.id, 'time', e.target.value)}
                        className="bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5 text-sm font-black text-[#08c4e5] w-20 text-center outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Notice */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-slate-600">
            <Info size={12} />
            <p className="text-[9px] font-medium uppercase tracking-wider">Эскертүүлөрдү каалагандай өзгөртө аласыз</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AddOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<Order, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    details: '',
    phone: '',
    deposit: '',
    operator: 'Санжар',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      status: 'Күтүүдө',
      type: 'Стандарт'
    });
    onNavigate('orders_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('wedding')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h2 className="text-xl md:text-2xl font-bold text-white">Жаңы заказ кошуу</h2>
        </div>
        <button 
          type="button"
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Заказчынын ФИОсу</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: Азамат Кадыров"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.customerName}
            onChange={e => setFormData({...formData, customerName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Дата</label>
            <input 
              required
              type="date" 
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Телефон номер</label>
            <input 
              required
              type="tel" 
              placeholder="+996 700 000 000"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Эмне заказ (чоо-жайы)</label>
          <textarea 
            required
            placeholder="Заказдын мазмуну..."
            rows={3}
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm resize-none text-white placeholder:text-slate-600"
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Задаток (сом)</label>
          <input 
            required
            type="number" 
            placeholder="5000"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.deposit}
            onChange={e => setFormData({...formData, deposit: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Оператор</label>
          <select 
            required
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
            value={formData.operator}
            onChange={e => setFormData({...formData, operator: e.target.value})}
          >
            <option value="Санжар" className="bg-slate-900">Санжар</option>
            <option value="Нурболот" className="bg-slate-900">Нурболот</option>
          </select>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 md:py-5 bg-[#08c4e5] text-white font-black rounded-2xl shadow-lg shadow-cyan-200/50 uppercase tracking-widest text-[10px] md:text-xs transition-all"
        >
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const OrdersListPage = ({ onNavigate, orders, onDeleteOrder }: { onNavigate: (page: Page) => void, orders: Order[], onDeleteOrder: (id: number) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="max-w-[1000px] mx-auto px-4 py-8 md:py-12"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Бардык заказдар</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Жаңы заказ
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
      {orders.length === 0 ? (
        <div className="col-span-full py-12 md:py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <FileText size={32} className="mx-auto text-slate-500 mb-2 md:mb-4 md:w-12 md:h-12" />
          <p className="text-[10px] md:text-slate-400 font-medium">Азырынча заказдар жок</p>
        </div>
      ) : (
        orders.map(order => (
          <motion.div 
            key={order.id}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-sm space-y-2 md:space-y-4 relative group"
          >
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center text-[#08c4e5]">
                  {OPERATOR_PHOTOS[order.operator] ? (
                    <img 
                      src={OPERATOR_PHOTOS[order.operator]} 
                      alt={order.operator}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={16} className="md:w-6 md:h-6" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-[10px] md:text-base truncate">{order.customerName}</h4>
                  <p className="text-[8px] md:text-xs text-slate-500 font-medium">{order.date}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[6px] md:text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {order.status}
              </span>
            </div>
            
            <div className="p-2 md:p-4 bg-white/5 rounded-xl md:rounded-2xl space-y-1.5 md:space-y-3">
              <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-xs">
                <Video size={10} className="text-slate-500 md:w-[14px] md:h-[14px]" />
                <span className="text-slate-300 font-medium truncate">{order.details}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-xs">
                <Clock size={10} className="text-slate-500 md:w-[14px] md:h-[14px]" />
                <span className="text-slate-300 font-medium">Задаток: <span className="text-emerald-500 font-bold">{order.deposit}</span></span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-xs">
                <MapPin size={10} className="text-slate-500 md:w-[14px] md:h-[14px]" />
                <span className="text-slate-300 font-medium truncate">{order.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-xs">
                <User size={10} className="text-slate-500 md:w-[14px] md:h-[14px]" />
                <span className="text-slate-300 font-medium">Оператор: <span className="text-[#08c4e5] font-bold">{order.operator}</span></span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [schoolOrders, setSchoolOrders] = useState<SchoolOrder[]>([]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    (window as any).openAIChat = () => setIsAIChatOpen(true);
  }, []);

  const handleAddOrder = (newOrder: Omit<Order, 'id'>) => {
    const orderWithId = {
      ...newOrder,
      id: Date.now(),
    };
    setOrders(prev => [orderWithId, ...prev]);
  };

  const handleAddSchoolOrder = (newOrder: Omit<SchoolOrder, 'id'>) => {
    const orderWithId = {
      ...newOrder,
      id: Date.now(),
    };
    setSchoolOrders(prev => [orderWithId, ...prev]);
  };

  const handleDeleteOrder = (id: number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleDeleteSchoolOrder = (id: number) => {
    setSchoolOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleRestoreOrder = (id: number) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const handleRestoreSchoolOrder = (id: number) => {
    setSchoolOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const activeOrders = orders.filter(o => !o.deletedAt);
  const deletedOrders = orders.filter(o => !!o.deletedAt);
  const activeSchoolOrders = schoolOrders.filter(o => !o.deletedAt);
  const deletedSchoolOrders = schoolOrders.filter(o => !!o.deletedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1d] to-[#020617] text-white font-sans selection:bg-cyan-500/30">
      <AnimatePresence mode="wait">
        {currentPage === 'dashboard' ? (
          <Dashboard key="dashboard" onNavigate={setCurrentPage} orders={activeOrders} />
        ) : currentPage === 'wedding' ? (
          <WeddingPage key="wedding" onNavigate={setCurrentPage} />
        ) : currentPage === 'school_list' ? (
          <SchoolListPage key="school_list" onNavigate={setCurrentPage} schoolOrders={activeSchoolOrders} onDeleteOrder={handleDeleteSchoolOrder} />
        ) : currentPage === 'add_school_order' ? (
          <AddSchoolOrderPage key="add_school_order" onNavigate={setCurrentPage} onAddOrder={handleAddSchoolOrder} />
        ) : currentPage === 'add_order' ? (
          <AddOrderPage key="add_order" onNavigate={setCurrentPage} onAddOrder={handleAddOrder} />
        ) : currentPage === 'orders_list' ? (
          <OrdersListPage key="orders_list" onNavigate={setCurrentPage} orders={activeOrders} onDeleteOrder={handleDeleteOrder} />
        ) : currentPage === 'trash' ? (
          <TrashPage 
            key="trash" 
            onNavigate={setCurrentPage} 
            deletedOrders={deletedOrders} 
            deletedSchoolOrders={deletedSchoolOrders}
            onRestoreOrder={handleRestoreOrder}
            onRestoreSchoolOrder={handleRestoreSchoolOrder}
          />
        ) : (
          <ProjectDetailsPage key="project_details" onNavigate={setCurrentPage} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIChatOpen && (
          <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer - Shared across pages */}
        <footer className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-500">
          <p>© 2026 Pixe1.media студияны башкаруу системасы</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Система иштеп жатат
            </span>
            <button className="hover:text-[#08c4e5] transition-colors cursor-pointer">Купуялуулук саясаты</button>
            <button className="hover:text-[#08c4e5] transition-colors cursor-pointer">Колдоо</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
