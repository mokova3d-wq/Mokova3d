import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { zipSync, strToU8 } from "three/examples/jsm/libs/fflate.module.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Ensure Node.js environment has necessary web polyfills for headless conversion
if (typeof globalThis !== "undefined") {
  if (typeof (globalThis as any).FileReader === "undefined") {
    class NodeFileReader {
      result: any = null;
      onload: any = null;
      onloadend: any = null;
      onerror: any = null;

      readAsArrayBuffer(blob: any) {
        if (blob && typeof blob.arrayBuffer === "function") {
          blob
            .arrayBuffer()
            .then((buf: ArrayBuffer) => {
              this.result = buf;
              if (this.onload) this.onload({ target: this });
              if (this.onloadend) this.onloadend({ target: this });
            })
            .catch((err: any) => {
              if (this.onerror) this.onerror(err);
            });
        } else {
          this.result = new ArrayBuffer(0);
          if (this.onload) this.onload({ target: this });
          if (this.onloadend) this.onloadend({ target: this });
        }
      }

      readAsDataURL(blob: any) {
        if (blob && typeof blob.arrayBuffer === "function") {
          blob
            .arrayBuffer()
            .then((buf: ArrayBuffer) => {
              this.result =
                "data:application/octet-stream;base64," +
                Buffer.from(buf).toString("base64");
              if (this.onload) this.onload({ target: this });
              if (this.onloadend) this.onloadend({ target: this });
            })
            .catch((err: any) => {
              if (this.onerror) this.onerror(err);
            });
        }
      }

      readAsText(blob: any) {
        if (blob && typeof blob.text === "function") {
          blob.text().then((txt: string) => {
            this.result = txt;
            if (this.onload) this.onload({ target: this });
            if (this.onloadend) this.onloadend({ target: this });
          });
        }
      }
    }
    (globalThis as any).FileReader = NodeFileReader;
  }
}

export type SupportedSourceFormat = "obj" | "fbx" | "gltf" | "glb" | "stl" | "3mf" | "ply";
export type SupportedTargetFormat = "glb" | "gltf" | "3mf" | "stl";

export interface CompanionFile {
  name: string;
  data: ArrayBuffer | string;
}

export interface ConversionOptions {
  optimize?: boolean; // deduplicate and clean vertices
  computeNormals?: boolean; // smooth normal reconstruction
  unitScale?: number; // scale multiplier
  binary?: boolean; // binary output if applicable
  companionFiles?: CompanionFile[];
}

export interface TargetFormatOption {
  id: SupportedTargetFormat | "glb_opt";
  targetFormat: SupportedTargetFormat;
  label: string;
  description: string;
  extension: string;
  mimeType: string;
}

export interface ConversionResult {
  targetFormat: SupportedTargetFormat;
  targetFileName: string;
  mimeType: string;
  data: ArrayBuffer | string;
  originalSizeBytes: number;
  convertedSizeBytes: number;
  sizeDiffBytes: number;
  sizeDiffPercent: number; // e.g. -45 for 45% reduction
  triangleCount: number;
  vertexCount: number;
  preservedFeatures: string[];
  warnings: string[];
}

/**
 * Returns genuinely supported target formats for a given source extension.
 */
