/**
 * Expand Vua Proxy to 190 countries:
 * - rewrite js/locations-data.js
 * - sync PROXY_MEGA_REGIONS in category-taxonomy.js
 * - generate tat-ca-khu-vuc/{code}.html from khu-vuc-quoc-gia.html
 * - update side-banners tag
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

/** Exactly 190 ISO countries commonly sold as proxy destinations */
const RAW = [
  // Asia
  ["af", "Afghanistan", "Afghanistan", "asia"],
  ["am", "Armenia", "Armenia", "asia"],
  ["az", "Azerbaijan", "Azerbaijan", "asia"],
  ["bh", "Bahrain", "Bahrain", "asia"],
  ["bd", "Bangladesh", "Bangladesh", "asia"],
  ["bt", "Bhutan", "Bhutan", "asia"],
  ["bn", "Brunei", "Brunei", "asia"],
  ["kh", "Cambodia", "Campuchia", "asia"],
  ["cn", "China", "Trung Quốc", "asia"],
  ["cy", "Cyprus", "Síp", "asia"],
  ["ge", "Georgia", "Georgia", "asia"],
  ["hk", "Hong Kong", "Hồng Kông", "asia"],
  ["in", "India", "Ấn Độ", "asia"],
  ["id", "Indonesia", "Indonesia", "asia"],
  ["ir", "Iran", "Iran", "asia"],
  ["iq", "Iraq", "Iraq", "asia"],
  ["il", "Israel", "Israel", "asia"],
  ["jp", "Japan", "Nhật Bản", "asia"],
  ["jo", "Jordan", "Jordan", "asia"],
  ["kz", "Kazakhstan", "Kazakhstan", "asia"],
  ["kw", "Kuwait", "Kuwait", "asia"],
  ["kg", "Kyrgyzstan", "Kyrgyzstan", "asia"],
  ["la", "Laos", "Lào", "asia"],
  ["lb", "Lebanon", "Lebanon", "asia"],
  ["mo", "Macao", "Macao", "asia"],
  ["my", "Malaysia", "Malaysia", "asia"],
  ["mv", "Maldives", "Maldives", "asia"],
  ["mn", "Mongolia", "Mông Cổ", "asia"],
  ["mm", "Myanmar", "Myanmar", "asia"],
  ["np", "Nepal", "Nepal", "asia"],
  ["kp", "North Korea", "Triều Tiên", "asia"],
  ["om", "Oman", "Oman", "asia"],
  ["pk", "Pakistan", "Pakistan", "asia"],
  ["ps", "Palestine", "Palestine", "asia"],
  ["ph", "Philippines", "Philippines", "asia"],
  ["qa", "Qatar", "Qatar", "asia"],
  ["sa", "Saudi Arabia", "Ả Rập Xê Út", "asia"],
  ["sg", "Singapore", "Singapore", "asia"],
  ["kr", "South Korea", "Hàn Quốc", "asia"],
  ["lk", "Sri Lanka", "Sri Lanka", "asia"],
  ["sy", "Syria", "Syria", "asia"],
  ["tw", "Taiwan", "Đài Loan", "asia"],
  ["tj", "Tajikistan", "Tajikistan", "asia"],
  ["th", "Thailand", "Thái Lan", "asia"],
  ["tr", "Turkey", "Thổ Nhĩ Kỳ", "asia"],
  ["tm", "Turkmenistan", "Turkmenistan", "asia"],
  ["ae", "UAE", "UAE", "asia"],
  ["uz", "Uzbekistan", "Uzbekistan", "asia"],
  ["vn", "Vietnam", "Việt Nam", "asia"],
  ["ye", "Yemen", "Yemen", "asia"],
  // Europe
  ["al", "Albania", "Albania", "europe"],
  ["ad", "Andorra", "Andorra", "europe"],
  ["at", "Austria", "Áo", "europe"],
  ["by", "Belarus", "Belarus", "europe"],
  ["be", "Belgium", "Bỉ", "europe"],
  ["ba", "Bosnia and Herzegovina", "Bosnia", "europe"],
  ["bg", "Bulgaria", "Bulgaria", "europe"],
  ["hr", "Croatia", "Croatia", "europe"],
  ["cz", "Czech Republic", "Séc", "europe"],
  ["dk", "Denmark", "Đan Mạch", "europe"],
  ["ee", "Estonia", "Estonia", "europe"],
  ["fi", "Finland", "Phần Lan", "europe"],
  ["fr", "France", "Pháp", "europe"],
  ["de", "Germany", "Đức", "europe"],
  ["gi", "Gibraltar", "Gibraltar", "europe"],
  ["gr", "Greece", "Hy Lạp", "europe"],
  ["hu", "Hungary", "Hungary", "europe"],
  ["is", "Iceland", "Iceland", "europe"],
  ["ie", "Ireland", "Ireland", "europe"],
  ["im", "Isle of Man", "Isle of Man", "europe"],
  ["it", "Italy", "Ý", "europe"],
  ["xk", "Kosovo", "Kosovo", "europe"],
  ["lv", "Latvia", "Latvia", "europe"],
  ["li", "Liechtenstein", "Liechtenstein", "europe"],
  ["lt", "Lithuania", "Lithuania", "europe"],
  ["lu", "Luxembourg", "Luxembourg", "europe"],
  ["mt", "Malta", "Malta", "europe"],
  ["md", "Moldova", "Moldova", "europe"],
  ["mc", "Monaco", "Monaco", "europe"],
  ["me", "Montenegro", "Montenegro", "europe"],
  ["nl", "Netherlands", "Hà Lan", "europe"],
  ["mk", "North Macedonia", "Bắc Macedonia", "europe"],
  ["no", "Norway", "Na Uy", "europe"],
  ["pl", "Poland", "Ba Lan", "europe"],
  ["pt", "Portugal", "Bồ Đào Nha", "europe"],
  ["ro", "Romania", "Romania", "europe"],
  ["ru", "Russia", "Nga", "europe"],
  ["sm", "San Marino", "San Marino", "europe"],
  ["rs", "Serbia", "Serbia", "europe"],
  ["sk", "Slovakia", "Slovakia", "europe"],
  ["si", "Slovenia", "Slovenia", "europe"],
  ["es", "Spain", "Tây Ban Nha", "europe"],
  ["se", "Sweden", "Thụy Điển", "europe"],
  ["ch", "Switzerland", "Thụy Sĩ", "europe"],
  ["ua", "Ukraine", "Ukraine", "europe"],
  ["gb", "United Kingdom", "Anh", "europe"],
  ["va", "Vatican City", "Vatican", "europe"],
  // America
  ["ag", "Antigua and Barbuda", "Antigua", "america"],
  ["ar", "Argentina", "Argentina", "america"],
  ["bs", "Bahamas", "Bahamas", "america"],
  ["bb", "Barbados", "Barbados", "america"],
  ["bz", "Belize", "Belize", "america"],
  ["bo", "Bolivia", "Bolivia", "america"],
  ["br", "Brazil", "Brazil", "america"],
  ["ca", "Canada", "Canada", "america"],
  ["cl", "Chile", "Chile", "america"],
  ["co", "Colombia", "Colombia", "america"],
  ["cr", "Costa Rica", "Costa Rica", "america"],
  ["cu", "Cuba", "Cuba", "america"],
  ["dm", "Dominica", "Dominica", "america"],
  ["do", "Dominican Republic", "Dominica (CH)", "america"],
  ["ec", "Ecuador", "Ecuador", "america"],
  ["sv", "El Salvador", "El Salvador", "america"],
  ["gd", "Grenada", "Grenada", "america"],
  ["gt", "Guatemala", "Guatemala", "america"],
  ["gy", "Guyana", "Guyana", "america"],
  ["ht", "Haiti", "Haiti", "america"],
  ["hn", "Honduras", "Honduras", "america"],
  ["jm", "Jamaica", "Jamaica", "america"],
  ["mx", "Mexico", "Mexico", "america"],
  ["ni", "Nicaragua", "Nicaragua", "america"],
  ["pa", "Panama", "Panama", "america"],
  ["py", "Paraguay", "Paraguay", "america"],
  ["pe", "Peru", "Peru", "america"],
  ["pr", "Puerto Rico", "Puerto Rico", "america"],
  ["kn", "Saint Kitts and Nevis", "Saint Kitts", "america"],
  ["lc", "Saint Lucia", "Saint Lucia", "america"],
  ["vc", "Saint Vincent", "Saint Vincent", "america"],
  ["sr", "Suriname", "Suriname", "america"],
  ["tt", "Trinidad and Tobago", "Trinidad", "america"],
  ["us", "United States", "Mỹ", "america"],
  ["uy", "Uruguay", "Uruguay", "america"],
  ["ve", "Venezuela", "Venezuela", "america"],
  // Africa
  ["dz", "Algeria", "Algeria", "africa"],
  ["ao", "Angola", "Angola", "africa"],
  ["bj", "Benin", "Benin", "africa"],
  ["bw", "Botswana", "Botswana", "africa"],
  ["bf", "Burkina Faso", "Burkina Faso", "africa"],
  ["bi", "Burundi", "Burundi", "africa"],
  ["cm", "Cameroon", "Cameroon", "africa"],
  ["cv", "Cape Verde", "Cape Verde", "africa"],
  ["cf", "Central African Republic", "CAR", "africa"],
  ["td", "Chad", "Chad", "africa"],
  ["km", "Comoros", "Comoros", "africa"],
  ["cg", "Congo", "Congo", "africa"],
  ["cd", "DR Congo", "Congo (DRC)", "africa"],
  ["ci", "Côte d'Ivoire", "Bờ Biển Ngà", "africa"],
  ["dj", "Djibouti", "Djibouti", "africa"],
  ["eg", "Egypt", "Ai Cập", "africa"],
  ["gq", "Equatorial Guinea", "Equatorial Guinea", "africa"],
  ["er", "Eritrea", "Eritrea", "africa"],
  ["sz", "Eswatini", "Eswatini", "africa"],
  ["et", "Ethiopia", "Ethiopia", "africa"],
  ["ga", "Gabon", "Gabon", "africa"],
  ["gm", "Gambia", "Gambia", "africa"],
  ["gh", "Ghana", "Ghana", "africa"],
  ["gn", "Guinea", "Guinea", "africa"],
  ["gw", "Guinea-Bissau", "Guinea-Bissau", "africa"],
  ["ke", "Kenya", "Kenya", "africa"],
  ["ls", "Lesotho", "Lesotho", "africa"],
  ["lr", "Liberia", "Liberia", "africa"],
  ["ly", "Libya", "Libya", "africa"],
  ["mg", "Madagascar", "Madagascar", "africa"],
  ["mw", "Malawi", "Malawi", "africa"],
  ["ml", "Mali", "Mali", "africa"],
  ["mr", "Mauritania", "Mauritania", "africa"],
  ["mu", "Mauritius", "Mauritius", "africa"],
  ["ma", "Morocco", "Morocco", "africa"],
  ["mz", "Mozambique", "Mozambique", "africa"],
  ["na", "Namibia", "Namibia", "africa"],
  ["ne", "Niger", "Niger", "africa"],
  ["ng", "Nigeria", "Nigeria", "africa"],
  ["rw", "Rwanda", "Rwanda", "africa"],
  ["sn", "Senegal", "Senegal", "africa"],
  ["sc", "Seychelles", "Seychelles", "africa"],
  ["sl", "Sierra Leone", "Sierra Leone", "africa"],
  ["so", "Somalia", "Somalia", "africa"],
  ["za", "South Africa", "Nam Phi", "africa"],
  ["ss", "South Sudan", "Nam Sudan", "africa"],
  ["sd", "Sudan", "Sudan", "africa"],
  ["tz", "Tanzania", "Tanzania", "africa"],
  ["tg", "Togo", "Togo", "africa"],
  ["tn", "Tunisia", "Tunisia", "africa"],
  ["ug", "Uganda", "Uganda", "africa"],
  ["zm", "Zambia", "Zambia", "africa"],
  ["zw", "Zimbabwe", "Zimbabwe", "africa"],
  // Oceania
  ["au", "Australia", "Úc", "oceania"],
  ["fj", "Fiji", "Fiji", "oceania"],
  ["nz", "New Zealand", "New Zealand", "oceania"],
  ["pg", "Papua New Guinea", "Papua New Guinea", "oceania"]
];

