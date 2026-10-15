import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// ye-design-system WebView wrapper template. UI + API come from the user's own server (address entered on first run,
// default from -PyeServer, e.g. http://t470:8790 over Tailscale). Generated apps: scripts/new-webview-app.sh.
// Signing: ONE shared owner key for every ye-app, never in git. keystore.properties (storeFile, storePassword, keyAlias,
// keyPassword) is read from $YE_KEYSTORE_PROPS or ~/.ye-keys/keystore.properties. Absent → release stays unsigned.
val keyProps = file(System.getenv("YE_KEYSTORE_PROPS") ?: "${System.getProperty("user.home")}/.ye-keys/keystore.properties")

android {
    namespace = "app.yetemplate"
    compileSdk = 35
    defaultConfig {
        applicationId = "app.yetemplate"
        minSdk = 26
        targetSdk = 35
        versionCode = (findProperty("yeVersionCode") as String?)?.toInt() ?: 1
        versionName = (findProperty("yeVersionName") as String?) ?: "0.1.0"
        resValue("string", "default_server", (findProperty("yeServer") as String?) ?: "")
    }
    if (keyProps.exists()) {
        val p = Properties().apply { keyProps.inputStream().use { load(it) } }
        signingConfigs {
            create("ye") {
                storeFile = file(p.getProperty("storeFile"))
                storePassword = p.getProperty("storePassword")
                keyAlias = p.getProperty("keyAlias")
                keyPassword = p.getProperty("keyPassword")
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (keyProps.exists()) signingConfig = signingConfigs.getByName("ye")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.activity:activity-ktx:1.9.3")
}
