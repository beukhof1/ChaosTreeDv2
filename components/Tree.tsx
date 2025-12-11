
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Instances, Instance, useTexture, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import Ornament from './Ornament';
import { UploadedImage } from '../types';

interface TreeProps {
  images: UploadedImage[];
  onUpdateTargets?: (targets: THREE.Vector3[]) => void;
  rootOffset?: [number, number, number];
  position?: [number, number, number];
  color?: string;
  flickerIntensity?: number;
  isNight?: boolean;
  // Extras
  showTreeSkirt?: boolean;
  showSnowOnBranches?: boolean;
  // Topper
  topperType?: 'star' | 'logo_spin' | 'logo_holo';
  logoUrl?: string | null;
}

interface TreeLayerProps {
    position: [number, number, number]; 
    scale: number; 
    radius: number;
    height: number;
    startGlobalIndex: number;
    occupiedSlots: Map<number, UploadedImage>;
    ornamentCount: number;
    startAngle: number;
    color: string;
    texture?: THREE.Texture;
    isNight?: boolean;
    layerIndex: number; 
    isSnowy?: boolean;
}

const noiseTexture = (() => {
    if (typeof document === 'undefined') return null;
    const size = 512; 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(x, y, 1, 1);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2); 
    return texture;
})();

const fabricTexture = (() => {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#600000'; // Dark red base
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for(let i=0; i<size; i+=3) ctx.fillRect(0, i, size, 1);
        for(let i=0; i<size; i+=3) ctx.fillRect(i, 0, 1, size);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for(let i=0; i<30000; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 2); 
    texture.anisotropy = 4;
    return texture;
})();

const scanlineTexture = (() => {
    if (typeof document === 'undefined') return null;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0,0,1,size);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; 
        for(let i=0; i<size; i+=4) ctx.fillRect(0, i, 1, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
})();

const createStylizedTreeGeometry = (radius: number, height: number, isSnowy: boolean) => {
    const r = Math.max(0.1, radius || 1);
    const h = Math.max(0.1, height || 1);
    const segments = 32; 
    const heightSegments = 24; 
    
    const geometry = new THREE.CylinderGeometry(0.01, r, h, segments, heightSegments, true);
    
    const posAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    const colors = new Float32Array(posAttribute.count * 3);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);

    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        let yNorm = (vertex.y + (h / 2)) / h;
        yNorm = Math.max(0, Math.min(1, yNorm || 0));
        
        let intensity = 1.3 - (yNorm * 0.9); 
        let rVal = intensity; let gVal = intensity; let bVal = intensity;

        // Apply snow to the upper surfaces of the cone segments
        if (isSnowy && yNorm > 0.6) {
             rVal = 1.0; gVal = 1.0; bVal = 1.0;
        }
        
        colorAttribute.setXYZ(i, rVal, gVal, bVal);
        const flare = Math.pow(1 - yNorm, 1.4); 
        const angle = Math.atan2(vertex.z, vertex.x);
        const currentBaseRadius = r * flare;
        vertex.x = Math.cos(angle) * currentBaseRadius;
        vertex.z = Math.sin(angle) * currentBaseRadius;

        if (yNorm < 0.12) {
            const angleIndex = Math.round((angle / (Math.PI * 2)) * segments);
            const influence = 1 - (yNorm / 0.12);
            if (angleIndex % 2 !== 0) {
                vertex.y += h * 0.12 * influence; 
                vertex.x *= (1 - 0.15 * influence); 
                vertex.z *= (1 - 0.15 * influence); 
            } else {
                vertex.x *= (1 + 0.08 * influence);
                vertex.z *= (1 + 0.08 * influence);
            }
        }
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.setAttribute('color', colorAttribute);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere(); 
    return geometry;
};

