"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Play, Pause, RotateCcw, Box, Eye, Layers, Upload, Sparkles, Compass } from "lucide-react";

export interface CustomModelTelemetry {
  widthMm: number;
  depthMm: number;
  heightMm: number;
  volumeCm3: number;
  estimatedWeightGrams: number;
  triangleCount: number;
  fitsBuildPlate: boolean;
  clearanceNotice?: string;
}

export interface CustomPrintModelViewerProps {
  file?: File | null;
  sampleType?: "bracket" | "gear" | "vase" | null;
  materialType?: string;
  materialColor?: string;
  onTelemetryCalculated?: (telemetry: CustomModelTelemetry) => void;
  className?: string;
}

export function CustomPrintModelViewer({
  file,
  sampleType,
  materialType = "PLA Matte",
  materialColor = "#5a45ff",
  onTelemetryCalculated,
  className = "",
}: CustomPrintModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [renderMode, setRenderMode] = useState<"shaded" | "wireframe" | "specular">("shaded");
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [telemetry, setTelemetry] = useState<CustomModelTelemetry | null>(null);
  const [currentView, setCurrentView] = useState<string>("iso");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelMeshRef = useRef<THREE.Object3D | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.8, 2.6, 4.2);
    camera.lookAt(0, 1.0, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
    } catch (renderErr) {
      console.warn("WebGLRenderer initialization failed in CustomPrintModelViewer:", renderErr);
      setWebglError(true);
      setIsLoading(false);
      return;
    }

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(6, 9, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x7d6bff, 1.5);
    fill.position.set(-6, 3, -4);
    scene.add(fill);

    const topSun = new THREE.DirectionalLight(0xffffff, 1.0);
    topSun.position.set(0, 10, 0);
    scene.add(topSun);

    // Realistic Heated Build Plate Assembly
    const buildPlateGroup = new THREE.Group();
    const plateWidth = 3.6;
    const plateDepth = 3.6;

    const plateGeo = new THREE.BoxGeometry(plateWidth, 0.04, plateDepth);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x11151e,
      roughness: 0.85,
      metalness: 0.2,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = -0.02;
    plateMesh.receiveShadow = true;
    buildPlateGroup.add(plateMesh);

    const borderEdges = new THREE.EdgesGeometry(plateGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x5a45ff, transparent: true, opacity: 0.7 });
    const borderLine = new THREE.LineSegments(borderEdges, borderMat);
    borderLine.position.y = -0.02;
    buildPlateGroup.add(borderLine);

    const gridMajor = new THREE.GridHelper(plateWidth, 18, 0x5a45ff, 0x222938);
    gridMajor.position.y = 0.002;
    buildPlateGroup.add(gridMajor);

    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.35, 0.005, 0),
      new THREE.Vector3(0.35, 0.005, 0),
      new THREE.Vector3(0, 0.005, -0.35),
      new THREE.Vector3(0, 0.005, 0.35),
    ]);
    const crossMat = new THREE.LineBasicMaterial({ color: 0xc8f542 });
    const crossLines = new THREE.LineSegments(crossGeo, crossMat);
    buildPlateGroup.add(crossLines);

    scene.add(buildPlateGroup);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI - 0.02;
    controls.target.set(0, 1.0, 0);
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 2. Material
    const colorHex = parseInt(materialColor.replace("#", ""), 16) || 0x5a45ff;
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: materialType.includes("Silk") ? 0.15 : 0.4,
      metalness: materialType.includes("Silk") ? 0.3 : 0.05,
      wireframe: renderMode === "wireframe",
    });
    materialRef.current = mat;

    // 3. Load or build model
    setIsLoading(true);

    const setupGeometry = (geo: THREE.BufferGeometry) => {
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      const box = geo.boundingBox;

      let w = 80,
        d = 80,
        h = 100;
      let tris = 0;

      if (box) {
        const size = new THREE.Vector3();
        box.getSize(size);

        // Center geometry
        geo.center();

        // Scale to fit viewport comfortably (e.g. normalize to max 2 units)
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2 / maxDim;
        geo.scale(scale, scale, scale);

        // Calculate real millimeter dimensions (assume 1 unit = 1mm if reasonably sized, or size scaled)
        w = Math.round(size.x > 5 ? size.x : size.x * 50);
        d = Math.round(size.z > 5 ? size.z : size.z * 50);
        h = Math.round(size.y > 5 ? size.y : size.y * 50);
      }

      if (geo.index) {
        tris = geo.index.count / 3;
      } else if (geo.attributes.position) {
        tris = geo.attributes.position.count / 3;
      }

      const volumeCm3 = Math.round(((w * d * h) / 1000) * 0.35); // Estimated solid volume factoring infill
      const estimatedWeightGrams = Math.round(volumeCm3 * 1.25); // PLA density approx 1.25 g/cm3

      const fitsBuildPlate = w <= 250 && d <= 250 && h <= 250;
      const tele: CustomModelTelemetry = {
        widthMm: w,
        depthMm: d,
        heightMm: h,
        volumeCm3,
        estimatedWeightGrams,
        triangleCount: Math.round(tris),
        fitsBuildPlate,
        clearanceNotice: fitsBuildPlate
          ? "Within 250×250×250mm Studio Heated Bed"
          : "Exceeds 250mm single-bed limit (segmentation recommended)",
      };

      setTelemetry(tele);
      onTelemetryCalculated?.(tele);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 1;
      mesh.castShadow = true;
      scene.add(mesh);
      modelMeshRef.current = mesh;
      setIsLoading(false);
    };

    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const reader = new FileReader();

      const handleParsedObject = (obj: THREE.Object3D) => {
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        obj.scale.setScalar(2 / maxDim);
        obj.position.y = 1;

        let tris = 0;
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = mat;
            child.castShadow = true;
            if (child.geometry?.attributes?.position) {
              tris += child.geometry.index
                ? child.geometry.index.count / 3
                : child.geometry.attributes.position.count / 3;
            }
          }
        });

        scene.add(obj);
        modelMeshRef.current = obj;

        const w = Math.round(size.x > 5 ? size.x : size.x * 50);
        const d = Math.round(size.z > 5 ? size.z : size.z * 50);
        const h = Math.round(size.y > 5 ? size.y : size.y * 50);
        const volume = Math.round(((w * d * h) / 1000) * 0.35);

        const fitsBuildPlate = w <= 250 && d <= 250 && h <= 250;
        const tele: CustomModelTelemetry = {
          widthMm: w,
          depthMm: d,
          heightMm: h,
          volumeCm3: volume,
          estimatedWeightGrams: Math.round(volume * 1.25),
          triangleCount: Math.round(tris) || 45000,
          fitsBuildPlate,
          clearanceNotice: fitsBuildPlate
            ? "Within 250×250×250mm Studio Heated Bed"
            : "Exceeds 250mm single-bed limit (segmentation recommended)",
        };
        setTelemetry(tele);
        onTelemetryCalculated?.(tele);
        setIsLoading(false);
      };

      if (ext === "stl") {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const loader = new STLLoader();
            const geo = loader.parse(buffer);
            setupGeometry(geo);
          } catch (err) {
            console.error("Error parsing STL", err);
            setIsLoading(false);
          }
        };
      } else if (ext === "obj") {
        reader.readAsText(file);
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const loader = new OBJLoader();
            const obj = loader.parse(text);
            handleParsedObject(obj);
          } catch (err) {
            console.error("Error parsing OBJ", err);
            setIsLoading(false);
          }
        };
      } else if (ext === "3mf") {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const loader = new ThreeMFLoader();
            const group = loader.parse(buffer);
            handleParsedObject(group);
          } catch (err) {
            console.error("Error parsing 3MF", err);
            setIsLoading(false);
          }
        };
      } else if (ext === "ply") {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const loader = new PLYLoader();
            const geo = loader.parse(buffer);
            setupGeometry(geo);
          } catch (err) {
            console.error("Error parsing PLY", err);
            setIsLoading(false);
          }
        };
      } else if (ext === "gltf" || ext === "glb") {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const loader = new GLTFLoader();
            loader.parse(
              buffer,
              "",
              (gltf) => handleParsedObject(gltf.scene),
              (err) => {
                console.error("Error parsing glTF", err);
                setIsLoading(false);
              }
            );
          } catch (err) {
            console.error("Error parsing glTF/GLB", err);
            setIsLoading(false);
          }
        };
      } else {
        setIsLoading(false);
      }
    } else {
      // Procedural sample 3D model for demonstration
      let geo: THREE.BufferGeometry;
      if (sampleType === "gear") {
        geo = new THREE.CylinderGeometry(0.8, 0.8, 0.35, 16);
      } else if (sampleType === "vase") {
        geo = new THREE.CylinderGeometry(0.5, 0.75, 1.6, 24);
      } else {
        // Engineering angle bracket with mounting hole
        geo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
      }
      setupGeometry(geo);
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isRotating;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

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
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [file, sampleType]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Update material color and render modes
  useEffect(() => {
    if (materialRef.current) {
      const colorHex = parseInt(materialColor.replace("#", ""), 16) || 0x5a45ff;
      materialRef.current.color.setHex(colorHex);
      materialRef.current.wireframe = renderMode === "wireframe";
      materialRef.current.roughness = renderMode === "specular" ? 0.05 : 0.4;
    }
  }, [materialColor, renderMode]);

  const setCameraPreset = (view: "front" | "top" | "plate" | "iso") => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    setIsRotating(false);
    setCurrentView(view);

    if (view === "top") {
      camera.position.set(0, 4.8, 0.0001);
      camera.up.set(0, 0, -1);
      controls.target.set(0, 1.0, 0);
    } else if (view === "plate") {
      camera.position.set(0, 6.0, 0.0001);
      camera.up.set(0, 0, -1);
      controls.target.set(0, 0, 0);
    } else if (view === "front") {
      camera.position.set(0, 1.0, 4.5);
      camera.up.set(0, 1, 0);
      controls.target.set(0, 1.0, 0);
    } else {
      camera.position.set(2.8, 2.6, 4.2);
      camera.up.set(0, 1, 0);
      controls.target.set(0, 1.0, 0);
    }
    controls.update();
  };

  const handleResetCamera = () => {
    setCameraPreset("iso");
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0e0c1d] rounded-3xl overflow-hidden border border-black/10 shadow-2xl flex flex-col select-none ${className}`}
    >
      {/* Top Status & Angle Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono font-bold text-[#c8f542] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#c8f542] animate-pulse" />
            Client 3D Engine
          </span>
          {file && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono text-white/80 truncate max-w-[140px] sm:max-w-[200px]">
              {file.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? "Pause Turntable" : "Auto Rotate Turntable"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRotating ? "bg-[#5a45ff] text-white" : "text-white/80 hover:bg-white/20"
            }`}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset to 3D View"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-1" />

          <button
            onClick={() => setCameraPreset("plate")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              currentView === "plate"
                ? "bg-[#c8f542] text-[#0e0c1d] shadow-xs"
                : "text-[#c8f542] hover:bg-white/15"
            }`}
            title="Top Plate View"
          >
            <Compass className="w-3 h-3" />
            <span>Top Plate</span>
          </button>

          <button
            onClick={() => setCameraPreset("top")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              currentView === "top"
                ? "bg-[#5a45ff] text-white shadow-xs"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
            title="Top View"
          >
            Top
          </button>

          <button
            onClick={() => setCameraPreset("front")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              currentView === "front"
                ? "bg-[#5a45ff] text-white shadow-xs"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
            title="Front View"
          >
            Front
          </button>

          <button
            onClick={() => setCameraPreset("iso")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              currentView === "iso"
                ? "bg-[#5a45ff] text-white shadow-xs"
                : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
            title="3D Iso View"
          >
            3D
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full flex-1 relative flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {webglError && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
            <Box className="w-8 h-8 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
              WebGL Renderer Unavailable
            </span>
            <p className="text-xs text-white/80 max-w-sm">
              Your browser or environment does not support WebGL hardware acceleration. Mesh slicing telemetry and quotes remain fully operational.
            </p>
          </div>
        )}

        {isLoading && !webglError && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
            <div className="w-8 h-8 border-2 border-[#5a45ff] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#c8f542]">Parsing 3D Mesh in Browser...</span>
          </div>
        )}
      </div>

      {/* Bottom Telemetry & Shaders Bar */}
      <div className="p-4 bg-white/10 backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {telemetry ? (
          <div className="flex items-center gap-3 font-mono text-[11px] text-white/80">
            <span>
              Size:{" "}
              <strong className="text-white">
                {telemetry.widthMm} × {telemetry.depthMm} × {telemetry.heightMm} mm
              </strong>
            </span>
            <span>•</span>
            <span>
              Est. Weight:{" "}
              <strong className="text-[#c8f542]">~{telemetry.estimatedWeightGrams}g</strong>
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              Tris: <strong className="text-white">{telemetry.triangleCount.toLocaleString()}</strong>
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-white/60 font-mono">Drag to inspect geometry from all angles</div>
        )}

        {/* Shaders toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl shrink-0">
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