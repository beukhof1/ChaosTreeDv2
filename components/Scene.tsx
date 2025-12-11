import React, { Suspense, useState, useMemo, useRef, forwardRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Environment, Sparkles, MeshReflectorMaterial, Cloud, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, HueSaturation, BrightnessContrast, GodRays, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import Tree from './Tree';
import CameraRig from './CameraRig';
import { UploadedImage, RenderStyle, SceneSettings } from '../types';

// Procedural ground texture
const groundTexture = (() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,512,512);
        for(let i=0; i<40000; i++) {
             const x = Math.random() * 512;
             const y = Math.random() * 512;
             const alpha = Math.random() * 0.1;
             ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
             ctx.fillRect(x,y,2,2);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
})();

const createGroundNoise = () => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.fillStyle = '#404040';
        ctx.fillRect(0,0,128,128);
        for(let i=0; i<500; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const r = Math.random() * 20;
            const g = ctx.createRadialGradient(x,y,0, x,y,r);
            g.addColorStop(0, 'rgba(255,255,255,0.1)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x,y,r,0,Math.PI*2);
            ctx.fill();
        }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
}
const groundDisplacement = createGroundNoise();

const createGroundAlphaMap = () => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
    }
    const t = new THREE.CanvasTexture(canvas);
    return t;
};
const groundAlphaMap = createGroundAlphaMap();

const createToonGradient = () => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 4, 0);
        gradient.addColorStop(0.0, '#444444');
        gradient.addColorStop(0.4, '#444444');
        gradient.addColorStop(0.5, '#aaaaaa');
        gradient.addColorStop(0.7, '#aaaaaa');
        gradient.addColorStop(0.8, '#ffffff');
        gradient.addColorStop(1.0, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 4, 1);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
};
const toonGradient = createToonGradient();

const goboTexture = (() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 512, 512);
        for(let i=0; i<30; i++) {
             const x = Math.random() * 512;
             const y = Math.random() * 512;
             const r = 50 + Math.random() * 100;
             const g = ctx.createRadialGradient(x, y, 0, x, y, r);
             g.addColorStop(0, 'rgba(255, 255, 255, 1)');
             g.addColorStop(1, 'rgba(0, 0, 0, 0)');
             ctx.fillStyle = g;
             ctx.beginPath();
             ctx.arc(x, y, r, 0, Math.PI * 2);
             ctx.fill();
        }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
})();

const mistTexture = (() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if(ctx) {
         ctx.fillStyle = '#000000';
         ctx.fillRect(0,0,256,256);
         for(let i=0; i<200; i++) {
             const x = Math.random() * 256;
             const y = Math.random() * 256;
             const r = 10 + Math.random() * 40;
             const g = ctx.createRadialGradient(x, y, 0, x, y, r);
             g.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
             g.addColorStop(1, 'rgba(0, 0, 0, 0)');
             ctx.fillStyle = g;
             ctx.beginPath();
             ctx.arc(x, y, r, 0, Math.PI*2);
             ctx.fill();
         }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
})();

interface SceneProps {
  images: UploadedImage[];
  autoRotate: boolean;
  renderStyle: RenderStyle;
  settings: SceneSettings;
  onUpdateSettings: (s: any) => void;
  isProcessing: boolean;
}

