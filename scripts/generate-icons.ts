import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const srcLogo = path.resolve(projectRoot, "src/assets/logo.png");
const publicDir = path.resolve(projectRoot, "public");

const outputs = [
  { name: "192x192.png", size: 192 },
  { name: "512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function ensurePublic() {
  await fs.promises.mkdir(publicDir, { recursive: true });
}

async function generate() {
  if (!fs.existsSync(srcLogo)) {
    console.error(`Logo not found at ${srcLogo}`);
    process.exit(1);
  }
  await ensurePublic();

  const buffer = await fs.promises.readFile(srcLogo);
  for (const out of outputs) {
    const dest = path.join(publicDir, out.name);
    await sharp(buffer)
      .resize(out.size, out.size, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`Generated ${dest}`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});


