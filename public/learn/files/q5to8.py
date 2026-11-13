#!/usr/bin/env python3
"""Rewrite every Q5_0 tensor in a GGUF file as Q8_0, losslessly, into a new file.

  pip install gguf numpy
  python3 q5to8.py IN.gguf OUT.gguf

A Q5_0 weight is d * (q - 16) with q in 0..31; a Q8_0 weight is d * s with s in -128..127. Keeping each block's
scale d and writing s = q - 16 gives the same numbers. Every other tensor and every metadata key is copied as is.
"""
import sys

import numpy as np
from gguf import GGMLQuantizationType as Q, GGUFReader, GGUFValueType as T, GGUFWriter

src, dst = sys.argv[1:3]
r = GGUFReader(src)


def q5_0_to_q8_0(raw: np.ndarray) -> np.ndarray:
    b = np.asarray(raw).reshape(-1, 22)            # Q5_0 block: f16 d, u32 high bits, 16 bytes of low nibbles
    d, qs = b[:, 0:2], b[:, 6:22]
    qh = b[:, 2:6].copy().view("<u4")             # bit j is the 5th bit of weight j
    j = np.arange(16, dtype=np.uint32)
    lo = (qs & 0x0F) | (((qh >> j) & 1) << 4).astype(np.uint8)
    hi = (qs >> 4) | (((qh >> (j + 16)) & 1) << 4).astype(np.uint8)
    s = (np.concatenate([lo, hi], axis=1).astype(np.int16) - 16).astype(np.int8)
    out = np.concatenate([d, s.view(np.uint8)], axis=1)  # Q8_0 block: f16 d, 32 int8
    return out.reshape(*raw.shape[:-1], raw.shape[-1] // 22 * 34)


new = {t.name: q5_0_to_q8_0(t.data) for t in r.tensors if t.tensor_type == Q.Q5_0}
if not new:
    sys.exit(f"{src}: no Q5_0 tensors, nothing to do")

arch = r.fields.get("general.architecture")
w = GGUFWriter(dst, arch.contents() if arch else "unknown")
if not arch:                                       # a later part of a split model has none; don't add one
    w.kv_data[0].pop("general.architecture", None)
if "general.alignment" in r.fields:
    w.data_alignment = int(r.fields["general.alignment"].contents())
for f in r.fields.values():
    if f.name.startswith("GGUF.") or f.name == "general.architecture":
        continue
    w.add_key_value(f.name, f.contents(), f.types[0], sub_type=f.types[-1] if f.types[0] == T.ARRAY else None)

for t in r.tensors:
    data = new.get(t.name, t.data)
    w.add_tensor_info(t.name, data.shape, data.dtype, data.nbytes, Q.Q8_0 if t.name in new else t.tensor_type)
w.write_header_to_file()
w.write_kv_data_to_file()
w.write_ti_data_to_file()
for t in r.tensors:
    w.write_tensor_data(new.get(t.name, t.data))
w.close()

grew = sum(a.nbytes for a in new.values()) - sum(t.n_bytes for t in r.tensors if t.name in new)
print(f"{dst}: {', '.join(new)} now Q8_0, {grew / 1e6:.1f} MB larger")
