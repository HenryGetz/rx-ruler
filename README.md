# rx-ruler

Validate Reactive Resume v5 JSON against the upstream schema. Ship it as a library or run it from the terminal.

```sh
npx rx-ruler validate resume.json
```

---

## Install

**CLI** (no install needed):
```sh
npx rx-ruler validate resume.json
```

**Library**:
```sh
npm i rx-ruler
```

---

## CLI Usage

```
rx-ruler validate <input>
```

| Flag | Description |
|------|-------------|
| `--json-errors` | Output a single JSON object to stdout instead of human-readable format |
| `--quiet` | Suppress the success message in human mode |
| `-h`, `--help` | Show help |
| `-v`, `--version` | Show version |

`<input>` is a file path or `-` for stdin.

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Valid |
| 1 | Schema-invalid |
| 2 | I/O error or parse failure |

---

## Library Usage

```ts
import { validate } from "rx-ruler";

const result = validate(data);

if (result.ok) {
  console.log(result.data); // typed as ResumeV5
} else {
  console.error(result.errors); // ValidationError[]
}
```

The `validate` function never throws. It always returns a discriminated union: `{ ok: true, data }` or `{ ok: false, errors }`.

---

## What It Validates

Reactive Resume **v5** JSON, against the upstream schema vendored from [AmruthPillai/Reactive-Resume](https://github.com/AmruthPillai/Reactive-Resume) at tag `v5.1.4` (commit `9df2a52`).

The vendored schema lives at `src/schema/v5/upstream/` and is frozen — never fetched at runtime.

---

## Telemetry

None. Ever.

---

## License

MIT. The vendored Reactive Resume schema retains its own MIT attribution at `src/schema/v5/UPSTREAM-LICENSE`.
