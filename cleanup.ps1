# Healthcare Vault — Cleanup Script
# Removes test/debug files that should not be in the repo
# Run: .\cleanup.ps1

Write-Host "`n=== Removing Test & Debug Files ===" -ForegroundColor Cyan

$files = @(
    "test-db.js",
    "test-gemini.js",
    "test-nano-banana.js",
    "create-share-tables.js",
    "fix-chat-table.js",
    "reset-db.js",
    "Backend\create-test-user.js",
    "Backend\test-db-connection.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  Already gone: $file" -ForegroundColor Gray
    }
}

# Untrack from Git (if they were committed before)
Write-Host "`n=== Untracking from Git ===" -ForegroundColor Cyan
foreach ($file in $files) {
    git rm --cached $file 2>$null
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "You can now delete this cleanup.ps1 file too.`n"
