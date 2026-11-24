# contact sheet of probe frames: python3 tools/sheet.py out.jpg cols width files...
import sys
from PIL import Image, ImageDraw
out, cols, w = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); fs = sys.argv[4:]
h = w * 9 // 16; rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), (30, 30, 30))
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); S.paste(im, ((i % cols) * w, (i // cols) * h))
    ImageDraw.Draw(S).text(((i % cols) * w + 6, (i // cols) * h + 4), f.split('/')[-1], fill=(255, 255, 0))
S.save(out, quality=85)
