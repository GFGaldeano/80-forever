param(
  [string]$Image = "bluenviron/mediamtx:latest",
  [string]$ContainerName = "80forever-mediamtx"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$ConfigPath = Join-Path $RepoRoot "ops\mediamtx\mediamtx.local.yml"

if (-not (Test-Path $ConfigPath)) {
  throw "No se encontró la configuración local de MediaMTX: $ConfigPath"
}

Write-Host ""
Write-Host "80 Forever - MediaMTX local" -ForegroundColor Cyan
Write-Host "Config: $ConfigPath"
Write-Host ""
Write-Host "RTMP OBS server : rtmp://localhost:1935" -ForegroundColor Yellow
Write-Host "OBS stream key  : 80forever" -ForegroundColor Yellow
Write-Host "HLS local URL   : http://localhost:8888/80forever/index.m3u8" -ForegroundColor Yellow
Write-Host ""

$Existing = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($Existing) {
  Write-Host "Eliminando contenedor previo: $ContainerName" -ForegroundColor DarkYellow
  docker rm -f $ContainerName | Out-Null
}

docker run --rm -it `
  --name $ContainerName `
  -p 1935:1935 `
  -p 8888:8888 `
  -v "${ConfigPath}:/mediamtx.yml:ro" `
  $Image
