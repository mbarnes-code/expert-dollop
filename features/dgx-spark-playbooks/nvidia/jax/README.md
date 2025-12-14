# Optimized JAX

> Optimize JAX to run on Spark

## Table of Contents

- [Overview](#overview)
- [Instructions](#instructions)
- [Troubleshooting](#troubleshooting)

---

## Overview

## Basic idea

JAX lets you write **NumPy-style Python code** and run it fast on GPUs without writing CUDA. It does this by:

- **NumPy on accelerators**: Use `jax.numpy` just like NumPy, but arrays live on the GPU.  
- **Function transformations**:  
  - `jit` → Compiles your function into fast GPU code  
  - `grad` → Gives you automatic differentiation 
  - `vmap` → Vectorizes your function across batches  
  - `pmap` → Runs across multiple GPUs in parallel 
- **XLA backend**: JAX hands your code to XLA (Accelerated Linear Algebra compiler), which fuses operations and generates optimized GPU kernels.

## What you'll accomplish

You'll set up a JAX development environment on NVIDIA Spark with Blackwell architecture that enables 
high-performance machine learning prototyping using familiar NumPy-like abstractions, complete with 
GPU acceleration and performance optimization capabilities.

## What to know before starting

- Comfortable with Python and NumPy programming
- General understanding of machine learning workflows and techniques
- Experience working in a terminal
- Experience using and building containers
- Familiarity with different versions of CUDA
- Basic understanding of linear algebra (high-school level math sufficient)

## Prerequisites

- NVIDIA Spark device with Blackwell architecture
- ARM64 (AArch64) processor architecture
- Docker or container runtime installed
- NVIDIA Container Toolkit configured
- Verify GPU access: `nvidia-smi`
- Port 8080 available for marimo notebook access

## Ancillary files

All required assets can be found [here on GitHub](https://github.com/NVIDIA/dgx-spark-playbooks/blob/main)

- [**JAX introduction notebook**](https://github.com/NVIDIA/dgx-spark-playbooks/blob/main/nvidia/jax/assets/jax-intro.py) — covers JAX programming model differences from NumPy and performance evaluation
- [**NumPy SOM implementation**](https://github.com/NVIDIA/dgx-spark-playbooks/blob/main/nvidia/jax/assets/numpy-som.py) — reference implementation of self-organized map training algorithm in NumPy  
- [**JAX SOM implementations**](https://github.com/NVIDIA/dgx-spark-playbooks/blob/main/nvidia/jax/assets/som-jax.py) — multiple iteratively refined implementations of SOM algorithm in JAX
- [**Environment configuration**](https://github.com/NVIDIA/dgx-spark-playbooks/blob/main/nvidia/jax/assets/Dockerfile) — package dependencies and container setup specifications


## Time & risk

* **Duration:** 2-3 hours including setup, tutorial completion, and validation
* **Risks:** 
  * Package dependency conflicts in Python environment
  * Performance validation may require architecture-specific optimizations
* **Rollback:** Container environments provide isolation; remove containers and restart to reset state.
* **Last Updated:** 11/07/2025
  * Minor copyedits

## Instructions

## Step 1. Verify system prerequisites

Confirm your NVIDIA Spark system meets the requirements and has GPU access configured.

```bash
## Verify GPU access
nvidia-smi

## Verify ARM64 architecture  
uname -m

## Check Docker GPU support
docker run --gpus all --rm nvcr.io/nvidia/cuda:13.0.1-runtime-ubuntu24.04 nvidia-smi
```

If you see a permission denied error (something like permission denied while trying to connect to the Docker daemon socket), add your user to the docker group so that you don't need to run the command with sudo .

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Step 2. Clone the playbook repository

```bash
git clone https://github.com/NVIDIA/dgx-spark-playbooks
```

## Step 3. Build the Docker image


> [!WARNING]
> This command will download a base image and build a container locally to support this environment.

```bash
cd dgx-spark-playbooks/nvidia/jax/assets
docker build -t jax-on-spark .
```

## Step 4. Launch Docker container

Run the JAX development environment in a Docker container with GPU support and port forwarding for marimo access.

```bash
docker run --gpus all --rm -it \
    --shm-size=1g --ulimit memlock=-1 --ulimit stack=67108864 \
    -p 8080:8080 \
    jax-on-spark
```

## Step 5. Access the marimo interface

Connect to the marimo notebook server to begin the JAX tutorial.

```bash
## Access via web browser
## Navigate to: http://localhost:8080
```

The interface will load a table-of-contents display and brief introduction to marimo.

## Step 6. Complete the JAX introduction tutorial

Work through the introductory material to understand JAX programming model differences from NumPy.

Navigate to and complete the JAX introduction notebook, which covers:
- JAX programming model fundamentals
- Key differences from NumPy
- Performance evaluation techniques

## Step 7. Implement NumPy baseline

Complete the NumPy-based self-organized map (SOM) implementation to establish a performance 
baseline.

Work through the NumPy SOM notebook to:
- Understand the SOM training algorithm
- Implement the algorithm using familiar NumPy operations
- Record performance metrics for comparison

## Step 8. Optimize with JAX implementations

Progress through the iteratively refined JAX implementations to see performance improvements.

Complete the JAX SOM notebook sections:
- Basic JAX port of NumPy implementation
- Performance-optimized JAX version
- GPU-accelerated parallel JAX implementation
- Compare performance across all versions

## Step 9. Validate performance gains

The notebooks will show you how to check the performance of each SOM training implementation; you'll see that that JAX implementations show performance improvements over NumPy baseline (and some will be quite a lot faster).

Visually inspect the SOM training output on random color data to confirm algorithm correctness.

## Step 10. Next steps

Apply JAX optimization techniques to your own NumPy-based machine learning code.

```bash
## Example: Profile your existing NumPy code
python -m cProfile your_numpy_script.py

## Then adapt to JAX and compare performance
```

Try adapting your favorite NumPy algorithms to JAX and measure performance improvements on 
Blackwell GPU architecture.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| `nvidia-smi` not found | Missing NVIDIA drivers | Install NVIDIA drivers for ARM64 |
| Container fails to access GPU | Missing NVIDIA Container Toolkit | Install `nvidia-container-toolkit` |
| JAX only uses CPU | CUDA/JAX version mismatch | Reinstall JAX with CUDA support |
| Port 8080 unavailable | Port already in use | Use `-p 8081:8080` or kill process on 8080 |
| Package conflicts in Docker build | Outdated environment file | Update environment file for Blackwell |

> [!NOTE]
> DGX Spark uses a Unified Memory Architecture (UMA), which enables dynamic memory sharing between the GPU and CPU. 
> With many applications still updating to take advantage of UMA, you may encounter memory issues even when within 
> the memory capacity of DGX Spark. If that happens, manually flush the buffer cache with:
```bash
sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches'
```
