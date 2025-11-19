# Android App Quick Start Guide

## Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK (API 24+)
- Kotlin 1.9+

## Step 1: Create New Android Project

1. Open Android Studio
2. File → New → New Project
3. Select "Empty Activity"
4. Configure:
   - Name: TeamTalk Transfers
   - Package: com.teamtalk.transfers
   - Language: Kotlin
   - Minimum SDK: API 24 (Android 7.0)
   - Build configuration: Kotlin DSL

## Step 2: Add Dependencies

Update `app/build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
}

android {
    namespace = "com.teamtalk.transfers"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.teamtalk.transfers"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
}

dependencies {
    // Add dependencies from ANDROID_MIGRATION_GUIDE.md
}
```

## Step 3: Basic Project Structure

Create these directories:
```
app/src/main/java/com/teamtalk/transfers/
├── data/
├── domain/
├── ui/
└── di/
```

## Step 4: First Screen

Create `ui/screens/home/HomeScreen.kt`:

```kotlin
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "TeamTalk Transfers",
            style = MaterialTheme.typography.headlineLarge
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Welcome to TeamTalk Transfers Android App")
    }
}
```

## Step 5: Run the App

1. Connect Android device or start emulator
2. Click Run (▶️)
3. App should launch with basic screen

## Next Steps

Follow the migration guide to implement features incrementally.

