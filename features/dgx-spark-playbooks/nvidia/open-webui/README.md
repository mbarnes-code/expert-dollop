# Open WebUI with Ollama

> Install Open WebUI and use Ollama to chat with models on your Spark

## Table of Contents

- [Overview](#overview)
- [Set up Open WebUI on Remote Spark with NVIDIA Sync](#set-up-open-webui-on-remote-spark-with-nvidia-sync)
- [Set Up Manually](#set-up-manually)
- [Troubleshooting](#troubleshooting)

---

## Overview

## Basic idea

Open WebUI is an extensible, self-hosted AI interface that operates entirely offline.
This playbook shows you how to deploy Open WebUI with an integrated Ollama server on your DGX Spark device that lets you access the web interface from your local browser while the models run on Spark's GPU.

## What you'll accomplish

You will have a fully functional Open WebUI installation running on your DGX Spark. This will be accessible through your local web browser either via **NVIDIA Sync's managed SSH tunneling (recommended)** or via manual setup. The setup includes integrated Ollama for model management, persistent data storage, and GPU acceleration for model inference.

## What to know before starting

- How to [Set Up Local Network Access](/spark/connect-to-your-spark) to your DGX Spark device

## Prerequisites

-  DGX Spark [device is set up](https://docs.nvidia.com/dgx/dgx-spark/first-boot.html) and accessible
-  [Local Network Access](/spark/connect-to-your-spark) to your DGX Spark
-  Enough disk space for the Open WebUI container image and model downloads

## Time & risk

* **Duration**: 15-20 minutes for initial setup, plus model download time (varies by model size)
* **Risks**:
  * Docker permission issues may require user group changes and session restart
  * Large model downloads may take significant time depending on network speed
* **Last Updated:** 10/28/2025
  * Minor copyedits

## Set up Open WebUI on Remote Spark with NVIDIA Sync

> [!TIP]
> If you haven't already installed NVIDIA Sync, [learn how here.](/spark/connect-to-your-spark/sync)

## Step 1. Configure Docker permissions

To easily manage containers using NVIDIA Sync, you must be able to run Docker commands without sudo. 

Open the Terminal app from NVIDIA Sync to start an interactive SSH session and test Docker access. In the terminal, run:

```bash
docker ps
```

If you see a permission denied error (something like permission denied while trying to connect to the Docker daemon socket), add your user to the docker group so that you don't need to run the command with sudo.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Test Docker access again. In the terminal, run:

```bash
docker ps
```

## Step 2. Verify Docker setup and pull container

Open a new Terminal app from NVIDIA Sync and pull the Open WebUI container image with integrated Ollama on your DGX Spark:

```bash
docker pull ghcr.io/open-webui/open-webui:ollama
```

Once the container image is downloaded, continue to setup NVIDIA Sync.

## Step 3. Open NVIDIA Sync Settings

- Click on the NVIDIA Sync icon in your system tray or taskbar to open the main application window.
- Click the gear icon in the top right corner to open the Settings window.
- Click on the "Custom" tab to access Custom Ports configuration.

## Step 4. Add Open WebUI custom port configuration

A Custom port is used to automatically start the Open WebUI container and set up port forwarding.

- Click the "Add New" button on the Custom tab.

Fill out the form with these values:

- **Name**: Open WebUI
- **Port**: 12000
- **Auto open in browser at the following path**: Check this checkbox
- **Start Script**: Copy and paste this entire script:

```bash
#!/usr/bin/env bash
set -euo pipefail

NAME="open-webui"
IMAGE="ghcr.io/open-webui/open-webui:ollama"

cleanup() {
  echo "Signal received; stopping ${NAME}..."
  docker stop "${NAME}" >/dev/null 2>&1 || true
  exit 0
}
trap cleanup INT TERM HUP QUIT EXIT

## Ensure Docker CLI and daemon are available
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon not reachable." >&2
  exit 1
fi

## Already running?
if [ -n "$(docker ps -q --filter "name=^${NAME}$" --filter "status=running")" ]; then
  echo "Container ${NAME} is already running."
else
#  # Exists but stopped? Start it.
  if [ -n "$(docker ps -aq --filter "name=^${NAME}$")" ]; then
    echo "Starting existing container ${NAME}..."
    docker start "${NAME}" >/dev/null
  else
#    # Not present: create and start it.
    echo "Creating and starting ${NAME}..."
    docker run -d -p 12000:8080 --gpus=all \
      -v open-webui:/app/backend/data \
      -v open-webui-ollama:/root/.ollama \
      --name "${NAME}" "${IMAGE}" >/dev/null
  fi
fi

echo "Running. Press Ctrl+C to stop ${NAME}."
## Keep the script alive until a signal arrives
while :; do sleep 86400; done
```

- Click the "Add" button to save the configuration to your DGX Spark.

## Step 5. Launch Open WebUI

- Click on the NVIDIA Sync icon in your system tray or taskbar to open the main application window.
- Under the "Custom" section, click on "Open WebUI".

Your default web browser should automatically open to the Open WebUI interface at `http://localhost:12000`.

> [!TIP]
> On first run, Open WebUI downloads models. This can delay server start and cause the page to fail to load in your browser. Simply wait and refresh the page.
> On future launches it will open quickly.

## Step 6. Create administrator account

To start using Open WebUI you must create an initial administrator account. This is a local account that you will use to access the Open WebUI interface.

- In the Open WebUI interface, click the "Get Started" button at the bottom of the screen.
- Fill out the administrator account creation form with your preferred credentials.
- Click the registration button to create your account and access the main interface.

## Step 7. Download and configure a model

Next, download a language model with Ollama and configure it for use in
Open WebUI. This download happens on your DGX Spark device and may take several minutes.

- Click on the "Select a model" dropdown in the top left corner of the Open WebUI interface.
- Type `gpt-oss:20b` in the search field.
- Click the `Pull "gpt-oss:20b" from Ollama.com` button that appears.
- Wait for the model download to complete. You can monitor progress in the interface.
- Once complete, select "gpt-oss:20b" from the model dropdown.

## Step 8. Test the model

You can verify that the setup is working properly by testing the model.

- In the chat text area at the bottom of the Open WebUI interface, enter: **Write me a haiku about GPUs**.
- Press Enter to send the message and wait for the model's response.

## Step 9. Stop the Open WebUI 

When you are finished with your session and want to stop the Open WebUI server and reclaim resources, close the Open WebUI from NVIDIA Sync.

- Click on the NVIDIA Sync icon in your system tray or taskbar to open the main application window.
- Under the "Custom" section, click the `x` icon on the right of the "Open WebUI" entry.
- This will close the tunnel and stop the Open WebUI docker container.

## Step 10. Next steps

Try downloading different models from the Ollama library at https://ollama.com/library.

You can monitor GPU and memory usage through the DGX Dashboard available in NVIDIA Sync as you try different models.

If Open WebUI reports an update is available, you can pull the container image by running this in your terminal:

```bash
docker stop open-webui
docker rm open-webui 
docker pull ghcr.io/open-webui/open-webui:ollama
```

After the update, launch Open WebUI again from NVIDIA Sync.

## Step 11. Cleanup and rollback

Steps to completely remove the Open WebUI installation and free up resources.

> [!WARNING]
> These commands will permanently delete all Open WebUI data and downloaded models.

Stop and remove the Open WebUI container:

```bash
docker stop open-webui
docker rm open-webui
```

Remove the downloaded images:

```bash
docker rmi ghcr.io/open-webui/open-webui:ollama
```

Remove persistent data volumes:

```bash
docker volume rm open-webui open-webui-ollama
```

Remove the Custom App from NVIDIA Sync by opening Settings > Custom tab and deleting the entry.

## Set Up Manually

## Step 1. Configure Docker permissions

To easily manage containers without sudo, you must be in the `docker` group. If you choose to skip this step, you will need to run Docker commands with sudo.

Open a new terminal and test Docker access. In the terminal, run:

```bash
docker ps
```

If you see a permission denied error (something like permission denied while trying to connect to the Docker daemon socket), add your user to the docker group so that you don't need to run the command with sudo.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Step 2. Verify Docker setup and pull container

Pull the Open WebUI container image with integrated Ollama:

```bash
docker pull ghcr.io/open-webui/open-webui:ollama
```

## Step 3. Start the Open WebUI container

Start the Open WebUI container by running:

```bash
docker run -d -p 8080:8080 --gpus=all \
  -v open-webui:/app/backend/data \
  -v open-webui-ollama:/root/.ollama \
  --name open-webui ghcr.io/open-webui/open-webui:ollama
```

This will start the Open WebUI container and make it accessible at `http://localhost:8080`. You can access the Open WebUI interface from your local web browser.

> [!NOTE]
> Application data will be stored in the `open-webui` volume and model data will be stored in the `open-webui-ollama` volume.

## Step 4. Create administrator account

Set up the initial administrator account for Open WebUI. This is a local account that you will use to access the Open WebUI interface.

- In the Open WebUI interface, click the "Get Started" button at the bottom of the screen.
- Fill out the administrator account creation form with your preferred credentials.
- Click the registration button to create your account and access the main interface.

## Step 5. Download and configure a model

You'll then download a language model through Ollama and configure it for use in
Open WebUI. This download happens on your DGX Spark device and may take several minutes.

- Click on the "Select a model" dropdown in the top left corner of the Open WebUI interface.
- Type `gpt-oss:20b` in the search field.
- Click the "Pull 'gpt-oss:20b' from Ollama.com" button that appears.
- Wait for the model download to complete. You can monitor progress in the interface.
- Once complete, select "gpt-oss:20b" from the model dropdown.

## Step 6. Test the model

You can verify that the setup is working properly by testing model
inference through the web interface.

- In the chat text area at the bottom of the Open WebUI interface, enter: **Write me a haiku about GPUs**.
- Press Enter to send the message and wait for the model's response.

## Step 7. Next steps

Try downloading different models from the Ollama library at https://ollama.com/library.

You can try this [set up with NVIDIA Sync](/spark/open-webui/sync) so that you can monitor GPU and memory usage through the DGX Dashboard as you try different models.

If Open WebUI reports an update is available, you can update the container image by running:

```bash
docker pull ghcr.io/open-webui/open-webui:ollama
```

## Step 8. Cleanup and rollback

Steps to completely remove the Open WebUI installation and free up resources.

> [!WARNING]
> These commands will permanently delete all Open WebUI data and downloaded models.

Stop and remove the Open WebUI container:

```bash
docker stop open-webui
docker rm open-webui
```

Remove the downloaded images:

```bash
docker rmi ghcr.io/open-webui/open-webui:ollama
```

Remove persistent data volumes:

```bash
docker volume rm open-webui open-webui-ollama
```

## Troubleshooting

## Common issues with setting up via NVIDIA Sync

| Symptom | Cause | Fix |
|---------|-------|-----|
| Permission denied on docker ps | User not in docker group | Run Step 1 completely, including terminal restart |
| Browser doesn't open automatically | Auto-open setting disabled | Manually navigate to localhost:12000 |
| Model download fails | Network connectivity issues | Check internet connection, retry download |
| GPU not detected in container | Missing `--gpus=all flag` | Recreate container with correct start script |
| Port 12000 already in use | Another application using port | Change port in Custom App settings or stop conflicting service |

## Common issues with manual setup

| Symptom | Cause | Fix |
|---------|-------|-----|
| Permission denied on docker ps | User not in docker group | Run Step 1 completely, including logging out and logging back in or use sudo|
| Model download fails | Network connectivity issues | Check internet connection, retry download |
| GPU not detected in container | Missing `--gpus=all flag` | Recreate container with correct command |
| Port 8080 already in use | Another application using port | Change port in docker command or stop conflicting service |

> [!NOTE]
> DGX Spark uses a Unified Memory Architecture (UMA), which enables dynamic memory sharing between the GPU and CPU. 
> With many applications still updating to take advantage of UMA, you may encounter memory issues even when within 
> the memory capacity of DGX Spark. If that happens, manually flush the buffer cache with:
```bash
sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches'
```
