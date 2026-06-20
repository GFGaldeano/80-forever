param(
  [string]$MediaRoot = "E:\80's Forever\media"
)

$ErrorActionPreference = "Stop"

$folders = @(
  (Join-Path $MediaRoot "recordings\raw"),
  (Join-Path $MediaRoot "recordings\processed"),
  (Join-Path $MediaRoot "vod"),
  (Join-Path $MediaRoot "thumbnails")
)

Write-Host "80 Forever - Preparando carpetas locales VOD" -ForegroundColor Cyan
Write-Host "Media root: $MediaRoot" -ForegroundColor DarkCyan

foreach ($folder in $folders) {
  if (-not (Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Creada: $folder" -ForegroundColor Green
  } else {
    Write-Host "Existe:  $folder" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Carpetas listas." -ForegroundColor Green
Write-Host "Configurar OBS Recording Path en:" -ForegroundColor Cyan
Write-Host (Join-Path $MediaRoot "recordings\raw") -ForegroundColor White