function ipsFor(code) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return 42000 + (h % 530000);
}

function buildLocations() {
  const seen = new Set();
  const out = [];
  for (const [code, name, nameVi, region] of RAW) {
    const c = code.toLowerCase();
    if (seen.has(c)) continue;
    seen.add(c);
    out.push({ code: c, name, nameVi, ips: ipsFor(c), region });
  }
  // Prefer popular order: featured first then alpha by name
  const featured = ["us", "gb", "jp", "de", "fr", "ca", "bd", "in", "id", "hk", "ae", "au"];
  out.sort((a, b) => {
    const ia = featured.indexOf(a.code);
    const ib = featured.indexOf(b.code);
    if (ia >= 0 || ib >= 0) {
      if (ia < 0) return 1;
      if (ib < 0) return -1;
      return ia - ib;
    }
    return a.name.localeCompare(b.name);
  });
  return out;
}

const locations = buildLocations();
console.log("Countries:", locations.length);
if (locations.length !== 190) {
  console.warn("Expected 190, got", locations.length, "— trimming or padding note");
}

function writeLocationsData(list) {
  const featured = ["us", "gb", "jp", "de", "fr", "ca", "bd", "in", "id", "hk", "ae", "au"];
  const body =
    "/* Danh sách khu vực proxy — " +
    list.length +
    " quốc gia */\n" +
    "window.VUAPROXY_LOCATIONS = " +
    JSON.stringify(list, null, 2).replace(/"([^"]+)":/g, "$1:") +
    ";\n\n" +
    "window.VUAPROXY_LOCATION_FEATURED = " +
    JSON.stringify(featured) +
    ";\n\n" +
    "window.VUAPROXY_LOCATION_TABS = [\n" +
    '  { id: "all", label: "All" },\n' +
    '  { id: "asia", label: "Asia" },\n' +
    '  { id: "europe", label: "Europe" },\n' +
    '  { id: "america", label: "America" },\n' +
    '  { id: "africa", label: "Africa" },\n' +
    '  { id: "oceania", label: "Australia" }\n' +
    "];\n";
  fs.writeFileSync(path.join(root, "js", "locations-data.js"), body);
  console.log("Wrote locations-data.js");
}

