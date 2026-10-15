#!/usr/bin/env bash
# Safe APK update over adb. NEVER uninstalls. Refuses on signer mismatch. Backs up app data first (debuggable builds).
# Usage: safe-install.sh <package> <apk> [backup-dir]      (DRY_RUN=1 → checks only, installs nothing)
set -euo pipefail
pkg=${1:?package}; apk=${2:?apk}; bdir=${3:-$HOME/ye-backups}
export PATH="$PATH:${ANDROID_HOME:-$HOME/android/sdk}/platform-tools:$(ls -d "${ANDROID_HOME:-$HOME/android/sdk}"/build-tools/* 2>/dev/null | sort -V | tail -1)"
die() { echo "STOP: $*" >&2; exit 1; }
command -v adb >/dev/null || die "adb not found"; command -v apksigner >/dev/null || die "apksigner not found (build-tools)"
[[ -s $apk ]] || die "apk missing/empty: $apk"
[[ $(adb devices | awk 'NR>1 && $2=="device"' | wc -l) == 1 ]] || die "need exactly one adb device (reconnect; never retry blindly)"
apk_cert=$(apksigner verify --print-certs "$apk" | awk -F': ' '/certificate SHA-256 digest/{print $2; exit}')
[[ -n $apk_cert ]] || die "apk is unsigned (assembleRelease without key?)"
echo "apk  $(sha256sum "$apk" | cut -c1-16)…  signer $apk_cert"
if adb shell pm path "$pkg" >/dev/null 2>&1; then
  inst_path=$(adb shell pm path "$pkg" | head -1 | sed 's/^package://' | tr -d '\r')
  tmp=$(mktemp -d); adb pull -q "$inst_path" "$tmp/installed.apk" >/dev/null
  inst_cert=$(apksigner verify --print-certs "$tmp/installed.apk" | awk -F': ' '/certificate SHA-256 digest/{print $2; exit}'); rm -rf "$tmp"
  echo "installed signer $inst_cert"
  [[ $inst_cert == "$apk_cert" ]] || die "signer mismatch → install -r would fail; do NOT uninstall. See docs/signing.md (key migration)."
  mkdir -p "$bdir"; out="$bdir/$pkg-$(date +%Y%m%d-%H%M%S).tar"
  if adb shell run-as "$pkg" true 2>/dev/null; then
    adb exec-out run-as "$pkg" tar -cf - . > "$out"
    [[ -s $out ]] && tar -tf "$out" >/dev/null || die "backup empty/corrupt: $out"
    echo "backup $out ($(du -h "$out" | cut -f1), $(tar -tf "$out" | wc -l) entries)"
  else
    echo "note: $pkg is not debuggable → run-as backup impossible; rely on the app's own export (server data lives on the host)."
    [[ ${ALLOW_NO_BACKUP:-0} == 1 ]] || die "set ALLOW_NO_BACKUP=1 after making an in-app export"
  fi
else
  echo "not installed yet → fresh install"
fi
[[ ${DRY_RUN:-0} == 1 ]] && { echo "DRY_RUN: would run adb install -r $apk"; exit 0; }
adb install -r "$apk"
adb shell monkey -p "$pkg" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true; sleep 3
adb shell pidof "$pkg" >/dev/null && echo "OK running" || die "app not running after install"
adb logcat -d -b crash | grep -q "$pkg" && echo "WARN: crash buffer mentions $pkg" || true
