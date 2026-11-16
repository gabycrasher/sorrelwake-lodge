$ErrorActionPreference = 'Stop'

# Sorrelwake Lodge — static-site quality and safety checks.
# Run with: powershell -ExecutionPolicy Bypass -File .\tests\site-safety.ps1

$projectRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        $script:failures.Add($Message)
    }
}

$requiredFiles = @(
    'index.html',
    'css/style.css',
    'js/main.js',
    'js/opening.js'
)

foreach ($relativePath in $requiredFiles) {
    Assert-True (Test-Path -LiteralPath (Join-Path $projectRoot $relativePath)) "Missing required file: $relativePath"
}

$indexPath = Join-Path $projectRoot 'index.html'
$cssPath = Join-Path $projectRoot 'css/style.css'
$mainScriptPath = Join-Path $projectRoot 'js/main.js'

$html = if (Test-Path -LiteralPath $indexPath) { Get-Content -LiteralPath $indexPath -Raw } else { '' }
$css = if (Test-Path -LiteralPath $cssPath) { Get-Content -LiteralPath $cssPath -Raw } else { '' }
$mainScript = if (Test-Path -LiteralPath $mainScriptPath) { Get-Content -LiteralPath $mainScriptPath -Raw } else { '' }

Assert-True ($html -match 'Sorrelwake Lodge') 'The fictional brand name is missing.'
Assert-True ($html -match 'Every name, place, price, availability and contact detail') 'The concept disclaimer is missing or incomplete.'
Assert-True ($html -match '<meta\s+name="robots"\s+content="noindex, nofollow"') 'The noindex/nofollow directive is missing.'
Assert-True ($html -match 'stay@sorrelwake\.invalid') 'The safe .invalid email address is missing.'
Assert-True ($html -match 'Fictional Highlands') 'The fictional location label is missing.'
Assert-True ($html -match 'class="skip-link"') 'The keyboard-accessible skip link is missing.'
Assert-True ($html -match 'data-menu-toggle') 'The mobile menu control is missing.'
Assert-True ($html -match 'data-room-tab') 'The interactive room selector is missing.'
Assert-True ($html -match 'data-booking-open') 'The demo stay-planner trigger is missing.'
Assert-True ($html -notmatch '<form[^>]+action\s*=') 'A form action was found; the concept must not send data.'
Assert-True ($html -notmatch '<a[^>]+href\s*=\s*["''](?:https?:|mailto:|tel:)') 'A live external, email or telephone link was found.'
Assert-True ($html -notmatch '<img[^>]+src\s*=\s*["'']https?:') 'A hotlinked image was found; all images must be local.'

$sectionCount = ([regex]::Matches($html, '<section\b')).Count
Assert-True ($sectionCount -ge 8) "Expected at least 8 content sections; found $sectionCount."

$imageDirectory = Join-Path $projectRoot 'assets/images'
$imageFiles = if (Test-Path -LiteralPath $imageDirectory) {
    @(Get-ChildItem -LiteralPath $imageDirectory -File -Include *.jpg, *.jpeg, *.webp, *.png)
} else {
    @()
}

Assert-True ($imageFiles.Count -ge 8) "Expected at least 8 downloaded images; found $($imageFiles.Count)."

$localImageReferences = [regex]::Matches($html, '(?:src|data-src)="(assets/images/[^"]+)"')
foreach ($match in $localImageReferences) {
    $imagePath = Join-Path $projectRoot ($match.Groups[1].Value -replace '/', '\')
    Assert-True (Test-Path -LiteralPath $imagePath) "Referenced image does not exist: $($match.Groups[1].Value)"
}

Assert-True ($css -match '@media\s*\(prefers-reduced-motion:\s*reduce\)') 'Reduced-motion styles are missing.'
Assert-True ($css -match 'overflow-x:\s*clip') 'The horizontal-overflow safeguard is missing.'
Assert-True ($mainScript -match 'demo') 'The JavaScript does not include a clear demo-only interaction message.'

if ($failures.Count -gt 0) {
    Write-Host "FAILED: $($failures.Count) check(s)" -ForegroundColor Red
    foreach ($failure in $failures) {
        Write-Host " - $failure" -ForegroundColor Red
    }
    exit 1
}

Write-Host 'PASS: Sorrelwake Lodge site checks completed successfully.' -ForegroundColor Green
