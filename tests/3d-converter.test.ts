import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  convert3DModel,
  getSupportedTargetFormats,
  build3MFFromGeometry,
} from "@/lib/3d-converter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

describe("Comprehensive 3D Model Conversion Engine", () => {
  it("provides correct target format pairings based on source file extension", () => {
    expect(getSupportedTargetFormats("model.obj").map((t) => t.id)).toEqual(["glb"]);
    expect(getSupportedTargetFormats("asset.fbx").map((t) => t.id)).toEqual(["glb"]);
    expect(getSupportedTargetFormats("scene.gltf").map((t) => t.id)).toEqual(["glb"]);
    expect(getSupportedTargetFormats("avatar.glb").map((t) => t.id)).toEqual(["glb_opt", "gltf"]);
    expect(getSupportedTargetFormats("print.stl").map((t) => t.id)).toEqual(["3mf"]);
    expect(getSupportedTargetFormats("part.3mf").map((t) => t.id)).toEqual(["stl"]);
    expect(getSupportedTargetFormats("mesh.ply").map((t) => t.id)).toEqual(["glb"]);
  });

  it("converts OBJ → GLB with geometry and vertex coordinates", async () => {
    const objText = `
v 0.0 0.0 0.0
v 10.0 0.0 0.0
v 0.0 10.0 0.0
f 1 2 3
`;
    const result = await convert3DModel({
      fileName: "triangle.obj",
      data: objText,
      targetFormat: "glb",
    });

    expect(result.targetFormat).toBe("glb");
    expect(result.targetFileName).toBe("triangle.glb");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
    expect(result.triangleCount).toBe(1);
    expect(result.preservedFeatures).toContain("GLB Binary Container");
  });

  it("converts OBJ + companion MTL → GLB with materials", async () => {
    const objText = `
mtllib palette.mtl
usemtl NeonPurple
v 0 0 0
v 5 0 0
v 0 5 0
f 1 2 3
`;
    const mtlText = `
newmtl NeonPurple
Kd 0.35 0.27 1.0
d 1.0
illum 2
`;
    const result = await convert3DModel({
      fileName: "specimen.obj",
      data: objText,
      targetFormat: "glb",
      options: {
        companionFiles: [{ name: "palette.mtl", data: mtlText }],
      },
    });

    expect(result.targetFormat).toBe("glb");
    expect(result.preservedFeatures).toContain("OBJ Wavefront Materials (.mtl)");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
  });

  it("converts glTF → GLB into compact self-contained binary", async () => {
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
    const gltfExporter = new GLTFExporter();
    const gltfJson = await gltfExporter.parseAsync(boxMesh, { binary: false, embedImages: true });
    const gltfString = typeof gltfJson === "string" ? gltfJson : JSON.stringify(gltfJson);

    const result = await convert3DModel({
      fileName: "box.gltf",
      data: gltfString,
      targetFormat: "glb",
    });

    expect(result.targetFormat).toBe("glb");
    expect(result.targetFileName).toBe("box.glb");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
  });

  it("converts GLB → glTF JSON with embedded resources", async () => {
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial());
    const gltfExporter = new GLTFExporter();
    const glbBuffer = (await gltfExporter.parseAsync(boxMesh, { binary: true })) as ArrayBuffer;

    const result = await convert3DModel({
      fileName: "cube.glb",
      data: glbBuffer,
      targetFormat: "gltf",
    });

    expect(result.targetFormat).toBe("gltf");
    expect(result.targetFileName).toBe("cube.gltf");
    expect(typeof result.data).toBe("string");
    const parsed = JSON.parse(result.data as string);
    expect(parsed.asset.version).toBe("2.0");
  });

  it("optimizes GLB → optimized GLB by deduplicating and cleaning vertices", async () => {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 8, 16), new THREE.MeshStandardMaterial());
    const gltfExporter = new GLTFExporter();
    const glbBuffer = (await gltfExporter.parseAsync(torus, { binary: true })) as ArrayBuffer;

    const result = await convert3DModel({
      fileName: "torus.glb",
      data: glbBuffer,
      targetFormat: "glb",
      options: { optimize: true },
    });

    expect(result.targetFormat).toBe("glb");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
    expect(result.preservedFeatures).toContain("Deduplicated Vertex Buffers");
  });

  it("converts STL → 3MF manufacturing archive with XML mesh", async () => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial());
    const stlExporter = new STLExporter();
    const stlDataView = stlExporter.parse(box, { binary: true });
    const stlBuffer = stlDataView.buffer.slice(
      stlDataView.byteOffset,
      stlDataView.byteOffset + stlDataView.byteLength
    );

    const result = await convert3DModel({
      fileName: "bracket.stl",
      data: stlBuffer,
      targetFormat: "3mf",
    });

    expect(result.targetFormat).toBe("3mf");
    expect(result.targetFileName).toBe("bracket.3mf");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
    expect(result.preservedFeatures).toContain("3D Model XML Mesh");
  });

  it("converts 3MF → STL binary for 3D printer slicers", async () => {
    const geom = new THREE.BoxGeometry(5, 5, 5);
    const threeMfBytes = build3MFFromGeometry(geom);

    const result = await convert3DModel({
      fileName: "custom_part.3mf",
      data: threeMfBytes.buffer.slice(
        threeMfBytes.byteOffset,
        threeMfBytes.byteOffset + threeMfBytes.byteLength
      ) as ArrayBuffer,
      targetFormat: "stl",
    });

    expect(result.targetFormat).toBe("stl");
    expect(result.targetFileName).toBe("custom_part.stl");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("STL is geometry-only"))).toBe(true);
  });

  it("converts PLY → GLB preserving point cloud / polygon mesh", async () => {
    const plyText = `ply
format ascii 1.0
element vertex 3
property float x
property float y
property float z
element face 1
property list uchar int vertex_index
end_header
0 0 0
2 0 0
0 2 0
3 0 1 2
`;
    const result = await convert3DModel({
      fileName: "scan.ply",
      data: plyText,
      targetFormat: "glb",
    });

    expect(result.targetFormat).toBe("glb");
    expect(result.targetFileName).toBe("scan.glb");
    expect(result.convertedSizeBytes).toBeGreaterThan(0);
    expect(result.triangleCount).toBe(1);
  });

  it("handles temporary server-side storage with 1-hour expiration lifecycle", async () => {
    const { saveTempConvertedFile, getTempConvertedFile, deleteTempConvertedFile, purgeExpiredTemp3DFiles } =
      await import("@/lib/temp-3d-storage");

    const sampleBuffer = Buffer.from("fake-glb-binary-data");
    const meta = saveTempConvertedFile("test-session-123", "model.glb", "model.obj", sampleBuffer, "model/gltf-binary");

    expect(meta.id).toBe("test-session-123");
    expect(meta.expiresAt).toBeGreaterThan(Date.now());
    expect(meta.expiresAt - meta.createdAt).toBe(3600000); // exactly 1 hour

    const retrieved = getTempConvertedFile("test-session-123");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.metadata.targetFileName).toBe("model.glb");

    // Immediate cleanup test
    deleteTempConvertedFile("test-session-123");
    expect(getTempConvertedFile("test-session-123")).toBeNull();

    // Purge expired files test
    const purged = purgeExpiredTemp3DFiles();
    expect(typeof purged).toBe("number");
  });
});
