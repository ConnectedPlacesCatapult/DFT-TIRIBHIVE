# Run GtR Atlas ingestion outside Cursor (safe to close Cursor / IDE).
# Requires: Python on PATH, pip deps, .env at repo root with DATABASE_URL.
#
# Usage (from repo root or anywhere):
#   pwsh -File scripts/run-ingest-gtr-offline.ps1
#
# Logs: scripts/logs/ingest-gtr-YYYYMMDD-HHMMSS.log

$ErrorActionPreference = "Stop"
# $PSScriptRoot = ...\HIVE\scripts  -> repo root is parent
$RepoRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) {
  throw "Could not find repo root (no package.json). Run from HIVE repo."
}

$LogDir = Join-Path $PSScriptRoot "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "ingest-gtr-$Stamp.log"

Write-Host "Repo:       $RepoRoot"
Write-Host "Log file:   $LogFile"
Write-Host "Starting detached process (you can close Cursor)..."
Write-Host ""

# Single combined log; PYTHONUNBUFFERED for timely writes
$Inner = "set PYTHONUNBUFFERED=1 && python scripts\ingest_gtr.py"
Start-Process -FilePath "cmd.exe" `
  -ArgumentList @("/c", "$Inner > `"$LogFile`" 2>&1") `
  -WorkingDirectory $RepoRoot `
  -WindowStyle Hidden

Write-Host "Started. Watch progress:"
Write-Host "  Get-Content -Path '$LogFile' -Wait -Tail 30"
Write-Host "  (heartbeat) $RepoRoot\logs\ingest_progress.txt"
Write-Host ""
Write-Host "Or open the .log file in an editor and refresh."
