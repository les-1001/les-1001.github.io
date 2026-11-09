---
title: The labels line up, so the data pipeline is done locally
date: 2026-11-04
project: humanoid-mimic
---

The local data pipeline now turns BEDLAM 2.0 samples into person-centred training crops. Each crop comes with its 3D body parameters, camera, 2D joints and a visibility mask. About 30% are "hips-up" crops that mimic someone sitting at a laptop, since that's what live mode will mostly see.

**Checking the labels.** I rebuilt labels from the raw motion and camera data and compared them with the dataset authors' processed labels. The agreement thresholds are fixed in the repo, so they can't drift later:

| | Mean | 95th percentile |
|---|---|---|
| 2D joints | ≤ 2 px | ≤ 4 px |
| 3D joints | ≤ 5 mm | ≤ 10 mm |

The comparison passed. A visual review of the overlays also passed: the projected joints and body mesh sit on the rendered person.

**The split.** Train, validation and test share no sequence, no body identity and no source motion. Validation and test each need at least 7% of frames and of clips, 20 bodies and 50 sequences. An automated test checks for overlap.

Next: run the same pipeline at scale on the NUS cluster.
