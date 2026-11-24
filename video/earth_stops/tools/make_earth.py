# Builds the globe textures (equirectangular) and a simplified world outline
# from the public-domain Natural Earth low-res datasets.
#   python3 tools/make_earth.py <naturalearth_lowres.shp> <naturalearth_cities.shp>
# Output: web/assets/earth_day.jpg, earth_night.png, clouds.png, web/lib/world.js
import sys, json, os
import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'web', 'assets')
TW, TH = 2048, 1024
rs = np.random.default_rng(42)

countries = shapefile.Reader(sys.argv[1])
cities = shapefile.Reader(sys.argv[2])


def xy(lon, lat):
    return ((lon + 180) / 360 * TW, (90 - lat) / 180 * TH)


def parts(shape):
    pts = shape.points
    idx = list(shape.parts) + [len(pts)]
    for a, b in zip(idx[:-1], idx[1:]):
        yield pts[a:b]


# ---------------- land mask ----------------
mask_img = Image.new('L', (TW, TH), 0)
d = ImageDraw.Draw(mask_img)
recs = countries.records()
shapes = countries.shapes()
for shp in shapes:
    for ring in parts(shp):
        d.polygon([xy(*p) for p in ring], fill=255)
land = np.asarray(mask_img).astype(float) / 255

lon = np.linspace(-180, 180, TW, endpoint=False) + 180 / TW
lat = np.linspace(90, -90, TH, endpoint=False) - 90 / TH
LON, LAT = np.meshgrid(lon, lat)


def fbm(w, h, octaves=6, base=4, seed=0, wrap=True):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gw, gh = base * 2 ** o, max(2, base * 2 ** o // 2)
        g = r.random((gh + 1, gw + 1))
        if wrap: g[:, -1] = g[:, 0]
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(img).astype(float) / 255 * amp
        tot += amp
        amp *= 0.5
    return out / tot


_wx = _wy = None
def blob(lo0, lo1, la0, la1, soft=6):
    """soft, noise-warped rectangle in lon/lat"""
    X, Y = (LON, LAT) if _wx is None else (LON + _wx, LAT + _wy)
    fx = np.clip(np.minimum(X - lo0, lo1 - X) / (soft * 1.6), 0, 1)
    fy = np.clip(np.minimum(Y - la0, la1 - Y) / (soft * 1.6), 0, 1)
    return fx * fy


n1 = fbm(TW, TH, 7, 6, 1)
n2 = fbm(TW, TH, 5, 3, 2)
n3 = fbm(TW, TH, 4, 48, 3)
_wx = (fbm(TW, TH, 4, 6, 11) - 0.5) * 22
_wy = (fbm(TW, TH, 4, 6, 12) - 0.5) * 14
desert = np.clip(
    blob(-17, 35, 14, 33, 7) + blob(35, 60, 12, 32, 5) + blob(118, 146, -32, -18, 6)
    + blob(88, 118, 37, 47, 5) + blob(-118, -103, 27, 38, 4) + blob(14, 26, -28, -19, 4)
    + blob(50, 75, 36, 48, 5) + blob(50, 70, 25, 36, 4) + blob(-72, -68, -28, -18, 2)
    + blob(65, 75, 24, 30, 3), 0, 1)
desert = np.clip(desert * (0.55 + 0.9 * n2), 0, 1) ** 0.8
alat = np.abs(LAT)
tropic = np.clip(1 - alat / 18, 0, 1)
boreal = np.clip((alat - 50) / 10, 0, 1) * np.clip((72 - alat) / 6, 0, 1)
tundra = np.clip((alat - 62) / 8, 0, 1)

def C(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

col = np.zeros((TH, TW, 3))
temperate = C('#5f9a3c'); jungle = C('#2f7a2a'); taiga = C('#3c6a3a'); tun = C('#8e8a64'); sand = C('#d9b77a'); sand2 = C('#c4904e')
base = temperate[None, None] * (1 - tropic[..., None]) + jungle[None, None] * tropic[..., None]
base = base * (1 - boreal[..., None]) + taiga * boreal[..., None]
base = base * (1 - tundra[..., None]) + tun * tundra[..., None]
ds = sand * (1 - n1[..., None]) + sand2 * n1[..., None]
base = base * (1 - desert[..., None]) + ds * desert[..., None]
base *= (0.80 + 0.30 * n1[..., None] + 0.18 * n3[..., None])
# ice: Antarctica, Greenland, high Arctic
ice = np.clip((-LAT - 62) / 4, 0, 1) + np.clip((LAT - 76) / 3, 0, 1) + ((LON > -60) & (LON < -15) & (LAT > 60))
ice = np.clip(ice, 0, 1)
base = base * (1 - ice[..., None]) + C('#eef4fa') * (0.9 + 0.1 * n1[..., None]) * ice[..., None]

# ocean
shallow = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(10))).astype(float) / 255
deep = C('#0d3a78'); mid = C('#1a5aa6'); coast = C('#2e86c6')
oc = deep * (1 - n2[..., None] * 0.3) + mid * n2[..., None] * 0.3
oc = oc * (1 - np.clip(shallow * 2.2, 0, 1)[..., None]) + coast * np.clip(shallow * 2.2, 0, 1)[..., None]
oc = oc * (1 - np.clip((alat - 60) / 25, 0, 1)[..., None] * 0.3)
seaice = np.clip((alat - 74) / 6, 0, 1) * np.clip((n1 + n3 * 0.5 - 0.55) * 6, 0, 1)
oc = oc * (1 - seaice[..., None]) + C('#dce8f2') * seaice[..., None]
img = oc * (1 - land[..., None]) + base * land[..., None]


