param(
  [int]$Port = 8789
)

# LAN-accessible preview server. Binds to 0.0.0.0 so phones / tablets
# on the same Wi-Fi network can hit it. Localhost-only preview
# (start-preview.ps1) is unaffected and continues running on 8788.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".preview-lan-server.pid"
$OutLog  = Join-Path $ProjectRoot "server-lan.out.log"
$ErrLog  = Join-Path $ProjectRoot "server-lan.err.log"

# Already running?
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Where-Object { $_.LocalAddress -eq "0.0.0.0" -or $_.LocalAddress -eq "::" }
if ($existing) {
  $pidText = ($existing.OwningProcess | Select-Object -First 1)
  Set-Content -LiteralPath $PidFile -Value $pidText
  Write-Host "LAN preview already running on port $Port (PID $pidText)"
}
else {
  $python = (Get-Command python -ErrorAction Stop).Source
  $process = Start-Process `
    -FilePath $python `
    -ArgumentList @("-m", "http.server", "$Port", "--bind", "0.0.0.0") `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -WindowStyle Hidden `
    -PassThru

  Set-Content -LiteralPath $PidFile -Value $process.Id
  Start-Sleep -Milliseconds 700
  Write-Host "LAN preview started (PID $($process.Id))"
}

# Open Windows Firewall hole for this port (TCP) — idempotent.
$ruleName = "muntaha-art-lan-preview-$Port"
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existingRule) {
  try {
    New-NetFirewallRule -DisplayName $ruleName `
      -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port `
      -Profile Private -Description "Muntaha portfolio LAN preview" | Out-Null
    Write-Host "Firewall: opened TCP $Port (Private profile only)"
  } catch {
    Write-Warning "Could not add firewall rule. Run this script as Administrator once to enable phone access. Error: $_"
  }
} else {
  Write-Host "Firewall rule already exists for port $Port"
}

# Find the LAN IP and print phone-test URL
$ip = Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -and $_.PrefixOrigin -ne "WellKnown" } |
      Select-Object -ExpandProperty IPAddress -First 1

if (-not $ip) {
  $ip = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.InterfaceAlias -like "*Ethernet*" -and $_.PrefixOrigin -ne "WellKnown" -and $_.IPAddress -notlike "169.254.*" } |
        Select-Object -ExpandProperty IPAddress -First 1
}

Write-Host ""
Write-Host "===================================================================="
Write-Host "  Phone test URL:  http://${ip}:$Port/"
Write-Host "===================================================================="
Write-Host "  Same as desktop: http://127.0.0.1:$Port/"
Write-Host ""
Write-Host "  Make sure your phone is on the same Wi-Fi network."
Write-Host "  Stop with: powershell -ExecutionPolicy Bypass -File stop-preview-lan.ps1"
Write-Host ""
