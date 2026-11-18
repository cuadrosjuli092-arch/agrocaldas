# Compilador a un único archivo HTML 100% independiente con Cafecito embebido
$Raiz = $PSScriptRoot
if (-not $Raiz) { $Raiz = (Get-Location).Path }

$htmlPath = Join-Path $Raiz "index.html"
$cssPath = Join-Path $Raiz "css\styles.css"
$jsPath = Join-Path $Raiz "js\agrocaldas.js"
$outPath = Join-Path $Raiz "AgroCaldas_Standalone.html"

$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)

# Convertir imágenes de Cafecito a Data URIs Base64 para autonomía total
$avatarPath = Join-Path $Raiz "img\cafecito_avatar_hd.png"
if (Test-Path $avatarPath) {
    $avatarBytes = [System.IO.File]::ReadAllBytes($avatarPath)
    $avatarDataUri = "data:image/png;base64," + [Convert]::ToBase64String($avatarBytes)
    $html = $html.Replace("img/cafecito_avatar_hd.png", $avatarDataUri)
    $html = $html.Replace("img/mascot_avatar.png", $avatarDataUri)
    $js = $js.Replace("img/cafecito_avatar_hd.png", $avatarDataUri)
    $js = $js.Replace("img/mascot_avatar.png", $avatarDataUri)
}

$heroPath = Join-Path $Raiz "img\cafecito_hero.png"
if (Test-Path $heroPath) {
    $heroBytes = [System.IO.File]::ReadAllBytes($heroPath)
    $heroDataUri = "data:image/png;base64," + [Convert]::ToBase64String($heroBytes)
    $html = $html.Replace("img/cafecito_hero.png", $heroDataUri)
    $js = $js.Replace("img/cafecito_hero.png", $heroDataUri)
}

$cssTag = '<link rel="stylesheet" href="css/styles.css">'
$jsTag = '<script src="js/agrocaldas.js"></script>'

$styleBlock = "<style>`n$css`n</style>"
$scriptBlock = "<script>`n$js`n</script>"

$html = $html.Replace($cssTag, $styleBlock)
$html = $html.Replace($jsTag, $scriptBlock)

[System.IO.File]::WriteAllText($outPath, $html, [System.Text.Encoding]::UTF8)

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " AgroCaldas_Standalone.html compilado con Cafecito HD!" -ForegroundColor White
Write-Host " Tamaño: $((Get-Item $outPath).Length) bytes" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
