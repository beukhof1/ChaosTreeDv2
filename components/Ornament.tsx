

import React, { Suspense, useRef, useMemo } from 'react';
import { useTexture, Decal } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UploadedImage } from '../types';

interface OrnamentProps {
  data?: UploadedImage;
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

const OrnamentMesh = ({ data }: { data: UploadedImage }) => {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * 100, []);

  const texture = useTexture(data.url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Increased wobble amplitude for stronger wind effect
    groupRef.current.rotation.z = Math.sin(t * 1.5 + phase) * 0.08; 
    groupRef.current.rotation.y = Math.sin(t * 0.5 + phase) * 0.10;
  });

  // Use dominant color extracted from image, or fallback to gray
  const baseColor = data.dominantColor || "#909090";

  return (
    <group ref={groupRef}>
        <group position={[0, -0.3, 0]}>
            <mesh geometry={sphereGeo} scale={0.26}>
                <meshStandardMaterial 
                    color={baseColor} // Blended color from photo
                    roughness={0.9} 
                    metalness={0.0} 
                    emissive="#000000" 
                    emissiveIntensity={0}
                    envMapIntensity={0.1} 
                />
                
                <Decal 
                    position={[0, 0, 1]} 
                    rotation={[0, 0, 0]} 
                    scale={[1.85, 1.85, 1]} 
                    renderOrder={1}
                >
                    <meshStandardMaterial 
                        map={texture} 
                        transparent 
                        polygonOffset 
                        polygonOffsetFactor={-20} 
                        roughness={0.9} 
                        metalness={0.0}
                        envMapIntensity={0.2}
                        emissive="#000000"
                        emissiveIntensity={0}
                        depthWrite={false} 
                    />
                </Decal>
            </mesh>
            
            <mesh position={[0, 0.24, 0]} geometry={capGeo} material={goldMaterial} />
            <mesh position={[0, 0.27, 0]} rotation={[0, 0, Math.PI / 2]} geometry={hookGeo} material={goldMaterial} />
        </group>
    </group>
  );
};

const Ornament: React.FC<OrnamentProps> = ({ data }) => {
  return (
    <group>
        <Suspense fallback={
            <mesh position={[0, -0.3, 0]} geometry={sphereGeo} scale={0.26} material={placeholderMaterial} />
        }>
            {data ? (
                <OrnamentMesh data={data} />
            ) : (
                <mesh position={[0, -0.3, 0]} geometry={sphereGeo} scale={0.26} material={placeholderMaterial} />
            )}
        </Suspense>
    </group>
  );
};

export default Ornament;