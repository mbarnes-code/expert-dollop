# NCCL for Two Sparks

> Install and test NCCL on two Sparks

## Table of Contents

- [Overview](#overview)
- [Run on two Sparks](#run-on-two-sparks)
- [Troubleshooting](#troubleshooting)

---

## Overview

## Basic idea

NCCL (NVIDIA Collective Communication Library) enables high-performance GPU-to-GPU communication
across multiple nodes. This walkthrough sets up NCCL for multi-node distributed training on
DGX Spark systems with Blackwell architecture. You'll configure networking, build NCCL from
source with Blackwell support, and validate communication between nodes.

## What you'll accomplish

You'll have a working multi-node NCCL environment that enables high-bandwidth GPU communication
across DGX Spark systems for distributed training workloads, with validated network performance
and proper GPU topology detection.

## What to know before starting

- Working with Linux network configuration and netplan
- Basic understanding of MPI (Message Passing Interface) concepts
- SSH key management and passwordless authentication setup

## Prerequisites

- Two DGX Spark systems
- Completed the Connect two Sparks playbook
- NVIDIA driver installed: `nvidia-smi`
- CUDA toolkit available: `nvcc --version`
- Root/sudo privileges: `sudo whoami`

## Time & risk

* **Duration**: 30 minutes for setup and validation
* **Risk level**: Medium - involves network configuration changes
* **Rollback**: The NCCL & NCCL Tests repositories can be deleted from DGX Spark
* **Last Updated:** 10/12/2025
  * First publication

## Run on two Sparks

## Step 1. Configure network connectivity

Follow the network setup instructions from the Connect two Sparks playbook to establish connectivity between your DGX Spark nodes.

This includes:
- Physical QSFP cable connection
- Network interface configuration (automatic or manual IP assignment)
- Passwordless SSH setup
- Network connectivity verification

## Step 2. Build NCCL with Blackwell support

Execute these commands on both nodes to build NCCL from source with Blackwell
architecture support:

```bash
## Install dependencies and build NCCL
sudo apt-get update && sudo apt-get install -y libopenmpi-dev
git clone -b v2.28.3-1 https://github.com/NVIDIA/nccl.git ~/nccl/
cd ~/nccl/
make -j src.build NVCC_GENCODE="-gencode=arch=compute_121,code=sm_121"

## Set environment variables
export CUDA_HOME="/usr/local/cuda"
export MPI_HOME="/usr/lib/aarch64-linux-gnu/openmpi"
export NCCL_HOME="$HOME/nccl/build/"
export LD_LIBRARY_PATH="$NCCL_HOME/lib:$CUDA_HOME/lib64/:$MPI_HOME/lib:$LD_LIBRARY_PATH"
```

## Step 3. Build NCCL test suite

Compile the NCCL test suite to validate communication performance:

```bash
## Clone and build NCCL tests
git clone https://github.com/NVIDIA/nccl-tests.git ~/nccl-tests/
cd ~/nccl-tests/
make MPI=1
```

## Step 4. Find the active network interface and IP addresses

Execute multi-node NCCL performance test using the active network interface. First, identify which network ports are available and up:

```bash
## Check network port status
ibdev2netdev
```

Example output:
```
roceP2p1s0f0 port 1 ==> enP2p1s0f0np0 (Down)
roceP2p1s0f1 port 1 ==> enP2p1s0f1np1 (Up)
rocep1s0f0 port 1 ==> enp1s0f0np0 (Down)
rocep1s0f1 port 1 ==> enp1s0f1np1 (Up)
```

Use an interface that shows as "(Up)" in your output. In this example, we'll use **enp1s0f1np1**. You can disregard interfaces starting with the prefix`enP2p<...>` and only consider interfaces starting with `enp1<...>` instead.

You will need to find the IP addresses for the CX-7 interfaces that are up. On both nodes, run the following command to find the IP addresses and take note of them for the next step.
```bash
  ip addr show enp1s0f0np0
  ip addr show enp1s0f1np1
```

Example output:
```
## In this example, we are using interface enp1s0f1np1.
nvidia@dgx-spark-1:~$ ip addr show enp1s0f1np1
    4: enp1s0f1np1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether 3c:6d:66:cc:b3:b7 brd ff:ff:ff:ff:ff:ff
        inet **169.254.35.62**/16 brd 169.254.255.255 scope link noprefixroute enp1s0f1np1
          valid_lft forever preferred_lft forever
        inet6 fe80::3e6d:66ff:fecc:b3b7/64 scope link
          valid_lft forever preferred_lft forever
```

In this example, the IP address for Node 1 is **169.254.35.62**. Repeat the process for Node 2.

## Step 5. Run NCCL communication test

> [!NOTE] 
> Full bandwidth can be achieved with just one QSFP cable.
> When two QSFP cables are connected, all four interfaces must be assigned IP addresses to obtain full bandwidth.

Execute the following commands on both nodes to run the NCCL communication test. Replace the IP addresses and interface names with the ones you found in the previous step.

```bash
## Set network interface environment variables (use your Up interface from the previous step)
export UCX_NET_DEVICES=enp1s0f1np1
export NCCL_SOCKET_IFNAME=enp1s0f1np1
export OMPI_MCA_btl_tcp_if_include=enp1s0f1np1

## Run the all_gather performance test across both nodes (replace the IP addresses with the ones you found in the previous step)
mpirun -np 2 -H <IP for Node 1>:1,<IP for Node 2>:1 \
  --mca plm_rsh_agent "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" \
  -x LD_LIBRARY_PATH=$LD_LIBRARY_PATH \
  $HOME/nccl-tests/build/all_gather_perf
```

You can also test your NCCL setup with a larger buffer size to use more of your 200Gbps bandwidth.

```bash
## Set network interface environment variables (use your active interface)
export UCX_NET_DEVICES=enp1s0f1np1
export NCCL_SOCKET_IFNAME=enp1s0f1np1
export OMPI_MCA_btl_tcp_if_include=enp1s0f1np1

## Run the all_gather performance test across both nodes
mpirun -np 2 -H <IP for Node 1>:1,<IP for Node 2>:1 \
  --mca plm_rsh_agent "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" \
  -x LD_LIBRARY_PATH=$LD_LIBRARY_PATH \
  $HOME/nccl-tests/build/all_gather_perf -b 16G -e 16G -f 2
```

Note: The IP addresses in the `mpirun` command are followed by `:1`. For example, `mpirun -np 2 -H 169.254.35.62:1,169.254.35.63:1`

## Step 7. Cleanup and rollback

```bash
## Rollback network configuration (if needed)
rm -rf ~/nccl/
rm -rf ~/nccl-tests/
```

## Step 8. Next steps
Your NCCL environment is ready for multi-node distributed training workloads on DGX Spark.
Now you can try running a larger distributed workload such as TRT-LLM or vLLM inference.

## Troubleshooting

## Common issues for running on two Spark

| Issue | Cause | Solution |
|-------|-------|----------|
| mpirun hangs or times out | SSH connectivity issues | 1. Test basic SSH connectivity: `ssh <remote_ip>` should work without password prompts<br>2. Try a simple mpirun test: `mpirun -np 2 -H <IP for Node 1>:1,<IP for Node 2>:1 hostname`<br>3. Verify SSH keys are setup correctly for all nodes |
| Network interface not found | Wrong interface name or down status | Check interface status with `ibdev2netdev` and verify IP configuration |
| NCCL build fails | Missing dependencies such as OpenMPI or incorrect CUDA version | Verify CUDA installation and required libraries are present |
