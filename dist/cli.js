#!/usr/bin/env node
import {
  validate
} from "./chunk-LNGKSHJJ.js";

// src/cli.ts
import { Command } from "commander";
import { readFileSync } from "fs";
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var pkg = require2("../package.json");
var program = new Command();
program.name("rx-ruler").description("Validate Reactive Resume v5 JSON against the upstream schema").version(pkg.version);
program.command("validate").argument("<input>", "Path to resume JSON file, or '-' for stdin").option("--json-errors", "Output a single JSON object to stdout").option("--quiet", "Suppress success message in human mode").action(async (input, options) => {
  let raw;
  try {
    if (input === "-") {
      const chunks = [];
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
              code: "io_error"
            }
          ]
        }) + "\n"
      );
    } else {
      process.stderr.write(`\u2717 Failed to read input: ${message}
`);
    }
    process.exit(2);
  }
  let data;
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
              code: "parse_error"
            }
          ]
        }) + "\n"
      );
    } else {
      process.stderr.write(`\u2717 Invalid JSON: ${message}
`);
    }
    process.exit(2);
  }
  const result = validate(data);
  if (result.ok) {
    if (options.jsonErrors) {
      process.stdout.write(JSON.stringify({ ok: true }) + "\n");
    } else if (!options.quiet) {
      process.stdout.write("\u2713 valid Reactive Resume v5 JSON\n");
    }
    process.exit(0);
  }
  if (options.jsonErrors) {
    process.stdout.write(JSON.stringify({ ok: false, errors: result.errors }) + "\n");
  } else {
    for (const err of result.errors) {
      process.stderr.write(`${err.path}: ${err.message} (${err.code})
`);
    }
    process.stderr.write(`\u2717 ${result.errors.length} error(s)
`);
  }
  process.exit(1);
});
program.parse();
