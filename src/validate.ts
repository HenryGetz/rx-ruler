import { ResumeV5Schema } from "./schema/v5/index.js";
import type { ResumeV5 } from "./schema/v5/index.js";
import type { ZodIssue } from "zod";

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  expected?: string;
  received?: string;
}

export type ValidationResult =
  | { ok: true; data: ResumeV5 }
  | { ok: false; errors: ValidationError[] };

function dotPath(path: PropertyKey[]): string {
  return path.join(".");
}

function mapIssue(issue: ZodIssue): ValidationError {
  const error: ValidationError = {
    path: dotPath(issue.path),
    message: issue.message,
    code: issue.code,
  };
  if ("expected" in issue && issue.expected !== undefined) {
    error.expected = String(issue.expected);
  }
  if ("received" in issue && issue.received !== undefined) {
    error.received = String(issue.received);
  }
  return error;
}

export function validate(input: unknown): ValidationResult {
  const result = ResumeV5Schema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    errors: result.error.issues.map(mapIssue),
  };
}
