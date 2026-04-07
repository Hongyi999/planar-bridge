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

## Pages

### Home (`pages/index`)

The landing page features a centered hero layout with the Planar Bridge logo, a heading ("你在找什么卡牌?"), and a subtitle. The main interaction point is the **search bar** with 10 rotating placeholder suggestions that cycle every 2.5 seconds with a vertical slide-up animation. A **camera button** (+) on the right side of the search bar opens the device camera or photo album for image-based card recognition. Below the search bar, a detail line reads "实时价格 · 系列浏览 · 个人收藏". The background has a subtle repeating grid pattern in gold at 4% opacity.

### Search Results (`pages/results`)

Displays results in a **2-column card grid** (toggleable to list view). At the top, a compact search bar allows refining the query. During AI processing, a **thinking strip** component shows animated steps (parsing query → searching database → loading prices) with staggered slide-in animations and shimmer effects. An **AI summary card** appears with the result count and a natural language description of what was found. Each card tile shows the card image, a **rarity badge** (color-coded: Legendary purple, Majestic gold, Fabled gold, Rare blue), and a **star button** for quick-adding to collections. In list view, cards show a thumbnail, name, metadata, price, and trend indicator (green ▲ / red ▼ / gray —). Cards animate in with a staggered fadeInUp effect.

### Card Detail (`pages/detail`)

A full-screen detail view with a **draggable hero section** — users can drag down on the card image to enlarge it (up to 1.2x scale), and tap it for full-screen preview. Two decorative concentric circles frame the card image. Below the hero, a **detail sheet** (white, rounded top corners 48rpx) slides up containing:

- **Header**: Card name (English + Chinese), type, and rarity alongside current price with trend indicator
- **Stats grid**: 4 chips showing Cost, Power/Defense, Intelligence, and Health values
- **Card text**: Full rules text in a formatted box
- **Price row**: Low / Mid / Market prices in a 3-column layout
- **Actions**: "加入收藏列表" button (opens a modal with checkboxes for selecting which lists to add the card to) and a link copy button for the TCGplayer URL

The custom navigation bar has frosted-glass styled back and home buttons.

### Series Browser (`pages/series`)

Displays all FAB card sets with a **sort toggle** between chronological (grouped by year) and alphabetical (A–Z flat list). Each set entry shows a **badge icon** with the set abbreviation, the set name, type/card count tags, and a chevron. Year dividers appear as gold-accented headers. Tapping a set navigates to the set detail page.

### Set Detail (`pages/set-detail`)

Shows all cards within a specific set in a paginated 2-column grid (or list view). A fixed header displays the set code, total card count, and optional Chinese name. Supports **infinite scroll** — loads 20 cards per batch on scroll-to-bottom. Cards have the same grid/list layout and star button as the results page. Loading state shows a shimmer skeleton animation.

### Collection Manager (`pages/lists`)

A full-featured collection management page. At the top, a **horizontal scrollable row** of list cards shows each collection (name, card count, total value) with an "add new" card at the start (dashed border, + icon). Lists are color-coded with user-selectable colors.

- **Edit mode**: Toggle to show reorder arrows on list cards (left/right swap). A wobble animation hint plays on first visit.
- **Long press a list**: Opens an **edit panel modal** with rename input, a 28-color picker grid, save button, and delete button.
- **Grid/list view toggle**: Same card display as results, but with a red ×  delete button on each card.
- **Stats**: Total card count and total collection value displayed in the header.

Data syncs between localStorage (instant) and cloud (background), with timestamp-based conflict resolution for multi-device support.

### Settings (`pages/settings`)

Organized in card-like sections:

- **Search preferences**: Sort order picker (A-Z, Z-A, by series, price high/low), search language
- **Display preferences**: Currency toggle (USD / CNY)
- **Export**: Multi-select checkboxes for export fields (2-column grid), list selection modal, format choice (Markdown to clipboard or CSV preview)
- **Data management**: Clear cache, reset all settings
- **About**: App version info, feedback link
- **Hidden admin mode**: Unlocked by tapping "关于" 5 times — reveals database stats (card/set/image counts) and a batch update button with progress indicator

## Components

### Search Bar (`components/search-bar`)

Accepts a `placeholders` array and rotates through them with a **vertical slide-up animation** (CSS `translateY` transition, 0.4s cubic-bezier). The animation uses an overlay container with `overflow: hidden` containing two text lines — the current and next placeholder. In compact mode (used on the results page), padding and border radius are reduced. Emits `search`, `camera`, and `tap` events.

### Card Tile (`components/card-tile`)

Renders a single card in the grid with staggered entrance animation (each card delays by `index × 100ms`). Shows the card image with a gradient fallback, a color-coded rarity badge (top-left), and a semi-transparent star button (top-right). Card info includes name, Chinese name, class/type metadata, and price with trend coloring. Press state scales to 0.97 with enhanced shadow.

### Thinking Strip (`components/thinking-strip`)

A vertical stack of AI processing steps with staggered reveal (800ms apart). Each step has a colored icon (purple clock, gold search, green dollar), a label, monospace metadata, and a status indicator (checkmark when done, spinning loader while processing). Features a shimmer overlay animation sweeping left-to-right on loading steps.

### Custom Tab Bar (`custom-tab-bar`)

Four tabs (Search, Series, Collections, Settings) with SVG icon pairs (normal/active). Active tab shows gold color at full opacity; inactive tabs are gray at 55% opacity. Includes bottom safe area padding for notched devices. Smooth opacity transitions on tab switches.

## Cloud Functions

### aiSearch

The core intelligence layer. Handles two search modes:

- **Text search**: The user's query is sent to the Hunyuan AI bot, which parses intent and extracts structured filters (class, type, rarity, price range, set code, keywords). Chinese class names (忍者, 守护者, 法师, etc.) are mapped to English equivalents. Falls back to regex pattern matching if AI is unavailable. Queries the cloud database with the extracted filters and returns up to 50 results.
- **Image search**: Accepts a cloud file ID, retrieves a temporary URL, and sends it to Hunyuan Vision for card identification. If vision fails, falls back to OCR via `cloud.openapi.ocr.printedText`. Recognized card names are then searched in the database.

### syncCollection

Manages user collection persistence with cloud-local sync:

- `get` — Fetch user's lists and settings by OpenID
- `save` — Persist full collection state
- `addCard` / `removeCard` — Atomic card operations on specific lists
- `saveSettings` — Save user preferences only

Auto-creates a default collection with 3 starter lists (收藏 / 心愿单 / 交换册) for new users.

### importCards / importImages / initData

Batch data management functions for populating the card database, downloading card images to cloud storage, and initializing set/series metadata.

## Design System

| Token | Value |
|-------|-------|
| Background | `#F2EFE4` warm beige |
| Card surface | `#FDFCF8` off-white |
| Accent | `#9B8644` warm gold |
| Text primary | `#2C2A22` near-black |
| Text secondary | `#6B6355` brown-gray |
| Text tertiary | `#A09A8C` light gray |
| Price up | `#3D7A5E` forest green |
| Price down | `#C4544A` rust red |
| Heading font | Songti SC, Georgia, serif |
| Body font | PingFang SC, -apple-system, sans-serif |
| Mono font | SF Mono, Menlo, monospace |

The design language emphasizes a warm, elegant aesthetic with serif headings, generous spacing, rounded corners (28–32rpx for cards), and subtle gold accents. All animations use ease-out or ease-in-out curves for natural motion.

## License

MIT
