---
title: "Quantisation-Aware Distillation for Small-Object Detection on Edge Hardware"
tabLabel: "UREx research"
summary: "Does a full-precision teacher model win back the small objects that 8-bit quantisation costs a real-time detector? I'm testing it with four training setups, all measured on an NVIDIA Jetson."
status: upcoming
order: 6
role: "UREx (CDE2605R), NUS, Semester 2 AY2026/27. TODO: find a supervising professor"
stack: [PyTorch, Ultralytics, TensorRT, ONNX Runtime, C++, NVIDIA Jetson, ESP32-P4]
links: []
---

## Why this matters

Robots, drones and smart cameras need object detectors that run in real time on small, low-power chips. The standard way to get there is **INT8 quantisation**: storing and computing with 8-bit integers instead of 32-bit floats. It cuts memory traffic by 4x, lets the model use fast integer hardware, and many edge chips and microcontrollers require it.

The cost is rounding error. A small, distant object may only show up as a few weak activations inside the network, and rounding can erase them. So a quantised model can lose small objects first while its overall accuracy still looks fine. For a robot or a drone, those far-away objects are often the ones that matter most.

Two known techniques each win back some of the lost accuracy:

- **Quantisation-aware training (QAT)** simulates the rounding during training, so the model learns weights that survive it. Espressif's YOLO11n release for the ESP32-P4 shows QAT lifting COCO mAP50-95 from 0.307 to 0.360 over plain 8-bit quantisation.
- **Knowledge distillation** trains the small model to imitate a large, accurate "teacher" model.

Less is known about whether combining the two helps **small objects specifically**, and whether the answer changes from one kind of edge chip to another.

## The question

Does INT8 quantisation hurt small-object detection more than large-object detection? And does distillation from a full-precision teacher recover more of that loss than QAT alone, at the same speed on the device?

- **H1:** Post-training quantisation (PTQ) to INT8 causes a larger relative drop in accuracy for small objects than for medium and large ones.
- **H2:** QAT recovers part of the small-object drop.
- **H3:** QAT plus distillation recovers more of it than QAT alone, with no extra inference cost, since the teacher is only used during training.

## Method

One small student model is trained four ways. Every result is measured on the real device, not estimated from FLOPs.

| # | Setup | What it tells me |
|---|---|---|
| 1 | Full-precision (FP32) student | The accuracy ceiling |
| 2 | INT8 via post-training quantisation | How much quantisation costs (H1) |
| 3 | INT8 via QAT | The standard fix (H2) |
| 4 | INT8 via QAT + distillation (outputs and features) | The proposed fix (H3) |

- **Data:** VisDrone, about 6,500 aerial training images packed with small objects.
- **Teacher:** a large YOLO model (L size, with M as a fallback), fine-tuned from public pretrained weights and kept at full precision.
- **Student:** a nano or small YOLO model, deployed in INT8.
- **Accuracy:** mAP50-95 overall and split by object size (small, medium, large, COCO-style), plus precision and recall at a fixed confidence threshold.
- **Speed:** a C++/TensorRT benchmark that times the whole pipeline (preprocessing, inference, box decoding and NMS), not just the model.
- **Which layers are to blame:** quantise one layer at a time to find the ones that cause the small-object drop. This also tests a simpler alternative: keep only those layers in 16-bit.
- **Failure analysis:** examples of objects the model misses after quantisation, grouped by size.
- **Rigour:** 2 to 3 random seeds per setup, and every model runs at the same input resolution so the latency numbers are comparable.

## Hardware

- **Training:** A100 GPU nodes on the NUS School of Computing cluster, roughly 100 to 200 GPU-hours in total, run as long unattended jobs with checkpointing.
- **Main target:** the GPU of an NVIDIA Jetson Orin Nano Super, running TensorRT INT8 engines.
- **Second target:** the same Jetson's ARM CPU cores with ONNX Runtime INT8. This adds a non-GPU data point with no extra hardware.
- **Stretch target:** an ESP32-P4 microcontroller (ESP32-P4-EYE board) using Espressif's ESP-DL toolchain. It tests whether the findings hold on a chip with no GPU at all. I'll only attempt it if the core results are done by Week 9.

## Timeline

| When | Work | Milestone |
|---|---|---|
| December | Dataset, cluster job scripts and Jetson set up; literature review | Pipeline runs end to end |
| Weeks 1–2 | Train the FP32 student; build the C++/TensorRT benchmark | Baseline accuracy and latency |
| Weeks 3–4 | Fine-tune the teacher; run PTQ; per-layer sensitivity analysis | H1 result |
| Weeks 5–7 | QAT and QAT + distillation runs, 2–3 seeds each | All four setups trained |
| Weeks 8–9 | Benchmark on Jetson GPU and CPU; failure analysis | Core results complete |
| Weeks 10–11 | ESP32-P4 deployment if on track, otherwise extra ablations | Stretch result or ablations |
| Weeks 12–13 | Analysis and write-up | Report submitted (due 19 April 2027) |

## What comes out of it

- A technical report.
- An open-source repository with the training scripts, quantised models and benchmark code.
- A results table of accuracy (split by object size) against on-device latency for all four setups.

If distillation turns out not to help, that's still a useful result: the report will show where and why it fails.

## Where it could go next

- Mixed precision per layer (INT4, INT8 or FP16), chosen from latency measured on each chip and guided by the sensitivity analysis.
- Using the teacher to label unlabelled video frames, so the student can be trained with only 10–25% of the labels.
- Extending the method to transformer-based detectors.

## Status

Upcoming. The proposal is written, and the next step is **finding a supervising professor**. Work starts in December with setup, ahead of Semester 2.
