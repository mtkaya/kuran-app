# The Holy Quran: Indexed - Project Documentation

**Date:** January 17, 2026
**Version:** 0.0.0 (Development)
**Platform:** iOS, Android, Web

## 📋 Project Overview
A comprehensive, cross-platform Quran application built with React and Capacitor. The app focuses on providing a seamless reading and listening experience with advanced features like multiple reading modes, audio playback with background support, and extensive personalization options.

---

## 🛠 Technology Stack

### Core
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Themes)
- **Icons:** Lucide React

### Mobile / Native
- **Runtime:** Capacitor 8.0
- **Platforms:** iOS (Xcode), Android (Android Studio)
- **Native Plugins:** `@capacitor/app` (Back button handling)

### State Management & Logic
- **State:** Zustand (Store-based architecture)
- **Routing:** React Router DOM
- **Search:** Fuse.js (Fuzzy search)
- **Testing:** Vitest + React Testing Library (v8 coverage)

---

## ✨ Features

### 📖 Reading Experience
1.  **Three Reading Modes:**
    *   **Normal:** Standard list view with infinite scroll.
    *   **Mushaf:** Page-by-page view using high-quality mushaf images.
    *   **Digital:** Modern card-based view focusing on single ayahs.
2.  **Customization:**
    *   Adjustable Arabic & Translation font sizes.
    *   **Themes:** Light, Dark, and System Default (High contrast support).
    *   Toggle Transliteration and Tajweed rules.
    *   Multiple Arabic fonts support.

### 🎧 Audio Playback
-   **Audio Player:** Global floating player accessible from anywhere.
-   **Background Playback:** Continues playing when app is minimized (iOS/Android).
-   **Lock Screen Controls:** Play, pause, next/prev controls via Media Session API.
-   **Auto-Scroll:** Reader automatically scrolls to the playing ayah.
-   **Repeat Modes:** Repeat Ayah, Repeat Surah, or None.

### 🔍 Search & Navigation
-   **Fuzzy Search:** Instant search across translation text and surah names.
-   **Surah Grid/List:** Toggleable view for Surah list (Fixed height cards).
-   **Quick Navigation:** Jump to specific Ayah or Page.

### 📝 User Data
-   **Bookmarks:** Save specific ayahs.
-   **Notes:** Add personal notes to any ayah.
-   **Last Read:** Automatically saves the last reading position.
-   **Local Storage:** All user data persists efficiently on the device.

---

## ✅ Completed Tasks (Recent)
-   **UI/UX Polish:**
    -   Implemented animated Splash Screen.
    -   Fixed Grid View layout (uniform 160px cards, no overflow).
    -   Improved Dark Mode contrast and visibility.
-   **Native Integration:**
    -   Enabled `UIBackgroundModes` (audio) for iOS.
    -   Integrated Media Session API for lock screen controls.
    -   Handled Android physical back button behavior.
-   **Quality Assurance:**
    -   **Testing:** Set up Vitest environment.
    -   **Coverage:** Added unit tests for `audioStore`, `bookmarkStore`, `settingsStore` (100% pass).
    -   **Security:** Audited dependencies (development-only vulnerabilities identified).

---

## ⚠️ Known Limitations & Issues

1.  **Android Background Notification:**
    -   While audio plays in the background, a persistent media notification widget is not fully native on Android without a custom Foreground Service implementation.
2.  **Widgets:**
    -   No Home Screen widgets (e.g., "Daily Ayah") currently exist. These require native Swift/Kotlin code.
3.  **PDF/Image Assets:**
    -   Mushaf images are loaded from local assets; ensuring high resolution on all devices may require storage optimization.

---

## 🚀 Future Roadmap

### Short Term
-   **Native Widgets:** Implement iOS WidgetKit and Android AppWidgetProvider for home screen widgets.
-   **Prayer Times:** Integrate Aladhan API for location-based prayer times.
-   **Qibla Finder:** Add a compass feature.

### Long Term
-   **Cloud Sync:** Sync bookmarks and notes across devices (requires backend).
-   **Hafiz Mode:** Advanced memorization tools with hiding/revealing text.
-   **Social Sharing:** Generate beautiful images of ayahs to share on social media.

---

## 💾 Store Structure
-   **audioStore:** Manages playback state, playlist, and HTML5 Audio element.
-   **settingsStore:** Handles theme, fonts, and boolean toggles.
-   **bookmarkStore:** Manages user bookmarks.
-   **readingStore:** Tracks reading position and view modes.
