param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputDir = "E:\80's Forever\media\recordings\processed",

  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputPath)) {
  throw "No existe el archivo de entrada: $InputPath"
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
  throw "ffmpeg no está instalado o no está en el PATH. Instalalo antes de procesar grabaciones."
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputPath)
$outputPath = Join-Path $OutputDir "$baseName.mp4"

if ((Test-Path $outputPath) -and (-not $Overwrite)) {
  throw "El archivo de salida ya existe: $outputPath. Usá -Overwrite para reemplazarlo."
}

$args = @("-hide_banner")
if ($Overwrite) { $args += "-y" } else { $args += "-n" }
$args += @(
  "-i", $InputPath,
  "-c", "copy",
  "-movflags", "+faststart",
  $outputPath
)

Write-Host "80 Forever - Remux OBS recording" -ForegroundColor Cyan
Write-Host "Input : $InputPath"
Write-Host "Output: $outputPath"

& ffmpeg @args

Write-Host "Remux finalizado." -ForegroundColor Green
Write-Host $outputPath -ForegroundColor White
