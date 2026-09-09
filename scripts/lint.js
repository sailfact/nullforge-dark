const https = require("https");
const generate = require("./generate");

const THEME_COLOR_REFERENCE_URL =
  "https://code.visualstudio.com/api/references/theme-color";

const NOT_THEME_KEYS = [
  "workbench.colorCustomizations",
  "editor.tokenColorCustomizations",
];

// Minimal promise wrapper around https.get — fetches the reference page's raw HTML body.
const get = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (data) => (body += data));
      res.on("end", () => resolve(body));
      res.on("error", reject);
    });
  });

// The VS Code docs render every valid theme-color key inside a <code> tag, alongside
// unrelated <code> snippets (example hex values, JSON keys, prose). There's no structured
// API for this list, so we scrape the HTML and filter down to what looks like a real key.
async function scrapeThemeAvailableKeys() {
  const data = await get(THEME_COLOR_REFERENCE_URL);

  const matches = data.match(new RegExp("<code>.+?</code>", "g"));

  if (!matches) {
    throw new Error(
      "Couldn't find any matches with <code>...</code>, maybe docs have changed?",
    );
  }

  return [...matches]
    .map((key) => key.replace("<code>", "").replace("</code>", ""))
    .filter((key) => !/ /.test(key)) // Remove if contains spaces
    .filter((key) => !/#.../.test(key)) // Remove if is a hex color
    .filter((key) => !/&quot;/.test(key)) // Remove if contains quotes
    .filter((key) => key.length > 4) // Remove if it's very small
    .filter((key) => !NOT_THEME_KEYS.includes(key)) // Remove if its in the blacklist
    .sort();
}

// Cross-checks the theme against upstream: generate() builds the theme from src/nullforge.yaml
// the same way the real build does, then we diff its color keys against what scraping found.
// This is what catches VS Code deprecating/adding keys.
(async () => {
  const availableKeys = await scrapeThemeAvailableKeys();
  const variants = await generate();

  const themeKeys = new Set(
    variants.flatMap(({ theme }) => Object.keys(theme.colors)),
  );

  // Keys we define that VS Code's docs no longer list — likely deprecated upstream.
  for (const key of themeKeys) {
    if (!availableKeys.includes(key)) {
      console.warn(`Unsupported key "${key}", probably deprecated?`);
    }
  }

  // Keys VS Code supports that we don't set — a possible gap to fill.
  for (const key of availableKeys) {
    if (!themeKeys.has(key)) {
      console.warn(`Missing key "${key}" in theme`);
    }
  }
})().catch(console.error);
