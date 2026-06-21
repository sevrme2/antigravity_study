$ErrorActionPreference = "Stop"

$projectDir = "C:\Users\MYCOM\Desktop\KU_Clubs_Platform"
$portableDir = Join-Path $projectDir "node_portable"
$zipPath = Join-Path $portableDir "node.zip"
$nodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"

if (-not (Test-Path $portableDir)) {
    New-Item -ItemType Directory -Path $portableDir | Out-Null
}

$extractedDir = Join-Path $portableDir "node-v20.11.1-win-x64"

if (-not (Test-Path (Join-Path $extractedDir "node.exe"))) {
    Write-Host "Downloading Node.js portable..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath
    
    Write-Host "Extracting Node.js..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $portableDir
    
    Write-Host "Cleaning up zip file..." -ForegroundColor Cyan
    Remove-Item -Path $zipPath
} else {
    Write-Host "Node.js portable is already installed." -ForegroundColor Green
}

# Define local executable paths
$nodeExe = Join-Path $extractedDir "node.exe"
$npmCmd = Join-Path $extractedDir "npm.cmd"

Write-Host "Verifying installation:"
& $nodeExe -v
& $npmCmd -v

Write-Host "Running npm install to download Electron..." -ForegroundColor Cyan
# Run npm install using the portable node and npm.
# Let's set the environment PATH so npm can find node.exe.
$oldPath = [System.Environment]::GetEnvironmentVariable("Path", "Process")
[System.Environment]::SetEnvironmentVariable("Path", "$extractedDir;$oldPath", "Process")

# Execute npm install
Set-Location -Path $projectDir
& $npmCmd install

Write-Host "Setup completed successfully!" -ForegroundColor Green
