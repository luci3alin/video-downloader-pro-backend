Write-Host "Checking system requirements for Docker and Pinchflat..." -ForegroundColor Green
Write-Host ""

# Check Windows version
$os = Get-WmiObject -Class Win32_OperatingSystem
Write-Host "Windows Version: $($os.Caption) $($os.OSArchitecture)" -ForegroundColor Cyan

# Check if WSL is enabled
$wslEnabled = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
Write-Host "WSL Status: $($wslEnabled.State)" -ForegroundColor $(if($wslEnabled.State -eq "Enabled") {"Green"} else {"Red"})

# Check if Virtual Machine Platform is enabled
$vmPlatform = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
Write-Host "Virtual Machine Platform: $($vmPlatform.State)" -ForegroundColor $(if($vmPlatform.State -eq "Enabled") {"Green"} else {"Red"})

# Check Docker installation
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker: $dockerVersion" -ForegroundColor Green
        $dockerInstalled = $true
    } else {
        Write-Host "Docker: Not installed" -ForegroundColor Red
        $dockerInstalled = $false
    }
} catch {
    Write-Host "Docker: Not installed" -ForegroundColor Red
    $dockerInstalled = $false
}

Write-Host ""
Write-Host "System Check Summary:" -ForegroundColor Yellow

if ($wslEnabled.State -eq "Enabled" -and $vmPlatform.State -eq "Enabled" -and $dockerInstalled) {
    Write-Host "All requirements met! You can run Pinchflat now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start Pinchflat:" -ForegroundColor Cyan
    Write-Host "   .\setup-pinchflat.ps1" -ForegroundColor White
} else {
    Write-Host "Some requirements are missing. Here's what you need to do:" -ForegroundColor Yellow
    Write-Host ""
    
    if ($wslEnabled.State -ne "Enabled") {
        Write-Host "Enable WSL 2:" -ForegroundColor Red
        Write-Host "   Run PowerShell as Administrator and execute:" -ForegroundColor White
        Write-Host "   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($vmPlatform.State -ne "Enabled") {
        Write-Host "Enable Virtual Machine Platform:" -ForegroundColor Red
        Write-Host "   Run PowerShell as Administrator and execute:" -ForegroundColor White
        Write-Host "   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart" -ForegroundColor Gray
        Write-Host ""
    }
    
    if (-not $dockerInstalled) {
        Write-Host "Install Docker Desktop:" -ForegroundColor Red
        Write-Host "   1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
        Write-Host "   2. Run the installer" -ForegroundColor White
        Write-Host "   3. Check 'Use WSL 2 instead of Hyper-V' during installation" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "For detailed instructions, see: DOCKER-INSTALLATION.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "After installing Docker, run this script again to verify everything is working!" -ForegroundColor Yellow
Read-Host "Press Enter to continue..."
