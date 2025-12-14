# Set Up Local Network Access

> NVIDIA Sync helps set up and configure SSH access

## Table of Contents

- [Overview](#overview)
- [Connect with NVIDIA Sync](#connect-with-nvidia-sync)
- [Connect with Manual SSH](#connect-with-manual-ssh)
- [Troubleshooting](#troubleshooting)

---

## Overview

## Basic idea

If you primarily work on another system, such as a laptop, and want to use your DGX Spark as a
remote resource, this playbook shows you how to connect and work over SSH. With SSH, you can
securely open a terminal session or tunnel ports to access web apps and APIs on your DGX Spark
from your local machine. 

There are two approaches: **NVIDIA Sync (recommended)** for streamlined
device management, or **manual SSH** for direct command-line control.

Before you get started, there are some important concepts to understand:

**Secure Shell (SSH)** is a cryptographic protocol for securely connecting to a remote computer
over an untrusted network. It lets you open a terminal on your DGX Spark as if you were sitting
at it, run commands, transfer files, and manage services—all encrypted end-to-end.

**SSH tunneling** (also called port forwarding) securely maps a port on your laptop
(for example, localhost:8888) to a port on the DGX Spark where an app is listening
(such as JupyterLab on port 8888). Your browser connects to localhost, and SSH forwards
the traffic through the encrypted connection to the remote service without exposing
that port on the wider network.

**mDNS (Multicast DNS)** lets devices discover each other by name on a local network without
needing a central DNS server. Your DGX Spark advertises its hostname via mDNS, so you can
connect using a name like `spark-abcd.local` (note the .local suffix), rather than looking
up its IP address.

## What you'll accomplish

You will establish secure SSH access to your DGX Spark device using either NVIDIA Sync or a manual
SSH configuration. NVIDIA Sync provides a graphical interface for device management with
integrated app launching, while manual SSH gives you direct command-line control with port
forwarding capabilities. Both approaches enable you to run terminal commands, access web
applications, and manage your DGX Spark remotely from your laptop.


## What to know before starting

- Basic terminal/command line usage
- Understanding of SSH concepts and key-based authentication
- Familiarity with network concepts like hostnames, IP addresses, and port forwarding

## Prerequisites

- Your DGX Spark [device is set up](https://docs.nvidia.com/dgx/dgx-spark/first-boot.html) and you have created a local user account
- Your laptop and DGX Spark are on the same network
- You have your DGX Spark username and password
- You have your device's mDNS hostname (printed on the Quick Start Guide) or IP address

## Time & risk

- **Time estimate:** 5-10 minutes
- **Risk level:** Low - SSH setup involves credential configuration but no system-level changes to the DGX Spark device
- **Rollback:** SSH key removal can be done by editing `~/.ssh/authorized_keys` on your DGX Spark.
- **Last Updated:** 10/28/2025
  * Minor copyedits

## Connect with NVIDIA Sync

## Step 1. Install NVIDIA Sync

NVIDIA Sync is a desktop app that connects your computer to your DGX Spark over the local network. 
It gives you a single interface to manage SSH access and launch development tools on your DGX Spark. 

Download and install NVIDIA Sync on your computer to get started.

::spark-download

**For macOS**

- After download, open `nvidia-sync.dmg`
- Drag and drop the app into your Applications folder
- Open `NVIDIA Sync` from the Applications folder

**For Windows**

- After download, run the installer .exe
- NVIDIA Sync will automatically start after installation completes


**For Debian/Ubuntu**

* Configure the package repository:

  ```
  curl -fsSL  https://workbench.download.nvidia.com/stable/linux/gpgkey  |  sudo tee -a /etc/apt/trusted.gpg.d/ai-workbench-desktop-key.asc
  echo "deb https://workbench.download.nvidia.com/stable/linux/debian default proprietary" | sudo tee -a /etc/apt/sources.list
  ```
* Update package lists:

  ```
  sudo apt update
  ```
* Install NVIDIA Sync:

  ```
  sudo apt install nvidia-sync
  ```

## Step 2. Configure Apps

Apps are desktop programs installed on your laptop that NVIDIA Sync can configure and launch with an automatic connection to your Spark.

You can change your app selections anytime in the Settings window. Apps that are marked "unavailable" must be installed before you can use them.

**Default apps:**
- **DGX Dashboard**: Web application pre-installed on DGX Spark for system management and integrated JupyterLab access
- **Terminal**: Your system's built-in terminal with automatic SSH connection

**Optional apps (require separate installation):**
- **VS Code**: Download from https://code.visualstudio.com/download 
- **Cursor**: Download from https://cursor.com/downloads 
- **NVIDIA AI Workbench**: Download from https://www.nvidia.com/workbench

## Step 3. Add your DGX Spark device

> [!NOTE]
> You must know either your hostname or IP address to connect.
>
> - The default hostname can be found on the Quick Start Guide included in the box. For example, `spark-abcd.local`
> - If you have a display connected to your device, you can find the hostname on the Settings page of the [DGX Dashboard](http://localhost:11000).
> - If `.local` (mDNS) hostnames don't work on your network you must use an IP address. This can be found in Ubuntu's network settings or by logging into the admin console of your router.

Finally, connect your DGX Spark by filling out the form:

- **Name**: A descriptive name (e.g., "My DGX Spark")
- **Hostname or IP**: The mDNS hostname (e.g. `spark-abcd.local`) or IP address of your Spark
- **Username**: Your DGX Spark user account name
- **Password**: Your DGX Spark user account password

> [!NOTE]
> Your password is used only during this initial setup to configure SSH key-based authentication. It is not stored or transmitted after setup completion. NVIDIA Sync will SSH into your device and 
> configure its locally provisioned SSH key pair.

Click the "Add" button and NVIDIA Sync will automatically:

1. Generate an SSH key pair on your laptop
2. Connect to your DGX Spark using your provided username and password
3. Add the public key to `~/.ssh/authorized_keys` on your device
4. Create an SSH alias locally for future connections
5. Discard your username and password information

> [!IMPORTANT]
> After completing system setup for the first time, your device may take several minutes to update and become available on the network. If NVIDIA Sync fails to connect, please wait 3-4 minutes and try again.

## Step 4. Access your DGX Spark

Once connected, NVIDIA Sync appears as a system tray/taskbar application. Click the NVIDIA Sync
icon to open the device management interface.

- **SSH connection**: Clicking on the large "Connect" and "Disconnect" buttons controls the overall SSH connection to your device.
- **Set working directory** (optional): Choose a default directory that Apps will open in
when launched through NVIDIA Sync. This defaults to your home directory on the remote device.
- **Launch applications**: Click on any configured app to open it with automatic SSH
connection to your DGX Spark.
- **Customize ports** (optional): "Custom Ports" are configured on the Settings screen to provide access to custom web apps or APIs running on your device.

## Step 5. Validate SSH setup

NVIDIA Sync creates an SSH alias for your device for easy access manually or from other SSH enabled apps.

Verify your local SSH configuration is correct by using the SSH alias. You should not be prompted for your 
password when using the alias:

```bash
## Configured if you use mDNS hostname
ssh <SPARK_HOSTNAME>.local
```

or

```bash
## Configured if you use IP address
ssh <IP>
```

On the DGX Spark, verify you're connected:

```bash
hostname
whoami
```

Exit the SSH session:

```bash
exit
```

## Step 6. Next steps

Test your setup by launching a development tool:
- Click the NVIDIA Sync system tray icon.
- Select "Terminal" to open a terminal session on your DGX Spark.
- Select "DGX Dashboard" to use JupyterLab and manage updates.
- Try [a custom port example with Open WebUI](/spark/open-webui/sync).

## Connect with Manual SSH

## Step 1. Verify SSH client availability

Confirm that you have an SSH client installed on your system. Most modern operating systems
include SSH by default. Run the following in your terminal:

```bash
## Check SSH client version
ssh -V
```

Expected output should show OpenSSH version information. 

## Step 2. Gather connection information

Collect the required connection details for your DGX Spark:

- **Username**: Your DGX Spark user account name
- **Password**: Your DGX Spark account password
- **Hostname**: Your device's mDNS hostname (from the Quick Start Guide, e.g., `spark-abcd.local`)
- **IP Address**: An alternative only needed if mDNS doesn't work on your network as described below

In some network configurations, like complex corporate environments, mDNS won't work as expected 
and you'll have to use your device's IP address directly to connect. You'll know you are in this situation when
you try to SSH and the command hangs indefinitely or you get an error like:

```
ssh: Could not resolve hostname spark-abcd.local: Name or service not known
```

**Testing mDNS Resolution**

To test if mDNS is working, use the `ping` utility:

```bash
ping spark-abcd.local
```

If mDNS is working and you can SSH using the hostname, you should see something like this:

```
$ ping -c 3 spark-abcd.local
PING spark-abcd.local (10.9.1.9): 56 data bytes
64 bytes from 10.9.1.9: icmp_seq=0 ttl=64 time=6.902 ms
64 bytes from 10.9.1.9: icmp_seq=1 ttl=64 time=116.335 ms
64 bytes from 10.9.1.9: icmp_seq=2 ttl=64 time=33.301 ms
```

If mDNS is **not** working, indicating you will have to use your IP directly, you will see something like this:

```
$ ping -c 3 spark-abcd.local
ping: cannot resolve spark-abcd.local: Unknown host
```

If none of these work, you'll need to:
- Log into your router's admin panel to find the IP Address
- Connect a display, keyboard, and mouse to check from the Ubuntu desktop

## Step 3. Test initial connection

Connect to your DGX Spark for the first time to verify basic connectivity:

```bash
## Connect using mDNS hostname (preferred)
ssh <YOUR_USERNAME>@<SPARK_HOSTNAME>.local
```

or

```bash
## Alternative: Connect using IP address
ssh <YOUR_USERNAME>@<DEVICE_IP_ADDRESS>
```

Replace placeholders with your actual values:
- `<YOUR_USERNAME>`: Your DGX Spark account name
- `<SPARK_HOSTNAME>`: Device hostname without `.local` suffix
- `<DEVICE_IP_ADDRESS>`: Your device's IP address

On first connection, you'll see a host fingerprint warning. Type `yes` and press Enter,
then enter your password when prompted.

## Step 4. Verify remote connection

Once connected, confirm you're on the DGX Spark device:

```bash
## Check hostname
hostname
## Check system information
uname -a
## Exit the session
exit
```

## Step 5. Use SSH tunneling for web applications

To access web applications running on your DGX Spark, use SSH port
forwarding. In this example we'll access the DGX Dashboard web application.

> [!NOTE]
> DGX Dashboard runs on localhost, port 11000.

Open the tunnel:

```bash
## local port 11000 → remote port 11000
ssh -L 11000:localhost:11000 <YOUR_USERNAME>@<SPARK_HOSTNAME>.local
```

After establishing the tunnel, access the forwarded web app in your browser: [http://localhost:11000](http://localhost:11000)

## Step 6. Next steps

With SSH access configured, you can:
- Open persistent terminal sessions: `ssh <YOUR_USERNAME>@<SPARK_HOSTNAME>.local`.
- Forward web application ports: `ssh -L <local_port>:localhost:<remote_port> <YOUR_USERNAME>@<SPARK_HOSTNAME>.local`.

## Troubleshooting

## Possible issues connecting via NVIDIA Sync

| Symptom | Cause | Fix |
|---------|--------|-----|
| Device name doesn't resolve | mDNS blocked on network | Use IP address instead of hostname.local |
| Connection refused/timeout | DGX Spark not booted or SSH not ready | Wait for device boot completion; SSH available after updates finish |
| Authentication failed | SSH key setup incomplete | Re-run device setup in NVIDIA Sync; check credentials |

## Possible issues connecting via manual SSH

| Symptom | Cause | Fix |
|---------|--------|-----|
| Device name doesn't resolve | mDNS blocked on network | Use IP address instead of hostname.local |
| Connection refused/timeout | DGX Spark not booted or SSH not ready | Wait for device boot completion; SSH available after updates finish |
| Port forwarding fails | Service not running or port conflict | Verify remote service is active; try different local port |
