
**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase setup

Use the supplied `supabase/` folder (includes config and migrations) and wire the app with environment variables.

1) Install the Supabase CLI  
   - https://supabase.com/docs/guides/cli/getting-started (Windows installer available)

2) Create your environment file  
   - Copy `env.example` to `.env.local`  
   - Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your project values.  
   - If you run the local Supabase stack, you can generate these automatically with `supabase status -o env > .env.local` after `supabase start`.

3) Start or connect to Supabase  
   - Local: from the repo root run `supabase start` (uses `supabase/config.toml`).  
   - Apply migrations locally with `supabase db reset` (recreates the database and runs everything under `supabase/migrations`).

4) Run the app  
   - `npm install`  
   - `npm run dev` (Vite reads `.env.local` automatically).