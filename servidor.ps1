# Servidor Web Local Autónomo para AgroCaldas usando .NET HttpListener
param (
    [int]$Puerto = 8080
)

$Raiz = $PSScriptRoot
if (-not $Raiz) { $Raiz = (Get-Location).Path }

$Url = "http://localhost:$Puerto/"
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Url)

try {
    $Listener.Start()
} catch {
    # Si el puerto 8080 está ocupado, probar con 8088
    $Puerto = 8088
    $Url = "http://localhost:$Puerto/"
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add($Url)
    $Listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "       AgroCaldas - Servidor Local Iniciado Exitosamente" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Aplicacion disponible en: $Url" -ForegroundColor Yellow
Write-Host " Contexto: Anserma, Caldas, Colombia" -ForegroundColor Gray
Write-Host " Presione Ctrl+C en esta ventana para detener el servidor." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green

# Abrir automáticamente en el navegador predeterminado
Start-Process $Url

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $RutaRelativa = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($RutaRelativa) -or $RutaRelativa -eq '/') {
            $RutaRelativa = "index.html"
        }

        # Decodificar URL
        $RutaRelativa = [System.Uri]::UnescapeDataString($RutaRelativa)
        $RutaArchivo = Join-Path $Raiz $RutaRelativa.Replace('/', '\')

        if (Test-Path $RutaArchivo -PathType Leaf) {
            $Extension = [System.IO.Path]::GetExtension($RutaArchivo).ToLower()
            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Bytes = [System.IO.File]::ReadAllBytes($RutaArchivo)
            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Bytes.Length
            $Response.AddHeader("Access-Control-Allow-Origin", "*")
            $Response.AddHeader("Cache-Control", "no-cache")
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $ErrorMsg = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado en AgroCaldas: $RutaRelativa")
            $Response.OutputStream.Write($ErrorMsg, 0, $ErrorMsg.Length)
        }

        $Response.OutputStream.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
}
