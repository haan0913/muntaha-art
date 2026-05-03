param(
  [int]$Port = 8788
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".preview-server.pid"

if (Test-Path $PidFile) {
  $pidText = (Get-Content -LiteralPath $PidFile -Raw).Trim()
  if ($pidText -match "^\d+$") {
    $process = Get-Process -Id ([int]$pidText) -ErrorAction SilentlyContinue
    if ($process) {
      Stop-Process -Id $process.Id
      Write-Host "Stopped preview server PID $($process.Id)."
    }
  }
  Remove-Item -LiteralPath $PidFile -Force
  exit 0
}

$existing = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "A process is listening on http://127.0.0.1:$Port/, but no .preview-server.pid file was found."
  Write-Host "PID(s): $($existing.OwningProcess -join ', ')"
  Write-Host "Stop it manually if you are sure it is the Muntaha preview server."
} else {
  Write-Host "No preview server is running on http://127.0.0.1:$Port/."
}
