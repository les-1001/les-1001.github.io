---
title: Humanoid Mimic
summary: Stand in front of your laptop webcam and a simulated Unitree G1 humanoid copies your movements in real time, entirely in your browser.
status: in-progress
order: 1
role: Personal project, 2026–27
stack: [PyTorch, ONNX Runtime Web, WebGPU, MuJoCo, three.js, SLURM]
# Add buttons here as they become real. The first one is the big blue button.
# links:
#   - label: Try it live
#     url: https://les-1001.github.io/humanoid-mimic/
#   - label: Code on GitHub
#     url: https://github.com/les-1001/Humanoid-mimic
links: []
---

## What it does

**Live mode** runs on your own device. Nothing leaves the browser. Your webcam feed goes through a person detector and a small pose network I trained. The predicted pose is smoothed, then mapped onto the G1's joints with inverse kinematics. The robot's arms, torso and head follow you. If you step back two or three metres, its legs follow too.

**Record mode** sends a 10-second clip to a GPU. A larger model reconstructs your full-body motion. The motion is retargeted to the robot. A physics simulation then scores whether a real G1 could actually perform it, checking balance, foot sliding, joint limits and motor torques.

## What I'm building myself

- **Teacher model:** video to a 3D body model (SMPL-X). Trained on the synthetic BEDLAM 2.0 dataset on the NUS computing cluster.
- **Student model:** a small network distilled from the teacher and quantised so it runs at interactive speed in the browser with WebGPU.
- **The glue:** evaluation, browser IK and the physics feasibility score.

Off-the-shelf parts: GMR for retargeting, the MuJoCo Menagerie G1 model, a person detector and three.js.

## How I'm evaluating it

- Train, validation and test splits share no sequence, body identity or motion source, so test numbers aren't inflated by leakage.
- The test split is used once, at the end. All model choices are made on validation.
- I compare variants across several seeds. A difference smaller than the seed spread counts as a tie.
- Real-world accuracy is measured on a public benchmark with its standard protocol, next to a published baseline run through the same protocol.

## Status

The data pipeline is done and verified. Next comes cluster preprocessing, then teacher training. The progress log below has the details.
