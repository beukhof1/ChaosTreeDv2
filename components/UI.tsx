import React, { useState, useEffect, useRef } from 'react';
import { Upload, RotateCw, Pause, Maximize, Minimize, Settings2, X, Sun, CloudFog, Camera, Sparkles, Moon, Play, Zap, Gift, Mountain, Trees, Clock, Globe, Scaling, Wind, Waves, Target, Scan, Snowflake, Crown, Box, Wand2, MessageSquare, Type, Projector, Cloud } from 'lucide-react';
import { RenderStyle, SceneSettings, UploadedImage } from '../types';

interface UIProps {
  onUpload: (files: FileList | null) => void;
  onLogoUpload: (files: FileList | null) => void; 
  images: UploadedImage[];
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  renderStyle: RenderStyle;
  setRenderStyle: (style: RenderStyle) => void;
  settings: SceneSettings;
  onUpdateSettings: (settings: React.SetStateAction<SceneSettings>) => void;
  onResetSettings: () => void;
}

interface PanelProps {
  children?: React.ReactNode;
  className?: string;
}

// Shiny Glass Panel Style
const Panel = ({ children, className = "" }: PanelProps) => (
    <div className={`bg-gradient-to-b from-white/15 to-black/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
        {children}
    </div>
);

interface SectionProps {
  title: string;
  icon: any;
  children?: React.ReactNode;
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
    <div className="mb-5 bg-white/5 rounded-xl p-3 border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-blue-200/80 px-1">
            <Icon size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold shadow-black drop-shadow-sm">{title}</span>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const Slider = ({ label, value, min, max, step, onChange }: any) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-white/70 w-20 truncate">{label}</span>
        <div className="flex-1 relative h-5 flex items-center group">
            <input 
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform group-hover:[&::-webkit-slider-thumb]:scale-125"
            />
        </div>
        <span className="text-[9px] font-mono text-white/40 w-6 text-right">{Math.round(value * 10) / 10}</span>
    </div>
);

const Toggle = ({ label, value, onChange }: any) => (
    <button 
        onClick={() => onChange(!value)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${value ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
    >
        <span className={`text-[11px] font-medium ${value ? 'text-blue-200' : 'text-white/60'}`}>{label}</span>
        <div className={`w-7 h-3.5 rounded-full relative transition-colors ${value ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform shadow-sm ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
        </div>
    </button>
);

const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between bg-black/20 p-1.5 rounded-lg border border-white/5">
        <span className="text-[11px] font-medium text-white/60 ml-2">{label}</span>
        <div className="relative group cursor-pointer">
            <div className="w-5 h-5 rounded-md border border-white/30 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: value }} />
            <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    </div>
);

const OptionGrid = ({ options, value, onChange, labelKey = 'label' }: any) => (
    <div className="grid grid-cols-3 gap-1">
        {options.map((opt: any) => (
            <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className={`py-1.5 px-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all border ${
                    value === opt.id 
                    ? 'bg-white text-black border-white shadow-lg' 
                    : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white'
                }`}
            >
                {opt[labelKey]}
            </button>
        ))}
    </div>
);

const TextInput = ({ value, onChange, placeholder }: any) => (
    <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
    />
);

const QUOTES = [
    "May your days be merry and bright",
    "Peace on Earth, good will to men",
    "Have yourself a merry little Christmas",
    "It's the most wonderful time of the year",
    "Joy to the world",
    "Let it snow, let it snow, let it snow",
    "Walking in a winter wonderland",
    "The magic of Christmas is not in the presents, but in His presence",
    "Christmas waves a magic wand over this world",
    "Merry Christmas to all, and to all a good night",
    "Tis the season to be jolly",
    "Miracle on 34th Street",
    "Home for the holidays",
    "Sending you hugs this Christmas season",
    "Wishing you a season full of light and laughter",
    "Warmest thoughts and best wishes for a wonderful Christmas",
    "May peace, love, and prosperity follow you always",
    "Eat, drink, and be merry",
    "Jingle bells, jingle all the way",
    "All I want for Christmas is you"
];

// Polished Cinema Subtitles
const CinemaSubtitles: React.FC = () => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex(prev => (prev + 1) % QUOTES.length);
                setFade(true);
            }, 1000);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-0 left-0 w-full h-48 pointer-events-none z-30 flex items-end justify-center pb-24">
            <div className={`transition-all duration-1000 ease-in-out px-8 text-center max-w-3xl ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="font-christmas text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 tracking-wide leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter">
                    "{QUOTES[index]}"
                </p>
            </div>
        </div>
    );
}

// Polished Typewriter Card
const TypewriterCard: React.FC<{ message: string }> = ({ message }) => {
    const [text, setText] = useState('');
    const fullText = message || "Warmest wishes for a wonderful holiday season...";
    
    useEffect(() => {
        setText('');
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, i + 1));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 60); 
        return () => clearInterval(interval);
    }, [fullText]);

    return (
        <div className="absolute top-32 left-8 z-30 pointer-events-none w-72 opacity-95">
            <div className="bg-white/5 backdrop-blur-xl text-white p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden transition-all hover:scale-105 duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-70"></div>
                <div className="relative z-10">
                     <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                         <span className="text-[10px] text-blue-200 uppercase tracking-[0.2em] font-bold">Holiday Wish</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse" />
                     </div>
                     <p className="font-sans text-sm leading-relaxed text-white/90 font-light tracking-wide">
                        {text}
                        <span className="animate-pulse inline-block w-0.5 h-4 bg-blue-300 ml-0.5 align-middle opacity-70"></span>
                     </p>
                </div>
            </div>
        </div>
    );
}

const UI: React.FC<UIProps> = ({ 
    onUpload, onLogoUpload, images, isAutoRotate, onToggleAutoRotate,
    settings, onUpdateSettings, onResetSettings
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'env' | 'decor' | 'camera'>('env');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen?.();
  const update = (key: keyof SceneSettings, value: any) => onUpdateSettings(p => ({ ...p, [key]: value }));

  return (
    <div className="w-full h-full relative pointer-events-none select-none font-sans text-slate-200">
      
      {/* Hide Branding when in Fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 z-40 pointer-events-none flex flex-col items-start drop-shadow-lg opacity-90">
            <h1 className="text-xl md:text-[10px] text-white leading-none -rotate-2" style={{ fontFamily: "'Rock Salt', cursive" }}>
                Cpt. Chaos
            </h1>
            <p className="text-[9px] text-blue-200 uppercase tracking-[0.25em] font-light ml-1 mt-1 text-shadow-sm opacity-80">Tree-D Christmas</p>
        </div>
      )}

      {/* Greetings - Always visible if enabled, even in fullscreen */}
      {settings.showCinemaSubtitles && <CinemaSubtitles />}
      {settings.showTypewriterCard && <TypewriterCard message={settings.typewriterMessage} />}

      {/* UI Controls - Auto Hide in Fullscreen */}
      {!isFullscreen && (
        <>
            {/* BOTTOM FLOATING BAR - COMPACT */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <Panel className="flex items-center gap-3 px-5 py-1.5 rounded-full">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white p-2.5 rounded-full transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
                        title="Add Memory"
                    >
                        <Upload size={18} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} accept="image/*" onClick={(e) => (e.currentTarget.value = '')} />

                    <div className="w-px h-6 bg-white/20" />

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onToggleAutoRotate}
                            disabled={images.length === 0}
                            className={`p-2.5 rounded-full transition-all ${
                                images.length === 0 
                                ? 'text-white/20 cursor-not-allowed' 
                                : isAutoRotate 
                                    ? 'bg-white/10 text-green-400 shadow-inner' 
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                            title={isAutoRotate ? "Pause Tour" : "Resume Tour"}
                        >
                            {isAutoRotate ? <Pause size={18} /> : <Play size={18} />}
                        </button>

                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2.5 rounded-full transition-all ${
                                showSettings 
                                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                            title="Settings"
                        >
                            <Settings2 size={18} />
                        </button>

                        <button 
                            onClick={toggleFullscreen}
                            className="p-2.5 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all"
                            title="Fullscreen"
                        >
                            <Maximize size={18} />
                        </button>
                    </div>
                </Panel>
            </div>

            {/* SETTINGS DRAWER */}
            <div className={`absolute top-0 right-0 h-full w-[300px] max-w-full pointer-events-auto transform transition-transform duration-300 z-50 flex flex-col ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
                <Panel className="h-full flex flex-col border-l border-white/20 rounded-l-2xl overflow-hidden shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <span className="font-bold text-xs tracking-widest uppercase text-white/90">Settings</span>
                        <div className="flex gap-2">
                            <button onClick={onResetSettings} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white" title="Reset"><RotateCw size={14} /></button>
                            <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"><X size={16} /></button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 gap-1 border-b border-white/5 bg-black/10">
                        {[
                            { id: 'env', label: 'World', icon: Globe },
                            { id: 'decor', label: 'Decor', icon: Gift },
                            { id: 'camera', label: 'Camera', icon: Camera }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:bg-white/5'}`}
                            >
                                <tab.icon size={12} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4 pb-32">
                        {activeTab === 'env' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Section title="Quality" icon={Settings2}>
                                    <OptionGrid 
                                        value={settings.quality} 
                                        onChange={(v: any) => update('quality', v)}
                                        options={[
                                            { id: 'high', label: 'High' },
                                            { id: 'balanced', label: 'Med' },
                                            { id: 'fast', label: 'Low' }
                                        ]} 
                                    />
                                </Section>

                                <Section title="Background" icon={Mountain}>
                                    <OptionGrid 
                                        value={settings.bgType} 
                                        onChange={(v: any) => update('bgType', v)}
                                        options={[
                                            { id: 'mountains', label: 'Alps' },
                                            { id: 'forest', label: 'Woods' },
                                            { id: 'aurora', label: 'Aurora' },
                                            { id: 'stars', label: 'Void' },
                                        ]} 
                                    />
                                </Section>

                                <Section title="Time Cycle" icon={Clock}>
                                    <div className="flex gap-1 mb-3 bg-black/20 p-1 rounded-lg">
                                        {['MANUAL', 'CYCLE', 'DAY LOOP'].map(mode => {
                                            let active = (mode === 'MANUAL' && !settings.isTimeAuto) ||
                                                        (mode === 'CYCLE' && settings.isTimeAuto && settings.timeLoopMode === 'cycle') ||
                                                        (mode === 'DAY LOOP' && settings.isTimeAuto && settings.timeLoopMode === 'pingpong');
                                            return (
                                                <button 
                                                    key={mode}
                                                    onClick={() => {
                                                        if(mode === 'MANUAL') update('isTimeAuto', false);
                                                        else {
                                                            update('isTimeAuto', true);
                                                            update('timeLoopMode', mode === 'CYCLE' ? 'cycle' : 'pingpong');
                                                        }
                                                    }}
                                                    className={`flex-1 py-1 rounded-md text-[9px] font-bold transition-all ${active ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {mode}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <Slider label="Hour" value={settings.timeOfDay} min={0} max={24} step={0.1} onChange={(v: number) => update('timeOfDay', v)} />
                                    <div className="h-2"></div>
                                    <ColorPicker label="Sky Tint" value={settings.skyColor} onChange={(v: string) => update('skyColor', v)} />
                                </Section>

                                <Section title="Lighting" icon={Zap}>
                                    <Toggle label="Ice Floor" value={settings.showGroundReflections} onChange={(v: boolean) => update('showGroundReflections', v)} />
                                    {settings.showGroundReflections && (
                                        <div className="pl-2 border-l border-white/10 ml-2 space-y-2 mt-2">
                                            <Slider label="Roughness" value={settings.groundRoughness} min={0} max={1} step={0.05} onChange={(v: number) => update('groundRoughness', v)} />
                                            <Slider label="Reflectivity" value={settings.groundReflection} min={0} max={1} step={0.05} onChange={(v: number) => update('groundReflection', v)} />
                                        </div>
                                    )}
                                    <div className="h-2"></div>
                                    <Toggle label="Cloud Shadows" value={settings.showGoboLighting} onChange={(v: boolean) => update('showGoboLighting', v)} />
                                    <div className="h-2"></div>
                                    <Slider label="Sunlight" value={settings.shadowIntensity} min={0} max={5} step={0.1} onChange={(v: number) => update('shadowIntensity', v)} />
                                    <Slider label="Ambient" value={settings.sceneLight} min={0} max={3} step={0.1} onChange={(v: number) => update('sceneLight', v)} />
                                </Section>
                            </div>
                        )}

                        {activeTab === 'decor' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Section title="Tree Topper" icon={Crown}>
                                    <div className="flex flex-col gap-2 mb-2">
                                        <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => onLogoUpload(e.target.files)} />
                                        <OptionGrid 
                                            value={settings.topperType} 
                                            onChange={(v: any) => update('topperType', v)}
                                            options={[{ id: 'star', label: 'Star' }, { id: 'logo_spin', label: '3D Logo' }, { id: 'logo_holo', label: 'Holo' }]} 
                                        />
                                        {(settings.topperType === 'logo_spin' || settings.topperType === 'logo_holo') && (
                                            <button onClick={() => logoInputRef.current?.click()} className="mt-2 w-full py-2 bg-white/5 hover:bg-white/10 text-blue-200 border border-white/10 rounded-lg text-[10px] font-bold transition-all">
                                                UPLOAD LOGO
                                            </button>
                                        )}
                                    </div>
                                </Section>

                                <Section title="Ornaments" icon={Gift}>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition-all mb-4 border border-blue-400/30">
                                        ADD PHOTOS
                                    </button>
                                    <ColorPicker label="Tree Color" value={settings.treeColor} onChange={(v: string) => update('treeColor', v)} />
                                </Section>

                                <Section title="Details" icon={Box}>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <Toggle label="Tree Skirt" value={settings.showTreeSkirt} onChange={(v: boolean) => update('showTreeSkirt', v)} />
                                        <Toggle label="Snowy Tree" value={settings.showSnowOnBranches} onChange={(v: boolean) => update('showSnowOnBranches', v)} />
                                    </div>
                                </Section>

                                <Section title="Greetings" icon={MessageSquare}>
                                    <div className="space-y-3">
                                        <Toggle label="Cinema Subtitles" value={settings.showCinemaSubtitles} onChange={(v: boolean) => update('showCinemaSubtitles', v)} />
                                        
                                        <div className="space-y-2">
                                            <Toggle label="Typewriter Card" value={settings.showTypewriterCard} onChange={(v: boolean) => update('showTypewriterCard', v)} />
                                            {settings.showTypewriterCard && (
                                                <TextInput value={settings.typewriterMessage} onChange={(v: string) => update('typewriterMessage', v)} placeholder="Card Message..." />
                                            )}
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Magic" icon={Wand2}>
                                    <Slider label="Tree Lights" value={settings.flicker} min={0} max={100} step={1} onChange={(v: number) => update('flicker', v)} />
                                    <Slider label="Sparkles" value={settings.sparkles} min={0} max={100} step={1} onChange={(v: number) => update('sparkles', v)} />
                                </Section>
                            </div>
                        )}

                        {activeTab === 'camera' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Section title="Weather" icon={CloudFog}>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <Toggle label="Rolling Fog" value={settings.showGroundFog} onChange={(v: boolean) => update('showGroundFog', v)} />
                                        <Toggle label="Diamond Dust" value={settings.showDiamondDust} onChange={(v: boolean) => update('showDiamondDust', v)} />
                                    </div>
                                    <Slider label="Snow Amount" value={settings.snow} min={0} max={100} step={1} onChange={(v: number) => update('snow', v)} />
                                    <Slider label="Speed" value={settings.snowSpeed} min={0} max={100} step={1} onChange={(v: number) => update('snowSpeed', v)} />
                                    <Slider label="Wind" value={settings.snowTurbulence} min={0} max={100} step={1} onChange={(v: number) => update('snowTurbulence', v)} />
                                    <Slider label="Flake Size" value={settings.snowSize} min={0} max={100} step={1} onChange={(v: number) => update('snowSize', v)} />
                                    <Slider label="Fog" value={settings.fog} min={0} max={100} step={1} onChange={(v: number) => update('fog', v)} />
                                </Section>

                                <Section title="Lens" icon={Camera}>
                                    <div className="mb-2">
                                        <Toggle label="Depth of Field" value={settings.showBokeh} onChange={(v: boolean) => update('showBokeh', v)} />
                                    </div>
                                    <Slider label="Bloom" value={settings.magic} min={0} max={100} step={1} onChange={(v: number) => update('magic', v)} />
                                    <Slider label="Vignette" value={settings.vignetteIntensity} min={0} max={100} step={1} onChange={(v: number) => update('vignetteIntensity', v)} />
                                    <Slider label="Roundness" value={settings.vignetteRoundness} min={0} max={100} step={1} onChange={(v: number) => update('vignetteRoundness', v)} />
                                    <Slider label="Rotate Speed" value={settings.speed} min={0} max={100} step={1} onChange={(v: number) => update('speed', v)} />
                                </Section>
                            </div>
                        )}
                    </div>
                </Panel>
            </div>
        </>
      )}

      {/* When Fullscreen, subtle exit button */}
      {isFullscreen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity z-50 pointer-events-auto">
                <button 
                    onClick={toggleFullscreen}
                    className="px-4 py-2 bg-black/40 text-white/50 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10"
                >
                    Exit Fullscreen
                </button>
          </div>
      )}

    </div>
  );
};

export default UI;