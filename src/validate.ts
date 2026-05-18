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
  const path = dotPath(issue.path);
  const code = issue.code;

  const rawExpected =
    "expected" in issue && issue.expected !== undefined
      ? String(issue.expected)
      : undefined;

  const receivedMatch = issue.message.match(/received (.+)$/);
  let received: string | undefined;
  if ("received" in issue && issue.received !== undefined) {
    received = String(issue.received);
  } else if (receivedMatch) {
    received = receivedMatch[1];
  }

  let message: string;
  if (code === "invalid_type" && rawExpected) {
    if (!received || received === "undefined") {
      message = `expected ${rawExpected}, but field is missing`;
      received = undefined;
    } else {
      message = `expected ${rawExpected}, received ${received}`;
    }
  } else {
    message = issue.message;
  }

  const error: ValidationError = { path, message, code };
  if (rawExpected) error.expected = rawExpected;
  if (received) error.received = received;

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
