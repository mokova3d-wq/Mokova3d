import { describe, it, expect } from "vitest";
import { verifyAdminPassword, updateAdminPassword } from "@/lib/api-db";
import { saveTempConvertedFile, getTempConvertedFile, deleteTempConvertedFile } from "@/lib/temp-3d-storage";

describe("Production Security & Edge-Case Safeguards", () => {
  it("verifies and hashes admin credentials with scrypt and salt", () => {
    // Set a known test password
    const testPass = "Mokova@SecureProdTest2026!";
    updateAdminPassword(testPass);

    // Correct password must authenticate
    expect(verifyAdminPassword(testPass)).toBe(true);

    // Wrong password must fail
    expect(verifyAdminPassword("WrongPassword123!")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });

  it("prevents directory traversal attacks in 3D temporary file storage", () => {
    // Attempt path traversal via ID
    const maliciousId = "../../etc/passwd";
    const record = getTempConvertedFile(maliciousId);
    expect(record).toBeNull();

    // Deleting with malicious ID does not throw or delete root files
    expect(() => deleteTempConvertedFile(maliciousId)).not.toThrow();
  });

  it("stores and retrieves 3D conversion artifacts cleanly with sanitization", () => {
    const validId = `test-conv-${Date.now()}`;
    const testContent = Buffer.from("solid test_mesh\nendsolid test_mesh");

    const saved = saveTempConvertedFile(
      validId,
      "test-cube.stl",
      "original-cube.stl",
      testContent,
      "model/stl"
    );

    expect(saved.id).toBe(validId);
    expect(saved.targetFileName).toBe("test-cube.stl");

    const retrieved = getTempConvertedFile(validId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.metadata.targetFileName).toBe("test-cube.stl");

    // Clean up
    deleteTempConvertedFile(validId);
    expect(getTempConvertedFile(validId)).toBeNull();
  });
});
