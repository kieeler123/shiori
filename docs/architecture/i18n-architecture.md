2026-02-27

# Shiori i18n Architecture

## Overview
Shiori now supports multi-language UI through a centralized i18n system.

The goal is not simple translation, but structural separation between:
- UI logic
- text resources
- user locale state

This enables future global expansion without redesigning components.

---

## Design Principles

1. **Brand name is not translated**
   - "Shiori" remains identical across all locales.

2. **UI text must never be hardcoded**
   - All visible text comes from locale dictionaries.

3. **Component independence**
   - Components do not know language details.
   - They only call `t(key)`.

4. **Global locale state**
   - Managed via `LocaleProvider`.

---

## Structure


shared/
└─ i18n/
├─ LocaleProvider.tsx
├─ useI18n.ts
├─ locales/
│ ├─ ko.ts
│ ├─ en.ts
│ ├─ ja.ts
│ └─ zh.ts
└─ LocaleSelectCompact.tsx


---

## Core Flow

User selects language
↓
LocaleSelectCompact
↓
setLocale(locale)
↓
LocaleProvider state update
↓
All components re-render
↓
t("key") resolves new language

---

## Supported Locales

- ko — Korean
- en — English
- ja — Japanese
- zh — Chinese

---

## Applied Areas (Today)

- Support navigation
- Support trash separation
- Edit page text
- Common buttons (cancel etc.)
- Header locale selector

---

## UI Rules

- Colors use theme tokens (no hardcoding)
- Dropdown menus share common styles
- Locale selector matches Theme selector UX

---

## Future Work

- LogsPage localization
- Placeholder localization
- Dynamic content locale support (DB level)
- locale column consideration (optional)

---

## Philosophy

Internationalization is treated as architecture,
not decoration.

Shiori is designed as a global-first platform.