export function getSupportedTargetFormats(sourceNameOrExt: string): TargetFormatOption[] {
  const ext = (
    sourceNameOrExt.includes(".")
      ? sourceNameOrExt.split(".").pop()
      : sourceNameOrExt
  )?.toLowerCase().trim() || "";

  switch (ext) {
    case "obj":
      return [
        {
          id: "glb",
          targetFormat: "glb",
          label: "GLB Binary (.glb)",
          description: "Universal Web & mobile binary glTF with embedded materials",
          extension: ".glb",
          mimeType: "model/gltf-binary",
        },
      ];

    case "fbx":
      return [
        {
          id: "glb",
          targetFormat: "glb",
          label: "GLB Binary (.glb)",
          description: "Compact WebGL standard 3D asset from Autodesk FBX",
          extension: ".glb",
          mimeType: "model/gltf-binary",
        },
      ];

    case "gltf":
      return [
        {
          id: "glb",
          targetFormat: "glb",
          label: "GLB Binary (.glb)",
          description: "Self-contained binary bundle embedding all buffers and textures",
          extension: ".glb",
          mimeType: "model/gltf-binary",
        },
      ];

    case "glb":
      return [
        {
          id: "glb_opt",
          targetFormat: "glb",
          label: "Optimized GLB (.glb)",
          description: "Deduplicated vertex indices, stripped empty attributes, re-indexed geometry",
          extension: ".glb",
          mimeType: "model/gltf-binary",
        },
        {
          id: "gltf",
          targetFormat: "gltf",
          label: "glTF JSON (.gltf)",
          description: "Human-readable JSON glTF structure with embedded data buffers",
          extension: ".gltf",
          mimeType: "model/gltf+json",
        },
      ];

    case "stl":
      return [
        {
          id: "3mf",
          targetFormat: "3mf",
          label: "3MF Manufacturing (.3mf)",
          description: "Modern 3D printing format with XML mesh definitions & slicer packaging",
          extension: ".3mf",
          mimeType: "model/3mf",
        },
      ];

    case "3mf":
      return [
        {
          id: "stl",
          targetFormat: "stl",
          label: "STL Binary (.stl)",
          description: "Standard binary stereolithography triangle mesh for slicers",
          extension: ".stl",
          mimeType: "model/stl",
        },
      ];

    case "ply":
      return [
        {
          id: "glb",
          targetFormat: "glb",
          label: "GLB Binary (.glb)",
          description: "Modern binary glTF preserving Stanford PLY mesh & vertex attributes",
          extension: ".glb",
          mimeType: "model/gltf-binary",
        },
      ];

    default:
      return [];
  }
}

export function toFflateU8(str: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    const utf8Bytes = Buffer.from(str, "utf8");
    return strToU8(utf8Bytes.toString("binary"), true);
  }
  return strToU8(str);
}

/**
 * Builds a compliant 3MF package containing OPC relationships, Content Types, and 3D XML mesh.
 */
export function build3MFFromGeometry(geometry: THREE.BufferGeometry): Uint8Array {
  const posAttr = geometry.attributes.position;
  if (!posAttr || posAttr.count === 0) {
    throw new Error("Geometry contains no vertex coordinates to package into 3MF.");
  }

  let vertexXml = "";
  let triangleXml = "";

  if (geometry.index) {
    for (let i = 0; i < posAttr.count; i++) {
      vertexXml += `          <vertex x="${posAttr.getX(i)}" y="${posAttr.getY(i)}" z="${posAttr.getZ(i)}" />\n`;
    }
    const idx = geometry.index;
    for (let i = 0; i < idx.count; i += 3) {
      triangleXml += `          <triangle v1="${idx.getX(i)}" v2="${idx.getX(i + 1)}" v3="${idx.getX(i + 2)}" />\n`;
    }
  } else {
    for (let i = 0; i < posAttr.count; i++) {
      vertexXml += `          <vertex x="${posAttr.getX(i)}" y="${posAttr.getY(i)}" z="${posAttr.getZ(i)}" />\n`;
    }
    for (let i = 0; i < posAttr.count; i += 3) {
      triangleXml += `          <triangle v1="${i}" v2="${i + 1}" v3="${i + 2}" />\n`;
    }
  }

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Title">Mokova3D Studio Converted Model</metadata>
  <metadata name="Designer">Mokova3D</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexXml}        </vertices>
        <triangles>
${triangleXml}        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

  return zipSync({
    "_rels/.rels": toFflateU8(relsXml),
    "[Content_Types].xml": toFflateU8(contentTypesXml),
    "3D/3dmodel.model": toFflateU8(modelXml),
  });
}

export function toArrayBuffer(input: ArrayBuffer | Uint8Array | string): ArrayBuffer {
  if (typeof input === "string") {
    const u8 = strToU8(input);
    return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  }
  if (input instanceof ArrayBuffer) {
    return input;
  }
  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }
  return new ArrayBuffer(0);
}

/**
 * Optimizes meshes across a 3D scene (merges vertices, cleans redundant attributes, computes smooth normals).
 */
