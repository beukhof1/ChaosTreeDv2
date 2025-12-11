

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

const Panel = ({ children, className = "" }: PanelProps) => (
    <div className={`bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl ${className}`}>
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
        <div className="flex items-center gap-2 mb-3 text-white/50 px-1">
            <Icon size={12} />
            <span className="text-[10px] uppercase tracking-widest font-bold">{title}</span>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const Slider = ({ label, value, min, max, step, onChange }: any) => (
    <div className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
        <span className="text-xs font-medium text-white/70 w-24 truncate">{label}</span>
        <div className="flex-1 relative h-6 flex items-center">
            <input 
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
        </div>
        <span className="text-[10px] font-mono text-white/50 w-8 text-right">{Math.round(value * 10) / 10}</span>
    </div>
);

const Toggle = ({ label, value, onChange }: any) => (
    <button 
        onClick={() => onChange(!value)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${value ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
    >
        <span className={`text-xs font-medium ${value ? 'text-blue-200' : 'text-white/70'}`}>{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-blue-500' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
    </button>
);

const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
        <span className="text-xs font-medium text-white/70">{label}</span>
        <div className="relative">
            <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: value }} />
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
    <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt: any) => (
            <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className={`py-2 px-1 rounded-md text-[10px] font-semibold transition-all border ${
                    value === opt.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
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
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
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
        <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-30 flex items-end justify-center pb-12">
            <div className={`transition-all duration-1000 ease-in-out px-8 text-center max-w-2xl ${fade ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <p className="font-serif italic text-lg md:text-xl text-amber-100 tracking-wider leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
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
        <div className="absolute top-24 left-6 z-30 pointer-events-none w-64 opacity-90 scale-90 origin-top-left">
            <div className="bg-white/90 backdrop-blur-sm text-stone-800 p-6 rounded-sm shadow-xl border border-white/20 relative overflow-hidden">
                <div className="relative z-10">
                     <div className="flex justify-between items-center mb-4 border-b border-stone-300/50 pb-2">
                         <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Holiday Post</span>
                         <div className="w-2 h-2 rounded-full bg-red-500" />
                     </div>
                     <p className="font-mono text-xs leading-relaxed text-stone-700 font-medium">
                        {text}
                        <span className="animate-pulse inline-block w-1.5 h-3 bg-red-400 ml-0.5 align-middle opacity-50"></span>
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
      
      {!isFullscreen && (
          <div className="absolute top-6 left-6 z-40 pointer-events-none flex flex-col items-start drop-shadow-lg opacity-75">
               <h1 className="text-[10px] md:text-xs text-white leading-none -rotate-2" style={{ fontFamily: "'Rock Salt', cursive" }}>
                   Cpt. Chaos
               </h1>
               <p className="text-[9px] text-blue-100 uppercase tracking-[0.25em] font-light ml-1 mt-1 text-shadow-sm opacity-80">Tree-D Christmas</p>
          </div>
      )}

      {settings.showCinemaSubtitles && <CinemaSubtitles />}
      {settings.showTypewriterCard && <TypewriterCard message={settings.typewriterMessage} />}

      {/* SETTINGS DRAWER */}
      <div className={`absolute top-0 right-0 h-full w-[320px] max-w-full pointer-events-auto transform transition-transform duration-300 z-50 flex flex-col ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
          <Panel className="h-full flex flex-col border-l border-white/10 rounded-l-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                  <span className="font-bold text-sm tracking-wide">Settings</span>
                  <div className="flex gap-2">
                      <button onClick={onResetSettings} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Reset"><RotateCw size={14} /></button>
                      <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
                  </div>
              </div>

              {/* Tabs */}
              <div className="flex p-2 gap-1 border-b border-white/10 bg-black/20">
                  {[
                      { id: 'env', label: 'World', icon: Globe },
                      { id: 'decor', label: 'Decor', icon: Gift },
                      { id: 'camera', label: 'Camera', icon: Camera }
                  ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}
                      >
                          <tab.icon size={12} /> {tab.label}
                      </button>
                  ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 pb-24">
                  {activeTab === 'env' && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                          <Section title="Quality" icon={Settings2}>
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

                          <Section title="Background" icon={Mountain}>
                              <OptionGrid 
                                  value={settings.bgType} 
                                  onChange={(v: any) => update('bgType', v)}
                                  options={[
                                      { id: 'mountains', label: 'Alps' },
                                      { id: 'forest', label: 'Forest' },
                                      { id: 'aurora', label: 'Aurora' },
                                      { id: 'stars', label: 'Night' },
                                  ]} 
                              />
                          </Section>

                          <Section title="Time" icon={Clock}>
                              <div className="flex gap-1 mb-2 bg-white/5 p-1 rounded-lg">
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
                                            className={`flex-1 py-1.5 rounded-md text-[9px] font-bold ${active ? 'bg-white text-black' : 'text-white/40'}`}
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
                                  <>
                                      <Slider label="Roughness" value={settings.groundRoughness} min={0} max={1} step={0.05} onChange={(v: number) => update('groundRoughness', v)} />
                                      <Slider label="Reflectivity" value={settings.groundReflection} min={0} max={1} step={0.05} onChange={(v: number) => update('groundReflection', v)} />
                                  </>
                              )}
                              <Toggle label="Cloud Shadows (Gobo)" value={settings.showGoboLighting} onChange={(v: boolean) => update('showGoboLighting', v)} />
                              <Slider label="Sunlight" value={settings.shadowIntensity} min={0} max={5} step={0.1} onChange={(v: number) => update('shadowIntensity', v)} />
                              <Slider label="Ambient" value={settings.sceneLight} min={0} max={3} step={0.1} onChange={(v: number) => update('sceneLight', v)} />
                          </Section>
                      </div>
                  )}

                  {activeTab === 'decor' && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                          <Section title="Tree Topper" icon={Crown}>
                              <div className="flex gap-2 items-center mb-2">
                                  <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => onLogoUpload(e.target.files)} />
                                  <OptionGrid 
                                      value={settings.topperType} 
                                      onChange={(v: any) => update('topperType', v)}
                                      options={[{ id: 'star', label: 'Star' }, { id: 'logo_spin', label: '3D Logo' }, { id: 'logo_holo', label: 'Holo' }]} 
                                  />
                              </div>
                              {(settings.topperType === 'logo_spin' || settings.topperType === 'logo_holo') && (
                                  <button onClick={() => logoInputRef.current?.click()} className="w-full py-2 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-lg text-xs font-bold hover:bg-blue-500/30">
                                      Upload Logo
                                  </button>
                              )}
                          </Section>

                          <Section title="Ornaments" icon={Gift}>
                             <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/50 transition-all mb-4">
                                Add Photos
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
                                  <div className="space-y-1">
                                      <Toggle label="Cinema Subtitles" value={settings.showCinemaSubtitles} onChange={(v: boolean) => update('showCinemaSubtitles', v)} />
                                  </div>

                                  <div className="space-y-1">
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
                              <div className="grid grid-cols-2 gap-2 mb-2">
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
                              <Toggle label="Depth of Field" value={settings.showBokeh} onChange={(v: boolean) => update('showBokeh', v)} />
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

      {/* BOTTOM FLOATING BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <Panel className="flex items-center gap-1 p-1 rounded-full px-2">
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
                  title="Add Memory"
               >
                   <Upload size={20} />
               </button>
               <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} accept="image/*" onClick={(e) => (e.currentTarget.value = '')} />

               <div className="w-px h-8 bg-white/10 mx-1" />

               {images.length > 0 && (
                   <button 
                      onClick={onToggleAutoRotate}
                      className={`p-3 rounded-full hover:bg-white/10 transition-colors ${isAutoRotate ? 'text-green-400' : 'text-white/60'}`}
                   >
                       {isAutoRotate ? <Pause size={20} /> : <Play size={20} />}
                   </button>
               )}

               <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-3 rounded-full hover:bg-white/10 transition-colors ${showSettings ? 'text-white bg-white/10' : 'text-white/60'}`}
               >
                   <Settings2 size={20} />
               </button>

               <button 
                  onClick={toggleFullscreen}
                  className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
               >
                   {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
               </button>
          </Panel>
      </div>

    </div>
  );
};

export default UI;