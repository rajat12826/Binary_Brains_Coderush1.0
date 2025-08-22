// src/utils/runPython.js
import { execFile } from "child_process";
import { promisify } from "util";
const execFileAsync = promisify(execFile);

export async function runPython(scriptPath, args = []) {
  if (!scriptPath) throw new Error("PYTHON_SCRIPT_PATH not set in env");
  const python = process.env.PYTHON_PATH || "python";
  try {
    const { stdout, stderr } = await execFileAsync(python, [scriptPath, ...args], {
      maxBuffer: 200 * 1024 * 1024 // 200 MB stdout buffer
    });
    if (stderr && stderr.trim()) {
      // warn but continue — many ML scripts print warnings to stderr
      console.warn("python stderr:", stderr);
    }
    const out = stdout.trim();
    if (!out) throw new Error("Python script returned empty output");
    // Ensure it's JSON
    return JSON.parse(out);
  } catch (err) {
    throw new Error(`Python execution failed: ${err.message}`);
  }
}
