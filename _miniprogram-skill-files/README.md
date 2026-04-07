# `/mini-program` — Claude Code Skill for WeChat Mini Programs

**Build a complete WeChat Mini Program from idea to deployment — without writing a single line of code yourself.**

This Claude Code skill turns a conversational prompt into a fully functional WeChat Mini Program. Just type `/mini-program`, answer a few questions about what you want to build, and Claude handles everything: project scaffolding, UI design, page development, cloud functions, database setup, and deployment guidance.

---

## What It Does

| You say | Claude does |
|---------|------------|
| "I want a habit tracker app" | Scaffolds pages, components, cloud functions, and a complete design system |
| "Orange theme, playful style" | Generates CSS design tokens, custom tab bar, and themed components |
| "I need user login" | Sets up WeChat auth flow with cloud function + user collection |
| "Add cloud database" | Creates CRUD cloud functions, collection schemas, and pagination logic |

**One skill. Five questions. A complete mini program.**

---

## Quick Start

### 1. Install the Skill

Copy `SKILL.md` to your Claude Code skills directory:

```bash
mkdir -p ~/.claude/skills/mini-program
cp SKILL.md ~/.claude/skills/mini-program/SKILL.md
```

### 2. Run It

Open Claude Code in any project directory and type:

```
/mini-program
```

### 3. Answer Questions

Claude will guide you through 5 stages, asking questions at each step:

```
┌─────────────────────────────────────────────────┐
│  Stage 1 → What's your app about?               │
│  Stage 2 → What should it look like?            │
│  Stage 3 → What tech do you need?               │
│  Stage 4 → [Claude builds everything]           │
│  Stage 5 → Ready to deploy?                     │
└─────────────────────────────────────────────────┘
```

That's it. No boilerplate. No documentation hunting. No setup fatigue.

---

## The 5-Stage Workflow

### Stage 1: Requirements

Claude asks about your app's purpose, target users, and your technical level.

- **Zero experience?** → Claude provides a complete beginner guide (account registration, dev tools setup, project creation)
- **Have an AppID?** → Skips straight to design

### Stage 2: Design

Claude asks about your visual preferences and generates a full design system.

- UI style (minimal / playful / business / dark)
- Brand colors → CSS design tokens (colors, typography, spacing, shadows, radii)
- Tab structure → `app.json` configuration
- Custom navigation bar if needed

### Stage 3: Tech Stack

Claude asks what capabilities you need and architects accordingly.

- **Database**: WeChat CloudBase (recommended) / self-hosted / third-party
- **External APIs**: Domain whitelist setup, API key management in cloud functions
- **AI features**: Tencent Hunyuan integration (text chat, image recognition, speech-to-text)
- **Auth**: WeChat login / phone number / none

### Stage 4: Development

Claude builds everything based on your confirmed requirements:

1. Project directory structure
2. Global config (`app.json` / `app.js` / `app.wxss`)
3. Custom Tab Bar with icons
4. Pages — one at a time, fully functional
5. Reusable components
6. Cloud functions (CRUD, auth, sync)
7. AI integration (if requested)
8. External API connections (if requested)

### Stage 5: Testing & Deployment

Claude provides a deployment checklist and guides you through:

- Cloud function deployment
- Database collection setup & permissions
- Domain whitelist configuration
- App submission and review process

---

## What Gets Generated

A typical project built with this skill:

```
your-app/
├── app.js                    # Cloud init, global data
├── app.json                  # Pages, tabBar, window config
├── app.wxss                  # Design tokens (CSS variables)
├── custom-tab-bar/           # Custom bottom navigation
├── components/
│   ├── nav-bar/              # Custom navigation bar (safe area aware)
│   └── [your-components]/    # App-specific components
├── pages/
│   ├── index/                # Home page
│   ├── [your-pages]/         # Additional pages
│   └── profile/              # User profile with stats
├── cloudfunctions/
│   ├── getData/              # Read operations with pagination
│   ├── addData/              # Create operations
│   ├── updateData/           # Update operations
│   ├── deleteData/           # Delete operations
│   └── login/                # WeChat auth + user storage
├── utils/
│   └── util.js               # Shared helpers
├── project.config.json       # WeChat DevTools config
└── sitemap.json              # Sitemap
```

---

## Code Standards

All generated code follows these conventions:

- **ES5 compatible** — `var`, `function(){}`, no arrow functions (maximum device compatibility)
- **Chinese output** — All UI text, comments, and error messages in Chinese
- **English variables** — Code identifiers in English
- **Error safety** — Every async call wrapped in try/catch, user-facing errors are always friendly Chinese messages (never raw JS errors)
- **Local-first** — Reads from cache instantly, syncs cloud data in background
- **Component lifecycle** — Proper timer cleanup in `detached()`, animation pause in `pageLifetimes.hide()`

---

## Coverage

The skill includes patterns and templates for:

| Category | What's Covered |
|----------|---------------|
| **Project Setup** | Directory structure, `app.json`, cloud init |
| **Design** | CSS variables, color/font/spacing tokens, animations |
| **Navigation** | Custom Tab Bar, custom nav bar, `switchTab` vs `navigateTo` |
| **Pages** | Lifecycle, URL params, pull-to-refresh, infinite scroll |
| **Components** | Properties, events, observers, page lifecycles |
| **Templates** | Data binding, `wx:if`/`wx:for`, event handling |
| **Styling** | rpx units, flex layouts, `:active` feedback, style isolation |
| **Cloud Functions** | `wx-server-sdk`, CRUD, deployment |
| **Database** | Queries, RegExp search, pagination, Command operators |
| **Storage** | File upload, temp URLs, `wx.chooseMedia` |
| **AI** | Hunyuan Bot API, Hunyuan Vision, speech-to-text |
| **External APIs** | `wx.request`, domain whitelist, API key management |
| **Local Storage** | Cache-first architecture, `wx.getStorageSync` |
| **Animations** | CSS transitions, keyframes, staggered list animations |
| **Error Handling** | Safe messages, regex filtering, fallback patterns |
| **Deployment** | Pre-launch checklist (19 items), submission guide |

---

## Built With This Skill

[**LightHouse**](https://github.com/Hongyi999/LightHouse) — A daily knowledge intake tracker for recording podcasts, videos, movies, books, and ideas. Built from zero to a complete mini program in one conversation.

---

## Requirements

- [Claude Code](https://claude.ai/code) (CLI, desktop app, or web)
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) for previewing and deploying
- A WeChat Mini Program account ([register here](https://mp.weixin.qq.com/))

---

## License

MIT
