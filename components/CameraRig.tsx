
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import React, { useRef, useEffect } from 'react';

interface CameraRigProps {
  active: boolean;
  targets?: Vector3[];
  speedConfig?: number;
}

const CameraRig: React.FC<CameraRigProps> = ({ active, targets = [], speedConfig = 0.05 }) => {
  const { gl } = useThree();
  const timeRef = useRef(0);
  
  const zoomRef = useRef(0);
  const rotationOffset = useRef(0);
  const heightOffset = useRef(0);
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const currentLookAt = useRef(new Vector3(0, 3.0, 0));

  useEffect(() => {
    const canvas = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      const sensitivity = 0.05;
      zoomRef.current += e.deltaY * sensitivity;
      zoomRef.current = MathUtils.clamp(zoomRef.current, -14, 15);
    };

    const onPointerDown = (e: PointerEvent) => {
        isDragging.current = true;
        previousPointer.current = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
    };
    
    const onPointerMove = (e: PointerEvent) => {
        if(!isDragging.current) return;
        const deltaX = e.clientX - previousPointer.current.x;
        const deltaY = e.clientY - previousPointer.current.y;
        
        previousPointer.current = { x: e.clientX, y: e.clientY };
        
        rotationOffset.current -= deltaX * 0.005;
        heightOffset.current += deltaY * 0.05;
    };
    
    const onPointerUp = (e: PointerEvent) => {
        isDragging.current = false;
        canvas.releasePointerCapture(e.pointerId);
        canvas.style.cursor = 'auto';
    };

    canvas.addEventListener('wheel', handleWheel, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);
    
    return () => {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointerleave', onPointerUp);
    }
  }, [gl]);

  useFrame((state, delta) => {
    if (active) {
        timeRef.current += delta;
    }
    const t = timeRef.current;

    // --- BASE ORBIT ---
    const baseRadius = 24.0;
    const currentRadius = baseRadius + zoomRef.current + Math.sin(t * speedConfig) * 2;
    
    heightOffset.current = MathUtils.clamp(heightOffset.current, -4, 15);
    
    const autoHeight = 6.0 + Math.sin(t * (speedConfig * 1.4)) * 2.0;
    const orbitHeight = autoHeight + heightOffset.current; 
    
    const orbitAngle = t * speedConfig + rotationOffset.current; 
    
    const orbitPos = new Vector3(
        Math.sin(orbitAngle) * currentRadius,
        orbitHeight,
        Math.cos(orbitAngle) * currentRadius
    );
    
    const orbitLookAt = new Vector3(0, 5.0 + heightOffset.current * 0.5, 0); 

    let finalPos = orbitPos.clone();
    let finalLookAt = orbitLookAt.clone();

    // --- TARGET FOCUS LOGIC ---
    if (active && !isDragging.current && targets.length > 0) {
        // Cycle settings for smoother animation
        const CYCLE_DURATION = 10; 
        const cycleIndex = Math.floor(t / CYCLE_DURATION) % targets.length;
        const cycleProgress = (t % CYCLE_DURATION) / CYCLE_DURATION; 

        const target = targets[cycleIndex];
        
        // Use a vector from the tree center (y ignored) to the target to determine radial direction
        const dirToTarget = new Vector3(target.x, 0, target.z).normalize();
        
        // Move camera to 1.8 units away from target
        const ZOOM_DIST = 1.8; 
        const focusPos = new Vector3().copy(target).add(dirToTarget.multiplyScalar(ZOOM_DIST));
        focusPos.y = target.y;

        // Weight calculation - increased transition window for smoother ease-in/out
        let weight = 0;
        const TRANSITION_PCT = 0.3; // 30% of time spent moving in/out
        
        if (cycleProgress < TRANSITION_PCT) {
            // Smoothstep for ease-in
            const p = cycleProgress / TRANSITION_PCT;
            weight = p * p * (3 - 2 * p);
        } else if (cycleProgress > (1 - TRANSITION_PCT)) {
            // Smoothstep for ease-out
            const p = (1 - cycleProgress) / TRANSITION_PCT;
            weight = p * p * (3 - 2 * p);
        } else {
            weight = 1;
        }

        // --- NON-CLIPPING INTERPOLATION ---
        
        const orbitRadius = Math.sqrt(orbitPos.x*orbitPos.x + orbitPos.z*orbitPos.z);
        const focusRadius = Math.sqrt(focusPos.x*focusPos.x + focusPos.z*focusPos.z);
        
        const orbitTheta = Math.atan2(orbitPos.x, orbitPos.z);
        const focusTheta = Math.atan2(focusPos.x, focusPos.z);
        
        // Calculate shortest angle path
        let deltaTheta = focusTheta - orbitTheta;
        while (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
        while (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;
        
        // Angle Lerp
        const currentTheta = orbitTheta + deltaTheta * Math.pow(weight, 0.5); 
        
        // Height Lerp
        const currentY = MathUtils.lerp(orbitPos.y, focusPos.y, Math.pow(weight, 1.5));

        // Radius Lerp 
        const radiusWeight = Math.pow(weight, 2); 
        const currentRad = MathUtils.lerp(orbitRadius, focusRadius, radiusWeight);
        
        finalPos.set(
            Math.sin(currentTheta) * currentRad,
            currentY,
            Math.cos(currentTheta) * currentRad
        );

        if (weight > 0.99) {
            // Subtle hover when locked in
            finalPos.y += Math.sin(t * 0.5) * 0.05; 
        }

        // LookAt Logic
        const lookAtWeight = Math.pow(weight, 0.2); 
        
        // Offset TARGET: 0 = exact center of screen
        const offsetTarget = target.clone();
        offsetTarget.y += 0.0; 

        // When locked in, force strict lookAt to target center
        if (weight > 0.8) {
            finalLookAt.copy(offsetTarget); 
        } else {
            finalLookAt.lerpVectors(orbitLookAt, offsetTarget, lookAtWeight);
        }
    }

    // --- COLLISION AVOIDANCE (Secondary Net) ---
    if (!isDragging.current) {
        const dist = Math.sqrt(finalPos.x * finalPos.x + finalPos.z * finalPos.z);
        let minSafeRadius = 2.0; 
        if (finalPos.y > -2 && finalPos.y < 12) {
             minSafeRadius = 3.0 + (12 - finalPos.y) * 0.3; 
        }
        if (dist < minSafeRadius && dist > 4.0) {
             const push = minSafeRadius / dist;
             finalPos.x *= push;
             finalPos.z *= push;
        }
    }

    // Increased lerp speed slightly for responsiveness during smoothing
    const lerpSpeed = isDragging.current ? 0.2 : 0.1;
    state.camera.position.lerp(finalPos, lerpSpeed);
    currentLookAt.current.lerp(finalLookAt, lerpSpeed);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
};

export default CameraRig;
