# Upload storage.zip from your PC to the server and extract it.
# Run from PowerShell: .\upload-storage-backup.ps1
# Requires: storage.zip at D:\Downloads\storage.zip (or set $ZipPath below)

$ErrorActionPreference = "Stop"
$ZipPath = "D:\Downloads\storage.zip"
$ServerUser = "root"
$ServerHost = "gekymedia.com"
$RemotePath = "/home/gekymedia/web/barffoods.com/public_html"

if (-not (Test-Path $ZipPath)) {
    Write-Host "Not found: $ZipPath" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading storage.zip to server..." -ForegroundColor Cyan
scp $ZipPath "${ServerUser}@${ServerHost}:/tmp/storage-backup.zip"
if ($LASTEXITCODE -ne 0) { Write-Host "Upload failed." -ForegroundColor Red; exit 1 }

Write-Host "Extracting on server and fixing permissions..." -ForegroundColor Cyan
$remoteCmd = @"
set -e
cd $RemotePath
STAMP=`$(date +%Y%m%d%H%M%S)
echo Backing up current storage to /tmp/storage-old-`$STAMP...
mv storage /tmp/storage-old-`$STAMP 2>/dev/null || true
mkdir -p storage
echo Extracting storage-backup.zip...
unzip -o /tmp/storage-backup.zip -d $RemotePath
if [ -d $RemotePath/storage ] && [ -d $RemotePath/storage/framework ]; then
  echo Storage extracted.
else
  if [ -d $RemotePath/storage/storage ]; then
    mv $RemotePath/storage/storage $RemotePath/storage-tmp
    rm -rf $RemotePath/storage
    mv $RemotePath/storage-tmp $RemotePath/storage
    echo Storage extracted from nested folder.
  elif [ -d $RemotePath/framework ] || [ -d $RemotePath/app ]; then
    mkdir -p $RemotePath/storage
    mv $RemotePath/framework $RemotePath/app $RemotePath/logs $RemotePath/storage/ 2>/dev/null || true
    echo Storage contents extracted into storage folder.
  fi
fi
chown -R www-data:www-data $RemotePath/storage $RemotePath/bootstrap/cache
chmod -R 775 $RemotePath/storage $RemotePath/bootstrap/cache
rm -f /tmp/storage-backup.zip
echo Done.
"@

$oneLine = $remoteCmd -replace "`r`n", " " -replace "`n", " " -replace "  +", " "
ssh "${ServerUser}@${ServerHost}" $oneLine

if ($LASTEXITCODE -ne 0) { Write-Host "Remote extract failed." -ForegroundColor Red; exit 1 }
Write-Host "Storage backup uploaded and extracted." -ForegroundColor Green