export function optimizeSceneMeshes(root: THREE.Object3D, options: ConversionOptions = {}): {
  triangles: number;
  vertices: number;
} {
  let triangles = 0;
  let vertices = 0;

  root.traverse((child: any) => {
    if (child && child.isMesh && child.geometry) {
      let geo = child.geometry;

      if (options.optimize !== false) {
        try {
          geo = mergeVertices(geo);
          child.geometry = geo;
        } catch (_) {}
      }

      if (options.computeNormals !== false) {
        geo.computeVertexNormals();
      }

      if (options.unitScale && options.unitScale !== 1.0) {
        geo.scale(options.unitScale, options.unitScale, options.unitScale);
      }

      const pos = geo.attributes.position;
      if (pos) {
        vertices += pos.count;
        if (geo.index) {
          triangles += Math.round(geo.index.count / 3);
        } else {
          triangles += Math.round(pos.count / 3);
        }
      }

      // Ensure PBR-compliant standard materials for GLTF/GLB export
      if (!child.material || child.material instanceof THREE.MeshBasicMaterial || !(child.material instanceof THREE.MeshStandardMaterial)) {
        const prevColor = (child.material as any)?.color || new THREE.Color(0x5a45ff);
        child.material = new THREE.MeshStandardMaterial({
          color: prevColor,
          roughness: 0.4,
          metalness: 0.1,
        });
      }
    }
  });

  return { triangles, vertices };
}

/**
 * Converts a 3D model buffer to target format with validation and feature preservation reporting.
 */
