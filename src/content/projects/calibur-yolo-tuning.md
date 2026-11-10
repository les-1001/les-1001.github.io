---
title: Tuning a Keypoint Detector on a GPU Cluster
summary: I tuned the hyperparameters and backbone of a YOLO11-pose model that finds the corners of armor plates. It cut keypoint loss by 17.5% and raised box mAP by 8.6%, and a seed study showed where further tuning stops helping.
status: in-progress
group: calibur
tabLabel: YOLO tuning
order: 3
role: NUS Calibur Robotics (RoboMaster), vision team, 2026
stack: [Python, PyTorch, Ultralytics YOLO11, SLURM, NVIDIA A100, Linux]
links: []
---

## In numbers

| | Starting model | After tuning |
|---|---|---|
| Validation keypoint (pose) loss | 0.195 | **0.161 (−17.5%)** |
| Validation box mAP50-95 | 0.780 | **0.848 (+8.6%)** |
| Validation pose mAP50-95 | 0.939 | **0.949 (+1.1%)** |
| Test pose mAP50-95 | — | **0.951** |
| Inference time per image | — | **0.86 ms** (38% faster than the larger backbone) |

- **16** full 100-epoch training runs, plus timing probes, on NVIDIA A100s
- **~9,400** labelled images (6,579 train / 1,881 validation / 945 test)
- **~420×** faster per epoch on the cluster (53.6 s) than on a laptop CPU (6.3 hours)

## The problem

The robot's aimbot finds enemy armor plates with a YOLO pose model. The model predicts the four corners of each plate, and the corners go into a PnP solver that works out the plate's 3D position. A few pixels of corner error become centimetres of aiming error at range. The training code already existed. My job was to tune the model to lower its keypoint loss.

## What I did

Three rounds of experiments, each building on the last:

1. **Backbone and learning rate.** Compared YOLO11-nano against YOLO11-small, then swept the learning rate (0.0005 / 0.001 / 0.002). Nano tied small on accuracy, beat it on the test set and ran 38% faster, so I chose nano. The default learning rate of 0.001 stayed best.
2. **One change at a time.** Tried a higher input resolution (960 px), a larger keypoint-loss weight, and stronger augmentation, each against the round-1 baseline. A larger keypoint weight looked like the winner.
3. **Is the winner real?** Before trusting it, I re-ran the default and the "winner" with three seeds each, then tested five more single changes. The seed spread (~0.005 mAP) was bigger than the win (+0.001), so it was a tie, not an improvement.

I ran everything on the NUS School of Computing cluster with SLURM, since my laptop has no GPU. Getting the first job running meant working through three storage-quota walls (home, scratch and node-local disk), a Python environment that resolved to the wrong interpreter, and an out-of-memory kill. I turned the fixes into a reusable job template that stages data on node-local disk and copies only small results back.

## What I learned

- **Measure your noise before you claim a win.** Changing only the random seed moved mAP by about 0.005, which was more than most "improvements". The only effects in the whole study bigger than noise were negative: perspective augmentation and a higher learning rate each cut box mAP by about 0.03.
- **Know when to stop tuning.** Accuracy plateaued near 0.95 pose / 0.85 box mAP. The next gains are in data (far, blurred and steep-angle plates), in a sharper metric (corner error in pixels instead of mAP), and in the inference confidence threshold, which nobody had tuned.
- **Pick the model for the deployment, not the leaderboard.** On a robot with a frame budget, a tie in accuracy plus 38% faster inference makes the choice easy.
- **Shared clusters have their own rules.** Quotas, partitions, node-local scratch and job time limits shaped the experiment design as much as the ML did.

## Status

Tuning is finished: the hyperparameters have plateaued. The proposed next steps are a per-corner pixel-error evaluation broken down by plate size and class, tuning the inference confidence and NMS thresholds, and targeted data collection for the failure cases.
