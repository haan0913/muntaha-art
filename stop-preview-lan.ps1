$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".preview-lan-server.pid"

if (Test-Path $PidFile) {
  $procId = (Get-Content $PidFile).Trim()
  try {
    Stop-Process -Id $procId -Force -ErrorAction Stop
    Write-Host "Stopped LAN preview (PID $procId)"
  } catch {
    Write-Host "Process $procId already gone"
  }
  Remove-Item $PidFile -ErrorAction SilentlyContinue
} else {
  Write-Host "No LAN preview pid file found."
}