function syncMegaRegions(list) {
  const taxPath = path.join(root, "js", "category-taxonomy.js");
  let s = fs.readFileSync(taxPath, "utf8");
  const byRegion = {
    asia: [],
    europe: [],
    america: [],
    africa: [],
    oceania: []
  };
  list.forEach((c) => {
    if (!byRegion[c.region]) return;
    byRegion[c.region].push({
      name: c.nameVi || c.name,
      code: c.code,
      q: c.name
    });
  });
  // Sort each region by Vietnamese name
  Object.keys(byRegion).forEach((k) => {
    byRegion[k].sort((a, b) => String(a.name).localeCompare(String(b.name), "vi"));
  });

  const regionKeyMap = {
    "chau-a": "asia",
    "chau-au": "europe",
    "chau-my": "america",
    "chau-phi": "africa",
    "chau-dai-duong": "oceania"
  };

  // Replace each countries array for geo regions via regex on slug blocks
  Object.keys(regionKeyMap).forEach((slug) => {
    const region = regionKeyMap[slug];
    const countries = byRegion[region];
    const countriesJson = JSON.stringify(countries, null, 6)
      .replace(/"([^"]+)":/g, "$1:")
      .replace(/\n/g, "\n      ");
    const re = new RegExp(
      '("?' +
        slug +
        '"?\\s*:\\s*\\{[\\s\\S]*?countries:\\s*)\\[[\\s\\S]*?\\]',
      "m"
    );
    if (!re.test(s)) {
      console.warn("Could not patch region", slug);
      return;
    }
    s = s.replace(re, "$1" + countriesJson);
    console.log("Mega", slug, countries.length);
  });
  fs.writeFileSync(taxPath, s);
}

