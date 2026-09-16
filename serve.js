const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 5174;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, code, data, type) {
  res.writeHead(code, { "Content-Type": type || "text/plain; charset=utf-8" });
  res.end(data);
}

function exists(rel) {
  try {
    return fs.existsSync(path.join(root, rel));
  } catch (_) {
    return false;
  }
}

function resolveFile(urlPath) {
  let filePath = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (!filePath.startsWith("/")) filePath = "/" + filePath;
  if (filePath.length > 1 && filePath.endsWith("/")) filePath = filePath.slice(0, -1);

  if (filePath === "/" || filePath === "/index.html") {
    return path.join(root, "index.html");
  }

  /* SEO listing */
  if (filePath === "/tat-ca-san-pham") {
    return path.join(root, "tat-ca-san-pham.html");
  }

  /* Category listing: /tat-ca-san-pham/proxy or /tat-ca-san-pham/proxy/luna-proxy */
  const catMatch = filePath.match(/^\/tat-ca-san-pham\/([^/]+)(?:\/([^/]+))?\/?$/i);
  if (catMatch) {
    const a = catMatch[1];
    const b = catMatch[2];
    // Product detail: slug ending with -digits
    if (!b && /-\d+$/.test(a)) {
      const staticFile = path.join(root, "vi", "tat-ca-san-pham", a + ".html");
      if (fs.existsSync(staticFile)) return staticFile;
      return path.join(root, "product.html");
    }
    // Parent or parent/child category → listing page
    return path.join(root, "tat-ca-san-pham.html");
  }

  /* Legacy /vi/tat-ca-san-pham/... */
  const prodVi = filePath.match(/^\/vi\/tat-ca-san-pham\/([^/]+?)(?:\.html)?\/?$/i);
  if (prodVi && prodVi[1] !== "index") {
    const staticFile = path.join(root, "vi", "tat-ca-san-pham", prodVi[1] + ".html");
    if (fs.existsSync(staticFile)) return staticFile;
    return path.join(root, "product.html");
  }

  /* Chia sẻ */
  if (filePath === "/chia-se" || filePath === "/blog") {
    return path.join(root, "chia-se.html");
  }
  const shareMatch = filePath.match(/^\/(?:vi\/)?chia-se\/([^/]+?)(?:\.html)?\/?$/i);
  if (shareMatch) {
    const staticFile = path.join(root, "vi", "chia-se", shareMatch[1] + ".html");
    if (fs.existsSync(staticFile)) return staticFile;
    return path.join(root, "chia-se-bai.html");
  }

  /* Danh sách SEO hubs */
  if (filePath === "/danh-sach-san-pham" || /^\/danh-sach-san-pham\/trang-\d+$/i.test(filePath)) {
    const paged = filePath.match(/trang-(\d+)$/i);
    if (paged) {
      const f = path.join(root, "vi", "danh-sach-san-pham", "trang-" + paged[1] + ".html");
      if (fs.existsSync(f)) return f;
    }
    const idx = path.join(root, "vi", "danh-sach-san-pham", "index.html");
    if (fs.existsSync(idx)) return idx;
  }
  if (filePath === "/danh-sach-chia-se" || /^\/danh-sach-chia-se\/trang-\d+$/i.test(filePath)) {
    const paged = filePath.match(/trang-(\d+)$/i);
    if (paged) {
      const f = path.join(root, "vi", "danh-sach-chia-se", "trang-" + paged[1] + ".html");
      if (fs.existsSync(f)) return f;
    }
    const idx = path.join(root, "vi", "danh-sach-chia-se", "index.html");
    if (fs.existsSync(idx)) return idx;
  }
  
  /* Chat peer routes */
  if (/^\/tin-nhan(\/|$)/i.test(filePath)) {
    return path.join(root, "tin-nhan.html");
  }

  /* Shop pretty URLs → shop.html (legacy) or listing */
  if (/^\/gian-hang\/[^/]+$/i.test(filePath)) {
    const slug = filePath.split("/").pop();
    const f = path.join(root, "gian-hang", slug + ".html");
    if (fs.existsSync(f)) return f;
    return path.join(root, "shop.html");
  }

  /* Country location pages: /tat-ca-khu-vuc/proxy-viet-nam → khu-vuc-quoc-gia.html (legacy /vn redirects) */
  const countrySeg = filePath.match(/^\/tat-ca-khu-vuc\/([a-z0-9-]+)\/?$/i);
  if (countrySeg) {
    const seg = countrySeg[1].toLowerCase();
    const CODE_TO_SLUG = {"us":"united-states","gb":"united-kingdom","jp":"japan","de":"germany","fr":"france","ca":"canada","bd":"bangladesh","in":"india","id":"indonesia","hk":"hong-kong","ae":"uae","au":"australia","af":"afghanistan","al":"albania","dz":"algeria","ad":"andorra","ao":"angola","ag":"antigua-and-barbuda","ar":"argentina","am":"armenia","at":"austria","az":"azerbaijan","bs":"bahamas","bh":"bahrain","bb":"barbados","by":"belarus","be":"belgium","bz":"belize","bj":"benin","bt":"bhutan","bo":"bolivia","ba":"bosnia-and-herzegovina","bw":"botswana","br":"brazil","bn":"brunei","bg":"bulgaria","bf":"burkina-faso","bi":"burundi","kh":"cambodia","cm":"cameroon","cv":"cape-verde","cf":"central-african-republic","td":"chad","cl":"chile","cn":"china","co":"colombia","km":"comoros","cg":"congo","cr":"costa-rica","ci":"cote-d-ivoire","hr":"croatia","cu":"cuba","cy":"cyprus","cz":"czech-republic","dk":"denmark","dj":"djibouti","dm":"dominica","do":"dominican-republic","cd":"dr-congo","ec":"ecuador","eg":"egypt","sv":"el-salvador","gq":"equatorial-guinea","er":"eritrea","ee":"estonia","sz":"eswatini","et":"ethiopia","fj":"fiji","fi":"finland","ga":"gabon","gm":"gambia","ge":"georgia","gh":"ghana","gi":"gibraltar","gr":"greece","gd":"grenada","gt":"guatemala","gn":"guinea","gw":"guinea-bissau","gy":"guyana","ht":"haiti","hn":"honduras","hu":"hungary","is":"iceland","ir":"iran","iq":"iraq","ie":"ireland","im":"isle-of-man","il":"israel","it":"italy","jm":"jamaica","jo":"jordan","kz":"kazakhstan","ke":"kenya","xk":"kosovo","kw":"kuwait","kg":"kyrgyzstan","la":"laos","lv":"latvia","lb":"lebanon","ls":"lesotho","lr":"liberia","ly":"libya","li":"liechtenstein","lt":"lithuania","lu":"luxembourg","mo":"macao","mg":"madagascar","mw":"malawi","my":"malaysia","mv":"maldives","ml":"mali","mt":"malta","mr":"mauritania","mu":"mauritius","mx":"mexico","md":"moldova","mc":"monaco","mn":"mongolia","me":"montenegro","ma":"morocco","mz":"mozambique","mm":"myanmar","na":"namibia","np":"nepal","nl":"netherlands","nz":"new-zealand","ni":"nicaragua","ne":"niger","ng":"nigeria","kp":"north-korea","mk":"north-macedonia","no":"norway","om":"oman","pk":"pakistan","ps":"palestine","pa":"panama","pg":"papua-new-guinea","py":"paraguay","pe":"peru","ph":"philippines","pl":"poland","pt":"portugal","pr":"puerto-rico","qa":"qatar","ro":"romania","ru":"russia","rw":"rwanda","kn":"saint-kitts-and-nevis","lc":"saint-lucia","vc":"saint-vincent","sm":"san-marino","sa":"saudi-arabia","sn":"senegal","rs":"serbia","sc":"seychelles","sl":"sierra-leone","sg":"singapore","sk":"slovakia","si":"slovenia","so":"somalia","za":"south-africa","kr":"south-korea","ss":"south-sudan","es":"spain","lk":"sri-lanka","sd":"sudan","sr":"suriname","se":"sweden","ch":"switzerland","sy":"syria","tw":"taiwan","tj":"tajikistan","tz":"tanzania","th":"thailand","tg":"togo","tt":"trinidad-and-tobago","tn":"tunisia","tr":"turkey","tm":"turkmenistan","ug":"uganda","ua":"ukraine","uy":"uruguay","uz":"uzbekistan","va":"vatican-city","ve":"venezuela","vn":"vietnam","ye":"yemen","zm":"zambia","zw":"zimbabwe"};
    if (/^[a-z]{2}$/.test(seg) && CODE_TO_SLUG[seg] && CODE_TO_SLUG[seg] !== seg) {
      res.writeHead(301, { Location: "/tat-ca-khu-vuc/" + CODE_TO_SLUG[seg] });
      res.end();
      return;
    }
    serveFile(path.join(__dirname, "khu-vuc-quoc-gia.html"), res);
    return;
  }

  /* Clean page URLs: /gioi-thieu → gioi-thieu.html */
  if (!path.extname(filePath)) {
    const htmlRel = filePath.slice(1) + ".html";
    if (exists(htmlRel)) return path.join(root, htmlRel);
  }

  /* Direct file */
  const direct = path.join(root, filePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;

  /* Fallback: try .html */
  if (!path.extname(filePath) && exists(filePath.slice(1) + ".html")) {
    return path.join(root, filePath.slice(1) + ".html");
  }

  return direct;
}

const server = http.createServer((req, res) => {
  try {
    const fullPath = resolveFile(req.url || "/");
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        send(res, 404, "Not found");
        return;
      }
      const ext = path.extname(fullPath);
      send(res, 200, data, types[ext] || "application/octet-stream");
    });
  } catch (e) {
    send(res, 500, "Server error");
  }
});

server.listen(port, () => {
  console.log(`Serving on http://localhost:${port}`);
});
