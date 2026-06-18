import fs from "node:fs";
import path from "node:path";

const from = path.resolve("generated/prisma");
const to = path.resolve("dist/generated/prisma");

fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(path.dirname(to), { recursive: true });
fs.cpSync(from, to, { recursive: true });