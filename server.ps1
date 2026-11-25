param(
  [int]$Port = 8092,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.wasm' = 'application/wasm'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
}

function Send-TextResponse {
  param(
    [System.Net.HttpListenerResponse]$Response,
    [int]$Status,
    [string]$Text
  )
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  $Response.StatusCode = $Status
  $Response.ContentType = 'text/plain; charset=utf-8'
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

$listener = $null
$boundPort = 0

for ($i = 0; $i -lt 20; $i++) {
  $tryPort = $Port + $i
  $candidate = $null
  try {
    $candidate = New-Object System.Net.HttpListener
    $candidate.Prefixes.Add("http://localhost:$tryPort/")
    $candidate.Start()
    $listener = $candidate
    $boundPort = $tryPort
    break
  } catch {
    if ($candidate) {
      try { $candidate.Close() } catch { }
    }
  }
}

if (-not $listener) {
  Write-Host "Could not start server on ports $Port to $($Port + 19)." -ForegroundColor Red
  Write-Host "Try another port: powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8095" -ForegroundColor Yellow
  exit 1
}

$url = "http://localhost:$boundPort/"

Write-Host ""
Write-Host "  GUGUMI'S NEST - Pixel Cat-Chicken Pet" -ForegroundColor Yellow
Write-Host "  $url" -ForegroundColor Cyan
Write-Host "  Press Ctrl + C to stop" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
  try { Start-Process $url } catch { Write-Host "Open this URL manually: $url" -ForegroundColor Yellow }
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $method = $request.HttpMethod
      if ($method -ne 'GET' -and $method -ne 'HEAD') {
        Send-TextResponse $response 405 'Method Not Allowed'
        continue
      }

      $urlPath = $request.Url.AbsolutePath
      try { $urlPath = [System.Uri]::UnescapeDataString($urlPath) } catch { }
      if ([string]::IsNullOrEmpty($urlPath) -or $urlPath -eq '/') {
        $urlPath = '/index.html'
      }

      $relative = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $full = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative))

      if (-not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-TextResponse $response 403 'Forbidden'
        continue
      }

      if (-not [System.IO.File]::Exists($full)) {
        Send-TextResponse $response 404 'Not Found'
        continue
      }

      $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
      $contentType = $mime[$ext]
      if (-not $contentType) { $contentType = 'application/octet-stream' }

      $bytes = [System.IO.File]::ReadAllBytes($full)
      $response.StatusCode = 200
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      $response.Headers['Cache-Control'] = 'no-store'

      if ($method -ne 'HEAD' -and $bytes.Length -gt 0) {
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      try { Send-TextResponse $response 500 'Internal Server Error' } catch { }
    } finally {
      try { $response.Close() } catch { }
    }
  }
} finally {
  try { $listener.Stop() } catch { }
  try { $listener.Close() } catch { }
  Write-Host "Server stopped." -ForegroundColor DarkGray
}
