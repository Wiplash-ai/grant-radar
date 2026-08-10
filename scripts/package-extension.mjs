import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import archiver from "archiver";

await mkdir("artifacts", { recursive: true });
const output = createWriteStream("artifacts/grant-radar-extension.zip");
const archive = archiver("zip", { zlib: { level: 9 } });
archive.pipe(output);
archive.directory("extension", false);
await archive.finalize();
await new Promise((resolve, reject) => { output.on("close", resolve); output.on("error", reject); });
console.log(`Packaged artifacts/grant-radar-extension.zip (${archive.pointer()} bytes)`);
