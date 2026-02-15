// Module (app-level) Gradle file (<project>/<app-module>/build.gradle.kts):
plugins {
  id("com.android.application")
  // Add the Google services Gradle plugin
  id("com.google.gms.google-services")
}

dependencies {
  // Import the Firebase BoM
  implementation(platform("com.google.firebase:firebase-bom:34.9.0"))

  // Add the dependencies for Firebase products you want to use
  implementation("com.google.firebase:firebase-analytics")
  implementation("com.google.firebase:firebase-auth")
  implementation("com.google.firebase:firebase-firestore")
}
