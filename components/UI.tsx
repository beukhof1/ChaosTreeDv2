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

// Modern Frosted Panel (visionOS style)
const Panel = ({ children, className = "" }: PanelProps) => (
    <div className={`bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl ${className}`}>
        {children}
    </div>
);

interface SectionProps {
  title: string;
  icon: any;
  children?: React.ReactNode;
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1 text-zinc-400">
            <Icon size={12} strokeWidth={2.5} />
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold">{title}</span>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const Slider = ({ label, value, min, max, step, onChange }: any) => (
    <div className="flex items-center justify-between gap-4 py-1 px-2">
        <span className="text-[11px] font-medium text-zinc-400 w-20 truncate">{label}</span>
        <div className="flex-1 relative h-6 flex items-center group">
            <div className="absolute w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-white/30 group-hover:bg-white/50 transition-colors" 
                    style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                />
            </div>
            <input 
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
                className="absolute h-3 w-3 bg-white rounded-full shadow-sm pointer-events-none transition-transform group-hover:scale-110 group-active:scale-95"
                style={{ left: `${((value - min) / (max - min)) * 100}%`, transform: 'translateX(-50%)' }}
            />
        </div>
        <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{Math.round(value * 10) / 10}</span>
    </div>
);

const Toggle = ({ label, value, onChange }: any) => (
    <button 
        onClick={() => onChange(!value)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 group ${
            value 
            ? 'bg-white/10 border-white/20' 
            : 'bg-transparent border-transparent hover:bg-white/5'
        }`}
    >
        <span className={`text-[11px] font-medium transition-colors ${value ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{label}</span>
        <div className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 ${value ? 'bg-white' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200 shadow-sm ${
                value ? 'translate-x-3.5 bg-black' : 'translate-x-0 bg-white/50'
            }`} />
        </div>
    </button>
);

const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between py-1 px-2">
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
        <div className="relative group cursor-pointer">
            <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: value }} />
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
    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl">
        {options.map((opt: any) => (
            <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    value === opt.id 
                    ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
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
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:bg-black/30 transition-all"
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
        <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-30 flex items-center justify-center pb-8">
            <div className={`transition-all duration-1000 ease-in-out px-8 text-center max-w-2xl ${fade ? 'opacity-90 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-2'}`}>
                <p className="font-serif italic text-xl md:text-2xl text-white/90 drop-shadow-md">
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
        <div className="absolute top-24 left-8 z-30 pointer-events-none w-64">
            <Panel className="p-6 rounded-2xl border-white/5">
                <div className="flex items-center gap-2 mb-3 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-white font-medium">Message</span>
                </div>
                <p className="font-mono text-xs leading-6 text-zinc-300">
                {text}
                <span className="animate-pulse inline-block w-1.5 h-3 bg-white/50 ml-0.5 align-middle"></span>
                </p>
            </Panel>
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
      
      {/* Branding - Hide in Fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 z-40 pointer-events-none opacity-80 mix-blend-difference">
            <h1 className="text-xl md:text-2xl text-white/90 leading-none -rotate-1 font-bold tracking-tight" style={{ fontFamily: "'Rock Salt', cursive" }}>
                Cpt. Chaos
            </h1>
            <p className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-medium ml-1 mt-1">Tree-D Christmas</p>
        </div>
      )}

      {/* Greetings */}
      {settings.showCinemaSubtitles && <CinemaSubtitles />}
      {settings.showTypewriterCard && <TypewriterCard message={settings.typewriterMessage} />}

      {/* UI Controls - Auto Hide in Fullscreen */}
      {!isFullscreen && (
        <>
            {/* BOTTOM DOCK */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <Panel className="flex items-center gap-1 p-1.5 rounded-full">
                    {/* Primary Action */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                        title="Add Memory"
                    >
                        <Upload size={20} strokeWidth={2.5} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} accept="image/*" onClick={(e) => (e.currentTarget.value = '')} />

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={onToggleAutoRotate}
                            disabled={images.length === 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                images.length === 0 
                                ? 'text-white/20 cursor-not-allowed' 
                                : isAutoRotate 
                                    ? 'bg-white/10 text-white shadow-inner' 
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                            title={isAutoRotate ? "Pause Tour" : "Resume Tour"}
                        >
                            {isAutoRotate ? <Pause size={18} fill="currentColor" className="opacity-80" /> : <Play size={18} fill="currentColor" className="translate-x-0.5 opacity-80" />}
                        </button>

                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                showSettings 
                                ? 'bg-white text-black' 
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                            title="Settings"
                        >
                            <Settings2 size={18} strokeWidth={2.5} />
                        </button>

                        <button 
                            onClick={toggleFullscreen}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                            title="Fullscreen"
                        >
                            <Maximize size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </Panel>
            </div>

            {/* SETTINGS SIDEBAR */}
            <div className={`absolute top-4 bottom-4 right-4 w-[320px] max-w-[calc(100vw-32px)] pointer-events-auto transform transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 flex flex-col ${showSettings ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}>
                <Panel className="h-full flex flex-col rounded-3xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs tracking-widest uppercase text-white">Settings</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-zinc-400">v2.0</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={onResetSettings} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white" title="Reset"><RotateCw size={14} /></button>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"><X size={16} /></button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="p-2 bg-black/20">
                        <div className="flex p-1 gap-1 bg-black/40 rounded-xl">
                            {[
                                { id: 'env', label: 'World', icon: Globe },
                                { id: 'decor', label: 'Decor', icon: Gift },
                                { id: 'camera', label: 'Camera', icon: Camera }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                                >
                                    <tab.icon size={12} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-2 pb-32">
                        {activeTab === 'env' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Section title="Rendering" icon={Settings2}>
                                    <OptionGrid 
                                        value={settings.quality} 
                                        onChange={(v: any) => update('quality', v)}
                                        options={[
                                            { id: 'high', label: 'High' },
                                            { id: 'balanced', label: 'Medium' },
                                            { id: 'fast', label: 'Low' }
                                        ]} 
                                    />
                                </Section>

                                <Section title="Environment" icon={Mountain}>
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

                                <Section title="Time & Atmosphere" icon={Clock}>
                                    <div className="flex gap-1 mb-4 bg-black/20 p-1 rounded-xl">
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
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-200 ${active ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    {mode}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <Slider label="Hour" value={settings.timeOfDay} min={0} max={24} step={0.1} onChange={(v: number) => update('timeOfDay', v)} />
                                    <ColorPicker label="Sky Tint" value={settings.skyColor} onChange={(v: string) => update('skyColor', v)} />
                                </Section>

                                <Section title="Lighting" icon={Zap}>
                                    <Toggle label="Ice Floor" value={settings.showGroundReflections} onChange={(v: boolean) => update('showGroundReflections', v)} />
                                    {settings.showGroundReflections && (
                                        <div className="bg-white/5 rounded-xl p-3 mt-2 space-y-1">
                                            <Slider label="Roughness" value={settings.groundRoughness} min={0} max={1} step={0.05} onChange={(v: number) => update('groundRoughness', v)} />
                                            <Slider label="Reflectivity" value={settings.groundReflection} min={0} max={1} step={0.05} onChange={(v: number) => update('groundReflection', v)} />
                                        </div>
                                    )}
                                    <div className="h-3"></div>
                                    <Toggle label="Cloud Shadows" value={settings.showGoboLighting} onChange={(v: boolean) => update('showGoboLighting', v)} />
                                    <div className="h-3"></div>
                                    <Slider label="Sunlight" value={settings.shadowIntensity} min={0} max={5} step={0.1} onChange={(v: number) => update('shadowIntensity', v)} />
                                    <Slider label="Ambient" value={settings.sceneLight} min={0} max={3} step={0.1} onChange={(v: number) => update('sceneLight', v)} />
                                </Section>
                            </div>
                        )}

                        {activeTab === 'decor' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Section title="Tree Topper" icon={Crown}>
                                    <div className="flex flex-col gap-3">
                                        <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => onLogoUpload(e.target.files)} />
                                        <OptionGrid 
                                            value={settings.topperType} 
                                            onChange={(v: any) => update('topperType', v)}
                                            options={[{ id: 'star', label: 'Star' }, { id: 'logo_spin', label: '3D Logo' }, { id: 'logo_holo', label: 'Holo' }]} 
                                        />
                                        {(settings.topperType === 'logo_spin' || settings.topperType === 'logo_holo') && (
                                            <button onClick={() => logoInputRef.current?.click()} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all">
                                                Upload Logo
                                            </button>
                                        )}
                                    </div>
                                </Section>

                                <Section title="Ornaments" icon={Gift}>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-xs shadow-lg transition-all mb-4">
                                        Add Photos
                                    </button>
                                    <ColorPicker label="Tree Color" value={settings.treeColor} onChange={(v: string) => update('treeColor', v)} />
                                </Section>

                                <Section title="Details" icon={Box}>
                                    <div className="space-y-2">
                                        <Toggle label="Tree Skirt" value={settings.showTreeSkirt} onChange={(v: boolean) => update('showTreeSkirt', v)} />
                                        <Toggle label="Snowy Branches" value={settings.showSnowOnBranches} onChange={(v: boolean) => update('showSnowOnBranches', v)} />
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
                                    <Slider label="Global Fog" value={settings.fog} min={0} max={100} step={1} onChange={(v: number) => update('fog', v)} />
                                </Section>

                                <Section title="Lens Effects" icon={Camera}>
                                    <div className="mb-4">
                                        <Toggle label="Depth of Field (Bokeh)" value={settings.showBokeh} onChange={(v: boolean) => update('showBokeh', v)} />
                                    </div>
                                    <Slider label="Bloom" value={settings.magic} min={0} max={100} step={1} onChange={(v: number) => update('magic', v)} />
                                    <Slider label="Vignette" value={settings.vignetteIntensity} min={0} max={100} step={1} onChange={(v: number) => update('vignetteIntensity', v)} />
                                    <Slider label="Roundness" value={settings.vignetteRoundness} min={0} max={100} step={1} onChange={(v: number) => update('vignetteRoundness', v)} />
                                    <Slider label="Tour Speed" value={settings.speed} min={0} max={100} step={1} onChange={(v: number) => update('speed', v)} />
                                </Section>
                            </div>
                        )}
                    </div>
                </Panel>
            </div>
        </>
      )}

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity z-50 pointer-events-auto">
                <button 
                    onClick={toggleFullscreen}
                    className="px-6 py-2 bg-black/50 text-white/70 hover:text-white rounded-full text-xs font-bold backdrop-blur-md border border-white/10 transition-colors"
                >
                    Exit Fullscreen
                </button>
          </div>
      )}

    </div>
  );
};

export default UI;