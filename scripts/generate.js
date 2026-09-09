const { readFile } = require("fs").promises;
const { join } = require("path");
const { Type, DEFAULT_SCHEMA, load } = require("js-yaml");

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Variant
 * @prop {string} id - Key into `palettes`.
 * @prop {string} label - Theme name shown in the picker.
 * @prop {string} uiTheme - VS Code base theme: `vs-dark` or `vs`.
 * @prop {string} file - Output filename under themes/.
 */

/**
 * @typedef {Object} Source - Parsed source file.
 * @prop {Record<string, Record<string, string|null>>} palettes - Per-variant role values.
 * @prop {Variant[]} variants - Themes to emit.
 * @prop {Record<string, string|null>} colors - VSCode color mapping, values may be `$ROLE`.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

/**
 * `!alpha [$ACCENT, '1f']` appends a constant alpha suffix to a role or literal.
 * Resolution of the `$ROLE` half happens later, in `substitute`.
 *
 * It has to stay a structured node rather than a concatenated string: hex alpha
 * digits are legal role characters, so `"$ACCENT1f"` would parse back out as a
 * role named `ACCENT1f`.
 */
const ALPHA = "__alpha";

const withAlphaType = new Type("!alpha", {
  kind: "sequence",
  construct: ([color, alpha]) => ({ [ALPHA]: { color, alpha } }),
});

const schema = DEFAULT_SCHEMA.extend([withAlphaType]);

/** Keys that describe the build rather than the theme; never emitted. */
const SCAFFOLDING = ["palettes", "variants"];

/**
 * Replace a leading `$ROLE` with its value for this variant. A trailing alpha
 * suffix (from `!alpha`) is preserved.
 * @param {string} value
 * @param {Record<string, string|null>} palette
 * @param {string} variantId
 */
const resolveValue = (value, palette, variantId) => {
  if (typeof value !== "string" || !value.startsWith("$")) return value;
  const match = /^\$([A-Za-z0-9_]+)(.*)$/.exec(value);
  const [, role, suffix] = match;
  if (!(role in palette)) {
    throw new Error(
      `Unknown role "$${role}" for variant "${variantId}". ` +
        `Add it to palettes.${variantId} in src/nullforge.yaml.`,
    );
  }
  const resolved = palette[role];
  // A null palette entry means "omit this key for this variant".
  if (resolved === null || resolved === undefined) return null;
  return `${resolved}${suffix}`;
};

/**
 * Deep-walk a structure, resolving `$ROLE` strings and dropping any key whose
 * value resolves to null. Dropping is what lets a single structure omit keys
 * per variant, and matches the hand-written JSON.
 *
 * Only null is dropped, never "". An empty `fontStyle` is meaningful: it
 * explicitly clears italic/bold inherited from a broader rule.
 */
const substitute = (node, palette, variantId) => {
  if (Array.isArray(node)) {
    return node.map((n) => substitute(n, palette, variantId));
  }
  if (node && typeof node === "object" && node[ALPHA]) {
    const { color, alpha } = node[ALPHA];
    const resolved = substitute(color, palette, variantId);
    // A role that is `~` for this variant drops the key, alpha suffix and all.
    return resolved === null ? null : `${resolved}${alpha}`;
  }
  if (node && typeof node === "object") {
    const out = {};
    for (const [key, raw] of Object.entries(node)) {
      const value = substitute(raw, palette, variantId);
      if (value === null || value === undefined) continue;
      out[key] = value;
    }
    return out;
  }
  return resolveValue(node, palette, variantId);
};

/**
 * Build every variant declared in the source file.
 *
 * The whole variant is returned alongside the theme so callers can both write
 * `themes/` and keep package.json's `contributes.themes` in step — the label
 * and uiTheme live in the YAML, not in two places.
 *
 * @returns {Promise<(Variant & {theme: object})[]>}
 */
module.exports = async () => {
  const yamlFile = await readFile(
    join(__dirname, "..", "src", "nullforge.yaml"),
    "utf-8",
  );

  /** @type {Source} */
  const src = load(yamlFile, { schema });

  const structure = { ...src };
  for (const key of SCAFFOLDING) delete structure[key];

  return src.variants.map((variant) => {
    const palette = src.palettes[variant.id];
    if (!palette) {
      throw new Error(`No palette defined for variant "${variant.id}".`);
    }

    const resolved = substitute(structure, palette, variant.id);

    return {
      ...variant,
      theme: {
        $schema: resolved.$schema,
        name: variant.label,
        type: resolved.type,
        semanticHighlighting: resolved.semanticHighlighting,
        colors: resolved.colors,
        tokenColors: resolved.tokenColors,
        semanticTokenColors: resolved.semanticTokenColors,
      },
    };
  });
};