const getOrnamentPosition = (layerIdx: number, ornIdx: number, total: number, radius: number, height: number, startAngle: number) => {
    const seed = layerIdx * 137 + ornIdx * 928;
    const rand = (Math.sin(seed) * 10000) % 1; 
    const rand2 = (Math.cos(seed) * 10000) % 1;
    const baseAngle = startAngle + (ornIdx * (Math.PI * 2 / total));
    const jitter = (rand - 0.5) * 0.8; 
    const angle = baseAngle + jitter;
    // Lower half placement (points) (approx bottom 20% of layer)
    const t = 0.05 + Math.abs(rand2) * 0.15; // 0.05 - 0.20 range from bottom
    const yPos = -height/2 + (t * height);
    
    // Calculate radius at this height based on cone flare
    const yNorm = (yPos + height/2) / height;
    const flare = Math.pow(1 - Math.max(0, Math.min(1, yNorm)), 1.4);
    const surfaceRadius = radius * flare;
    
    // Push out further to prevent clipping (0.4 extra offset)
    const rPos = surfaceRadius + 0.4; 
    
    const x = Math.cos(angle) * rPos;
    const z = Math.sin(angle) * rPos;
    const rotY = -angle + Math.PI / 2;
    return { x, y: yPos, z, rotY };
};

const TreeLayer: React.FC<TreeLayerProps> = ({ 
    position, scale, radius, height, occupiedSlots, startGlobalIndex, ornamentCount, startAngle, color, texture, isNight, layerIndex, isSnowy 
}) => {
    const effectiveRadius = radius * scale;
    const effectiveHeight = height * scale;
    const geometry = useMemo(() => createStylizedTreeGeometry(effectiveRadius, effectiveHeight, !!isSnowy), [effectiveRadius, effectiveHeight, isSnowy]);
    const ornamentPositions = useMemo(() => {
        const positions = [];
        for(let i=0; i<ornamentCount; i++) {
            positions.push(getOrnamentPosition(layerIndex, i, ornamentCount, effectiveRadius, effectiveHeight, startAngle));
        }
        return positions;
    }, [ornamentCount, startAngle, effectiveHeight, effectiveRadius, layerIndex]);

    return (
        <group position={position}>
            <mesh geometry={geometry} receiveShadow>
                <meshToonMaterial color={color} vertexColors emissive={isNight ? color : "#081c08"} emissiveIntensity={isNight ? 0.4 : 0.2} bumpMap={texture || null} bumpScale={0.05} />
            </mesh>
            {ornamentPositions.map((pos, i) => {
                const globalIdx = startGlobalIndex + i;
                const imgData = occupiedSlots.get(globalIdx);
                return (
                    <group key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, pos.rotY, 0]}>
                        <Ornament data={imgData} />
                    </group>
                );
            })}
        </group>
    );
};

// Updated filler colors: Light Blue, Blue, Yellow
const FILLER_COLORS = ['#87CEFA', '#1E90FF', '#FFD700'];

