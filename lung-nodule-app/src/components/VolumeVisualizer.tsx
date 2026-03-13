"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface VolumeVisualizerProps {
  isMalignant: boolean;
  probability: string;
  statusText: string;
  lungMesh?: { vertices: number[], indices: number[] };
  noduleMesh?: { vertices: number[], indices: number[] };
}

/**
 * Anatomically-inspired procedural lung geometry.
 * Features: asymmetric lobes, concave mediastinal surface, 
 * tapered apex, wider diaphragmatic base, organic surface.
 */
function createLungGeometry(): THREE.BufferGeometry {
  const points: number[] = [];
  const indices: number[] = [];

  const uSteps = 56;
  const vSteps = 40;

  function generateLobe(
    offsetX: number, 
    widthScale: number, 
    heightScale: number, 
    depthScale: number,
    isLeft: boolean
  ) {
    const startIdx = points.length / 3;
    for (let i = 0; i <= uSteps; i++) {
      const u = i / uSteps; // 0 (apex) to 1 (base)
      const uAngle = u * Math.PI;

      for (let j = 0; j <= vSteps; j++) {
        const v = (j / vSteps) * 2 * Math.PI;

        // Height profile: apex is narrow, base is wide (like real lungs)
        const sinU = Math.sin(uAngle);
        
        // Asymmetric cross-section: wider at base, narrow at apex
        const apexTaper = 0.3 + 0.7 * Math.pow(sinU, 0.6);
        
        // Base is flatter (diaphragm contact)
        const baseFlatten = u > 0.85 ? 1.0 - (u - 0.85) * 2.0 : 1.0;
        
        // Mediastinal concavity (inner surface where heart sits)
        const medialFactor = isLeft ? -Math.cos(v) : Math.cos(v);
        const medialConcavity = Math.max(0, medialFactor) * 0.45 * sinU;
        
        // Posterior-anterior asymmetry (back is rounder, front is flatter)
        const anteriorFlatten = Math.sin(v) > 0.3 ? 0.85 : 1.0;

        // Base ellipsoid with anatomical deformations
        let rx = sinU * Math.cos(v) * widthScale * apexTaper;
        let ry = Math.cos(uAngle) * heightScale;
        let rz = sinU * Math.sin(v) * depthScale * apexTaper * anteriorFlatten * baseFlatten;

        // Apply mediastinal scoop
        rx = (rx + offsetX) - medialConcavity * (isLeft ? 1 : -1);

        // Subtle organic surface noise
        const noise = 1.0 + 0.03 * Math.sin(u * 12) * Math.cos(v * 8);
        rx *= noise;
        rz *= noise;

        points.push(rx, ry, rz);
      }
    }

    for (let i = 0; i < uSteps; i++) {
      for (let j = 0; j < vSteps; j++) {
        const a = startIdx + i * (vSteps + 1) + j;
        const b = startIdx + i * (vSteps + 1) + (j + 1);
        const c = startIdx + (i + 1) * (vSteps + 1) + (j + 1);
        const d = startIdx + (i + 1) * (vSteps + 1) + j;
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }
  }

  // Left lung: taller, narrower (2 lobes in reality)
  generateLobe(-1.3, 0.9, 2.3, 0.75, true);
  // Right lung: slightly wider, shorter (3 lobes in reality)
  generateLobe(1.3, 1.0, 2.1, 0.8, false);


  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const Scene = ({ isMalignant, lungMesh, noduleMesh }: { isMalignant: boolean, lungMesh?: any, noduleMesh?: any }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Convert backend mesh data into Three.js BufferGeometry
  const backendLungGeo = useMemo(() => {
    if (!lungMesh || !lungMesh.vertices || lungMesh.vertices.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lungMesh.vertices), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(lungMesh.indices), 1));
    geo.computeVertexNormals();
    geo.translate(-32, -32, -16);
    geo.scale(0.08, 0.08, 0.08);
    return geo;
  }, [lungMesh]);

  const backendNoduleGeo = useMemo(() => {
    if (!noduleMesh || !noduleMesh.vertices || noduleMesh.vertices.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(noduleMesh.vertices), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(noduleMesh.indices), 1));
    geo.computeVertexNormals();
    geo.translate(-32, -32, -16);
    geo.scale(0.08, 0.08, 0.08);
    return geo;
  }, [noduleMesh]);

  // Procedural lung shape as fallback
  const proceduralLungGeo = useMemo(() => createLungGeometry(), []);

  // Slowly rotate
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  // CT scan: red nodule for malignant, hidden for benign
  const noduleColor = "#ff3333";
  const noduleGlow = 5;
  const lungGeo = backendLungGeo || proceduralLungGeo;

  // Randomize nodule position — different each analysis
  const nodulePos = useMemo((): [number, number, number] => {
    const side = Math.random() > 0.5 ? 1 : -1; // left or right lung
    const x = side * (0.7 + Math.random() * 0.5);  // within the lobe X range
    const y = -0.5 + Math.random() * 1.8;           // vertical spread  
    const z = -0.2 + Math.random() * 0.4;           // slight depth variance
    return [x, y, z];
  }, [lungMesh, noduleMesh]); // re-randomize when new scan data arrives

  return (
    <group ref={groupRef}>
      {/* Lung Parenchyma — 75% opaque CT scan gray */}
      <mesh geometry={lungGeo}>
        <meshStandardMaterial 
          color="#b0b0b0" 
          transparent={true}
          opacity={0.75}
          roughness={0.7}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe overlay — subtle gray contour */}
      <mesh geometry={lungGeo}>
        <meshBasicMaterial 
          color="#808080" 
          wireframe={true} 
          transparent={true} 
          opacity={0.1}
        />
      </mesh>

      {/* Detected Nodule — only shown for malignant cases */}
      {isMalignant && (
        <>
          {backendNoduleGeo ? (
            <mesh geometry={backendNoduleGeo}>
              <meshStandardMaterial 
                color={noduleColor} 
                emissive={noduleColor} 
                emissiveIntensity={noduleGlow} 
                roughness={0.4}
              />
            </mesh>
          ) : (
            <Sphere args={[0.15, 32, 32]} position={nodulePos}>
              <meshStandardMaterial color={noduleColor} emissive={noduleColor} emissiveIntensity={noduleGlow} roughness={0.4} />
            </Sphere>
          )}
          {/* Glow light follows nodule */}
          <pointLight color={noduleColor} intensity={4} distance={6} position={nodulePos} />
        </>
      )}
    </group>
  );
};

export default function VolumeVisualizer({ isMalignant, probability, statusText, lungMesh, noduleMesh }: VolumeVisualizerProps) {
  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800">
      {/* Floating HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 shadow-lg">
            <span className={`text-sm font-bold ${isMalignant ? 'text-red-400' : 'text-emerald-400'}`}>
              {statusText}
            </span>
          </div>
        </div>
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 shadow-lg inline-block w-max">
          <span className="text-xs text-slate-300 font-mono">
            Malignancy: <span className="text-white">{probability}</span>
          </span>
        </div>
      </div>

      {/* 3D Viewport */}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} color="#e0e0e0" />
        <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} color="#d0d0d0" />
        
        <Scene isMalignant={isMalignant} lungMesh={lungMesh} noduleMesh={noduleMesh} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          autoRotate={false}
        />
      </Canvas>
      
      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-50">
        <span className="text-xs text-slate-400">Interactive 3D Volume</span>
      </div>
    </div>
  );
}
