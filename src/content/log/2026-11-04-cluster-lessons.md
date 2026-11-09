---
title: "Cluster lessons: storage, Python versions and one broken install"
date: 2026-11-04
project: humanoid-mimic
---

Before moving hundreds of gigabytes onto the cluster, I ran small probe jobs to measure what it actually allows.

- **Storage:** the compute nodes have about 3 TB of fast local disk, but the shared scratch space has its own quota. Archives stay packed on scratch and are only extracted on the node's local disk.
- **Home folder:** it has a tiny quota, and a forgotten 3.7 GB pip cache was sitting in it. Every cache now points at the job's local disk.
- **Python:** compute nodes only ship Python 3.12, and the project pins 3.11. Each job installs 3.11 with `uv` on the local disk.

**What broke:** two setup jobs failed to install a basic dependency (`certifi`). The cause was index order. The PyTorch package index was listed first, and it also served packages it shouldn't. The fix is to use that index only for `torch` and `torchvision`.

I also cut my AI coding-agent setup down to short, focused sessions, each driven by a written playbook. When the agent makes a mistake, the fix goes into the playbook so the mistake doesn't come back.
