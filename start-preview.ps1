param(
  [int]$Port = 8788
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".preview-server.pid"
$OutLog = Join-Path $ProjectRoot "server.out.log"
$ErrLog = Join-Path $ProjectRoot "server.err.log"

$existing = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  $pidText = ($existing.OwningProcess | Select-Object -First 1)
  Set-Content -LiteralPath $PidFile -Value $pidText
  Write-Host "Preview already running: http://127.0.0.1:$Port/ (PID $pidText)"
  exit 0
}

$python = (Get-Command python -ErrorAction Stop).Source
$process = Start-Process `
  -FilePath $python `
  -ArgumentList @("-m", "http.server", "$Port", "--bind", "127.0.0.1") `
  -WorkingDirectory $ProjectRoot `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog `
  -WindowStyle Hidden `
  -PassThru

Set-Content -LiteralPath $PidFile -Value $process.Id
Start-Sleep -Milliseconds 700

$check = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 5
Write-Host "Preview running: http://127.0.0.1:$Port/ (PID $($process.Id), status $($check.StatusCode))"
