# BarfFoods - Connect existing server project to Git (keep storage & .env)
# Use when the project was copied to the server and you want to pull from GitHub
# without losing storage (uploads, logs, cache) or .env.
# Run from your PC: .\server-setup.ps1

$ErrorActionPreference = "Stop"
$ServerUser = "root"
$ServerHost = "gekymedia.com"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Connecting server project to GitHub (keeping storage + .env)..." -ForegroundColor Cyan
Write-Host "Server: ${ServerUser}@${ServerHost}" -ForegroundColor Gray
Write-Host ""

Set-Location $ScriptDir
$scriptContent = (Get-Content -Raw -Path ".\server-git-init.sh") -replace "`r`n", "`n" -replace "`r", ""
$scriptContent | ssh "${ServerUser}@${ServerHost}" "bash -s"

if ($LASTEXITCODE -ne 0) { Write-Host "Server setup failed." -ForegroundColor Red; exit 1 }
Write-Host ""
Write-Host "Server is now connected to GitHub. Storage and .env were preserved." -ForegroundColor Green
Write-Host "Use .\deploy.ps1 for future deployments." -ForegroundColor White