def polar_smooth(a):
    # longitudes converge at the poles: fade every row toward its mean to avoid streaks
    f = np.clip((np.abs(lat) - 62) / 22, 0, 1)[:, None]
    if a.ndim == 3: f = f[..., None]
    return a * (1 - f) + a.mean(axis=1, keepdims=True) * f


img = polar_smooth(img)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'earth_day.jpg'), quality=92)

# ---------------- night lights ----------------
night = np.zeros((TH, TW))
for rec, shp in zip(recs, shapes):
    pop = rec[0] or 0
    if pop <= 0 or rec[1] == 'Antarctica': continue
    bx0, by0, bx1, by1 = shp.bbox
    n = int(min(4000, pop / 1.2e5))
    xs = rs.uniform(bx0, bx1, n * 3); ys = rs.uniform(by0, by1, n * 3)
    px = ((xs + 180) / 360 * TW).astype(int) % TW; py = np.clip(((90 - ys) / 180 * TH).astype(int), 0, TH - 1)
    ok = land[py, px] > 0.5
    px, py = px[ok][:n], py[ok][:n]
    np.add.at(night, (py, px), rs.uniform(0.15, 0.6, len(px)))
for shp in cities.shapes():
    lo, la = shp.points[0]
    x, y = int((lo + 180) / 360 * TW) % TW, int((90 - la) / 180 * TH)
    for k in range(60):
        dx, dy = rs.normal(0, 3.2, 2)
        xx, yy = (x + int(dx)) % TW, int(np.clip(y + dy, 0, TH - 1))
        night[yy, xx] += rs.uniform(0.3, 1.0)
night_img = Image.fromarray(np.clip(night * 255, 0, 255).astype(np.uint8))
glow = night_img.filter(ImageFilter.GaussianBlur(2.5))
nl = np.clip(np.asarray(night_img).astype(float) + np.asarray(glow).astype(float) * 1.6, 0, 255) / 255
rgba = np.zeros((TH, TW, 4), np.uint8)
rgba[..., 0] = 255; rgba[..., 1] = 205; rgba[..., 2] = 120; rgba[..., 3] = (nl * 255).astype(np.uint8)
Image.fromarray(rgba).save(os.path.join(OUT, 'earth_night.png'))

# ---------------- clouds ----------------
c1 = fbm(TW, TH, 8, 8, 7)
c2 = fbm(TW, TH, 6, 24, 8)
# zonal stretching: smear noise along longitude
cl = np.asarray(Image.fromarray((c1 * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(1))).astype(float) / 255
bands = 0.55 + 0.25 * np.exp(-((LAT) / 8) ** 2) + 0.25 * np.exp(-((alat - 55) / 12) ** 2) - 0.25 * np.exp(-((alat - 25) / 8) ** 2)
cv = np.clip((cl * 0.8 + c2 * 0.4) * bands - 0.36, 0, 1) * 2.4
cv = polar_smooth(np.clip(cv, 0, 1) ** 1.1) * np.clip((80 - np.abs(LAT)) / 15, 0, 1)
cr = np.zeros((TH, TW, 4), np.uint8); cr[..., :3] = 255; cr[..., 3] = (cv * 235).astype(np.uint8)
Image.fromarray(cr).save(os.path.join(OUT, 'clouds.png'))

# ---------------- world outline for flat maps ----------------
polys = []
for shp in shapes:
    for ring in parts(shp):
        if len(ring) < 4: continue
        r = [(round(a, 1), round(b, 1)) for a, b in ring[::2]]
        polys.append(r)
with open(os.path.join(ROOT, 'web', 'lib', 'world.js'), 'w') as f:
    f.write('// Natural Earth 1:110m (public domain), simplified\nwindow.WORLD=' + json.dumps(polys, separators=(',', ':')) + ';\n')
print('ok', len(polys), 'polygons')
