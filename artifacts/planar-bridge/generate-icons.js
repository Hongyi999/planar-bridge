const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = t[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, c]);
}

function makePNG(size, drawFn) {
  const W = size, H = size;
  const raw = Buffer.alloc((W * 4 + 1) * H, 0);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = drawFn(x, y, W, H);
      const o = y * (W * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const comp = zlib.deflateSync(raw);
  const hdr = Buffer.alloc(13);
  hdr.writeUInt32BE(W, 0); hdr.writeUInt32BE(H, 4);
  hdr[8] = 8; hdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', hdr),
    chunk('IDAT', comp),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function onLine(x, y, x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2) <= w;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
  return Math.sqrt((x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2) <= w;
}

function inCircleRing(x, y, cx, cy, r, w) {
  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  return d >= r - w && d <= r;
}

function inFilledCircle(x, y, cx, cy, r) {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r;
}

const SZ = 81;

function makeIcon(drawFn, color) {
  return makePNG(SZ, (x, y) => {
    const on = drawFn(x, y, SZ);
    return on ? [...color, 255] : [0, 0, 0, 0];
  });
}

const GOLD = [155, 134, 68];
const GRAY = [160, 154, 140];

const icons = {
  search: (x, y, W) => {
    const cx = 31, cy = 31, r = 16, sw = 3.5;
    return inCircleRing(x, y, cx, cy, r, sw) ||
      onLine(x, y, cx + r * 0.68, cy + r * 0.68, W - 9, W - 9, 4);
  },
  series: (x, y, W) => {
    const g = 9, sz = 25, gap = 4, sw = 3;
    const sq = (x1, y1) =>
      x >= x1 && x <= x1 + sz && y >= y1 && y <= y1 + sz &&
      (x <= x1 + sw || x >= x1 + sz - sw || y <= y1 + sw || y >= y1 + sz - sw);
    return sq(g, g) || sq(g + sz + gap, g) || sq(g, g + sz + gap) || sq(g + sz + gap, g + sz + gap);
  },
  lists: (x, y, W) => {
    const x1 = 18, x2 = 63, y1 = 8, ymid = 52, sw = 3.5;
    const cx = (x1 + x2) / 2;
    const inTop = x >= x1 && x <= x2 && y >= y1 && y <= y1 + sw;
    const inLeft = x >= x1 && x <= x1 + sw && y >= y1 && y <= ymid;
    const inRight = x >= x2 - sw && x <= x2 && y >= y1 && y <= ymid;
    const onV1 = onLine(x, y, x1, ymid, cx, ymid - 16, sw);
    const onV2 = onLine(x, y, cx, ymid - 16, x2, ymid, sw);
    return inTop || inLeft || inRight || onV1 || onV2;
  },
  settings: (x, y, W) => {
    const cx = W / 2, cy = W / 2, r1 = 11, r2 = 19, teeth = 8, tw = 5, sw = 3.5;
    const inCore = inCircleRing(x, y, cx, cy, r1, sw);
    let inTooth = false;
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const x1 = cx + r1 * Math.cos(angle), y1 = cy + r1 * Math.sin(angle);
      const x2 = cx + r2 * Math.cos(angle), y2 = cy + r2 * Math.sin(angle);
      if (onLine(x, y, x1, y1, x2, y2, tw / 2)) { inTooth = true; break; }
    }
    return inCore || inTooth;
  }
};

const outDir = path.join(__dirname, 'src', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const [name, fn] of Object.entries(icons)) {
  fs.writeFileSync(path.join(outDir, `tab-${name}.png`), makeIcon(fn, GRAY));
  fs.writeFileSync(path.join(outDir, `tab-${name}-sel.png`), makeIcon(fn, GOLD));
  console.log(`Generated tab-${name}.png`);
}

console.log('All icons generated in src/images/');
