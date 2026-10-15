/**
 * 3D Web Experience Architecture Contract
 * Decouples 3D viewer rendering implementation (Three.js / WebGL / model-viewer)
 * from core UI presentation and application logic.
 */

export type ModelFormat = "gltf" | "glb" | "usdz";

export interface CameraPreset {
  fov: number;
  position: [number, number, number];
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
}

export interface Model3DDescriptor {
  id: string;
  assetUrl: string;
  format: ModelFormat;
  byteSize: number;
  dracoCompressed: boolean;
  triangleCount: number;
  dimensions: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  cameraPreset?: Partial<CameraPreset>;
  posterFallbackUrl: string;
  availableExplodedNodes?: string[];
  materialsConfigurable?: boolean;
}

export type ViewportRenderMode = "shaded" | "wireframe" | "specular" | "xray";

export interface ViewportState {
  isLoading: boolean;
  loadProgressPercent: number;
  error?: string | null;
  activeRenderMode: ViewportRenderMode;
  isAutoRotating: boolean;
  isExplodedView: boolean;
  activeHotspotId?: string | null;
}

export interface IModel3DViewerProps {
  model: Model3DDescriptor;
  initialRenderMode?: ViewportRenderMode;
  autoRotate?: boolean;
  showInspectorControls?: boolean;
  onHotspotClick?: (hotspotId: string) => void;
  onLoadComplete?: () => void;
  onError?: (err: Error) => void;
  className?: string;
}
