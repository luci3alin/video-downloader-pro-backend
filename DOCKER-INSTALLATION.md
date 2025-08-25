# 🐳 Docker Desktop Installation Guide for Windows

## Prerequisites
- Windows 10/11 (64-bit)
- WSL 2 enabled (Windows Subsystem for Linux 2)
- Virtualization enabled in BIOS

## 🚀 Step-by-Step Installation

### 1. Enable WSL 2
Open PowerShell as Administrator and run:
```powershell
# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart your computer
Restart-Computer
```

### 2. Install WSL 2 Linux Kernel
After restart, download and install the WSL 2 kernel update:
- [Download WSL 2 Kernel Update](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)
- Run the installer
- Set WSL 2 as default: `wsl --set-default-version 2`

### 3. Install Docker Desktop
1. Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Click "Download for Windows"
3. Run the installer
4. Follow the installation wizard
5. **Important**: Check "Use WSL 2 instead of Hyper-V" during installation

### 4. Start Docker Desktop
1. Launch Docker Desktop from Start Menu
2. Wait for Docker to start (whale icon in system tray)
3. Accept the terms and conditions

### 5. Verify Installation
Open PowerShell and run:
```powershell
docker --version
docker-compose --version
```

You should see version numbers for both commands.

## 🔧 Alternative: Chocolatey Installation

If you prefer using Chocolatey package manager:
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install docker-desktop
```

## 🚨 Troubleshooting

### WSL 2 Issues
```powershell
# Check WSL status
wsl --list --verbose

# Update WSL
wsl --update

# Reset WSL if needed
wsl --shutdown
```

### Docker Service Issues
```powershell
# Restart Docker service
Restart-Service docker

# Or restart Docker Desktop completely
```

### Virtualization Issues
- Enter BIOS/UEFI during boot
- Enable "Virtualization Technology" or "Intel VT-x" / "AMD-V"
- Save and restart

## ✅ After Installation

Once Docker is working:
1. Run `setup-pinchflat.bat` or `.\setup-pinchflat.ps1`
2. Access Pinchflat at http://localhost:8945
3. Start downloading YouTube content!

## 🔗 Useful Links
- [Docker Desktop Documentation](https://docs.docker.com/desktop/windows/)
- [WSL 2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Pinchflat GitHub](https://github.com/kieraneglin/pinchflat)

---

**Need help?** Check the troubleshooting section or ask in the community!
