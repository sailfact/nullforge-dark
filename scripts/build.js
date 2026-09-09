/**
 * Build every variant declared in src/nullforge.yaml:
 *   - writes themes/<file>.json for each one
 *   - rewrites package.json's `contributes.themes` to match
 *
 * The second step is what keeps "add a variant" a one-file change: the label,
 * uiTheme and filename are declared once, in the YAML `variants:` block.
 */
const fs = require("fs");
const path = require("path");
const generate = require("./generate");

const ROOT = path.join(__dirname, "..");
const THEME_DIR = path.join(ROOT, "themes");
const PACKAGE_JSON = path.join(ROOT, "package.json");

/**
 * Point package.json at the themes we just built. Only writes when something
 * actually changed, so a no-op build leaves the file (and git) untouched.
 * @param {{label: string, uiTheme: string, file: string}[]} variants
 */
const syncContributes = async (variants) => {
  const pkg = JSON.parse(await fs.promises.readFile(PACKAGE_JSON, "utf-8"));
  const themes = variants.map(({ label, uiTheme, file }) => ({
    label,
    uiTheme,
    path: `./themes/${file}`,
  }));

  const current = JSON.stringify(pkg.contributes && pkg.contributes.themes);
  if (current === JSON.stringify(themes)) return;

  pkg.contributes = { ...pkg.contributes, themes };
  await fs.promises.writeFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`package.json  (contributes.themes: ${themes.length} themes)`);
};

module.exports = async () => {
  const variants = await generate();

  await fs.promises.mkdir(THEME_DIR, { recursive: true });

  await Promise.all(
    variants.map(({ file, theme }) =>
      fs.promises
        .writeFile(
          path.join(THEME_DIR, file),
          JSON.stringify(theme, null, 4) + "\n",
        )
        .then(() => console.log(`themes/${file}`)),
    ),
  );

  await syncContributes(variants);
};

if (require.main === module) {
  module.exports().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
