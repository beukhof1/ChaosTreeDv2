
import React, { Suspense, useRef, useMemo } from 'react';
import { useTexture, Decal } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrnamentProps {
  image?: string;
}

// Slightly smaller sphere to help spacing
const sphereGeo = new THREE.SphereGeometry(1, 64, 64); 
const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12);
const hookGeo = new THREE.TorusGeometry(0.02, 0.005, 8, 12);

const goldMaterial = new THREE.MeshStandardMaterial({ 
    color: "#FFD700", 
    roughness: 0.3, 
    metalness: 1.0 
});

const placeholderMaterial = new THREE.MeshStandardMaterial({ 
    color: "#b0b0b0", 
    roughness: 0.7, 
    metalness: 0.1, 
    envMapIntensity: 0.5 
});

const OrnamentMesh = ({ image }: { image: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * 100, []);

  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Increased wobble amplitude for stronger wind effect
    groupRef.current.rotation.z = Math.sin(t * 1.5 + phase) * 0.08; 
    groupRef.current.rotation.y = Math.sin(t * 0.5 + phase) * 0.10;
  });

  return (
    <group ref={groupRef}>
        <group position={[0, -0.3, 0]}>
            {/* 
                Scale 0.26 reduced from 0.28 to minimize clipping with neighbors.
            */}
            <mesh geometry={sphereGeo} scale={0.26}>
                <meshStandardMaterial 
                    color="#909090" // Darker gray base for contrast
                    roughness={0.9} // Extremely matte
                    metalness={0.0} // No metal
                    emissive="#000000" // Absolutely no emission
                    emissiveIntensity={0}
                    envMapIntensity={0.1} // Minimal environment reflection
                />
                
                {/* 
                   DECAL PROJECTION:
                   Restricted Z-scale prevents bleed-through to back of sphere.
                   High negative polygonOffset ensures it renders ON TOP of the sphere.
                   RenderOrder forced higher.
                */}
                <Decal 
                    position={[0, 0, 1]} 
                    rotation={[0, 0, 0]} 
                    scale={[2.3, 2.3, 1]} 
                    renderOrder={1}
                >
                    <meshStandardMaterial 
                        map={texture} 
                        transparent 
                        polygonOffset 
                        polygonOffsetFactor={-20} 
                        roughness={0.9} // Match base matte look
                        metalness={0.0}
                        envMapIntensity={0.2}
                        emissive="#000000"
                        emissiveIntensity={0}
                        depthWrite={false} // Helps avoid z-fighting
                    />
                </Decal>
            </mesh>
            
            <mesh position={[0, 0.24, 0]} geometry={capGeo} material={goldMaterial} />
            <mesh position={[0, 0.27, 0]} rotation={[0, 0, Math.PI / 2]} geometry={hookGeo} material={goldMaterial} />
        </group>
    </group>
  );
};

const Ornament: React.FC<OrnamentProps> = ({ image }) => {
  return (
    <group>
        <Suspense fallback={
            <mesh position={[0, -0.3, 0]} geometry={sphereGeo} scale={0.26} material={placeholderMaterial} />
        }>
            {image ? (
                <OrnamentMesh image={image} />
            ) : (
                <mesh position={[0, -0.3, 0]} geometry={sphereGeo} scale={0.26} material={placeholderMaterial} />
            )}
        </Suspense>
    </group>
  );
};

export default Ornament;
