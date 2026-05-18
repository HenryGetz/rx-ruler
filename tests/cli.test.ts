import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const cli = resolve(__dirname, "../src/cli.ts");

interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runCli(args: string, input?: string): CliResult {
  try {
    const cmd = `npx tsx ${cli} validate ${args}`;
    const stdout = execSync(cmd, {
      encoding: "utf-8",
      input,
      timeout: 15000,
    });
    return { exitCode: 0, stdout: stdout.trim(), stderr: "" };
  } catch (e: any) {
    return {
      exitCode: e.status ?? 1,
      stdout: (e.stdout ?? "").toString().trim(),
      stderr: (e.stderr ?? "").toString().trim(),
    };
  }
}

describe("CLI", () => {
  const validFixture = resolve(__dirname, "fixtures", "v5-valid.json");
  const invalidFixture = resolve(__dirname, "fixtures", "v5-invalid.json");

  // Test 1: Valid fixture → exit 0, success message on stdout
  it("exits 0 with success message for valid fixture", () => {
    const result = runCli(validFixture);
    expect(result.exitCode).toBe(0);
    // stdout should contain a success indicator
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  // Test 2: Invalid fixture → exit 1, errors on stderr
  it("exits 1 with errors on stderr for invalid fixture", () => {
    const result = runCli(invalidFixture);
    expect(result.exitCode).toBe(1);
    // stderr or stdout should contain error information
    const output = result.stderr || result.stdout;
    expect(output.length).toBeGreaterThan(0);
  });

  // Test 3: Missing file → exit 2 (usage/system error)
  it("exits 2 for missing file", () => {
    const result = runCli("/nonexistent/resume.json");
    expect(result.exitCode).toBe(2);
  });

  // Test 4: --json-errors flag → JSON output on stdout
  it("outputs parseable JSON with --json-errors flag", () => {
    const result = runCli(`${invalidFixture} --json-errors`);
    // When --json-errors is used, output should be parseable JSON
    // even on validation failure
    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout || result.stderr);
    expect(parsed).toHaveProperty("ok");
    expect(parsed.ok).toBe(false);
    expect(parsed).toHaveProperty("errors");
    expect(Array.isArray(parsed.errors)).toBe(true);
  });

  // Test 5: Stdin with '-' works
  it("reads from stdin when input is '-'", () => {
    const fixturePath = resolve(__dirname, "fixtures", "v5-valid.json");
    const fixtureContent = readFileSync(fixturePath, "utf-8");
    const result = runCli("-", fixtureContent);
    expect(result.exitCode).toBe(0);
  });
});
