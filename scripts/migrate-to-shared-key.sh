#!/usr/bin/env bash
# PREPARED, NOT YET RUN (owner approved the plan 2026-10-15; execution needs a separate go per app).
# Moves ONE installed app from its old signing key to the shared ye key. This is the only flow that uninstalls,
# so it is gated: backup → verify → (optional in-app export check) → explicit confirmation phrase → uninstall → install → restore.
# Usage: migrate-to-shared-key.sh <package> <new-signed.apk>        DRY_RUN=1 by default.
set -euo pipefail
pkg=${1:?package}; apk=${2:?apk}; DRY_RUN=${DRY_RUN:-1}
bdir=$HOME/ye-backups/key-migration; mkdir -p "$bdir"; ts=$(date +%Y%m%d-%H%M%S); out="$bdir/$pkg-$ts.tar"
die() { echo "STOP: $*" >&2; exit 1; }
[[ $(adb devices | awk 'NR>1 && $2=="device"' | wc -l) == 1 ]] || die "need exactly one adb device"
adb shell pm path "$pkg" >/dev/null 2>&1 || die "$pkg not installed — use safe-install.sh"
case $pkg in
  app.yephotos|app.yeplayer) echo "server-backed app: library lives on the host (yehost backups); phone keeps only prefs/cookies." ;;
esac
if adb shell run-as "$pkg" true 2>/dev/null; then
  adb exec-out run-as "$pkg" tar -cf - . > "$out"; [[ -s $out ]] && tar -tf "$out" >/dev/null || die "backup empty: $out"
  echo "backup $out: $(tar -tf "$out" | wc -l) entries"; tar -tf "$out" | grep -E 'databases/|shared_prefs/|files/' | head
else
  die "$pkg not debuggable: run-as backup impossible. Make an in-app export (yereader .yereader zip / yetube JSON backup) and re-run with ALLOW_NO_BACKUP=1" 
fi
echo "Checklist before continuing: in-app export saved off-phone? server URL noted? sha256 of backup: $(sha256sum "$out" | cut -c1-16)"
[[ $DRY_RUN == 1 ]] && { echo "DRY_RUN=1: stopping before uninstall. Re-run with DRY_RUN=0 to proceed."; exit 0; }
read -rp "Type exactly 'wipe $pkg' to uninstall the old-key build: " ok; [[ $ok == "wipe $pkg" ]] || die "not confirmed"
adb uninstall "$pkg"; adb install "$apk"
# restore: debuggable target only (run-as); release targets restore via the app's import screen
if adb shell run-as "$pkg" true 2>/dev/null; then
  adb shell am force-stop "$pkg"
  adb exec-in run-as "$pkg" tar -xf - < "$out" 2>/dev/null || adb shell "run-as $pkg tar -xf -" < "$out"
  echo "restored $out"
else echo "restore via in-app import from your export"; fi
adb shell monkey -p "$pkg" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 3; adb shell pidof "$pkg" >/dev/null && echo OK