// 3D Snow with rotation, turbulence, size and two types of particles
const FallingSnow: React.FC<{ count: number, speed: number, turbulence: number, size: number, diamondDust: boolean }> = React.memo(({ count, speed, turbulence, size, diamondDust }) => {
    const meshRef1 = useRef<THREE.InstancedMesh>(null);
    const meshRef2 = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Split count between primary (flat diamonds) and secondary (hexagons)
    const count1 = Math.floor(count * 0.7);
    const count2 = Math.max(0, count - count1);

    // --- SYSTEM 1 (Main) ---
    const pos1 = useMemo(() => new Float32Array(count1 * 3), [count1]);
    const spd1 = useMemo(() => new Float32Array(count1), [count1]);
    const rot1 = useMemo(() => new Float32Array(count1 * 3), [count1]);
    const phs1 = useMemo(() => new Float32Array(count1), [count1]);
    
    // --- SYSTEM 2 (Secondary) ---
    const pos2 = useMemo(() => new Float32Array(count2 * 3), [count2]);
    const spd2 = useMemo(() => new Float32Array(count2), [count2]);
    const rot2 = useMemo(() => new Float32Array(count2 * 3), [count2]);
    const phs2 = useMemo(() => new Float32Array(count2), [count2]);

    const speedMult = (speed / 50) * 1.0;
    const turbMult = (turbulence / 100) * 2.0;
    const sizeBase = 0.02 + (size / 100) * 0.15; 

    // Init function
    const initParticles = (c: number, pos: Float32Array, spd: Float32Array, rot: Float32Array, phs: Float32Array) => {
        for(let i=0; i<c; i++) {
            pos[i*3] = (Math.random() - 0.5) * 60;
            pos[i*3+1] = Math.random() * 40;
            pos[i*3+2] = (Math.random() - 0.5) * 60;
            spd[i] = 0.05 + Math.random() * 0.1;
            rot[i*3] = Math.random() * Math.PI;
            rot[i*3+1] = Math.random() * Math.PI;
            rot[i*3+2] = Math.random() * Math.PI;
            phs[i] = Math.random() * Math.PI * 2;
        }
    };

    useEffect(() => {
        initParticles(count1, pos1, spd1, rot1, phs1);
        initParticles(count2, pos2, spd2, rot2, phs2);
    }, [count1, count2]);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        
        // Update System 1
        if (meshRef1.current) {
            for(let i=0; i<count1; i++) {
                pos1[i*3+1] -= spd1[i] * speedMult;
                if (turbMult > 0) {
                    pos1[i*3] += Math.sin(t * 0.5 + phs1[i]) * 0.05 * turbMult;
                    pos1[i*3+2] += Math.cos(t * 0.3 + phs1[i]) * 0.05 * turbMult;
                }
                rot1[i*3] += delta * 0.5;
                rot1[i*3+1] += delta * 0.3;
                
                if (pos1[i*3+1] < -2) {
                    pos1[i*3+1] = 40;
                    pos1[i*3] = (Math.random() - 0.5) * 60;
                    pos1[i*3+2] = (Math.random() - 0.5) * 60;
                }
                dummy.position.set(pos1[i*3], pos1[i*3+1], pos1[i*3+2]);
                dummy.rotation.set(rot1[i*3], rot1[i*3+1], rot1[i*3+2]);
                const s = sizeBase + Math.sin(phs1[i]) * (sizeBase * 0.3);
                dummy.scale.set(s, s * 0.1, s); // Flattened crystal shape
                dummy.updateMatrix();
                meshRef1.current.setMatrixAt(i, dummy.matrix);
            }
            meshRef1.current.instanceMatrix.needsUpdate = true;
        }

        // Update System 2 (Hexagons - slightly floatier)
        if (meshRef2.current) {
            for(let i=0; i<count2; i++) {
                pos2[i*3+1] -= spd2[i] * speedMult * 0.9; // Slightly slower
                if (turbMult > 0) {
                    pos2[i*3] += Math.sin(t * 0.4 + phs2[i]) * 0.06 * turbMult;
                    pos2[i*3+2] += Math.cos(t * 0.2 + phs2[i]) * 0.06 * turbMult;
                }
                rot2[i*3] += delta * 0.3; // Slower rotation
                rot2[i*3+2] += delta * 0.2;
                
                if (pos2[i*3+1] < -2) {
                    pos2[i*3+1] = 40;
                    pos2[i*3] = (Math.random() - 0.5) * 60;
                    pos2[i*3+2] = (Math.random() - 0.5) * 60;
                }
                dummy.position.set(pos2[i*3], pos2[i*3+1], pos2[i*3+2]);
                dummy.rotation.set(rot2[i*3], rot2[i*3+1], rot2[i*3+2]);
                const s = sizeBase * 0.8 + Math.sin(phs2[i]) * (sizeBase * 0.2);
                dummy.scale.setScalar(s); // Uniform scale for hexagons
                dummy.updateMatrix();
                meshRef2.current.setMatrixAt(i, dummy.matrix);
            }
            meshRef2.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* Primary Snow (White Diamond Dust) */}
            <instancedMesh ref={meshRef1} args={[undefined, undefined, count1]} frustumCulled={false}>
                <octahedronGeometry args={[1, 0]} /> 
                {diamondDust ? (
                     <meshStandardMaterial 
                        color="#e0f7fa" 
                        roughness={0.1} 
                        metalness={1.0} 
                        emissive="#00ffff" 
                        emissiveIntensity={0.2}
                     />
                ) : (
                     <meshStandardMaterial 
                        color="white" 
                        roughness={0.1} 
                        metalness={0.1} 
                        emissive="white" 
                        emissiveIntensity={0.2} 
                     />
                )}
            </instancedMesh>

            {/* Secondary Snow (Pale Blue Hexagons) */}
            <instancedMesh ref={meshRef2} args={[undefined, undefined, count2]} frustumCulled={false}>
                <circleGeometry args={[1, 6]} />
                <meshStandardMaterial 
                    color="#e0f2fe" // Very pale blue
                    roughness={0.2} 
                    metalness={0.5} 
                    emissive="#a5f3fc" 
                    emissiveIntensity={0.15} 
                    transparent
                    opacity={0.9}
                    side={THREE.DoubleSide}
                />
            </instancedMesh>
        </group>
    );
});

