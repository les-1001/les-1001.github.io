---
title: Picking the training data and the stack
date: 2026-10-28
project: humanoid-mimic
---

Before writing any model code, I settled what the teacher network will learn from and which parts of the pipeline I'll reuse.

- **Data:** BEDLAM 2.0, a large synthetic dataset of rendered people with exact 3D body ground truth. I'm only using the videos and labels (about 160 GB available), never the 26 TB of PNG frames and depth maps.
- **Body model:** SMPL-X, the locked-head variant that BEDLAM 2.0 uses. Mixing it with another version would silently put the shapes in a different space, so the version is pinned in config.
- **Licences:** the dataset is research-only and can't be redistributed. The demo will show my model's output, never the training data.
- **Baseline:** a published model trained on the same data. I'll only compare against it on a real-world benchmark. On my own test split it would have an unfair advantage, since that split is carved from its training data.
