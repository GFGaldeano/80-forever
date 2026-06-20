param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [string]$Timestamp = "00:00:10",

  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputPath)) {
  throw "No existe el archivo de entrada: $InputPath"
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
  throw "ffmpeg no está instalado o no está en el PATH."
}

$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and (-not (Test-Path $outputDir))) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

if ((Test-Path $OutputPath) -and (-not $Overwrite)) {
  throw "Ya existe thumbnail: $OutputPath. Usá -Overwrite para reemplazar."
}

$args = @("-hide_banner")
if ($Overwrite) { $args += "-y" } else { $args += "-n" }
$args += @(
  "-ss", $Timestamp,
  "-i", $InputPath,
  "-frames:v", "1",
  "-q:v", "2",
  $OutputPath
)

Write-Host "80 Forever - Generar thumbnail VOD" -ForegroundColor Cyan
Write-Host "Input : $InputPath"
Write-Host "Output: $OutputPath"
Write-Host "Time  : $Timestamp"

& ffmpeg @args

Write-Host "Thumbnail generado." -ForegroundColor Green
Write-Host $OutputPath -ForegroundColor White
