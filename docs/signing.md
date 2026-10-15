# Signing and safe install

Today each app is signed with a different key: yephotos `android/yephotos.keystore` (gitignored), and yereader/yetube with per-machine debug keys (see their HANDOFF). Updating in place requires the same key, so we move to **one shared key**, kept only on the owner machine.

1. Once: `scripts/create-shared-key.sh` creates `~/.ye-keys/ye-release.jks` and `keystore.properties` (incl. `certSha256`). Back it up offline twice. Record the fingerprint here:
   - `certSha256 = <not created yet>`
2. Build: Gradle reads `$YE_KEYSTORE_PROPS` or `~/.ye-keys/keystore.properties` (template `app/build.gradle.kts`, yetube pattern). Or sign afterwards with `scripts/sign-apk.sh unsigned.apk out.apk`, which checks the fingerprint.
3. Update: `scripts/safe-install.sh <pkg> <apk>` compares the installed signer to the APK signer and stops on a mismatch. It backs up with `run-as` (debuggable builds) and verifies the tar is non-empty, then runs `install -r` and checks that the app is running. It never uninstalls. `DRY_RUN=1` runs the checks only.
4. One-time key move per app: `scripts/migrate-to-shared-key.sh <pkg> <apk>`. It defaults to `DRY_RUN=1`, makes the backup, and needs the typed phrase `wipe <pkg>`. **Not run yet.** Order: yephotos (data is on the server; the phone holds only the server URL), then yeplayer, then yetube (JSON backup + run-as), then yereader (`.yereader` export + run-as).