const FillerBaubles: React.FC<{ layers: any[], occupiedSlots: Map<number, UploadedImage> }> = React.memo(({ layers, occupiedSlots }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    const data = useMemo(() => {
        const items = [];
        layers.forEach((layer, layerIdx) => {
             const effectiveRadius = layer.radius * layer.scale;
             const effectiveHeight = layer.height * layer.scale;
             // Increased count for MANY more filler baubles
             const fillerCount = Math.floor(layer.ornaments * 12); 
             for(let i=0; i < fillerCount; i++) {
                 // Reuse getOrnamentPosition but modify slightly
                 const seed = layerIdx * 137 + i * 928;
                 const rand = (Math.sin(seed) * 10000) % 1;
                 const rand2 = (Math.cos(seed) * 10000) % 1;
                 const angle = (i * (Math.PI * 2 / fillerCount)) + (rand * 0.5);
                 
                 // Fillers can be a bit higher up in the layer
                 const t = 0.2 + Math.abs(rand2) * 0.4;
                 const yPos = -effectiveHeight/2 + (t * effectiveHeight);
                 const yNorm = (yPos + effectiveHeight/2) / effectiveHeight;
                 const flare = Math.pow(1 - Math.max(0, Math.min(1, yNorm)), 1.4);
                 
                 // Randomize depth slightly
                 const rPos = (effectiveRadius * flare) + (0.05 + Math.random() * 0.15); 
                 
                 const x = Math.cos(angle) * rPos;
                 const z = Math.sin(angle) * rPos;
                 
                 // Shift Y relative to layer position
                 const v = new THREE.Vector3(x, yPos + layer.position[1], z);
                 
                 items.push({ 
                     pos: v, 
                     rotY: -angle + Math.PI/2, 
                     colorHex: FILLER_COLORS[Math.floor(Math.random() * FILLER_COLORS.length)], 
                     // Smaller scale for fillers: 0.12 to 0.18 (Image balls are ~0.26)
                     scale: 0.12 + Math.random() * 0.06
                });
             }
        });
        return items;
    }, [layers]);

    useEffect(() => {
        if (!meshRef.current) return;
        data.forEach((item, i) => {
            dummy.position.copy(item.pos);
            dummy.rotation.set(0, item.rotY, 0);
            dummy.scale.setScalar(item.scale);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
            color.set(item.colorHex);
            meshRef.current?.setColorAt(i, color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if(meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [data]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} receiveShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial roughness={0.2} metalness={0.8} envMapIntensity={1.2} />
        </instancedMesh>
    );
});

const TreeSkirt: React.FC = () => (
    <mesh position={[0, -3.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 9.0, 0.5, 64]} />
        <meshStandardMaterial map={fabricTexture || undefined} bumpMap={fabricTexture || undefined} bumpScale={0.1} color="#D42426" roughness={1.0} />
    </mesh>
);

const wrappingMaterials = [
    new THREE.MeshStandardMaterial({ color: '#8b0000', roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: '#1a3300', roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: '#001a33', roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: '#b8860b', roughness: 0.3, metalness: 0.6 }),
];
const ribbonMaterials = [
    new THREE.MeshStandardMaterial({ color: "#FFD700", roughness: 0.2, metalness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: "#E0E0E0", roughness: 0.2, metalness: 0.8 }),
];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const Gift = ({ position, rotation, scale, material, ribbonMaterial }: any) => (
    <group position={position} rotation={rotation}>
        <mesh castShadow receiveShadow material={material} geometry={boxGeo} scale={scale} />
        <mesh castShadow receiveShadow material={ribbonMaterial} geometry={boxGeo} position={[0, 0, 0]} scale={[scale[0] * 1.01, scale[1] * 1.01, scale[2] * 0.15]} />
        <mesh castShadow receiveShadow material={ribbonMaterial} geometry={boxGeo} position={[0, 0, 0]} scale={[scale[0] * 0.15, scale[1] * 1.01, scale[2] * 1.01]} />
    </group>
);

const Presents: React.FC = () => {
    const gifts = useMemo(() => {
        const items = [];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1.5 + Math.random() * 3.5; 
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const width = 0.5 + Math.random() * 0.5;
            const depth = 0.5 + Math.random() * 0.5;
            const height = 0.4 + Math.random() * 0.5;
            items.push({
                position: [x, -3.0 + height/2, z] as [number, number, number],
                rotation: [0, Math.random() * Math.PI, 0] as [number, number, number],
                scale: [width, height, depth] as [number, number, number],
                material: wrappingMaterials[Math.floor(Math.random() * wrappingMaterials.length)],
                ribbonMaterial: ribbonMaterials[Math.floor(Math.random() * ribbonMaterials.length)],
            });
        }
        return items;
    }, []);
    return <group>{gifts.map((data, i) => <Gift key={i} {...data} />)}</group>;
};

const LogoTextureMesh = ({ url, style }: { url: string, style: 'logo_spin' | 'logo_holo' }) => {
    const tex = useTexture(url);
    const ref = useRef<THREE.Group>(null);
    if (scanlineTexture) { scanlineTexture.wrapS = THREE.RepeatWrapping; scanlineTexture.wrapT = THREE.RepeatWrapping; }
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter;
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ref.current) {
            ref.current.rotation.y += 0.01;
            ref.current.position.y = style === 'logo_holo' ? 14.5 + Math.sin(t) * 0.1 : 14.2;
        }
        if (scanlineTexture) scanlineTexture.offset.y = -t * 0.2; 
    });

    if (style === 'logo_spin') {
        return (
            <group ref={ref} position={[0, 14.2, 0]}>
                <mesh receiveShadow>
                     <planeGeometry args={[3, 3]} /> 
                     <meshStandardMaterial map={tex} side={THREE.DoubleSide} transparent alphaTest={0.1} roughness={0.5} metalness={0.1} />
                </mesh>
            </group>
        );
    }
    return (
        <group ref={ref} position={[0, 14.2, 0]}>
             <mesh>
                 <planeGeometry args={[3, 3]} />
                 <meshBasicMaterial 
                    map={tex} 
                    transparent 
                    opacity={0.8} 
                    side={THREE.DoubleSide} 
                    blending={THREE.AdditiveBlending} 
                    depthWrite={false} 
                 />
             </mesh>
             {/* Scanline overlay for holo effect */}
             <mesh>
                 <planeGeometry args={[3, 3]} />
                 <meshBasicMaterial 
                    map={scanlineTexture} 
                    transparent 
                    opacity={0.4} 
                    side={THREE.DoubleSide} 
                    blending={THREE.AdditiveBlending}
                    color="#00ffff"
                 />
             </mesh>
             <pointLight color="#00ffff" intensity={2} distance={5} decay={2} />
        </group>
    );
}

