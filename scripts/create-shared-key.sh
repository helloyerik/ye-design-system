#!/usr/bin/env bash
# One-time: create the shared ye release key in ~/.ye-keys (outside every repo). Refuses if it exists.
# Back it up offline twice (USB + password manager) — losing it means no in-place updates ever again.
set -euo pipefail
d=$HOME/.ye-keys; ks=$d/ye-release.jks; [[ -e $ks ]] && { echo "exists: $ks (refuse)"; exit 1; }
mkdir -p "$d"; chmod 700 "$d"
read -rsp "keystore password (>=12 chars): " pw; echo; [[ ${#pw} -ge 12 ]] || { echo "too short"; exit 1; }
keytool -genkeypair -keystore "$ks" -storetype PKCS12 -alias ye -keyalg RSA -keysize 4096 -validity 36500 \
  -storepass "$pw" -keypass "$pw" -dname "CN=Yerik Kuanbaev, O=ye-apps"
cert=$(keytool -list -v -keystore "$ks" -storepass "$pw" -alias ye | awk -F': ' '/SHA256:/{print $2; exit}' | tr -d ':' | tr A-F a-f)
printf 'storeFile=%s\nstorePassword=%s\nkeyAlias=ye\nkeyPassword=%s\ncertSha256=%s\n' "$ks" "$pw" "$pw" "$cert" > "$d/keystore.properties"
chmod 600 "$d/keystore.properties" "$ks"; echo "created $ks cert $cert — record this fingerprint in docs/signing.md"
