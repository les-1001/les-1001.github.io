---
title: Aim Training and Replay Tools
summary: Tools that let a robotics team test and tune its aimbot without a live match. They replay recorded footage through the robot's real code, run a stationary-spin trainer, and measure where bullets actually hit from a phone's slow-motion video.
status: in-progress
group: calibur
tabLabel: Aim tools
order: 4
role: NUS Calibur Robotics (RoboMaster), vision team, 2026
stack: [C++17, Python, OpenCV, ONNX Runtime, Eigen, Pytest, CMake]
links: []
---

## In numbers

- **5,700+ lines** in the trainer and recording commit (106 files), with C++ and Python tests
- **~1,000-line** shot-review tool. On synthetic clips with a planted 20 ms lag and 15 mm offset, it measured 18 ms and 12 mm.
- **3 tools in one aim-tuning loop:** replay → train → measure hits

## The problem

Tuning a RoboMaster aimbot used to mean putting the robot on a field, firing, and guessing. Nothing was recorded, a change couldn't be compared against the old version on the same input, and nobody could see where the shots actually landed.

## What I built

- **Video replay through the production pipeline** (`video_debug`). It feeds recorded clips through the robot's own detector, tracker and planner with the robot's own config. It draws the aim point using the camera matrix and scores each replay, so two versions of the code can be compared on identical footage. I also fixed a YOLO11 class-mapping bug along the way.
- **Stationary-spin aimbot trainer.** It simulates or replays a spinning target through the production `auto_aim` code, using the same viewers and HUD as the robot. Around it:
  - a session recorder with a documented file format and validation;
  - gimbal excitation runs (steps, chirps) with a script that fits a gimbal dynamics model;
  - camera and hand-eye calibration helpers;
  - suite and comparison scripts that run many trials and diff two builds.
- **Shot review from a phone video.** You give it a 240 fps slow-mo clip and it:
  - finds the armor plates (any ONNX detector);
  - tracks each bullet and estimates when it crossed the plate from its shrinking size;
  - fits `miss = bias + b × plate speed` to separate aim offset from timing lag.

  The output is an HTML report, an annotated video and suggested config changes. It only suggests a change when the effect is more than twice its uncertainty.

## What I learned

- **Tools only get used if they're easy.** My first plan for shot analysis needed robot logs, firmware changes and clock sync. Teammates wanted one command and a video path, so I rebuilt it that way and moved the extras behind optional flags.
- **Test a measurement tool on data where you know the answer.** Rendering synthetic clips with a planted lag and offset showed the tool's real error before anyone trusted it on the field.
- **Separate what tuning can fix from what it can't.** Splitting misses into a constant offset, a speed-dependent lag and leftover scatter tells you which config value to change, and when to stop changing it.
- **Replay makes changes comparable.** The [GPU preprocessing work](/projects/calibur-gpu-latency/) was only provable because I could replay the same 1,753 armor detections through both code paths.

## Status

The replay tools and trainer are on feature branches. Shot review is being tested on robot footage, and the next use is A/B testing the aiming of the GPU-preprocessing build.
