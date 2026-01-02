This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# GatherCart

GatherCart ist ein schlankes, lokales Planungs- und Budget-Tool.  
Du kannst damit Projekte (z.B. Urlaub, PC-Build, Umzug, Wunschliste) anlegen und alle geplanten Ausgaben übersichtlich verwalten – komplett im Browser, ohne Login und ohne Server.

---

## ✨ Features

- 🧾 **Projekte anlegen**  
  z.B. „Sommerurlaub 2026“, „Neuer Gaming-PC“, „Wohnungsumzug“, „Wunschliste“.

- 💸 **Budget & Währung pro Projekt**  
  - Optionales Gesamtbudget  
  - Frei wählbare Währung (EUR, USD, THB, … oder eigene Kürzel)

- 📦 **Produkte/Items pro Projekt**  
  - Name, Shop/Anbieter  
  - Preis & Menge  
  - Optionaler Link (URL)  
  - Freitext-Notiz (z.B. „nur bei Rabatt“, „Alternative“)

- ✅ **Status-Handling**  
  - Items als *geplant* oder *gekauft* markieren  
  - Filter für: alle / offen / gekauft  
  - Quick-Aktionen: „Alle offen“ / „Alle gekauft“

- 📊 **Übersicht & Auswertung**  
  - Summe aller geplanten Ausgaben  
  - Summe aller als „gekauft“ markierten Items  
  - Rest-Budget und prozentuale Auslastung (falls Budget gesetzt)

- 🌐 **Zweisprachig (DE / EN)**  
  Sprache jederzeit umschaltbar, Spracheinstellung wird gespeichert.

- 🎨 **Theme-Toggle (Dark / Light)**  
  - Dark-Theme als Standard  
  - Umschaltbar auf Light-Theme  
  - Auswahl wird im Browser gespeichert

- 💾 **Lokale Datenspeicherung**  
  - Alle Daten werden in `localStorage` des Browsers gespeichert  
  - Kein Server, kein Backend, kein Login  
  - Export/Import der Daten als JSON-Backup möglich

- 📋 **Copy-to-Clipboard**  
  - Projektliste (inkl. Preise, Status, Notizen, Links) als Text in die Zwischenablage kopieren  
  - Ideal, um die Liste z.B. in Messenger, Mails oder Notizen einzufügen

---

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/) – App Router (`app/`-Verzeichnis)
- React (Client Components)
- TypeScript
- Tailwind (via `@import "tailwindcss";` in `globals.css`)
- `localStorage` für persistente Daten im Browser
- Deployment z.B. über [Vercel](https://vercel.com/)

---

## 🚀 Lokale Entwicklung

### Voraussetzungen

- Node.js (empfohlen: aktuelle LTS-Version)
- npm oder pnpm oder yarn

### Installation

```bash
# Repository klonen
git clone <DEIN-REPO-URL>
cd <DEIN-PROJEKTORDNER>

# Dependencies installieren
npm install
# oder:
# pnpm install
# yarn