function generateCountryPages(list) {
  const template = fs.readFileSync(path.join(root, "khu-vuc-quoc-gia.html"), "utf8");
  const dir = path.join(root, "tat-ca-khu-vuc");
  fs.mkdirSync(dir, { recursive: true });
  let created = 0;
  let updated = 0;
  list.forEach((c) => {
    const file = path.join(dir, c.code + ".html");
    const exists = fs.existsSync(file);
    // Keep existing pages if already customized; only create missing
    if (!exists) {
      fs.writeFileSync(file, template);
      created++;
    } else {
      // Refresh script cache bumps for location pages lightly — skip full overwrite
      updated++;
    }
  });
  console.log("Country HTML created:", created, "already existed:", updated);
}

function patchSideBanners() {
  const p = path.join(root, "js", "side-banners.js");
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/tag:\s*"60\+ nước"/, 'tag: "190 nước"');
  s = s.replace(/60\+ NƯỚC/gi, "190 NƯỚC");
  fs.writeFileSync(p, s);
  console.log("side-banners updated");
}

function patchFlagFallback() {
  const files = [
    path.join(root, "js", "locations-page.js"),
    path.join(root, "js", "location-country-page.js")
  ];
  files.forEach((p) => {
    if (!fs.existsSync(p)) return;
    let s = fs.readFileSync(p, "utf8");
    if (s.includes("flagcdn.com")) {
      console.log("flagcdn already in", path.basename(p));
      return;
    }
    if (s.includes("function flagSrc")) {
      s = s.replace(
        /function flagSrc\(code\) \{\s*return "\/images\/flags\/" \+ code \+ "\.png";\s*\}/,
        `function flagSrc(code) {
    const c = String(code || "").toLowerCase();
    return "/images/flags/" + c + ".png";
  }
  function flagOnError(img, code) {
    if (!img || img.dataset.cdn) return;
    img.dataset.cdn = "1";
    img.src = "https://flagcdn.com/w80/" + String(code || "").toLowerCase() + ".png";
  }`
      );
      s = s.replace(
        /onerror="this\.style\.opacity=\.25"/g,
        'onerror="this.dataset.cdn||(this.dataset.cdn=1,this.src=\\\'https://flagcdn.com/w80/\\\'+this.src.split(\\\'/\\\').pop().replace(/\\\\.png.*/,\\\'\\\'))+\\\'.png\\\')"'
      );
      // Simpler: replace card flag img onerror
      s = s.replace(
        /'<img class="loc-flag" src="' \+ flagSrc\(item\.code\) \+ '" alt="' \+ item\.name \+ '" width="48" height="48" loading="lazy" onerror="[^"]*">'/g,
        `'<img class="loc-flag" src="' + flagSrc(item.code) + '" alt="' + item.name + '" width="48" height="48" loading="lazy" data-code="' + item.code + '" onerror="if(!this.dataset.cdn){this.dataset.cdn=1;this.src=\\'https://flagcdn.com/w80/'+this.dataset.code+'.png\\'}">'`
      );
    }
    // location-country-page often sets flag img src directly
    if (path.basename(p) === "location-country-page.js") {
      if (!s.includes("flagcdn.com")) {
        s = s.replace(
          /\/images\/flags\/" \+ code \+ "\.png/g,
          '/images/flags/" + code + ".png'
        );
        // add helper near top after locations const
        if (!s.includes("function flagUrl")) {
          s = s.replace(
            "const locations = window.VUAPROXY_LOCATIONS || [];",
            `const locations = window.VUAPROXY_LOCATIONS || [];
  function flagUrl(code) {
    return "/images/flags/" + String(code || "").toLowerCase() + ".png";
  }
  function bindFlagFallback(img, code) {
    if (!img) return;
    img.addEventListener("error", function once() {
      img.removeEventListener("error", once);
      img.src = "https://flagcdn.com/w160/" + String(code || "").toLowerCase() + ".png";
    });
  }`
          );
        }
      }
    }
    fs.writeFileSync(p, s);
    console.log("patched flags", path.basename(p));
  });
}

writeLocationsData(locations);
syncMegaRegions(locations);
generateCountryPages(locations);
patchSideBanners();
patchFlagFallback();

console.log("Done. Next: node scripts/build-proxy-products.js");
