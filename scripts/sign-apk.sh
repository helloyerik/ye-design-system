#!/usr/bin/env bash
# Sign an unsigned APK with the ONE shared ye key (manual, on the owner machine only; no CI secrets).
# Usage: sign-apk.sh <unsigned.apk> <out.apk>     Key: $YE_KEYSTORE_PROPS or ~/.ye-keys/keystore.properties
set -euo pipefail
in=${1:?unsigned apk}; out=${2:?out apk}
props=${YE_KEYSTORE_PROPS:-$HOME/.ye-keys/keystore.properties}; [[ -f $props ]] || { echo "missing $props (see docs/signing.md)"; exit 1; }
get() { sed -n "s/^$1=//p" "$props"; }
bt=$(ls -d "${ANDROID_HOME:-$HOME/android/sdk}"/build-tools/* | sort -V | tail -1)
"$bt/zipalign" -f -p 4 "$in" "$out.aligned"
"$bt/apksigner" sign --ks "$(get storeFile)" --ks-key-alias "$(get keyAlias)" --ks-pass "pass:$(get storePassword)" --key-pass "pass:$(get keyPassword)" --out "$out" "$out.aligned"
rm -f "$out.aligned" "$out.idsig"
cert=$("$bt/apksigner" verify --print-certs "$out" | awk -F': ' '/SHA-256 digest/{print $2; exit}')
want=$(get certSha256 || true)
echo "signed $out cert $cert"; [[ -z $want || $want == "$cert" ]] || { echo "CERT MISMATCH vs recorded $want"; exit 1; }
