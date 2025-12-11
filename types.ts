

export interface OrnamentData {
  id: string;
  position: [number, number, number];
  color: string;
}

export interface UploadedImage {
  id: string;
  url: string;
}

export type RenderStyle = 'cinematic' | 'studio' | 'cozy' | 'neon' | 'arctic' | 'vintage';

export interface SceneSettings {
  // 0. SYSTEM
  quality: 'high' | 'balanced' | 'fast';

  // 1. LIGHTING & SKY
  timeOfDay: number;      // 0-24
  isTimeAuto: boolean;
  timeLoopMode: 'cycle' | 'pingpong'; 
  bgType: 'mountains' | 'forest' | 'aurora' | 'stars'; 
  skyColor: string;       // Base background color
  exposure: number;       // 0-5 (Global brightness)
  shadowIntensity: number;// 0-5 (Sunlight strength)
  sceneLight: number;     // 0-5 (Ambient/Hemisphere fill)
  
  // 2. WORLD
  treeColor: string;      // Hex
  snow: number;           // 0-100 (Particle count)
  snowSpeed: number;      // 0-100 (Fall speed)
  snowTurbulence: number; // 0-100 (Wind/Chaos)
  snowSize: number;       // 0-100 (Flake size)
  fog: number;            // 0-100 (Mist density)
  showGroundReflections: boolean;
  groundRoughness: number; // 0-1 (Ice roughness)
  groundReflection: number; // 0-1 (Mirror intensity)
  
  // 3. MAGIC & EFFECTS
  flicker: number;    // 0-100 (Tree LED intensity/speed)
  sparkles: number;   // 0-100 (Magic glowing pixels)
  magic: number;      // 0-100 (Bloom)
  
  // NEW VISUALS
  showGroundFog: boolean;
  showDiamondDust: boolean;
  showGoboLighting: boolean;
  
  // 4. LENS
  vignetteIntensity: number; // 0-100
  vignetteRoundness: number; // 0-100
  speed: number;      // 0-100 (Rotation speed)
  
  // 6. DECOR SETTINGS
  topperType: 'star' | 'logo_spin' | 'logo_holo'; 
  logoUrl: string | null;                         

  // 7. COZY EXTRAS
  showTreeSkirt: boolean;
  
  showSnowOnBranches: boolean;
  showBokeh: boolean;

  // 8. GREETINGS
  showCinemaSubtitles: boolean;
  showTypewriterCard: boolean;
  typewriterMessage: string;
}