const GoboLight: React.FC = () => {
    const tex = goboTexture;
    const ref = useRef<THREE.SpotLight>(null);
    useFrame((state) => {
        if (ref.current && ref.current.map) {
             ref.current.map.offset.x = state.clock.elapsedTime * 0.02;
             ref.current.map.rotation = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <spotLight 
            ref={ref}
            position={[10, 25, 10]} 
            angle={0.6} 
            penumbra={0.5} 
            intensity={2.0} 
            castShadow 
            shadow-mapSize={[512, 512]}
            map={tex || undefined}
        />
    )
}

const GroundMist: React.FC = () => {
    const tex = mistTexture;
    const ref = useRef<THREE.Mesh>(null);
    if(tex) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
    }

    useFrame((state) => {
        if (ref.current && tex) {
            tex.offset.x = state.clock.elapsedTime * 0.03;
            tex.offset.y = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <mesh position={[0, -2.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial 
                map={tex || undefined} 
                transparent 
                opacity={0.4} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
                color="#b0d0ff"
            />
        </mesh>
    )
}


const Effects: React.FC<{ settings: SceneSettings, renderStyle: RenderStyle }> = ({ settings, renderStyle }) => {
    const bloomVal = (settings.magic / 100) * 1.1;
    
    // Adjusted vignette to be more subtle/wider by default but deeper darkness
    const vignetteOffset = 0.2 + (settings.vignetteRoundness / 100) * 0.3; 
    const vignetteDarkness = (settings.vignetteIntensity / 100) * 1.2; // Increased multiplier for more intensity

    const grainVal = renderStyle === 'vintage' ? 0.3 : (renderStyle === 'neon' ? 0.2 : 0);
    const isHighQuality = settings.quality === 'high';
    const enableDoF = isHighQuality && settings.showBokeh;

    return (
        <EffectComposer key={settings.quality} multisampling={0} disableNormalPass={false} frameBufferType={THREE.HalfFloatType}>
            <BrightnessContrast brightness={0.0} contrast={0.1} />
            <Bloom luminanceThreshold={0.55} intensity={bloomVal} radius={0.75} mipmapBlur />
            {enableDoF ? (
                 <DepthOfField 
                    focusDistance={0.035} // Adjusted to prevent close-up background disappearance (was 0.025)
                    focalLength={0.02}    // Reduced focal length for wider focus plane
                    bokehScale={2}        // Reduced bokeh scale from 4 to 2 to make background visible
                    height={480} 
                 />
            ) : null}
            <Vignette darkness={vignetteDarkness} offset={vignetteOffset} eskil={false} />
            {grainVal > 0 ? <Noise opacity={grainVal} /> : null}
            {renderStyle === 'vintage' ? <HueSaturation saturation={-0.4} hue={0.05} /> : null}
            {renderStyle === 'neon' ? <HueSaturation saturation={0.4} /> : null}
        </EffectComposer>
    );
};

const BackgroundGradient: React.FC<{ baseColor: string }> = React.memo(({ baseColor }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const colorRef = useRef(baseColor);

    useEffect(() => { colorRef.current = baseColor; }, [baseColor]);

    const uniforms = useMemo(() => ({
        uColorTop: { value: new THREE.Color(baseColor) },
        uColorBottom: { value: new THREE.Color(baseColor) }
    }), []); 

    useFrame(() => {
        if (!materialRef.current) return;
        const targetColor = new THREE.Color(colorRef.current);
        const topTarget = targetColor.clone().lerp(new THREE.Color('#000000'), 0.5);
        const bottomTarget = targetColor.clone().lerp(new THREE.Color('#ffffff'), 0.2);
        materialRef.current.uniforms.uColorTop.value.lerp(topTarget, 0.1);
        materialRef.current.uniforms.uColorBottom.value.lerp(bottomTarget, 0.1);
    });
    
    return (
        <mesh scale={[900, 900, 900]}> 
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial 
                ref={materialRef}
                side={THREE.BackSide}
                uniforms={uniforms}
                vertexShader={`varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`}
                fragmentShader={`uniform vec3 uColorTop; uniform vec3 uColorBottom; varying vec3 vWorldPosition; void main() { vec3 dir = normalize(vWorldPosition); float h = dir.y; float mixVal = smoothstep(-0.2, 0.6, h); gl_FragColor = vec4( mix( uColorBottom, uColorTop, mixVal ), 1.0 ); }`}
            />
        </mesh>
    );
});

const MountainLights: React.FC<{ isNight: boolean }> = React.memo(({ isNight }) => {
    const count = 100;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    useEffect(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
             // Scatter lights on lower parts of mountains
             const angle = Math.random() * Math.PI * 2;
             const r = 50 + Math.random() * 150; // Distance
             const x = Math.cos(angle) * r;
             const z = Math.sin(angle) * r;
             const y = -4 + Math.random() * 5; // Low altitude
             
             dummy.position.set(x, y, z);
             const s = 0.5 + Math.random() * 1.5;
             dummy.scale.setScalar(s);
             dummy.updateMatrix();
             meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Flicker intensity
        const t = state.clock.elapsedTime;
        const opacity = isNight ? 0.8 + Math.sin(t * 5) * 0.2 : 0;
        // We can't easily animate opacity per instance without custom shader or attributes, 
        // so we just toggle visible or use scale for now
        meshRef.current.visible = isNight;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.2, 4, 4]} />
            <meshBasicMaterial color="#ffaa00" />
        </instancedMesh>
    )
})

const DistantForest: React.FC<{ isNight: boolean }> = React.memo(({ isNight }) => {
    const count = 500;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 60 + Math.random() * 80;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            dummy.position.set(x, -3.0, z);
            const s = 3 + Math.random() * 3;
            dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <coneGeometry args={[1, 4, 4]} />
            <meshToonMaterial color={isNight ? "#050a05" : "#0f172a"} />
        </instancedMesh>
    )
});

const MountainsBackground: React.FC = React.memo(() => {
    const count = 50;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const geometry = useMemo(() => {
        const geo = new THREE.ConeGeometry(1, 1, 4, 1);
        geo.translate(0, 0.5, 0);
        const count = geo.attributes.position.count;
        const colors = new Float32Array(count * 3);
        const pos = geo.attributes.position;
        const rockColor = new THREE.Color("#4a4a5a");
        const snowColor = new THREE.Color("#ffffff");
        
        for(let i=0; i<count; i++) {
             const y = pos.getY(i);
             // Sharper, lower snow line
             if(y > 0.4 + Math.random() * 0.1) {
                 colors[i*3] = snowColor.r; colors[i*3+1] = snowColor.g; colors[i*3+2] = snowColor.b;
             } else {
                 colors[i*3] = rockColor.r; colors[i*3+1] = rockColor.g; colors[i*3+2] = rockColor.b;
             }
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geo;
    }, []);

    useEffect(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = 200 + Math.random() * 50;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const w = 50 + Math.random() * 60;
            const h = 60 + Math.random() * 60; 
            dummy.position.set(x, -5, z);
            dummy.scale.set(w, h, w);
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [count]);

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
             <meshToonMaterial vertexColors />
        </instancedMesh>
    )
});

const AuroraBackground: React.FC = React.memo(() => {
    const ref = useRef<THREE.Mesh>(null);
    const ref2 = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.05;
        if (ref2.current) ref2.current.rotation.y = -clock.getElapsedTime() * 0.03;
    });

    return (
        <group>
            <mesh scale={[900, 900, 900]}> 
                <sphereGeometry args={[1, 32, 32]} />
                <shaderMaterial 
                    side={THREE.BackSide}
                    uniforms={{ uColorTop: { value: new THREE.Color("#0f172a") }, uColorBottom: { value: new THREE.Color("#2e1065") } }}
                    vertexShader={`varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`}
                    fragmentShader={`uniform vec3 uColorTop; uniform vec3 uColorBottom; varying vec3 vWorldPosition; void main() { vec3 dir = normalize(vWorldPosition); float h = dir.y; float mixVal = smoothstep(-0.2, 0.6, h); gl_FragColor = vec4( mix( uColorBottom, uColorTop, mixVal ), 1.0 ); }`}
                />
            </mesh>
            <mesh position={[0, 10, -50]}>
                <sphereGeometry args={[40, 32, 32]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <group position={[0, 20, 0]}>
                <mesh ref={ref} scale={[200, 100, 200]}>
                    <torusGeometry args={[1, 0.5, 16, 100]} />
                    <meshBasicMaterial color="#00ff88" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
                <mesh ref={ref2} scale={[250, 120, 250]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[1, 0.4, 16, 100]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>
        </group>
    )
});

const TimeController: React.FC<{ settings: SceneSettings, onUpdate: (s: any) => void }> = ({ settings, onUpdate }) => {
    const direction = useRef(1);
    useFrame((_, delta) => {
        if (settings.isTimeAuto) {
            let newTime = settings.timeOfDay;
            const speedFactor = 0.15; 
            if (settings.timeLoopMode === 'pingpong') {
                newTime += delta * speedFactor * direction.current;
                if (newTime >= 18) { newTime = 18; direction.current = -1; } 
                else if (newTime <= 7) { newTime = 7; direction.current = 1; }
            } else {
                newTime += delta * speedFactor;
                if (newTime > 24) newTime = 0;
            }
            onUpdate((p: SceneSettings) => ({ ...p, timeOfDay: newTime }));
        }
    });
    return null;
}

const Scene: React.FC<SceneProps> = ({ images, autoRotate, renderStyle, settings, onUpdateSettings, isProcessing }) => {
  const [targets, setTargets] = useState<THREE.Vector3[]>([]);
  
  const qualitySettings = useMemo(() => {
      switch(settings.quality) {
          case 'fast': return { dpr: 0.6, shadows: false };
          case 'balanced': return { dpr: 0.8, shadows: true };
          case 'high': default: return { dpr: [1, 1.5], shadows: true };
      }
  }, [settings.quality]);

  const snowCount = Math.floor((settings.snow / 100) * 1000); 
  const sparklesCount = Math.floor((settings.sparkles / 100) * 800); 
  const fogDensity = (settings.fog / 100) * 0.04;             
  const rotationSpeed = (settings.speed / 100) * 0.2;

  const time = settings.timeOfDay;
  const sunAngle = ((time - 6) / 12) * Math.PI;
  const sunY = Math.sin(sunAngle) * 30;
  const sunZ = Math.cos(sunAngle) * 30;
  
  const isNight = time < 6 || time > 19;
  
  const lerpedSkyColor = useMemo(() => {
    const userColor = new THREE.Color(settings.skyColor);
    const midnight = new THREE.Color('#020617');
    const sunrise = new THREE.Color('#f97316');
    const noon = userColor;
    const sunset = new THREE.Color('#a855f7');
    const colors = [
        { t: 0, c: midnight }, { t: 5, c: midnight.clone().lerp(sunrise, 0.3) }, 
        { t: 7, c: sunrise }, { t: 10, c: noon.clone().lerp(new THREE.Color('#ffffff'), 0.2) }, 
        { t: 12, c: noon }, { t: 15, c: noon }, { t: 18, c: sunset }, 
        { t: 20, c: new THREE.Color('#1e1b4b') }, { t: 24, c: midnight }, 
    ];
    let c1 = colors[0];
    let c2 = colors[colors.length - 1];
    for (let i = 0; i < colors.length - 1; i++) {
        if (time >= colors[i].t && time < colors[i+1].t) {
            c1 = colors[i]; c2 = colors[i+1]; break;
        }
    }
    const alpha = (time - c1.t) / (c2.t - c1.t);
    return c1.c.clone().lerp(c2.c, alpha).getStyle();
  }, [time, settings.skyColor]);

  const sceneGroupY = -1.8;
  const treeLocalY = 2.3;
  
  // Custom colors for the magic sparkles
  const sparkleColors = useMemo(() => ['#87CEFA', '#00BFFF', '#FFD700'], []);

  return (
    <Canvas
      dpr={qualitySettings.dpr as any}
      gl={{ alpha: false, stencil: false, depth: true, antialias: false, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
      shadows={qualitySettings.shadows}
      camera={{ position: [0, 6, 24], fov: 45 }}
    >
      <TimeController settings={settings} onUpdate={onUpdateSettings} />

      {/* Lock environment to prevent flashing, just adjust intensity */}
      <Environment preset={'park'} background={false} blur={0.8} environmentIntensity={settings.exposure * (isNight ? 0.4 : 1)} />

      {qualitySettings.shadows ? (
          <directionalLight position={[0, Math.max(5, sunY), Math.max(10, sunZ)]} intensity={settings.shadowIntensity * (isNight ? 0.1 : 1)} castShadow shadow-bias={-0.0005} shadow-mapSize={[1024, 1024]} />
      ) : (
           <directionalLight position={[0, Math.max(5, sunY), Math.max(10, sunZ)]} intensity={settings.shadowIntensity * (isNight ? 0.1 : 1)} />
      )}
      
      <hemisphereLight intensity={settings.sceneLight * (isNight ? 0.3 : 0.7)} color={lerpedSkyColor} groundColor="#050505" />
      
      {/* Invisible Spotlights for Night Tree Illumination - Always mounted, intensity animated */}
      <group>
            <spotLight position={[10, 10, 10]} target-position={[0, 4, 0]} angle={0.6} penumbra={1} intensity={isNight ? 1.5 : 0} distance={50} color="#aaddff" />
            <spotLight position={[-10, 10, 10]} target-position={[0, 4, 0]} angle={0.6} penumbra={1} intensity={isNight ? 1.5 : 0} distance={50} color="#aaddff" />
            <spotLight position={[0, 10, -10]} target-position={[0, 4, 0]} angle={0.6} penumbra={1} intensity={isNight ? 1.0 : 0} distance={50} color="#ccddee" />
      </group>

      {settings.showGoboLighting && <GoboLight />}

      {/* Backgrounds */}
      {settings.bgType === 'stars' ? <Stars radius={300} depth={50} count={6000} factor={4} saturation={0} fade speed={1} /> : null}
      {(settings.bgType === 'mountains' || settings.bgType === 'forest') ? <BackgroundGradient baseColor={lerpedSkyColor} /> : null}
      {settings.bgType === 'mountains' ? (
        <>
            <MountainsBackground />
            <MountainLights isNight={isNight} />
        </>
      ) : null}
      {settings.bgType === 'forest' ? <DistantForest isNight={isNight} /> : null}
      {settings.bgType === 'aurora' ? (
          <>
             <Stars radius={300} depth={50} count={2000} factor={4} fade />
             <AuroraBackground />
          </>
      ) : null}

      <fogExp2 attach="fog" args={['#000000', 0]} color={lerpedSkyColor} density={fogDensity * 0.8} />
      {(settings.bgType === 'mountains' || settings.bgType === 'forest' || settings.bgType === 'aurora') ? <DistantForest isNight={isNight} /> : null}
      
      <group position={[0, sceneGroupY, 0]}>
         <Suspense fallback={null}>
             <Tree 
                images={images} 
                onUpdateTargets={setTargets}
                position={[0, treeLocalY, 0]} 
                rootOffset={[0, sceneGroupY, 0]}
                color={settings.treeColor}
                isNight={isNight}
                flickerIntensity={settings.flicker}
                showTreeSkirt={settings.showTreeSkirt}
                showSnowOnBranches={settings.showSnowOnBranches}
                topperType={settings.topperType}
                logoUrl={settings.logoUrl}
             />
         </Suspense>
         
         {/* Ice Floor */}
         <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={qualitySettings.shadows} position={[0, -3.1, 0]}>
            <circleGeometry args={[300, 64]} /> 
            {settings.showGroundReflections ? (
                 <MeshReflectorMaterial
                    blur={[400, 100]} // Enhanced blur for ice
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={40} // Subtle reflection
                    roughness={settings.groundRoughness} // Icy/Frosty
                    depthScale={1}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#d0e8ff" // Pale Ice blue
                    metalness={0.1}
                    mirror={settings.groundReflection} // Reflection intensity
                    distortion={0.3} // Surface unevenness
                    distortionMap={groundTexture || undefined}
                 />
            ) : (
                <meshToonMaterial color="#ffffff" gradientMap={toonGradient} map={groundTexture} bumpMap={groundTexture} bumpScale={0.05} displacementMap={groundDisplacement || undefined} displacementScale={0.4} alphaMap={groundAlphaMap} transparent />
            )}
         </mesh>
         
         {settings.showGroundFog && <GroundMist />}
         
         {sparklesCount > 0 ? (
            <Sparkles 
                size={0.5} 
                scale={[20, 15, 20]} 
                position={[0, 5, 0]} 
                count={sparklesCount} 
                speed={0.4} 
                opacity={1.0} 
                color={sparkleColors} 
                noise={0.5}
            />
         ) : null}
         
         {snowCount > 0 ? (
            <FallingSnow 
                count={Math.min(snowCount, 500)} 
                speed={settings.snowSpeed} 
                turbulence={settings.snowTurbulence}
                size={settings.snowSize}
                diamondDust={settings.showDiamondDust}
            />
         ) : null}
    </group>
    
    {!isProcessing ? <Effects renderStyle={renderStyle} settings={settings} /> : null}
    <CameraRig active={autoRotate} targets={targets} speedConfig={rotationSpeed} />
    </Canvas>
  );
};

export default Scene;