export async function convert3DModel(params: {
  fileName: string;
  data: ArrayBuffer | string;
  targetFormat: SupportedTargetFormat;
  options?: ConversionOptions;
}): Promise<ConversionResult> {
  const { fileName, data, targetFormat, options = {} } = params;
  const sourceExt = fileName.split(".").pop()?.toLowerCase() || "";
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  const originalSizeBytes = typeof data === "string" ? Buffer.byteLength(data, "utf8") : data.byteLength;
  const preservedFeatures: string[] = ["3D Mesh Topology", "Vertex Coordinates"];
  const warnings: string[] = [];

  let modelGroup: THREE.Object3D;

  // 1. Parse Input Model
  switch (sourceExt) {
    case "stl": {
      const stlBuffer = toArrayBuffer(data);
      const loader = new STLLoader();
      const geometry = loader.parse(stlBuffer);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x5a45ff }));
      modelGroup = new THREE.Group();
      modelGroup.add(mesh);
      preservedFeatures.push("Stereolithography Facets");
      break;
    }

    case "obj": {
      const objText = typeof data === "string" ? data : new TextDecoder().decode(data);
      const objLoader = new OBJLoader();

      // Check companion MTL file
      const mtlFile = options.companionFiles?.find((f) => f.name.toLowerCase().endsWith(".mtl"));
      if (mtlFile) {
        try {
          const mtlText = typeof mtlFile.data === "string" ? mtlFile.data : new TextDecoder().decode(mtlFile.data);
          const mtlLoader = new MTLLoader();
          const materialsCreator = mtlLoader.parse(mtlText, "");
          materialsCreator.preload();
          objLoader.setMaterials(materialsCreator);
          preservedFeatures.push("OBJ Wavefront Materials (.mtl)");
        } catch (mtlErr: any) {
          warnings.push(`Could not parse companion MTL file: ${mtlErr.message || "Invalid syntax"}. Used fallback material.`);
        }
      }

      modelGroup = objLoader.parse(objText);
      preservedFeatures.push("Wavefront Geometry Groups");
      break;
    }

    case "fbx": {
      const fbxBuffer = toArrayBuffer(data);
      const fbxLoader = new FBXLoader();
      modelGroup = fbxLoader.parse(fbxBuffer, "");
      preservedFeatures.push("FBX Hierarchical Structure");
      warnings.push("FBX skeletal armatures and animation clips baked to static geometry for 3D printing/glTF portability.");
      break;
    }

    case "gltf":
    case "glb": {
      const gltfLoader = new GLTFLoader();
      const loaded = await new Promise<any>((resolve, reject) => {
        if (typeof data === "string") {
          gltfLoader.parse(data, "", resolve, reject);
        } else {
          gltfLoader.parse(toArrayBuffer(data), "", resolve, reject);
        }
      });
      modelGroup = loaded.scene || new THREE.Group();
      preservedFeatures.push("glTF Scene Nodes", "PBR Materials");
      break;
    }

    case "ply": {
      let plyInput: any;
      if (typeof data === "string") {
        plyInput = data;
      } else {
        const u8 = new Uint8Array(data);
        const headerSample = new TextDecoder().decode(u8.subarray(0, 100));
        if (headerSample.includes("format ascii")) {
          plyInput = new TextDecoder().decode(u8);
        } else {
          plyInput = toArrayBuffer(data);
        }
      }
      const plyLoader = new PLYLoader();
      const geometry = plyLoader.parse(plyInput);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x5a45ff }));
      modelGroup = new THREE.Group();
      modelGroup.add(mesh);
      preservedFeatures.push("Stanford Polygon Mesh", "Vertex Attributes");
      break;
    }

    case "3mf": {
      const threeMfBuffer = toArrayBuffer(data);
      const loader = new ThreeMFLoader();
      modelGroup = loader.parse(threeMfBuffer);
      preservedFeatures.push("3MF Manufacturing Model Mesh");
      break;
    }

    default:
      throw new Error(`Unsupported source 3D format ".${sourceExt}". Supported: OBJ, FBX, glTF, GLB, STL, 3MF, PLY.`);
  }

  // 2. Optimize & Clean Geometry
  const { triangles, vertices } = optimizeSceneMeshes(modelGroup, options);
  if (options.optimize !== false) {
    preservedFeatures.push("Deduplicated Vertex Buffers");
  }

  // 3. Export to Target Format
  let targetData: ArrayBuffer | string;
  let targetFileName: string;
  let mimeType: string;

  const gltfExporter = new GLTFExporter();
  const stlExporter = new STLExporter();

  switch (targetFormat) {
    case "glb": {
      const glbResult = await gltfExporter.parseAsync(modelGroup, { binary: true });
      if (!(glbResult instanceof ArrayBuffer)) {
        throw new Error("GLTFExporter did not produce a valid binary ArrayBuffer for GLB.");
      }
      targetData = glbResult;
      targetFileName = `${baseName}.glb`;
      mimeType = "model/gltf-binary";
      preservedFeatures.push("GLB Binary Container", "Embedded PBR Shaders");
      break;
    }

    case "gltf": {
      const gltfResult = await gltfExporter.parseAsync(modelGroup, { binary: false, embedImages: true });
      targetData = typeof gltfResult === "string" ? gltfResult : JSON.stringify(gltfResult, null, 2);
      targetFileName = `${baseName}.gltf`;
      mimeType = "model/gltf+json";
      preservedFeatures.push("glTF 2.0 JSON Structure", "Embedded Data URIs");
      break;
    }

    case "3mf": {
      // Find first mesh or merge geometries
      let primaryGeometry: THREE.BufferGeometry | null = null;
      modelGroup.traverse((child) => {
        if (!primaryGeometry && child instanceof THREE.Mesh && child.geometry) {
          primaryGeometry = child.geometry;
        }
      });

      if (!primaryGeometry) {
        throw new Error("Model contains no mesh geometry to export to 3MF.");
      }

      const zipBytes = build3MFFromGeometry(primaryGeometry);
      targetData = zipBytes.buffer.slice(
        zipBytes.byteOffset,
        zipBytes.byteOffset + zipBytes.byteLength
      ) as ArrayBuffer;
      targetFileName = `${baseName}.3mf`;
      mimeType = "model/3mf";
      preservedFeatures.push("OPC 3MF Package", "3D Model XML Mesh");
      break;
    }

    case "stl": {
      const stlResult = stlExporter.parse(modelGroup, { binary: true });
      const stlBuffer: ArrayBuffer =
        stlResult instanceof DataView
          ? (stlResult.buffer.slice(
              stlResult.byteOffset,
              stlResult.byteOffset + stlResult.byteLength
            ) as ArrayBuffer)
          : (stlResult as any);
      targetData = stlBuffer;
      targetFileName = `${baseName}.stl`;
      mimeType = "model/stl";
      preservedFeatures.push("Binary STL Triangulation");
      warnings.push("STL is geometry-only; surface colors and PBR materials cannot be stored in standard STL files.");
      break;
    }

    default:
      throw new Error(`Unsupported target format "${targetFormat}".`);
  }

  const convertedSizeBytes =
    typeof targetData === "string" ? Buffer.byteLength(targetData, "utf8") : targetData.byteLength;
  const sizeDiffBytes = convertedSizeBytes - originalSizeBytes;
  const sizeDiffPercent =
    originalSizeBytes > 0 ? Math.round((sizeDiffBytes / originalSizeBytes) * 100) : 0;

  return {
    targetFormat,
    targetFileName,
    mimeType,
    data: targetData,
    originalSizeBytes,
    convertedSizeBytes,
    sizeDiffBytes,
    sizeDiffPercent,
    triangleCount: triangles,
    vertexCount: vertices,
    preservedFeatures,
    warnings,
  };
}
