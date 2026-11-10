---
title: GPU Preprocessing on a Competition Robot
summary: I moved the robot's image preprocessing onto the Jetson GPU. On the running robot, frames processed per second doubled and camera-to-command latency fell by 46%, with detections bit-identical to the old path.
status: in-progress
tabLabel: GPU preprocessing
order: 2
role: NUS Calibur Robotics (RoboMaster), vision team, 2026
stack: [C++17, CUDA, TensorRT, NVIDIA Jetson AGX Orin, OpenCV, CMake, Python]
links: []
---

## In numbers

| | Before | After |
|---|---|---|
| Main loop rate on the robot | ~50 FPS | **~98 FPS (2×)** |
| Camera → command latency, mean | 45.8 ms | **24.8 ms (−46%)** |
| Camera → command latency, p99 | 55.8 ms | **39.3 ms** |
| Detector alone, offline bench | 117–133 FPS | **228–255 FPS (+75–101%)** |
| Preprocess alone, one frame | 1.93 ms (CPU) | **0.81 ms (GPU)** |
| Accuracy | — | **0 differences across 1,753 armor plates** |

## The problem

NUS Calibur builds robots for RoboMaster, a university competition where robots shoot at each other's armor plates. Each robot runs a C++ vision pipeline on an NVIDIA Jetson: camera → YOLO detector (TensorRT) → tracker → aim planner → gimbal command. When the robot acts on an older image, it aims at where the target used to be.

I found two problems by reading the detector code:

1. **Every frame was preprocessed twice.** One stage built a full input tensor that nothing ever read, and the next stage built it again. That wasted about 2 ms of CPU per frame.
2. **Preprocessing ran on the CPU.** It made five OpenCV passes and then copied a 4.9 MB float buffer to the GPU. The design came from a codebase written for an Intel CPU with no GPU, and the Jetson's stock OpenCV has no CUDA modules.

## What I did

- **Deleted the dead preprocess** (24 lines). It is a zero-risk change, so it can go in as its own small PR.
- **Wrote a CUDA kernel** that does resize, padding, BGR→RGB, normalisation and HWC→NCHW in a single pass. It writes straight into TensorRT's input buffer, so the host-to-device copy of the float tensor goes away.
- **Kept the CPU path as the default.** The GPU path is behind a config flag, so the team can switch back on site without rebuilding.
- **Proved it changes nothing:**
  - A parity test on 11 edge-case images (odd sizes, upscaling, portrait, all black, all white, cropped regions) matched the CPU path bit for bit.
  - A frame-by-frame replay of recorded robot footage compared every detection: 1,753 armor plates with the same count, labels, confidence and corner positions (0.0000 px difference).
- **Built a per-frame latency trace.** It timestamps every stage from camera receipt to the serial command, plus a report script. This let me measure the whole robot, not just the detector.
- **Measured on the real robot.** I wrote a step-by-step guide so a teammate could run the test on the sentry robot (AGX Orin, live camera, real gimbal). The runs alternated before/after/before/after, about 60 s each. The two pairs agreed within 0.5 ms.

## What I learned

- **Saving 8 ms in one stage saved 21 ms end to end.** The main loop is serial, so a faster detector also means frames wait less in the camera queue (17 → 8 ms). I only saw this by tracing the whole loop. Benchmarking the detector alone predicted a much smaller win.
- **Offline benchmarks can mislead in both directions.** The bench predicted the camera's 150 fps cap would be the limit. On the robot, the CPU is shared with the camera driver, ROS and the video stream, so the old path was much slower than on the bench (~50 FPS), and the real limit turned out to be the serial loop, not the camera.
- **"Faster" isn't done until accuracy is proven unchanged.** I set the bar at bit-identical output before measuring speed at all.
- **Speed changes have side effects.** Some tracker settings count frames, not milliseconds. At twice the frame rate, "hold a lost target for 15 frames" means 153 ms instead of 300 ms. I listed these settings for retuning.
- **Read the datasheet.** The camera can do 249 fps. The 150 fps limit was a line in our own code.
- Along the way I found an existing bug: a CUDA error-check macro re-declared a variable, so two query functions checked an uninitialised value.

## Status

The code is on a feature branch, with a written report and the measurements. The GPU flag ships off until the team lead approves it. Next steps:

- repeat the measurement on the Orin NX that the standard robots use;
- A/B test aiming accuracy in the trainer (see [Aim Training and Replay Tools](/projects/calibur-aim-tools/));
- go after the remaining ~25 ms: read only the newest camera frame, and wake the planner when a new target arrives instead of waiting for its 100 Hz tick.
