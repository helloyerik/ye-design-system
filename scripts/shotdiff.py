#!/usr/bin/env python3
"""Pixel diff of two screenshot dirs. Usage: shotdiff.py A B [threshold_px]. Exit 1 if any file differs above threshold."""
import sys, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]; thr = int(sys.argv[3]) if len(sys.argv) > 3 else 0
bad = 0; same = 0
for f in sorted(os.listdir(a)):
    if not f.endswith('.png'): continue
    pb = os.path.join(b, f)
    if not os.path.exists(pb): print('MISSING', f); bad += 1; continue
    ia, ib = Image.open(os.path.join(a, f)).convert('RGB'), Image.open(pb).convert('RGB')
    if ia.size != ib.size: print('SIZE', f, ia.size, ib.size); bad += 1; continue
    d = ImageChops.difference(ia, ib).convert('L').point(lambda v: 255 if v > 8 else 0)
    n = sum(1 for v in d.getdata() if v)
    if n > thr: print(f'DIFF {f} {n}px bbox={d.getbbox()}'); bad += 1
    else: same += 1
print(f'same={same} diff={bad}'); sys.exit(1 if bad else 0)
