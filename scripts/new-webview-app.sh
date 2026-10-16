#!/usr/bin/env bash
# Generate an Android WebView wrapper from android/webview-template.
# Usage: new-webview-app.sh <name> <applicationId> <out-dir> [default-server]
#   new-webview-app.sh yenotes app.yenotes ../yenotes/android http://t470:8800
set -euo pipefail
name=${1:?name}; appid=${2:?applicationId}; out=${3:?out-dir}; server=${4:-}
src="$(cd "$(dirname "$0")/.." && pwd)/android/webview-template"
[[ -e $out ]] && { echo "refuse: $out exists"; exit 1; }
[[ $appid =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]] || { echo "bad applicationId"; exit 1; }
mkdir -p "$out"; cp -r "$src"/. "$out"/; rm -f "$out/README.md"
pkgdir="$out/app/src/main/java/$(echo "$appid" | tr . /)"; mkdir -p "$pkgdir"
mv "$out/app/src/main/java/app/yewebview/MainActivity.kt" "$pkgdir/"; rmdir "$out/app/src/main/java/app/yewebview" 2>/dev/null || true
grep -rlZ -e 'yewebview' -e '__APP_NAME__' "$out" | xargs -0 sed -i -e "s/app\.yewebview/$appid/g" -e "s/yewebview/$name/g" -e "s/__APP_NAME__/$name/g"
[[ -n $server ]] && echo "yeServer=$server" >> "$out/gradle.properties"
sed -i "s/PORT/${server##*:}/" "$out/app/src/main/assets/setup.html" 2>/dev/null || true
echo "generated $out ($appid). Build: (cd $out && ./gradlew assembleRelease)"
