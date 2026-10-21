# Compilador a un único archivo HTML 100% independiente
$Raiz = $PSScriptRoot
if (-not $Raiz) { $Raiz = (Get-Location).Path }

$htmlPath = Join-Path $Raiz "index.html"
$cssPath = Join-Path $Raiz "css\styles.css"
$jsPath = Join-Path $Raiz "js\agrocaldas.js"
$outPath = Join-Path $Raiz "AgroCaldas_Standalone.html"

$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)

$cssTag = '<link rel="stylesheet" href="css/styles.css">'
$jsTag = '<script src="js/agrocaldas.js"></script>'

$styleBlock = "<style>`n$css`n</style>"
$scriptBlock = "<script>`n$js`n</script>"

$html = $html.Replace($cssTag, $styleBlock)
$html = $html.Replace($jsTag, $scriptBlock)

[System.IO.File]::WriteAllText($outPath, $html, [System.Text.Encoding]::UTF8)

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " AgroCaldas_Standalone.html compilado con éxito!" -ForegroundColor White
Write-Host " Tamaño: $((Get-Item $outPath).Length) bytes" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
