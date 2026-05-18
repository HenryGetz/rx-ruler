import { Command } from "commander";
import { readFileSync } from "node:fs";
import { validate, type ValidationError } from "./validate.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
  .name("rx-ruler")
  .description("Validate Reactive Resume v5 JSON against the upstream schema")
  .version(pkg.version);

program
  .command("validate")
  .argument("<input>", "Path to resume JSON file, or '-' for stdin")
  .option("--json-errors", "Output a single JSON object to stdout")
  .option("--quiet", "Suppress success message in human mode")
  .action(async (input: string, options: { jsonErrors?: boolean; quiet?: boolean }) => {
    let raw: string;
    try {
      if (input === "-") {
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        raw = Buffer.concat(chunks).toString("utf-8");
      } else {
        raw = readFileSync(input, "utf-8");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (options.jsonErrors) {
        process.stdout.write(
          JSON.stringify({
            ok: false,
            errors: [
              {
                path: "",
                message: `Failed to read input: ${message}`,
                code: "io_error",
              },
            ],
          }) + "\n",
        );
      } else {
        process.stderr.write(`✗ Failed to read input: ${message}\n`);
      }
      process.exit(2);
    }

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (options.jsonErrors) {
        process.stdout.write(
          JSON.stringify({
            ok: false,
            errors: [
              {
                path: "",
                message: `Invalid JSON: ${message}`,
                code: "parse_error",
              },
            ],
          }) + "\n",
        );
      } else {
        process.stderr.write(`✗ Invalid JSON: ${message}\n`);
      }
      process.exit(2);
    }

    const result = validate(data);

    if (result.ok) {
      if (options.jsonErrors) {
        process.stdout.write(JSON.stringify({ ok: true }) + "\n");
      } else if (!options.quiet) {
        process.stdout.write("✓ valid Reactive Resume v5 JSON\n");
      }
      process.exit(0);
    }

    if (options.jsonErrors) {
      process.stdout.write(JSON.stringify({ ok: false, errors: result.errors }) + "\n");
    } else {
      for (const err of result.errors) {
        process.stderr.write(`${err.path}: ${err.message} (${err.code})\n`);
      }
      process.stderr.write(`✗ ${result.errors.length} error(s)\n`);
    }
    process.exit(1);
  });

program.parse();
