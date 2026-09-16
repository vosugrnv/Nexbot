const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "js", "locations-data.js"), "utf8");
const codes = [...src.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]);
const unique = [...new Set(codes)].sort();

const dir = path.join(__dirname, "..", "tat-ca-khu-vuc");
const files = fs
  .readdirSync(dir)
  .filter((f) => /\.html$/i.test(f))
  .map((f) => f.replace(/\.html$/i, "").toLowerCase())
  .sort();
const fileSet = new Set(files);

const missing = unique.filter((c) => !fileSet.has(c));
const extra = files.filter((c) => !unique.includes(c));

console.log(
  JSON.stringify(
    {
      locations: unique.length,
      htmlPages: files.length,
      missingCount: missing.length,
      missing,
      extraCount: extra.length,
      extra: extra.slice(0, 50),
      sampleNewish: ["zw", "td", "ss", "xk", "nr", "tv", "pw", "mh", "km", "gq"].map((c) => ({
        code: c,
        inData: unique.includes(c),
        hasHtml: fileSet.has(c)
      }))
    },
    null,
    2
  )
);
