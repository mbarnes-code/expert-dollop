# Ollama

> Install and use Ollama

## Table of Contents

- [Overview](#overview)
- [Instructions](#instructions)
- [Troubleshooting](#troubleshooting)

---

## Overview

## Basic Idea

This playbook demonstrates how to set up remote access to an Ollama server running on your NVIDIA
Spark device using NVIDIA Sync's Custom Apps feature. You'll install Ollama on your Spark device,
configure NVIDIA Sync to create an SSH tunnel, and access the Ollama API from your local machine.
This eliminates the need to expose ports on your network while enabling AI inference from your
laptop through a secure SSH tunnel.

## What you'll accomplish

You will have Ollama running on your NVIDIA Spark with Blackwell architecture and accessible via
API calls from your local laptop. This setup allows you to build applications or use tools on your
local machine that communicate with the Ollama API for large language model inference, leveraging
the powerful GPU capabilities of your Spark device without complex network configuration.

## What to know before starting

- Working with SSH connections and system tray applications
- Basic familiarity with terminal commands and cURL for API testing
- Understanding of REST API concepts and JSON formatting
- Experience with container environments and GPU-accelerated workloads

## Prerequisites

- DGX Spark device set up and connected to your network
- NVIDIA Sync installed and connected to your Spark
- Terminal access to your local machine for testing API calls



## Time & risk

* **Duration**: 10-15 minutes for initial setup, 2-3 minutes for model download (varies by model size)

* **Risk level**: Low - No system-level changes, easily reversible by stopping the custom app

* **Rollback**: Stop the custom app in NVIDIA Sync and uninstall Ollama with standard package
removal if needed

* **Last Updated:** 10/12/2025
  * First publication

## Instructions

## Step 1. Verify Ollama installation status

**Description**: Check if Ollama is already installed on your NVIDIA Spark device. This runs on
the Spark device through NVIDIA Sync terminal to determine if installation is needed.

```bash
ollama --version
```

If you see version information, skip to Step 3. If you get "command not found", proceed to Step 2.

## Step 2. Install Ollama on your Spark device

**Description**: Download and install Ollama using the official installation script. This runs on
the Spark device and installs the Ollama binary and service components.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Wait for the installation to complete. You should see output indicating successful installation.

## Step 3. Download and verify a language model

**Description**: Pull a language model to your Spark device. This downloads the model files and
makes them available for inference. The example uses Qwen2.5 30B, optimized for Blackwell GPUs.

```bash
ollama pull qwen2.5:32b
```

Expected output:
```
pulling manifest
pulling 58574f2e94b9: 100% ████████████████████████████  18 GB
pulling 53e4ea15e8f5: 100% ████████████████████████████ 1.5 KB
pulling d18a5cc71b84: 100% ████████████████████████████  11 KB
pulling cff3f395ef37: 100% ████████████████████████████  120 B
pulling 3cdc64c2b371: 100% ████████████████████████████  494 B
verifying sha256 digest
writing manifest
success
```

## Step 4. Access NVIDIA Sync settings

**Description**: Open the NVIDIA Sync configuration interface on your local machine to add a new
custom application tunnel. This runs on your local laptop/workstation.

1. Click on the NVIDIA Sync logo in your system tray/taskbar
2. Click on the gear icon in the top right corner to open Settings window
3. Click on the "Custom" tab

## Step 5. Configure Ollama custom app in NVIDIA Sync

**Description**: Create a new custom application entry that will establish an SSH tunnel to the
Ollama server running on port 11434. This configuration runs on your local machine.

1. Click the "Add New" button
2. Fill out the form with these values:
  - **Name**: `Ollama Server`
  - **Port**: `11434`
  - **Auto open in browser**: Leave unchecked (this is an API, not a web interface)
  - **Start Script**: Leave empty
3. Click "Add"

The new Ollama Server entry should now appear in your NVIDIA Sync custom apps list.

## Step 6. Start the SSH tunnel

**Description**: Activate the SSH tunnel to make the remote Ollama server accessible on your local
machine. This creates a secure connection from localhost:11434 to your Spark device.

1. Click on the NVIDIA Sync logo in your system tray/taskbar
2. Under the "Custom" section, click on "Ollama Server"

The tunnel is active when you see the connection status indicator in NVIDIA Sync.

## Step 7. Validate API connectivity

**Description**: Test the Ollama API connection from your local machine to ensure the tunnel is
working correctly. This runs on your local laptop terminal.

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5:32b",
  "messages": [{
    "role": "user",
    "content": "Write me a haiku about GPUs and AI."
  }],
  "stream": false
}'
```

Expected response format:
```json
{
  "model": "qwen2.5:32b",
  "created_at": "2024-01-15T12:30:45.123Z",
  "message": {
    "role": "assistant",
    "content": "Silicon power flows\nThrough circuits, dreams become real\nAI awakens"
  },
  "done": true
}
```

## Step 8. Test additional API endpoints

**Description**: Verify other Ollama API functionality to ensure full operation. These commands
run on your local machine and test different API capabilities.

Test model listing:
```bash
curl http://localhost:11434/api/tags
```

Test streaming responses:
```bash
curl -N http://localhost:11434/api/chat -d '{
  "model": "qwen2.5:32b",
  "messages": [{"role": "user", "content": "Count to 5 slowly"}],
  "stream": true
}'
```

## Step 9. Cleanup and rollback

**Description**: How to remove the setup and return to the original state.

To stop the tunnel:
1. Open NVIDIA Sync and click "Ollama Server" to deactivate

To remove the custom app:
1. Open NVIDIA Sync Settings → Custom tab
2. Select "Ollama Server" and click "Remove"

> [!WARNING]
> To completely uninstall Ollama from your Spark device:

```bash
sudo systemctl stop ollama
sudo systemctl disable ollama
sudo rm /usr/local/bin/ollama
sudo rm -rf /usr/share/ollama
sudo userdel ollama
```

This will remove all Ollama files and downloaded models.

## Step 10. Next steps

**Description**: Explore additional functionality and integration options with your working Ollama
setup.

Test different models from the [Ollama library](https://ollama.com/library):
```bash
ollama pull llama3.1:8b
ollama pull codellama:13b
ollama pull phi3.5:3.8b
```

Monitor GPU and system usage during inference using the DGX Dashboard available through NVIDIA Sync.

Build applications using the Ollama API by integrating with your preferred programming language's
HTTP client libraries.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| "Connection refused" on localhost:11434 | SSH tunnel not active | Start Ollama Server in NVIDIA Sync custom apps |
| Model download fails with disk space error | Insufficient storage on Spark | Free up space or choose smaller model (e.g., qwen2.5:7b) |
| Ollama command not found after install | Installation path not in PATH | Restart terminal session or run `source ~/.bashrc` |
| API returns "model not found" error | Model not pulled or wrong name | Run `ollama list` to verify available models |
| Slow inference on Spark | Model too large for GPU memory | Try smaller model or check GPU memory with `nvidia-smi` |
