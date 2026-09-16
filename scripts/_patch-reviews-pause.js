const fs = require("fs");
const path = "C:/Users/Admin/Downloads/VuaProxy/js/app.js";
let t = fs.readFileSync(path, "utf8");
const old = `  cols.forEach((col, idx) => {
    const items = buckets[idx].length ? buckets[idx] : REVIEWS.slice(idx, idx + 4);
    const html = items.map(reviewMarqueeCard).join("");
    col.innerHTML = \`<div class="reviews-col-track">\${html}\${html}</div>\`;
  });
}
renderReviewsMarquee();`;
const neu = `  cols.forEach((col, idx) => {
    const items = buckets[idx].length ? buckets[idx] : REVIEWS.slice(idx, idx + 4);
    const html = items.map(reviewMarqueeCard).join("");
    col.innerHTML = \`<div class="reviews-col-track">\${html}\${html}</div>\`;
  });

  const section = grid.closest(".reviews-marquee") || grid;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const on = !!(entries[0] && entries[0].isIntersecting);
      section.classList.toggle("is-paused", !on);
    }, { rootMargin: "80px 0px", threshold: 0.02 });
    io.observe(section);
  }
}
renderReviewsMarquee();`;
if (!t.includes(old)) {
  console.log("pattern missing");
  process.exit(1);
}
fs.writeFileSync(path, t.replace(old, neu));
console.log("app.js patched");
