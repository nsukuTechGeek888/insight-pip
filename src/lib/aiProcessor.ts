import fs from "fs-extra";
import path from "path";
import glob from "glob";
import axios from "axios";

// -------------- CONFIG --------------
const FOLDER_TO_SCAN = path.join(process.cwd(), "src"); // You can change this
const OUTPUT_FOLDER = path.join(process.cwd(), "processed");
const AI_API_URL = "http://localhost:11434/api/generate"; // Ollama default
const AI_MODEL = "mistral"; // Change to the model you want

// -------------- MAIN PROCESS --------------
async function main() {
  console.log(`🔍 Scanning files in: ${FOLDER_TO_SCAN}...`);

  const files = glob.sync("**/*.{ts,tsx,js,jsx,json,md,css}", {
    cwd: FOLDER_TO_SCAN,
    absolute: true,
  });

  if (files.length === 0) {
    console.error("❌ No files found.");
    process.exit(1);
  }

  await fs.ensureDir(OUTPUT_FOLDER);

  for (const file of files) {
    console.log(`📄 Processing: ${path.relative(process.cwd(), file)}`);
    const content = await fs.readFile(file, "utf-8");

    try {
      const aiResponse = await sendToAI(content);
      const outputPath = path.join(
        OUTPUT_FOLDER,
        path.basename(file) + ".processed.txt"
      );
      await fs.writeFile(outputPath, aiResponse, "utf-8");
      console.log(`✅ Saved: ${outputPath}`);
    } catch (err) {
      console.error(`⚠️ Error processing ${file}:`, err.message);
    }
  }

  console.log("🎯 All files processed.");
}

// -------------- SEND TO AI --------------
async function sendToAI(content: string): Promise<string> {
  const response = await axios.post(AI_API_URL, {
    model: AI_MODEL,
    prompt: `Summarize and analyze this code:\n\n${content}`,
    stream: false,
  });

  // Ollama returns text under `response.data.response`
  return response.data.response || "[No AI response]";
}

// Run the script
main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
