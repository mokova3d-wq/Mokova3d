"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box, Eye, Camera, RotateCcw, Play, Pause, Upload, Layers,
  Sparkles, Download, MessageCircle, AlertTriangle, CheckCircle2,
  Shield, HelpCircle, FileCode, Sliders, Compass, ArrowRightLeft,
  RefreshCw, Check, ArrowRight, FileCheck, Info, Maximize2, Minimize
} from "lucide-react";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";
import {
  convert3DModel,
  getSupportedTargetFormats,
  ConversionResult,
  SupportedTargetFormat,
  CompanionFile,
} from "@/lib/3d-converter";

interface ModelStats {
  fileName: string;
  fileSizeBytes: number;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  volumeCm3: number;
  estimatedWeightGrams: number;
  triangleCount: number;
  vertexCount: number;
  fitsBuildPlate?: boolean;
  clearanceNotice?: string;
}

const SAMPLE_MODELS = [
  { id: "bracket", name: "Engineering Angle Bracket", desc: "Mechanical 90° mount" },
  { id: "gear", name: "Precision Involute Gear", desc: "16-Tooth mechanical drive gear" },
  { id: "vase", name: "Spiral Parametric Vase", desc: "Continuous organic vase geometry" },
];

export default function Browser3DViewerPage() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  // Workflow Mode: Option 1 (view) vs Option 2 (convert)
  const [activeWorkflow, setActiveWorkflow] = useState<"view" | "convert">("view");

  // === VIEW MODE STATE ===
  const [activeFile, setActiveFile] = useState<File | { name: string; buffer: ArrayBuffer; size: number } | null>(null);
  const [sampleType, setSampleType] = useState<string | null>("bracket");
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formatNotice, setFormatNotice] = useState<string>("");

  const [renderMode, setRenderMode] = useState<"shaded" | "wireframe" | "normals" | "xray">("shaded");
  const [modelColor, setModelColor] = useState<string>("#5a45ff");
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [bgStyle, setBgStyle] = useState<"dark" | "blueprint" | "light">("dark");
  const [currentView, setCurrentView] = useState<string>("iso");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelObjectRef = useRef<THREE.Object3D | null>(null);
  const buildPlateRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const materialRef = useRef<any>(null);

  // === CONVERT MODE STATE ===
  const [convertFile, setConvertFile] = useState<File | null>(null);
  const [companionFiles, setCompanionFiles] = useState<File[]>([]);
  const [selectedTargetFormat, setSelectedTargetFormat] = useState<SupportedTargetFormat | "glb_opt">("glb");
  const [optDeduplicate, setOptDeduplicate] = useState<boolean>(true);
  const [optComputeNormals, setOptComputeNormals] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [convertError, setConvertError] = useState<string>("");
  const convertInputRef = useRef<HTMLInputElement>(null);
  const companionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((flags) => {
        if (Array.isArray(flags)) {
          const found = flags.find((f: any) => f.id === "feature_3d_renderer");
          setIsEnabled(found ? found.enabled === 1 : true);
        } else {
          setIsEnabled(true);
        }
      })
      .catch(() => setIsEnabled(true));
  }, []);

  // Update target format default when a file is selected in Convert mode
  useEffect(() => {
    if (convertFile) {
      const ext = convertFile.name.split(".").pop()?.toLowerCase() || "";
      const available = getSupportedTargetFormats(ext);
      if (available.length > 0) {
        setSelectedTargetFormat(available[0].id);
      }
      setConversionResult(null);
      setConvertError("");
    }
  }, [convertFile]);

  // --- 3D INTERACTIVE VIEWER (OPTION 1) ---
  useEffect(() => {
    if (isEnabled === false || activeWorkflow !== "view") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    setErrorMessage("");
    setFormatNotice("");
    setIsLoading(true);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 1000);
    camera.position.set(2.8, 2.6, 4.2);
    camera.lookAt(0, 1.1, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
    } catch (renderInitErr: any) {
      console.error("WebGLRenderer initialization failed:", renderInitErr);
      setErrorMessage(
        "WebGL graphics could not be initialized or hardware acceleration is unavailable. Click 'Retry 3D Engine' or switch to Option 2 to convert files."
      );
      setIsLoading(false);
      return;
    }

    const onContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL context lost.");
      setErrorMessage("WebGL graphics context was lost. Click 'Retry 3D Engine' to re-initialize the 3D viewport.");
      setIsLoading(false);
    };

    const onContextRestored = () => {
      console.log("WebGL context restored.");
      setCanvasKey((k) => k + 1);
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    // Professional Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);

    const dirKey = new THREE.DirectionalLight(0xfff5e6, 2.4);
    dirKey.position.set(6, 10, 6);
    dirKey.castShadow = true;
    scene.add(dirKey);

    const dirFill = new THREE.DirectionalLight(0x7d6bff, 1.6);
    dirFill.position.set(-6, 5, -4);
    scene.add(dirFill);

    const topSun = new THREE.DirectionalLight(0xffffff, 1.2);
    topSun.position.set(0, 12, 0);
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
    buildPlateRef.current = buildPlateGroup;
    gridHelperRef.current = gridMajor;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.6;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI - 0.02;
    controls.target.set(0, 1.1, 0);
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    const processObject3D = (obj: THREE.Object3D, name: string, fileSize: number) => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      obj.scale.setScalar(2.4 / maxDim);
      obj.position.set(0, 1.1, 0);

      const colorHex = parseInt(modelColor.replace("#", ""), 16) || 0x5a45ff;
      let tris = 0;
      let verts = 0;

      obj.traverse((child: any) => {
        if (child.isMesh && child.geometry) {
          child.castShadow = true;
          child.receiveShadow = true;
          const pos = child.geometry.attributes.position;
          if (pos) {
            verts += pos.count;
            tris += child.geometry.index ? Math.round(child.geometry.index.count / 3) : Math.round(pos.count / 3);
          }
          if (renderMode === "normals") {
            child.material = new THREE.MeshNormalMaterial();
          } else if (renderMode === "xray") {
            child.material = new THREE.MeshPhysicalMaterial({
              color: colorHex,
              transmission: 0.9,
              opacity: 1,
              transparent: true,
              roughness: 0.1,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: colorHex,
              roughness: 0.35,
              metalness: 0.1,
              wireframe: renderMode === "wireframe",
            });
          }
          materialRef.current = child.material;
        }
      });

      scene.add(obj);
      modelObjectRef.current = obj;

      const w = Math.round(size.x > 5 ? size.x : size.x * 50);
      const d = Math.round(size.z > 5 ? size.z : size.z * 50);
      const h = Math.round(size.y > 5 ? size.y : size.y * 50);
      const volume = Math.max(1, Math.round(((w * d * h) / 1000) * 0.35));
      const fitsBuildPlate = w <= 250 && d <= 250 && h <= 250;

      setStats({
        fileName: name,
        fileSizeBytes: fileSize,
        widthMm: w,
        depthMm: d,
        heightMm: h,
        volumeCm3: volume,
        estimatedWeightGrams: Math.round(volume * 1.24),
        triangleCount: tris,
        vertexCount: verts,
        fitsBuildPlate,
        clearanceNotice: fitsBuildPlate
          ? "Within 250×250×250mm Studio Build Volume"
          : "Exceeds 250mm single-bed limit (segmentation recommended)",
      });

      setIsLoading(false);
    };

    const processGeometry = (geo: THREE.BufferGeometry, name: string, fileSize: number) => {
      geo.computeVertexNormals();
      const colorHex = parseInt(modelColor.replace("#", ""), 16) || 0x5a45ff;
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.1,
        wireframe: renderMode === "wireframe",
      });
      materialRef.current = mat;
      const mesh = new THREE.Mesh(geo, mat);
      processObject3D(mesh, name, fileSize);
    };

    if (activeFile) {
      const ext = activeFile.name.split(".").pop()?.toLowerCase();
      const fileBytes = (activeFile as any).size || (activeFile as any).buffer?.byteLength || 0;

      const loadFromBuffer = (buffer: ArrayBuffer) => {
        try {
          if (ext === "stl") {
            const loader = new STLLoader();
            const geo = loader.parse(buffer);
            processGeometry(geo, activeFile.name, fileBytes);
          } else if (ext === "obj") {
            const text = new TextDecoder().decode(buffer);
            const loader = new OBJLoader();
            const obj = loader.parse(text);
            processObject3D(obj, activeFile.name, fileBytes);
          } else if (ext === "gltf" || ext === "glb") {
            const loader = new GLTFLoader();
            loader.parse(
              buffer,
              "",
              (gltf) => {
                processObject3D(gltf.scene, activeFile.name, fileBytes);
              },
              (err) => {
                setErrorMessage("Failed to parse glTF/GLB: " + err.message);
                setIsLoading(false);
              }
            );
          } else if (ext === "ply") {
            const loader = new PLYLoader();
            const geo = loader.parse(buffer);
            processGeometry(geo, activeFile.name, fileBytes);
          } else if (ext === "3mf") {
            const loader = new ThreeMFLoader();
            const group = loader.parse(buffer);
            processObject3D(group, activeFile.name, fileBytes);
          } else if (ext === "fbx") {
            const loader = new FBXLoader();
            const group = loader.parse(buffer, "");
            processObject3D(group, activeFile.name, fileBytes);
            setFormatNotice("FBX skeleton bones baked into static geometry for interactive viewing.");
          } else {
            setErrorMessage("Format ." + ext + " is not directly viewable. Try converting it in the Convert 3D File tab.");
            setIsLoading(false);
          }
        } catch (err: any) {
          setErrorMessage("Error parsing " + (ext?.toUpperCase() || "file") + ": " + (err.message || "Invalid file content"));
          setIsLoading(false);
        }
      };

      if ("buffer" in activeFile && activeFile.buffer instanceof ArrayBuffer) {
        loadFromBuffer(activeFile.buffer);
      } else if (activeFile instanceof File) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(activeFile);
        reader.onload = (e) => {
          const buf = e.target?.result as ArrayBuffer;
          if (buf) loadFromBuffer(buf);
        };
        reader.onerror = () => {
          setErrorMessage("Failed to read local file.");
          setIsLoading(false);
        };
      }
    } else {
      let geo: THREE.BufferGeometry;
      let name = "Engineering Angle Bracket";
      if (sampleType === "gear") {
        geo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 18);
        name = "16-Tooth Precision Gear";
      } else if (sampleType === "vase") {
        geo = new THREE.CylinderGeometry(0.5, 0.8, 1.8, 24);
        name = "Spiral Parametric Vase";
      } else {
        geo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
      }
      processGeometry(geo, name, 1420000);
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
      if (!container || !renderer || !camera) return;
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
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      // Deep GPU geometry and material disposal
      if (sceneRef.current) {
        sceneRef.current.traverse((child: any) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
      rendererRef.current = null;
    };
  }, [activeFile, sampleType, isEnabled, activeWorkflow, canvasKey]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  useEffect(() => {
    if (materialRef.current) {
      const colorHex = parseInt(modelColor.replace("#", ""), 16) || 0x5a45ff;
      if ("color" in materialRef.current) {
        (materialRef.current as any).color.setHex(colorHex);
      }
      if ("wireframe" in materialRef.current) {
        (materialRef.current as any).wireframe = renderMode === "wireframe";
      }
    }
  }, [modelColor, renderMode]);

  useEffect(() => {
    if (buildPlateRef.current) {
      buildPlateRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const setCameraPreset = (view: "front" | "top" | "plate" | "right" | "iso" | "reset") => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    setIsRotating(false);
    setCurrentView(view);

    if (view === "top") {
      camera.position.set(0, 5.0, 0.0001);
      camera.up.set(0, 0, -1);
      controls.target.set(0, 1.1, 0);
    } else if (view === "plate") {
      camera.position.set(0, 6.2, 0.0001);
      camera.up.set(0, 0, -1);
      controls.target.set(0, 0, 0);
    } else if (view === "front") {
      camera.position.set(0, 1.1, 4.8);
      camera.up.set(0, 1, 0);
      controls.target.set(0, 1.1, 0);
    } else if (view === "right") {
      camera.position.set(4.8, 1.1, 0);
      camera.up.set(0, 1, 0);
      controls.target.set(0, 1.1, 0);
    } else if (view === "iso" || view === "reset") {
      camera.position.set(2.8, 2.6, 4.2);
      camera.up.set(0, 1, 0);
      controls.target.set(0, 1.1, 0);
    }
    controls.update();
  };

  const toggleFullscreen = () => {
    const el = viewportBoxRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleCaptureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = (stats?.fileName || "mokova3d-model") + "-render.png";
    link.href = url;
    link.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setActiveFile(e.target.files[0]);
      setSampleType(null);
    }
  };

  // --- CONVERT 3D MODEL HANDLER (OPTION 2) ---
  const handlePerformConversion = async () => {
    if (!convertFile) return;

    setIsConverting(true);
    setConvertError("");
    setConversionResult(null);

    try {
      const buffer = await convertFile.arrayBuffer();

      const companionList: CompanionFile[] = [];
      for (const comp of companionFiles) {
        if (comp.name.endsWith(".mtl") || comp.name.endsWith(".txt")) {
          const txt = await comp.text();
          companionList.push({ name: comp.name, data: txt });
        } else {
          const buf = await comp.arrayBuffer();
          companionList.push({ name: comp.name, data: buf });
        }
      }

      const targetFormat: SupportedTargetFormat =
        selectedTargetFormat === "glb_opt" ? "glb" : selectedTargetFormat;

      const result = await convert3DModel({
        fileName: convertFile.name,
        data: buffer,
        targetFormat,
        options: {
          optimize: optDeduplicate,
          computeNormals: optComputeNormals,
          companionFiles: companionList,
        },
      });

      setConversionResult(result);
    } catch (err: any) {
      setConvertError(err.message || "Conversion failed. Please verify the file is not corrupted.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadConverted = () => {
    if (!conversionResult) return;
    const blob =
      typeof conversionResult.data === "string"
        ? new Blob([conversionResult.data], { type: conversionResult.mimeType })
        : new Blob([conversionResult.data], { type: conversionResult.mimeType });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = conversionResult.targetFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handlePreviewConvertedInViewer = () => {
    if (!conversionResult) return;
    const buffer =
      typeof conversionResult.data === "string"
        ? new TextEncoder().encode(conversionResult.data).buffer
        : conversionResult.data;

    setActiveFile({
      name: conversionResult.targetFileName,
      buffer,
      size: conversionResult.convertedSizeBytes,
    });
    setSampleType(null);
    setActiveWorkflow("view");
  };

  if (isEnabled === false) {
    return (
      <div className="min-h-screen wrap py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-500/10 text-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
          <Box className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold font-display text-[#0e0c1d]">
          3D Model Studio Paused
        </h1>
        <p className="text-sm text-[#6a6880] max-w-md mx-auto leading-relaxed">
          The browser-based 3D studio and converter module is currently disabled in system settings.
        </p>
        <Link href="/products" className="btn dark text-xs font-bold inline-flex mt-2">
          Browse 3D Catalog
        </Link>
      </div>
    );
  }

  const bgClasses = {
    dark: "bg-[#090b0e]",
    blueprint: "bg-[#0a192f]",
    light: "bg-[#f1f5f9]",
  };

  const formatOptions = convertFile
    ? getSupportedTargetFormats(convertFile.name)
    : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Studio Header Bar & Option 1 vs Option 2 Mode Switcher */}
      <div className="border-b border-black/10 bg-white py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
                3D METROLOGY &amp; CONVERTER
              </span>
              <h1 className="text-xl font-bold font-display text-[#0e0c1d]">
                Browser 3D Studio
              </h1>
            </div>
            <p className="text-xs text-[#6a6880] mt-0.5">
              100% Client-Side. Inspect 3D models with true orbit controls or convert between STL, 3MF, OBJ, FBX, PLY &amp; GLB.
            </p>
          </div>

          {/* Workflow Mode Switcher: Option 1 (View) vs Option 2 (Convert) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#faf9f7] border border-black/10 rounded-2xl">
            <button
              onClick={() => setActiveWorkflow("view")}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (activeWorkflow === "view" ? "bg-[#5a45ff] text-white shadow-sm" : "text-[#6a6880] hover:text-[#0e0c1d]")}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Option 1: View 3D Model</span>
            </button>

            <button
              onClick={() => setActiveWorkflow("convert")}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (activeWorkflow === "convert" ? "bg-[#0e0c1d] text-white shadow-sm" : "text-[#6a6880] hover:text-[#0e0c1d]")}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#c8f542]" />
              <span>Option 2: Convert File</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPTION 1: INTERACTIVE 3D VIEWER WORKFLOW                                  */}
      {/* ========================================================================= */}
      {activeWorkflow === "view" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div
              ref={viewportBoxRef}
              className={"relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden border border-black/10 shadow-2xl flex flex-col select-none transition-colors duration-300 " + bgClasses[bgStyle]}
            >
              {/* Top Viewport Header */}
              <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono font-bold text-[#c8f542] border border-white/10">
                    VIEWER
                  </span>
                  <span className="text-xs font-mono text-white/90 font-bold truncate max-w-[180px]">
                    {stats?.fileName || "Specimen Model"}
                  </span>
                </div>

                {/* View Angles & Fullscreen Toolbar */}
                <div className="flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-lg">
                  <button
                    onClick={() => setIsRotating(!isRotating)}
                    title={isRotating ? "Pause Turntable" : "Auto Rotate Turntable"}
                    className={"p-1.5 rounded-lg transition-colors cursor-pointer " + (isRotating ? "bg-[#5a45ff] text-white" : "text-white/80 hover:bg-white/20 hover:text-white")}
                  >
                    {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setCameraPreset("reset")}
                    title="Reset to 3D Isometric View"
                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen Workspace" : "Enter Fullscreen Workspace"}
                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="w-[1px] h-4 bg-white/20 mx-1" />

                  <button
                    onClick={() => setCameraPreset("plate")}
                    className={"px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 " + (currentView === "plate" ? "bg-[#c8f542] text-[#0e0c1d] shadow-xs" : "text-[#c8f542] hover:bg-white/15")}
                    title="Direct Overhead Top Plate & Print Bed View"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Top Plate</span>
                  </button>

                  <button
                    onClick={() => setCameraPreset("top")}
                    className={"px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer " + (currentView === "top" ? "bg-[#5a45ff] text-white shadow-xs" : "text-white/80 hover:text-white hover:bg-white/15")}
                    title="Top-Down Model Focus View"
                  >
                    Top
                  </button>

                  <button
                    onClick={() => setCameraPreset("front")}
                    className={"px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer " + (currentView === "front" ? "bg-[#5a45ff] text-white shadow-xs" : "text-white/80 hover:text-white hover:bg-white/15")}
                    title="Front Ortho View"
                  >
                    Front
                  </button>

                  <button
                    onClick={() => setCameraPreset("right")}
                    className={"px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer " + (currentView === "right" ? "bg-[#5a45ff] text-white shadow-xs" : "text-white/80 hover:text-white hover:bg-white/15")}
                    title="Right Profile View"
                  >
                    Right
                  </button>

                  <button
                    onClick={() => setCameraPreset("iso")}
                    className={"px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer " + (currentView === "iso" ? "bg-[#5a45ff] text-white shadow-xs" : "text-white/80 hover:text-white hover:bg-white/15")}
                    title="3D Studio Perspective"
                  >
                    3D Studio
                  </button>
                </div>
              </div>

              {/* Canvas Viewport */}
              <div
                ref={containerRef}
                className="w-full flex-1 relative flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
              >
                <canvas key={canvasKey} ref={canvasRef} className="w-full h-full block" />

                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                    <div className="w-8 h-8 border-2 border-[#5a45ff] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-[#c8f542]">Parsing 3D Mesh in Browser...</span>
                  </div>
                )}
              </div>

              {/* Viewport Footer Toolbar */}
              <div className="p-3.5 bg-black/50 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/70">
                  <span>Left Click: Orbit</span>
                  <span>•</span>
                  <span>Right Click: Pan</span>
                  <span>•</span>
                  <span>Scroll: Zoom</span>
                  <span>•</span>
                  <span className="text-[#c8f542]">Overhead View Enabled</span>
                </div>

                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setRenderMode("shaded")}
                    className={"px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer " + (renderMode === "shaded" ? "bg-[#5a45ff] text-white" : "text-white/60 hover:text-white")}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => setRenderMode("wireframe")}
                    className={"px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer " + (renderMode === "wireframe" ? "bg-[#c8f542] text-[#0e0c1d]" : "text-white/60 hover:text-white")}
                  >
                    Wireframe
                  </button>
                  <button
                    onClick={() => setRenderMode("normals")}
                    className={"px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer " + (renderMode === "normals" ? "bg-white text-[#0e0c1d]" : "text-white/60 hover:text-white")}
                  >
                    Normals
                  </button>
                  <button
                    onClick={() => setRenderMode("xray")}
                    className={"px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer " + (renderMode === "xray" ? "bg-[#38bdf8] text-[#0e0c1d]" : "text-white/60 hover:text-white")}
                  >
                    X-Ray
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setCanvasKey((k) => k + 1);
                      setErrorMessage("");
                    }}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 rounded-xl text-red-800 font-bold text-[11px] cursor-pointer shadow-xs"
                  >
                    Retry 3D Engine
                  </button>
                  <button
                    onClick={() => setActiveWorkflow("convert")}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-xl text-red-800 font-bold text-[11px] cursor-pointer"
                  >
                    Convert to Supported Format →
                  </button>
                </div>
              </div>
            )}

            {formatNotice && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{formatNotice}</span>
              </div>
            )}

            {/* View Actions & Specimen Selectors */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-black/10 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn dark text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#c8f542]" />
                  <span>Open Local 3D Model</span>
                </button>

                <button
                  onClick={handleCaptureScreenshot}
                  className="py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-[#faf9f7] text-xs font-bold text-[#0e0c1d] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#5a45ff]" />
                  <span>Capture PNG</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".stl,.obj,.gltf,.glb,.ply,.3mf,.fbx"
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6a6880] font-bold text-[11px] uppercase font-mono">Samples:</span>
                {SAMPLE_MODELS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveFile(null);
                      setSampleType(s.id);
                    }}
                    className={"px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer " + (sampleType === s.id && !activeFile ? "bg-[#5a45ff] text-white shadow-xs" : "bg-[#faf9f7] text-[#0e0c1d] hover:bg-[#eeedfb] border border-black/5")}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Converter Callout */}
            <div className="p-4 rounded-2xl bg-[#eeedfb]/60 border border-[#5a45ff]/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#5a45ff] shrink-0" />
                <span className="text-[#0e0c1d] font-semibold">
                  Need to convert your 3D model into GLB, 3MF, or STL for 3D printing?
                </span>
              </div>
              <button
                onClick={() => setActiveWorkflow("convert")}
                className="font-bold text-[#5a45ff] hover:underline whitespace-nowrap cursor-pointer"
              >
                Open File Converter →
              </button>
            </div>
          </div>

          {/* Right Sidebar: Telemetry & Shader Settings */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-black/10 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <h3 className="font-bold font-display text-sm text-[#0e0c1d]">
                  Physical Print Measurements
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  CALCULATED
                </span>
              </div>

              {stats ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#6a6880]">Bounding Dimensions:</span>
                    <strong className="font-mono text-[#0e0c1d] text-sm">
                      {stats.widthMm} × {stats.depthMm} × {stats.heightMm} mm
                    </strong>
                  </div>

                  <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#6a6880]">Estimated Weight:</span>
                    <strong className="font-mono text-[#5a45ff] text-sm">
                      ~{stats.estimatedWeightGrams} grams
                    </strong>
                  </div>

                  <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#6a6880]">Mesh Volume:</span>
                    <strong className="font-mono text-[#0e0c1d]">{stats.volumeCm3} cm³</strong>
                  </div>

                  <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#6a6880]">Triangle Count:</span>
                    <strong className="font-mono text-[#0e0c1d]">
                      {stats.triangleCount.toLocaleString()} Tris
                    </strong>
                  </div>

                  <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#6a6880]">File Size:</span>
                    <strong className="font-mono text-[#0e0c1d]">
                      {(stats.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </strong>
                  </div>

                  {stats.clearanceNotice && (
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                        stats.fitsBuildPlate
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      <span>{stats.clearanceNotice}</span>
                      <span className="font-bold">{stats.fitsBuildPlate ? "✓ Fits Bed" : "⚠️ Oversize"}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#6a6880] py-4 text-center">Loading telemetry...</div>
              )}

              {stats && (
                <a
                  href={"https://wa.me/918527373680?text=" + encodeURIComponent(
                    "Hi Mokova3D! I inspected my 3D model \"" + stats.fileName + "\" on your browser renderer.\n• Dimensions: " + stats.widthMm + " × " + stats.depthMm + " × " + stats.heightMm + " mm\n• Est. Weight: ~" + stats.estimatedWeightGrams + "g\n• Triangles: " + stats.triangleCount.toLocaleString() + "\nCan you provide a 3D printing quote and delivery timeline for Delhi NCR?"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Quote This 3D File on WhatsApp →</span>
                </a>
              )}
            </div>

            <div className="bg-white border border-black/10 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold font-display text-sm text-[#0e0c1d]">
                Shader &amp; Canvas Options
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#0e0c1d] mb-1.5">Model Color</label>
                  <div className="flex items-center gap-2">
                    {["#5a45ff", "#c8f542", "#f59e0b", "#38bdf8", "#ffffff", "#0e0c1d"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setModelColor(c)}
                        style={{ backgroundColor: c }}
                        className={"w-6 h-6 rounded-full border-2 transition-transform cursor-pointer " + (modelColor === c ? "scale-125 border-[#5a45ff] shadow-sm" : "border-black/20 hover:scale-110")}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0e0c1d] mb-1.5">Background Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setBgStyle("dark")}
                      className={"p-2 rounded-xl border text-center font-bold text-[11px] cursor-pointer " + (bgStyle === "dark" ? "bg-[#0e0c1d] text-white border-black" : "bg-[#faf9f7] text-[#6a6880]")}
                    >
                      Dark Studio
                    </button>
                    <button
                      onClick={() => setBgStyle("blueprint")}
                      className={"p-2 rounded-xl border text-center font-bold text-[11px] cursor-pointer " + (bgStyle === "blueprint" ? "bg-[#0a192f] text-white border-blue-900" : "bg-[#faf9f7] text-[#6a6880]")}
                    >
                      Blueprint
                    </button>
                    <button
                      onClick={() => setBgStyle("light")}
                      className={"p-2 rounded-xl border text-center font-bold text-[11px] cursor-pointer " + (bgStyle === "light" ? "bg-white text-[#0e0c1d] border-black" : "bg-[#faf9f7] text-[#6a6880]")}
                    >
                      Clean Slate
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-black/5">
                  <span className="font-bold text-[#0e0c1d]">Build Plate Grid</span>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={"px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer " + (showGrid ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}
                  >
                    {showGrid ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2: 3D FILE CONVERSION WORKFLOW (STANDALONE, RESOURCE-CONSCIOUS)    */}
      {/* ========================================================================= */}
      {activeWorkflow === "convert" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 my-8 space-y-8">
          {/* Workflow Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0f14] via-[#121622] to-[#0c0f14] text-white border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#5a45ff]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#c8f542]/15 text-xs font-mono font-bold text-[#c8f542] border border-[#c8f542]/30 inline-block">
                STANDALONE 3D CONVERTER
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Convert, Optimize &amp; Export 3D Models
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Direct in-browser conversion between modern and manufacturing formats. No cloud upload required, 100% private, with full geometry validation.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-white/80">
                <span className="px-2 py-0.5 rounded bg-white/10">OBJ → GLB</span>
                <span className="px-2 py-0.5 rounded bg-white/10">FBX → GLB</span>
                <span className="px-2 py-0.5 rounded bg-white/10">glTF → GLB</span>
                <span className="px-2 py-0.5 rounded bg-white/10">GLB → Optimized GLB</span>
                <span className="px-2 py-0.5 rounded bg-white/10">GLB → glTF</span>
                <span className="px-2 py-0.5 rounded bg-white/10">STL ↔ 3MF</span>
                <span className="px-2 py-0.5 rounded bg-white/10">PLY → GLB</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Upload & Configuration Form (7 cols) */}
            <div className="md:col-span-7 space-y-6">
              {/* Step 1: Upload Source Model */}
              <div className="bg-white border border-black/10 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                      1
                    </span>
                    <h3 className="font-bold text-sm font-display text-[#0e0c1d]">
                      Select Source 3D Model
                    </h3>
                  </div>
                  {convertFile && (
                    <button
                      onClick={() => {
                        setConvertFile(null);
                        setCompanionFiles([]);
                        setConversionResult(null);
                      }}
                      className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Clear File
                    </button>
                  )}
                </div>

                {!convertFile ? (
                  <div
                    onClick={() => convertInputRef.current?.click()}
                    className="border-2 border-dashed border-[#5a45ff]/40 hover:border-[#5a45ff] bg-[#faf9f7] hover:bg-[#eeedfb]/30 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#eeedfb] text-[#5a45ff] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0e0c1d]">
                        Click or drag a 3D model here
                      </p>
                      <p className="text-xs text-[#6a6880] mt-1">
                        Supports <span className="font-mono font-semibold">.OBJ, .FBX, .GLTF, .GLB, .STL, .3MF, .PLY</span> up to 50MB
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={convertInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setConvertFile(e.target.files[0]);
                        }
                      }}
                      accept=".stl,.obj,.gltf,.glb,.ply,.3mf,.fbx"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#faf9f7] border border-black/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0e0c1d] text-white flex items-center justify-center">
                        <FileCode className="w-5 h-5 text-[#c8f542]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0e0c1d] truncate max-w-[200px] sm:max-w-xs">
                          {convertFile.name}
                        </p>
                        <p className="text-[11px] font-mono text-[#6a6880]">
                          {(convertFile.size / (1024 * 1024)).toFixed(2)} MB • {convertFile.name.split(".").pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => convertInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#eeedfb] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <input
                      type="file"
                      ref={convertInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setConvertFile(e.target.files[0]);
                        }
                      }}
                      accept=".stl,.obj,.gltf,.glb,.ply,.3mf,.fbx"
                      className="hidden"
                    />
                  </div>
                )}

                {/* Optional Companion MTL / Texture Attachment */}
                {convertFile && convertFile.name.toLowerCase().endsWith(".obj") && (
                  <div className="pt-2 border-t border-black/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0e0c1d]">Optional: Attach Companion Material (.mtl)</span>
                      <button
                        type="button"
                        onClick={() => companionInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#5a45ff] hover:underline cursor-pointer"
                      >
                        + Add .MTL / Textures
                      </button>
                      <input
                        type="file"
                        ref={companionInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            setCompanionFiles(Array.from(e.target.files));
                          }
                        }}
                        multiple
                        accept=".mtl,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                    </div>
                    {companionFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {companionFiles.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[#eeedfb] text-[10px] font-mono text-[#5a45ff]">
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Choose Target Format */}
              <div className="bg-white border border-black/10 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                    2
                  </span>
                  <h3 className="font-bold text-sm font-display text-[#0e0c1d]">
                    Choose Output Format &amp; Quality Settings
                  </h3>
                </div>

                {!convertFile ? (
                  <p className="text-xs text-[#6a6880]">
                    Upload a 3D model above to view supported target conversion formats.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#0e0c1d]">Available Target Formats</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formatOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedTargetFormat(opt.id)}
                            className={"p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 " + (selectedTargetFormat === opt.id ? "bg-[#eeedfb] border-[#5a45ff] shadow-xs" : "bg-[#faf9f7] border-black/10 hover:border-black/20")}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#0e0c1d]">{opt.label}</span>
                              {selectedTargetFormat === opt.id && (
                                <Check className="w-4 h-4 text-[#5a45ff]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#6a6880] leading-snug">
                              {opt.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Optimization Options */}
                    <div className="p-4 bg-[#faf9f7] rounded-2xl border border-black/5 space-y-3 text-xs">
                      <span className="font-bold text-[#0e0c1d] block">Optimization Options</span>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optDeduplicate}
                          onChange={(e) => setOptDeduplicate(e.target.checked)}
                          className="rounded text-[#5a45ff]"
                        />
                        <span className="text-[#374151]">
                          Deduplicate vertices &amp; merge redundant geometry index buffers
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optComputeNormals}
                          onChange={(e) => setOptComputeNormals(e.target.checked)}
                          className="rounded text-[#5a45ff]"
                        />
                        <span className="text-[#374151]">
                          Recalculate smooth face normals for seamless rendering
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handlePerformConversion}
                      disabled={isConverting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#5a45ff] hover:bg-[#4330e6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#c8f542]" />
                          <span>Converting 3D Geometry...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4 text-[#c8f542]" />
                          <span>Convert Model to {selectedTargetFormat.toUpperCase()}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {convertError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{convertError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Output & Action Studio (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white border border-black/10 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <h3 className="font-bold font-display text-sm text-[#0e0c1d]">
                    Conversion Summary &amp; Download
                  </h3>
                  {conversionResult && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      READY
                    </span>
                  )}
                </div>

                {!conversionResult ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#faf9f7] border border-black/10 flex items-center justify-center mx-auto text-[#6a6880]">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#0e0c1d]">Awaiting Conversion</p>
                    <p className="text-[11px] text-[#6a6880] max-w-xs mx-auto">
                      Choose a source model and target format to see compression metrics and download the converted asset.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Size & Metrics Card */}
                    <div className="p-4 rounded-2xl bg-[#faf9f7] border border-black/5 space-y-3 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6880]">Output File:</span>
                        <strong className="text-[#0e0c1d]">{conversionResult.targetFileName}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6880]">Original Size:</span>
                        <span className="text-[#0e0c1d]">
                          {(conversionResult.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6880]">Converted Size:</span>
                        <strong className="text-[#5a45ff]">
                          {(conversionResult.convertedSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </strong>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-black/5">
                        <span className="text-[#6a6880]">File Size Delta:</span>
                        <span
                          className={"font-bold " + (conversionResult.sizeDiffBytes <= 0 ? "text-emerald-700" : "text-amber-700")}
                        >
                          {conversionResult.sizeDiffBytes <= 0
                            ? "Reduced " + Math.abs(conversionResult.sizeDiffPercent) + "%"
                            : "Expanded " + conversionResult.sizeDiffPercent + "%"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6880]">Triangles / Vertices:</span>
                        <span className="text-[#0e0c1d]">
                          {conversionResult.triangleCount.toLocaleString()} / {conversionResult.vertexCount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Preserved Features List */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-[#0e0c1d] text-[11px] uppercase tracking-wider block">
                        Preserved Features:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {conversionResult.preservedFeatures.map((feat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Warnings (if any) */}
                    {conversionResult.warnings.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <span className="font-bold block text-[11px]">Notice:</span>
                        {conversionResult.warnings.map((w, idx) => (
                          <p key={idx} className="text-[11px] leading-tight">
                            • {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Action Triggers */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleDownloadConverted}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download {conversionResult.targetFileName}</span>
                      </button>

                      {/* Optional Interactive Preview */}
                      <button
                        onClick={handlePreviewConvertedInViewer}
                        className="w-full py-3 px-4 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#c8f542]" />
                        <span>Preview in Interactive 3D Viewer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Format Information Card */}
              <div className="p-5 rounded-3xl bg-[#faf9f7] border border-black/10 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#5a45ff]" />
                  <span className="font-bold text-[#0e0c1d]">Studio Privacy &amp; Integrity Guarantee</span>
                </div>
                <p className="text-[#6a6880] leading-relaxed text-[11px]">
                  Conversions are processed client-side inside your browser sandbox. Your proprietary CAD, STL, and OBJ geometry files are never sent to third-party APIs or shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
