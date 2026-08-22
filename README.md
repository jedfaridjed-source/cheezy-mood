# Cheezy Mood — Preorder App

Angular 17 single-page preorder app for Cheezy Mood. Customers build their order, choose a pickup slot, and send the preorder to the restaurant through WhatsApp.

## Features

- Sandwich and pasta bases
- Pasta choice: Mac & Cheese, Alfredo, Rossa
- Meat and cheese extras
- Fries extra
- Cart with quantities
- Pickup day and time selection
- Same-day slots automatically start at least 30 minutes from the current time
- Pickup window: 11:00–23:30
- Customer name, phone and optional note
- WhatsApp preorder message
- Responsive mobile/desktop UI
- Cloudflare Wrangler configuration
- Original Cheezy Mood logo and menu assets included

## 1. Set your WhatsApp number

Open `src/app/home.component.ts` and make sure this value is your real restaurant WhatsApp number, digits only with the Tunisia country code:

```ts
readonly whatsappNumber = '216XXXXXXXX';
```

## 2. Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## 3. Production build

```bash
npm run build:prod
```

Angular outputs the production site to:

`dist/cheezy-mood/browser`

## 4. Deploy with Cloudflare Wrangler

Log in once on the machine you use for deployment:

```bash
npx wrangler login
```

Then deploy:

```bash
npm run deploy
```

The included `wrangler.jsonc` is already configured for the Angular browser output and SPA fallback.

## 5. GitHub + Cloudflare automatic deployment

Create a new GitHub repository, then from this project folder:

```bash
git init
git add .
git commit -m "Initial Cheezy Mood preorder app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cheezy-mood.git
git push -u origin main
```

For a Cloudflare Git-based build, use:

- Build command: `npm run build:prod`
- Output directory: `dist/cheezy-mood/browser`
- Root directory: `/`

If using the same Cloudflare Workers Builds workflow as your portfolio, use:

- Build command: `npm run build:prod`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

## Important business settings

The pickup hours and preparation lead time are centralized in `src/app/home.component.ts`:

```ts
readonly openingHour = 11;
readonly closingHour = 23;
readonly closingMinute = 30;
readonly minimumLeadMinutes = 30;
```

Change these values if Cheezy Mood's real opening hours or preparation time changes.
