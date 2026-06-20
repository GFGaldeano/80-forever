param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [string]$VodRoot = "E:\80's Forever\media\vod",

  [int]$SegmentSeconds = 6,

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

$OutputDir = Join-Path $VodRoot $Slug
if ((Test-Path $OutputDir) -and $Overwrite) {
  Remove-Item $OutputDir -Recurse -Force
}
if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$playlist = Join-Path $OutputDir "index.m3u8"
$segmentPattern = Join-Path $OutputDir "segment_%03d.ts"

if ((Test-Path $playlist) -and (-not $Overwrite)) {
  throw "Ya existe playlist: $playlist. Usá -Overwrite para regenerar."
}

Write-Host "80 Forever - Crear HLS VOD" -ForegroundColor Cyan
Write-Host "Input : $InputPath"
Write-Host "Output: $playlist"

$args = @("-hide_banner")
if ($Overwrite) { $args += "-y" } else { $args += "-n" }
$args += @(
  "-i", $InputPath,
  "-c:v", "copy",
  "-c:a", "copy",
  "-hls_time", "$SegmentSeconds",
  "-hls_playlist_type", "vod",
  "-hls_segment_filename", $segmentPattern,
  $playlist
)

& ffmpeg @args

Write-Host "HLS VOD generado." -ForegroundColor Green
Write-Host $playlist -ForegroundColor White
