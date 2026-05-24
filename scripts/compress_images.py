"""Compress oversized PNGs to under 25MB by resizing to max 2500px."""
from PIL import Image
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TARGETS = [
    # chujiandunhuangshi images (in 3 locations)
    'DHP-website/chujiandunhuangshi/all',
    'public/chujiandunhuangshi/all',
    # presets
    'public/presets',
]

MAX_DIM = 2500  # max pixels on longest edge
QUALITY = 85    # PNG compression level

for sub in TARGETS:
    d = os.path.join(BASE, sub)
    if not os.path.isdir(d):
        continue
    for fname in os.listdir(d):
        if not fname.lower().endswith('.png'):
            continue
        fp = os.path.join(d, fname)
        size_mb = os.path.getsize(fp) / (1024 * 1024)
        if size_mb < 20:
            continue

        img = Image.open(fp)
        w, h = img.size
        ratio = MAX_DIM / max(w, h)
        if ratio < 1:
            new_w = int(w * ratio)
            new_h = int(h * ratio)
            print(f'Resizing {fp} : {w}x{h} -> {new_w}x{new_h} ({size_mb:.0f}MB)')
            img = img.resize((new_w, new_h), Image.LANCZOS)

        img.save(fp, 'PNG', optimize=True)
        new_mb = os.path.getsize(fp) / (1024 * 1024)
        print(f'  Saved: {new_mb:.1f}MB')
