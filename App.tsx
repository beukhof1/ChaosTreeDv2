import React, { useState, useCallback, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { UploadedImage, RenderStyle, SceneSettings } from './types';

// FRESH DEFAULTS
export const DEFAULT_SETTINGS: SceneSettings = {
  quality: 'high',    // Default to high

  timeOfDay: 12,      // Noon start
  isTimeAuto: true,   // Auto time enabled
  timeLoopMode: 'pingpong', // Day Loop mode
  bgType: 'mountains',
  skyColor: '#47d4f0', // New Sky Tint
  exposure: 1.0,
  shadowIntensity: 1.5, // Sunlight
  sceneLight: 1.5,    // Ambient
  treeColor: '#2e8a84', // New Tree Color
  
  snow: 100,           // Max snow
  snowSpeed: 40,      // Faster
  snowTurbulence: 30, // More wind
  snowSize: 40,       // Larger flakes
  fog: 15,            // Global fog
  showGroundReflections: false, 
  groundRoughness: 0.15,
  groundReflection: 0.5,

  flicker: 0,         
  sparkles: 50,       // More magic sparkles
  magic: 25,          // Reduced Bloom
  
  // New Visuals Default Off
  showGroundFog: false,
  showDiamondDust: false,
  showGoboLighting: false,
  
  vignetteIntensity: 50,
  vignetteRoundness: 50,
  speed: 12,          // Slow rotation
  
  topperType: 'star',
  logoUrl: null,

  // Cozy Extras
  showTreeSkirt: true, 
  
  showSnowOnBranches: false,
  showBokeh: false,

  // Greetings
  showCinemaSubtitles: true, // Enabled by default
  showTypewriterCard: false,
  typewriterMessage: 'Wishing you a season of joy and wonder...',
};

const STORAGE_KEY = 'memory-tree-save-v8'; // Bump version to force new defaults

const App: React.FC = () => {
  // Load initial state from local storage
  const [initialState] = useState(() => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored) : {};
      } catch (e) {
          console.warn('Failed to load local storage:', e);
          return {};
      }
  });

  const [images, setImages] = useState<UploadedImage[]>(initialState.images || []);
  const [autoRotate, setAutoRotate] = useState(initialState.autoRotate ?? true);
  const [renderStyle, setRenderStyle] = useState<RenderStyle>(initialState.renderStyle || 'cinematic');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Merge defaults with saved settings to ensure all keys exist
  const [sceneSettings, setSceneSettings] = useState<SceneSettings>({
      ...DEFAULT_SETTINGS,
      ...(initialState.sceneSettings || {})
  });

  // Save to local storage whenever state changes
  useEffect(() => {
      const timeout = setTimeout(() => {
          try {
              const saveData = {
                  images,
                  autoRotate,
                  renderStyle,
                  sceneSettings
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
          } catch (e) {
              console.warn('Failed to save to local storage (quota exceeded?):', e);
          }
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeout);
  }, [images, autoRotate, renderStyle, sceneSettings]);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    // 1. Disable expensive rendering effects to free up GPU for texture upload
    setIsProcessing(true);

    const fileArray = Array.from(files);
    const newImages: UploadedImage[] = [];
    
    // Process images: Resize to max 512px Square (Cover Crop) - Increased resolution
    const processFile = (file: File): Promise<UploadedImage> => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const TARGET_SIZE = 512; 
                const canvas = document.createElement('canvas');
                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;
                const ctx = canvas.getContext('2d');
                
                let dominantColor = '#b0b0b0';

                if (ctx) {
                    // Calculate "Cover" fit to ensure square center crop
                    const ratio = Math.max(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
                    const w = img.width * ratio;
                    const h = img.height * ratio;
                    const offsetX = (TARGET_SIZE - w) / 2;
                    const offsetY = (TARGET_SIZE - h) / 2;

                    ctx.drawImage(img, offsetX, offsetY, w, h);
                    
                    // Extract dominant average color for ornament blending
                    try {
                        // Sample center area for better accuracy
                        const sampleSize = 50;
                        const p = ctx.getImageData((TARGET_SIZE-sampleSize)/2, (TARGET_SIZE-sampleSize)/2, sampleSize, sampleSize).data;
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let i = 0; i < p.length; i += 4) {
                            r += p[i];
                            g += p[i + 1];
                            b += p[i + 2];
                            count++;
                        }
                        r = Math.floor(r / count);
                        g = Math.floor(g / count);
                        b = Math.floor(b / count);
                        dominantColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                    } catch (e) {
                        console.warn('Error extracting color', e);
                    }

                    // 0.85 quality saves memory bandwidth
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve({
                        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                        url: dataUrl,
                        dominantColor
                    });
                } else {
                    resolve({
                         id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                         url: url,
                         dominantColor: '#b0b0b0'
                    });
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ id: 'error', url: '', dominantColor: '#505050' }); 
            };
            img.src = url;
        });
    };

    // 2. Process sequentially
    for (const file of fileArray) {
        try {
            const uploadedImg = await processFile(file);
            if (uploadedImg.url) {
                newImages.push(uploadedImg);
            }
        } catch (e) {
            console.error("Failed to process image", e);
        }
    }

    setImages((prev) => [...prev, ...newImages]);
    
    // 3. Re-enable effects after a longer delay
    setTimeout(() => {
        setIsProcessing(false);
    }, 800);

  }, []);

  const handleLogoUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSceneSettings(prev => ({ ...prev, logoUrl: url }));
  }, []);

  const toggleAutoRotate = () => setAutoRotate(!autoRotate);
  
  const handleResetSettings = () => {
      setSceneSettings(DEFAULT_SETTINGS);
      setRenderStyle('cinematic');
  }

  const handleStyleChange = (style: RenderStyle) => {
    setRenderStyle(style);
    
    switch (style) {
        case 'studio':
            setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 12,
                bgType: 'mountains', // Default safest
                exposure: 1.2,
                shadowIntensity: 1.0,
                sceneLight: 1.5,
                snow: 0,
                fog: 0,
                flicker: 0,
                sparkles: 0,
                magic: 10,
                showGroundFog: false,
                showDiamondDust: false,
                showGoboLighting: false,
                vignetteIntensity: 20,
                vignetteRoundness: 50,
                showGroundReflections: true,
                groundRoughness: 0.1,
                groundReflection: 0.8,
            }));
            break;
        case 'cinematic':
            setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 18, 
                bgType: 'mountains',
                exposure: 0.8,
                shadowIntensity: 2.0,
                sceneLight: 0.5,
                snow: 20,
                fog: 15,
                flicker: 60,
                sparkles: 40,
                magic: 40,
                showGroundFog: true,
                showDiamondDust: true,
                showGoboLighting: true,
                vignetteIntensity: 60,
                vignetteRoundness: 50,
                showGroundReflections: false,
            }));
            break;
        case 'cozy':
            setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 17, 
                bgType: 'mountains',
                exposure: 0.9,
                shadowIntensity: 1.5,
                sceneLight: 1.0,
                snow: 60,
                fog: 20,
                flicker: 80,
                sparkles: 60,
                magic: 60,
                showGroundFog: false,
                showDiamondDust: false,
                showGoboLighting: false,
                vignetteIntensity: 40,
                vignetteRoundness: 70,
                showGroundReflections: false,
            }));
            break;
        case 'neon':
            setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 0, 
                bgType: 'stars',
                exposure: 0.7,
                shadowIntensity: 0.5,
                sceneLight: 0.8,
                snow: 10,
                fog: 30,
                flicker: 100,
                sparkles: 80,
                magic: 90,
                showGroundFog: true,
                showDiamondDust: false,
                showGoboLighting: false,
                vignetteIntensity: 50,
                vignetteRoundness: 50,
                showGroundReflections: true,
                groundRoughness: 0.2,
                groundReflection: 0.6,
            }));
            break;
        case 'arctic':
            setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 8, 
                bgType: 'mountains',
                exposure: 1.3,
                shadowIntensity: 0.8,
                sceneLight: 2.0,
                snow: 100,
                fog: 60,
                flicker: 30,
                sparkles: 20,
                magic: 30,
                showGroundFog: true,
                showDiamondDust: true,
                showGoboLighting: false,
                vignetteIntensity: 30,
                vignetteRoundness: 40,
                showGroundReflections: true,
                groundRoughness: 0.05,
                groundReflection: 0.7,
            }));
            break;
        case 'vintage':
             setSceneSettings(prev => ({
                ...prev,
                timeOfDay: 14,
                bgType: 'forest',
                exposure: 0.9,
                shadowIntensity: 1.0,
                sceneLight: 1.2,
                snow: 10,
                fog: 25,
                flicker: 40,
                sparkles: 30,
                magic: 20,
                showGroundFog: false,
                showDiamondDust: false,
                showGoboLighting: false,
                vignetteIntensity: 80,
                vignetteRoundness: 80,
                showGroundReflections: false,
            }));
            break;
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene 
            images={images} 
            autoRotate={autoRotate}
            renderStyle={renderStyle}
            settings={sceneSettings}
            onUpdateSettings={setSceneSettings}
            isProcessing={isProcessing}
        />
      </div>
      
      <div className="absolute inset-0 z-50 pointer-events-none">
        <UI 
          onUpload={handleImageUpload}
          onLogoUpload={handleLogoUpload}
          images={images} 
          isAutoRotate={autoRotate}
          onToggleAutoRotate={toggleAutoRotate}
          renderStyle={renderStyle}
          setRenderStyle={handleStyleChange}
          settings={sceneSettings}
          onUpdateSettings={setSceneSettings}
          onResetSettings={handleResetSettings}
        />
      </div>
    </div>
  );
};

export default App;