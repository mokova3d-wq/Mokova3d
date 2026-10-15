"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCcw, Box, Eye, Layers } from "lucide-react";

export interface ClientModelCanvasProps {
  modelType?: string;
  productName: string;
  posterImage?: string;
  dimensionsMm?: string;
  className?: string;
}

export function ClientModelCanvas({
  modelType = "cat",
  productName,
  posterImage,
  dimensionsMm = "90 × 80 × 120 mm",
  className = "",
}: ClientModelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderMode, setRenderMode] = useState<"shaded" | "wireframe" | "specular">("shaded");
  const [isRotating, setIsRotating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [sliceProgress, setSliceProgress] = useState(100);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);

    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
    } catch (renderErr) {
      console.warn("WebGLRenderer initialization failed in ClientModelCanvas, using poster fallback:", renderErr);
      setWebglError(true);
      return;
    }

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7d6bff, 1.8);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc8f542, 1.2);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // 3. 3D Model Group Assembly
    const group = new THREE.Group();
    modelGroupRef.current = group;
    materialsRef.current = [];

    // Helper material generator
    const createMat = (color: number, roughness = 0.4) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.1,
      });
      materialsRef.current.push(mat);
      return mat;
    };

    // Construct high-detail parametric 3D geometries based on model type
    if (modelType === "cat" || modelType.includes("cat")) {
      // Cat Head & Body
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.75, 1.2, 32);
      const bodyMesh = new THREE.Mesh(bodyGeo, createMat(0x181824, 0.3));
      bodyMesh.position.y = 0.6;
      group.add(bodyMesh);

      const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const headMesh = new THREE.Mesh(headGeo, createMat(0xffffff, 0.2));
      headMesh.position.y = 1.45;
      group.add(headMesh);

      // Ears
      const earGeo = new THREE.ConeGeometry(0.2, 0.35, 16);
      const earL = new THREE.Mesh(earGeo, createMat(0x5a45ff, 0.3));
      earL.position.set(-0.25, 1.95, 0.1);
      earL.rotation.z = 0.2;
      group.add(earL);

      const earR = new THREE.Mesh(earGeo, createMat(0x5a45ff, 0.3));
      earR.position.set(0.25, 1.95, 0.1);
      earR.rotation.z = -0.2;
      group.add(earR);

      // Collar
      const collarGeo = new THREE.TorusGeometry(0.48, 0.08, 16, 32);
      const collarMesh = new THREE.Mesh(collarGeo, createMat(0xc8f542, 0.1));
      collarMesh.position.y = 1.15;
      collarMesh.rotation.x = Math.PI / 2;
      group.add(collarMesh);
    } else if (modelType === "penguin" || modelType.includes("penguin")) {
      // Roly-Poly Penguin
      const bodyGeo = new THREE.SphereGeometry(0.8, 32, 32);
      bodyGeo.scale(1, 1.3, 1);
      const bodyMesh = new THREE.Mesh(bodyGeo, createMat(0x181824, 0.3));
      bodyMesh.position.y = 0.9;
      group.add(bodyMesh);

      const bellyGeo = new THREE.SphereGeometry(0.65, 32, 32);
      bellyGeo.scale(0.85, 1.1, 0.5);
      const bellyMesh = new THREE.Mesh(bellyGeo, createMat(0xffffff, 0.2));
      bellyMesh.position.set(0, 0.85, 0.45);
      group.add(bellyMesh);

      // Beak
      const beakGeo = new THREE.ConeGeometry(0.12, 0.25, 16);
      const beakMesh = new THREE.Mesh(beakGeo, createMat(0xf59e0b, 0.2));
      beakMesh.position.set(0, 1.25, 0.8);
      beakMesh.rotation.x = Math.PI / 2;
      group.add(beakMesh);
    } else if (modelType === "lamp" || modelType.includes("lamp")) {
      // Shadow Lamp Geometric Facets
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.3, 32);
      const baseMesh = new THREE.Mesh(baseGeo, createMat(0x181824, 0.4));
      baseMesh.position.y = 0.15;
      group.add(baseMesh);

      const shadeGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.4, 8, 8, true);
      const shadeMesh = new THREE.Mesh(shadeGeo, createMat(0xfff5e6, 0.1));
      shadeMesh.position.y = 1.1;
      group.add(shadeMesh);

      // Internal Bulb
      const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const bulbMesh = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0xffe066 }));
      bulbMesh.position.y = 0.9;
      group.add(bulbMesh);
    } else {
      // Multi-feature Sculpted Object (Toroid / Lattice / Figure)
      const knotGeo = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 16);
      const knotMesh = new THREE.Mesh(knotGeo, createMat(0x5a45ff, 0.2));
      knotMesh.position.y = 0.9;
      group.add(knotMesh);

      const standGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.2, 32);
      const standMesh = new THREE.Mesh(standGeo, createMat(0x181824, 0.4));
      standMesh.position.y = 0.1;
      group.add(standMesh);
    }

    scene.add(group);
    setIsLoaded(true);

    // 4. Mouse / Touch Orbit Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !group) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 5. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (group && isRotating && !isDragging) {
        group.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      if (canvas) {
        canvas.removeEventListener("mousedown", onMouseDown);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [modelType, isRotating]);

  // Update render modes (Shaded, Wireframe, Specular)
  useEffect(() => {
    for (const mat of materialsRef.current) {
      if ("wireframe" in mat) {
        (mat as any).wireframe = renderMode === "wireframe";
      }
      if ("roughness" in mat) {
        (mat as any).roughness = renderMode === "specular" ? 0.05 : 0.35;
      }
    }
  }, [renderMode]);

  const handleResetCamera = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] bg-[#0e0c1d] rounded-2xl overflow-hidden border border-black/10 shadow-xl flex flex-col select-none ${className}`}
    >
      {/* Top Telemetry Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono font-semibold text-[#c8f542] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#c8f542] animate-pulse" />
            3D Client WebGL
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-white/70">
            {dimensionsMm}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? "Pause Turntable" : "Resume Turntable"}
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Camera"
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container or Fallback */}
      {webglError ? (
        <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden">
          {posterImage && (
            <img
              src={posterImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              Hardware WebGL Unavailable
            </span>
            <p className="text-xs text-white/80 max-w-sm">
              Displaying high-resolution inspection poster. Interactive 3D orbital inspection requires WebGL hardware acceleration.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full flex-1 cursor-grab active:cursor-grabbing relative flex items-center justify-center overflow-hidden"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
          {!isLoaded && posterImage && (
            <img
              src={posterImage}
              alt={productName}
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            />
          )}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="p-3 bg-white/10 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 text-[11px] text-white/70 font-mono">
          <Eye className="w-3.5 h-3.5 text-[#c8f542]" />
          <span className="hidden sm:inline">Drag to rotate • Scroll to zoom</span>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
          <button
            onClick={() => setRenderMode("shaded")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              renderMode === "shaded"
                ? "bg-[#5a45ff] text-white shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            Shaded
          </button>
          <button
            onClick={() => setRenderMode("wireframe")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              renderMode === "wireframe"
                ? "bg-[#c8f542] text-[#0e0c1d] shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={() => setRenderMode("specular")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              renderMode === "specular"
                ? "bg-white text-[#0e0c1d] shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            Specular
          </button>
        </div>
      </div>
    </div>
  );
}