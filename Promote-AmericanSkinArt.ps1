<#  Promote-AmericanSkinArt.ps1
    - Archives CURRENT LIVE site (origin/main) -> dated ZIP (outside repo)
    - Commits local changes (if any)
    - Pulls (rebase) + pushes to main
    - Optional: creates & pushes an annotated tag
    - Archives the NEW version after the push (HEAD) -> ZIP named by tag or timestamp

    Usage examples:
      pwsh -File "C:\Users\Bruce\Sites\American Skin Art\Promote-AmericanSkinArt.ps1"
      pwsh -File "C:\Users\Bruce\Sites\American Skin Art\Promote-AmericanSkinArt.ps1" -CreateTag
      pwsh -File "C:\Users\Bruce\Sites\American Skin Art\Promote-AmericanSkinArt.ps1" -CreateTag -TagName "release-asa-v1.2.0" -Message "Refresh gallery"
#>

[CmdletBinding()]
param(
  [string]$Message = $(Get-Date -Format "yyyy-MM-dd HH:mm") + " — Promote American Skin Art",
  [switch]$CreateTag,
  [string]$TagName,
  [string]$RepoPath    = "C:\Users\Bruce\Sites\American Skin Art",
  [string]$ArchiveRoot = "C:\Users\Bruce\Backups\SiteArchives\american-skin-art"   # outside the repo
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# --- Ensure git is available (alias if not on PATH) ---
$gitCmd = (Get-Command git -ErrorAction SilentlyContinue)?.Source
if (-not $gitCmd) {
  foreach ($c in @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe"
  )) { if (Test-Path $c) { $gitCmd = $c; break } }
  if (-not $gitCmd) { throw "Git not found. Install Git for Windows or add it to PATH." }
  Set-Alias -Name git -Value $gitCmd -Scope Script
}

# --- Helper: quick sidecar manifest (commit/tag/time) ---
function Write-Manifest {
  param(
    [string]$zipPath,
    [string]$commit,
    [string]$label
  )
  $txt = $zipPath -replace '\.zip$','.txt'
  $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
  @"
Archive: $(Split-Path -Leaf $zipPath)
Label  : $label
Commit : $commit
Date   : $now
Repo   : $RepoPath
"@ | Out-File -Encoding utf8 $txt
}

# --- Work in repo ---
Push-Location $RepoPath
try {
  if (-not (Test-Path ".git")) { throw "Not a git repo: $RepoPath" }

  # Ensure archive folder
  New-Item -ItemType Directory -Force -Path $ArchiveRoot | Out-Null

  # Fetch latest refs
  git fetch origin

  # Archive CURRENT LIVE before replacing it
  $liveCommit = ""
  try { $liveCommit = (git rev-parse --verify origin/main).Trim() } catch { $liveCommit = "" }
  if ($liveCommit) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmm"
    $preZip = Join-Path $ArchiveRoot ("american-skin-art_live-$stamp.zip")
    Write-Host "Archiving CURRENT LIVE (origin/main @ $liveCommit) -> $preZip"
    git archive --format=zip -o "$preZip" "origin/main"
    Write-Manifest -zipPath $preZip -commit $liveCommit -label "PRE-PUSH (origin/main)"
  } else {
    Write-Warning "origin/main not found (first publish?). Skipping pre-push live archive."
  }

  # Stage & commit local changes (if any)
  git add -A
  $hasChanges = $true
  try { git diff --cached --quiet; $hasChanges = $false } catch { $hasChanges = $true }
  if ($hasChanges) {
    git commit -m "$Message"
  } else {
    Write-Host "No local changes to commit."
  }

  # Rebase on remote & push
  Write-Host "Pulling (rebase) from origin/main..."
  git pull --rebase origin main

  Write-Host "Pushing to origin/main..."
  git push -u origin main

  # NEW HEAD after push
  $newCommit = (git rev-parse --verify HEAD).Trim()

  # Optional: create & push tag for the NEW version
  $finalTag = $null
  if ($CreateTag) {
    if (-not $TagName -or [string]::IsNullOrWhiteSpace($TagName)) {
      $TagName = "release-" + (Get-Date -Format "yyyyMMdd-HHmm")
    }
    # Guard against duplicates
    $existsLocal  = (git tag -l "$TagName") -ne $null -and (git tag -l "$TagName").Trim().Length -gt 0
    $existsRemote = $false
    try {
      $remoteMatch = (git ls-remote --tags origin "refs/tags/$TagName") | Out-String
      if ($remoteMatch.Trim().Length -gt 0) { $existsRemote = $true }
    } catch { $existsRemote = $false }

    if ($existsLocal -or $existsRemote) {
      throw "Tag '$TagName' already exists. Choose a different name (or omit -TagName to auto-generate)."
    }

    Write-Host "Creating annotated tag: $TagName"
    git tag -a "$TagName" -m "$Message"
    Write-Host "Pushing tag: $TagName"
    git push origin "$TagName"
    $finalTag = $TagName
  }

  # Archive NEW version after the push
  $postLabel = $finalTag ? "POST-PUSH (tag: $finalTag)" : "POST-PUSH (HEAD)"
  $postName  = $finalTag ? ("american-skin-art_release-" + $finalTag + ".zip")
                         : ("american-skin-art_post-" + (Get-Date -Format "yyyyMMdd-HHmm") + ".zip")
  $postZip   = Join-Path $ArchiveRoot $postName
  Write-Host "Archiving NEW version ($postLabel @ $newCommit) -> $postZip"
  git archive --format=zip -o "$postZip" HEAD
  Write-Manifest -zipPath $postZip -commit $newCommit -label $postLabel

  Write-Host ""
  Write-Host "✅ Promotion complete."
  Write-Host "   Live URL         : https://doomsdae.github.io/american-skin-art"
  if ($liveCommit) { Write-Host "   Archived (PRE)   : $preZip" }
  Write-Host "   Archived (POST)  : $postZip"
  if ($finalTag)   { Write-Host "   Tagged release   : $finalTag" }
}
finally {
  Pop-Location
}
