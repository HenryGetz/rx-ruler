import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export { validate } from "./validate.js";
export type { ValidationResult, ValidationError } from "./validate.js";
export type { ResumeV5 } from "./schema/v5/index.js";
export { ResumeV5Schema } from "./schema/v5/index.js";

export const version: string = pkg.version;
