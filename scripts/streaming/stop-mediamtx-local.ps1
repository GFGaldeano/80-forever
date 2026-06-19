param(
  [string]$ContainerName = "80forever-mediamtx"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Deteniendo MediaMTX local: $ContainerName" -ForegroundColor Cyan
docker stop $ContainerName | Out-Null
docker rm -f $ContainerName | Out-Null
Write-Host "MediaMTX local detenido." -ForegroundColor Green
