# Planar Bridge

A WeChat Mini Program for searching, browsing, and collecting [Flesh and Blood](https://fabtcg.com/) trading card game cards — with real-time pricing, AI-powered natural language search, and image recognition.

## Features

- **AI-Powered Search** — Ask in plain Chinese or English (e.g. "Ninja 的传奇装备", "cards under $10 with Go Again") powered by Tencent Hunyuan via WeChat CloudBase
- **Image Recognition** — Snap a photo of any FAB card to instantly identify and look up its details
- **Real-Time Pricing** — Live market prices synced from JustTCG
- **Series Browser** — Browse the complete card catalog organized by set/edition
- **Card Details** — Full card info including class, type, rarity, pitch value, and price history
- **Personal Collection** — Save and manage your favorite cards
- **Rotating Search Suggestions** — Animated placeholder examples showcasing different search capabilities

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | WeChat Mini Program (WXML / WXSS / JS) |
| Backend | WeChat CloudBase (Cloud Functions, Cloud Database, Cloud Storage) |
| AI | Tencent Hunyuan via `cloud.extend.AI` — Bot API (text) + Hunyuan Vision (image) |
| Pricing API | JustTCG API |
| Design | Custom Tab Bar, custom navigation bar, CSS animations, ES5-compatible |

## Project Structure

```
Claude/
├── pages/
│   ├── index/          # Home — search bar with animated placeholders + camera upload
│   ├── results/        # Search results grid
│   ├── detail/         # Card detail view with hero image + swipe gestures
│   ├── set-detail/     # Cards within a specific set
│   ├── series/         # Set/edition browser
│   ├── lists/          # Personal collection manager
│   └── settings/       # App settings + data sync
├── components/
│   ├── search-bar/     # Search input with rotating placeholder animation
│   ├── card-tile/      # Card grid tile component
│   └── thinking-strip/ # AI thinking indicator
├── custom-tab-bar/     # Custom bottom navigation with SVG icons
├── cloudfunctions/
│   ├── aiSearch/       # AI search — text queries + image recognition (Hunyuan Vision + OCR fallback)
│   ├── syncCollection/ # JustTCG price sync
│   ├── importCards/    # Batch card data import
│   ├── importImages/   # Card image downloader
│   ├── initData/       # Database initialization
│   └── voiceToText/    # Speech-to-text with pinyin fuzzy matching
├── assets/icons/       # SVG icons for tabs, navigation, and UI elements
├── utils/              # Shared utilities
├── app.js              # App entry — cloud init
├── app.json            # Global config — pages, tabBar, window
└── app.wxss            # Design tokens — colors, typography, spacing
```

## Getting Started

### Prerequisites

- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- A WeChat Mini Program account with an AppID
- WeChat CloudBase environment set up

### Setup

1. Clone this repository
2. Open WeChat DevTools and import the `Claude/` directory
3. Enter your AppID in project settings
4. Set your CloudBase environment ID in `app.js`
5. Deploy all cloud functions (right-click each folder → Upload and Deploy)
6. Create the required database collections in the CloudBase console

## License

MIT