// Custom 5-Point Star Geometry
const starGeometry = (() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.4;
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.sin(angle) * radius;
        const y = Math.cos(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    
    const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 1
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // Center the pivot
    return geo;
})();

const TopperStar: React.FC<{ showRays: boolean, type: 'star' | 'logo_spin' | 'logo_holo', logoUrl?: string | null }> = ({ showRays, type, logoUrl }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(ref.current && type === 'star') {
            ref.current.rotation.y += 0.01;
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            ref.current.scale.setScalar(scale);
        }
    });

    if (type !== 'star' && logoUrl) return <LogoTextureMesh url={logoUrl} style={type} />;

    return (
        <group ref={ref} position={[0, 14.2, 0]}> 
            <mesh geometry={starGeometry}>
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} roughness={0.1} metalness={1.0} />
            </mesh>
             <pointLight intensity={3} distance={6} color="#FFD700" />
             {showRays ? (
                <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                     <coneGeometry args={[1.5, 6, 8, 1, true]} />
                     <meshBasicMaterial color="#FFD700" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
             ) : null}
        </group>
    );
};

const FairyLights: React.FC<{ flickerIntensity: number }> = React.memo(({ flickerIntensity }) => {
    const count = 350; 
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const colors = useMemo(() => new Float32Array(count * 3), [count]);

    // Positions for a spiral
    useEffect(() => {
        if (!meshRef.current) return;
        const tempColor = new THREE.Color();
        const baseColors = [0xffaa00, 0xff0000, 0x00ff00, 0x0088ff];
        
        for (let i = 0; i < count; i++) {
             const pct = i / count;
             const h = 1.0 + pct * 12.0; 
             const angle = pct * Math.PI * 30; 
             
             // Conical radius: wider at bottom, narrower at top
             const r = 2.8 * (1 - pct * 0.85); 
             
             const x = Math.cos(angle) * r;
             const z = Math.sin(angle) * r;
             
             dummy.position.set(x, h, z);
             const s = 0.04;
             dummy.scale.setScalar(s);
             dummy.updateMatrix();
             meshRef.current.setMatrixAt(i, dummy.matrix);
             
             tempColor.setHex(baseColors[Math.floor(Math.random() * baseColors.length)]);
             meshRef.current.setColorAt(i, tempColor);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if(meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Simple blink effect
        if (flickerIntensity > 0) {
            const t = state.clock.elapsedTime;
            // Modulate emissive intensity in shader? 
            // Or just scale a bit to simulate pulse
            const s = 0.04 + Math.sin(t * 5) * 0.01 * (flickerIntensity/100);
            // Updating all scales is heavy, maybe just keep static glow 
            // relying on Bloom for the "light" look
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial 
                toneMapping={false} 
                emissive="white" 
                emissiveIntensity={2.0} 
                color="white" 
                roughness={0.2}
            />
        </instancedMesh>
    );
});

const Tree: React.FC<TreeProps> = React.memo(({ 
    images, onUpdateTargets, rootOffset = [0, 0, 0], position = [0, 0, 0], color = '#2E8B57', isNight = false, 
    flickerIntensity = 0,
    showTreeSkirt = false,
    showSnowOnBranches = false,
    topperType = 'star', logoUrl = null,
}) => {
  const [shuffleNonce, setShuffleNonce] = useState(0);

  useEffect(() => {
    // 5 minutes timer to shuffle images
    const interval = setInterval(() => { setShuffleNonce(n => n + 1); }, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const shuffledImages = useMemo(() => {
     const list = [...images];
     for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
     }
     return list;
  }, [images, shuffleNonce]);

  const treeLayers = useMemo(() => [
    { position: [0, 2.5, 0], scale: 2.2, radius: 2.4, height: 4.0, ornaments: 7, color: color }, 
    { position: [0, 4.2, 0], scale: 2.0, radius: 2.35, height: 3.9, ornaments: 6, color: color }, 
    { position: [0, 5.9, 0], scale: 1.8, radius: 2.3, height: 3.8, ornaments: 4, color: color }, 
    { position: [0, 7.6, 0], scale: 1.6, radius: 2.2, height: 3.7, ornaments: 3, color: color }, 
    { position: [0, 9.2, 0], scale: 1.4, radius: 2.1, height: 3.6, ornaments: 2, color: color }, 
    { position: [0, 10.8, 0], scale: 1.2, radius: 2.0, height: 3.4, ornaments: 2, color: color }, 
    { position: [0, 12.3, 0], scale: 1.0, radius: 1.8, height: 3.2, ornaments: 1, color: color }, 
  ], [color]);

  const totalOrnaments = treeLayers.reduce((acc, layer) => acc + layer.ornaments, 0);

  const occupiedSlots = useMemo(() => {
    // Map number -> full Image object
    const map = new Map<number, UploadedImage>();
    if (shuffledImages.length === 0) return map;
    for (let i = 0; i < totalOrnaments; i++) {
        map.set(i, shuffledImages[i % shuffledImages.length]);
    }
    return map;
  }, [shuffledImages, totalOrnaments]);

  useEffect(() => {
    if (shuffledImages.length === 0 || !onUpdateTargets) return;
    const targets: THREE.Vector3[] = [];
    let globalIndex = 0;
    treeLayers.forEach((layer, layerIdx) => {
        const effectiveHeight = layer.height * layer.scale;
        const effectiveRadius = layer.radius * layer.scale;
        for(let i=0; i<layer.ornaments; i++) {
             if (occupiedSlots.has(globalIndex)) {
                const pos = getOrnamentPosition(layerIdx, i, layer.ornaments, effectiveRadius, effectiveHeight, 0);
                targets.push(new THREE.Vector3(pos.x + rootOffset[0] + position[0], pos.y + layer.position[1] + rootOffset[1] + position[1], pos.z + rootOffset[2] + position[2]));
             }
             globalIndex++;
        }
    });
    if(targets.length > 0) onUpdateTargets(targets);
  }, [occupiedSlots, shuffledImages, position, onUpdateTargets, treeLayers, rootOffset]);

  return (
    <group position={position}>
        <TopperStar showRays={false} type={topperType || 'star'} logoUrl={logoUrl} />
        
        <FairyLights flickerIntensity={flickerIntensity} />
        
        {/* Presents are always on now */}
        <Presents />

        {showTreeSkirt ? <TreeSkirt /> : null}
        
        <mesh position={[0, 4.0, 0]} receiveShadow>
            <cylinderGeometry args={[0.05, 0.8, 14, 16]} />
            <meshStandardMaterial color="#8d5524" roughness={0.9} />
        </mesh>
        
        <mesh position={[0, -3.1, 0]} receiveShadow>
             <cylinderGeometry args={[13.5, 13.8, 0.2, 48]} />
             <meshToonMaterial color="#ffffff" />
        </mesh>
        
        {(() => {
            let currentIndex = 0;
            return treeLayers.map((layer, idx) => {
                const startIdx = currentIndex;
                currentIndex += layer.ornaments;
                return (
                    <TreeLayer 
                        key={idx}
                        {...layer}
                        layerIndex={idx}
                        position={layer.position as [number, number, number]}
                        startGlobalIndex={startIdx}
                        occupiedSlots={occupiedSlots}
                        ornamentCount={layer.ornaments}
                        startAngle={0} 
                        texture={noiseTexture || undefined}
                        isNight={isNight}
                        isSnowy={showSnowOnBranches}
                    />
                );
            });
        })()}

        <FillerBaubles layers={treeLayers} occupiedSlots={occupiedSlots} />
    </group>
  );
});

export default Tree;
