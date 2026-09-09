/**
 * Round-trip check: generate the themes from src/nullforge.yaml in memory and
 * deep-compare them against the committed JSON in themes/.
 *
 * This is the gate that makes it safe to treat the YAML as the only source of
 * truth. Run it before gitignoring themes/, and after any refactor of the
 * generator.
 *
 * Header fields ($schema/type/semanticHighlighting) are reported separately:
 * a hand-written variant may omit them, and adding them is a deliberate fix
 * rather than a regression.
 */
const fs = require("fs");
const path = require("path");
const generate = require("./generate");

const THEME_DIR = path.join(__dirname, "..", "themes");
const HEADER_FIELDS = ["$schema", "type", "semanticHighlighting"];

// The committed themes are JSON-with-comments: the design-system originals carry
// `//` section headers and trailing commas. Only whole-line comments are stripped,
// so values containing `//` (e.g. the vscode:// schema URL) survive.
const loadJsonc = (file) =>
  JSON.parse(
    fs
      .readFileSync(file, "utf-8")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/,(\s*[}\]])/g, "$1"),
  );

/** Collect every leaf difference between two values as dotted paths. */
function diff(actual, expected, at = "", out = []) {
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  if (Array.isArray(expected) || Array.isArray(actual)) {
    const a = actual || [];
    const e = expected || [];
    if (a.length !== e.length) {
      out.push(`${at}: length ${a.length} != ${e.length}`);
    }
    for (let i = 0; i < Math.max(a.length, e.length); i++) {
      diff(a[i], e[i], `${at}[${i}]`, out);
    }
    return out;
  }

  if (isObj(expected) || isObj(actual)) {
    const a = actual || {};
    const e = expected || {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(e)])) {
      diff(a[k], e[k], at ? `${at}.${k}` : k, out);
    }
    return out;
  }

  if (actual !== expected) {
    out.push(`${at}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
  return out;
}

(async () => {
  const variants = await generate();
  let failed = false;

  for (const { file, theme } of variants) {
    const target = path.join(THEME_DIR, file);
    if (!fs.existsSync(target)) {
      console.log(`? ${file} — no committed file to compare against`);
      continue;
    }
    const committed = loadJsonc(target);

    const added = HEADER_FIELDS.filter((f) => !(f in committed));
    const body = ["colors", "tokenColors", "semanticTokenColors"].flatMap((k) =>
      diff(theme[k], committed[k], k),
    );
    const nameDiff = diff(theme.name, committed.name, "name");

    if (body.length === 0 && nameDiff.length === 0) {
      console.log(
        `OK ${file}` +
          (added.length ? `  (adds ${added.join(", ")})` : ""),
      );
    } else {
      failed = true;
      console.log(`FAIL ${file} — ${body.length + nameDiff.length} difference(s)`);
      for (const d of [...nameDiff, ...body].slice(0, 40)) {
        console.log(`     ${d}`);
      }
      if (body.length > 40) console.log(`     ... and ${body.length - 40} more`);
    }
  }

  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
