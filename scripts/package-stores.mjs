import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "extension");
const stagingRoot = path.join(root, ".wip", "store-packages");
const outputRoot = path.join(root, "artifacts", "packages");
const baseManifest = JSON.parse(await readFile(path.join(source, "manifest.json"), "utf8"));

assertReleaseManifest(baseManifest);
await rm(stagingRoot, { recursive: true, force: true });
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const targets = ["chrome", "edge", "opera", "firefox"];
const outputs = [];

for (const target of targets) {
  const stage = path.join(stagingRoot, target);
  await cp(source, stage, { recursive: true });

  const manifest = structuredClone(baseManifest);
  if (target === "firefox") {
    manifest.background = { scripts: ["background.js"] };
    manifest.browser_specific_settings = {
      gecko: {
        id: "grant-grinder@wiplash.ai",
        strict_min_version: "140.0",
        data_collection_permissions: {
          required: ["searchTerms", "browsingActivity", "websiteContent"]
        }
      }
    };
    manifest.web_accessible_resources = manifest.web_accessible_resources.map(({ use_dynamic_url: _ignored, ...entry }) => entry);
  }

  await writeFile(path.join(stage, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const extension = target === "firefox" ? "xpi" : "zip";
  const filename = `grant-grinder-${target}-v${manifest.version}.${extension}`;
  const outputPath = path.join(outputRoot, filename);
  await archiveDirectory(stage, outputPath);
  outputs.push({ filename, hash: createHash("sha256").update(await readFile(outputPath)).digest("hex") });
}

await writeFile(
  path.join(outputRoot, "SHA256SUMS.txt"),
  `${outputs.map(({ filename, hash }) => `${hash}  ${filename}`).join("\n")}\n`
);

console.log(`Created ${targets.length} Grant Grinder ${baseManifest.version} store packages in ${outputRoot}.`);

function assertReleaseManifest(manifest) {
  if (manifest.manifest_version !== 3) throw new Error("Grant Grinder store packages must use Manifest V3.");
  if (manifest.description.length > 132) throw new Error("The extension description exceeds the 132-character store limit.");
  if (JSON.stringify(manifest.host_permissions) !== JSON.stringify(["https://labs.wiplash.ai/grants/*"])) {
    throw new Error("The release manifest may only request the Grant Grinder first-party host.");
  }
  const serialized = JSON.stringify(manifest).toLowerCase();
  for (const forbidden of ["localhost", "127.0.0.1", "api_key", "apikey"]) {
    if (serialized.includes(forbidden)) throw new Error(`Release manifest contains forbidden token: ${forbidden}`);
  }
}

async function archiveDirectory(directory, outputPath) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("warning", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(directory, false);
    void archive.finalize();
  });
}
