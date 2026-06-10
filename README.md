# 📝 NotesBazi

NotesBazi is a premium, high-performance **Notes Management and Digital Library Platform** specifically crafted for the students of the **United Group of Institutions (UGI)**, supporting campuses like **UIT, UCER, UIP, and UIM**.

It provides an interactive, community-driven space where students can upload, search, rate, bookmark, and download verified academic resources like notes, previous year question papers (PYQs), and assignments. Additionally, it integrates Google Gemini AI to auto-summarize notes and perform OCR on uploaded image resources.

---

## 🚀 Key Features

### 📖 Student & Resource Features
* **Interactive Resource Navigator**: Effortlessly filter and explore notes, assignments, and PYQs by subject, department, and academic year.
* **AI-Powered OCR & Auto-Metadata**:
  * Automatically extracts subject name, academic year, and topics from uploaded note screenshots using **Google Gemini 1.5 Flash**.
  * Generates short summaries and 5 highly relevant keywords automatically for text/document submissions.
* **Student Leaderboard**: Displays top contributors based on contribution points earned through views, downloads, and ratings of their uploads.
* **Personalized Dashboard**: A private space for students to view their uploaded notes, bookmarks, download histories, and contribution scores.
* **Saved Notes (Bookmarks)**: Bookmark important resources for quick access from the dashboard.
* **Rating & View System**: Rate notes (1-5 stars) and track views/downloads. Average ratings are automatically recalculated in real-time using PostgreSQL database triggers.
* **Flag & Moderation**: Report inappropriate or incorrect notes, automatically notifying admins.

### 🛡️ Admin & Control Features
* **Verification System**: Verify user-uploaded notes so they are highlighted as high-quality content.
* **Analytics Dashboard**: Rich visual charts built with **Recharts** detailing download and view trends, user sign-up activity, and report distributions.
* **Moderation Center**: Manage flagged notes (resolve or delete), manage users (promote to admin or restrict permissions), and verify uploads.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) (Server Actions, SSR, Dynamic Routes, and Middleware)
* **Backend Database & Authentication**: [Supabase](https://supabase.com/) (using `@supabase/ssr` & `@supabase/supabase-js` for cookie-based session persistence and secure Row Level Security policies)
* **AI Engine**: [Google Gemini SDK](https://ai.google.dev/) (`@google/generative-ai` using `gemini-1.5-flash`)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (modern, fast styling with support for seamless dark mode)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (built on top of Radix UI primitives)
* **Animations**: [Framer Motion](https://www.framer.com/motion/) & custom micro-animations
* **Data Visualizations**: [Recharts](https://recharts.org/)

---

## 🗄️ Database Setup (Supabase SQL)

To run the application, configure your Supabase database with the following schemas. Execute these scripts in the **Supabase Dashboard > SQL Editor**:

### 1. Admin & Core Setup (`admin_setup.sql`)
Creates the `reports` table, enables Row Level Security (RLS) policies for notes and profiles, updates roles (e.g., student, admin), and configures triggers to automatically create user profiles upon signup.
```sql
-- Profiles table setup and admin policies
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'));

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Interactions Setup (`interaction_setup.sql`)
Sets up bookmarks (`saved_notes`), reviews (`ratings`), database functions to safely increment downloads/views, and a trigger to calculate average note ratings in real-time.
```sql
-- Trigger for automatic average rating update
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.notes
    SET average_rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.ratings
        WHERE note_id = NEW.note_id
    )
    WHERE id = NEW.note_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Storage & Avatars (`avatar_migration.sql`)
Sets up a public bucket named `avatars` to store profile pictures and establishes security policies allowing authenticated users to manage their own avatar pictures.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root of the project and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 💻 Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/gkm563/NotesBazi.git
   cd NotesBazi
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application locally.

4. **Linting & Code Quality**:
   ```bash
   npm run lint
   ```

---

## 🌐 Deployment Guide

### 🚀 Deploying to Vercel (Recommended)
Since NotesBazi uses dynamic features like **Next.js Server Actions**, dynamic routing, and **Supabase SSR cookie middleware**, it requires a Node.js-compatible backend server runtime. **Vercel** is the recommended host for hosting Next.js applications seamlessly for free.

#### Step-by-Step Vercel Deployment:
1. Push your latest code changes to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
3. Click **Add New** > **Project**.
4. Import your **NotesBazi** (or `uginotes`) repository.
5. In the **Environment Variables** section, input the keys from your `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `GEMINI_API_KEY`
6. Click **Deploy**. Vercel will automatically build the application and provide a public `.vercel.app` URL.
7. Any subsequent pushes to your repository's branch (e.g. `main` or `uginotes`) will trigger an automatic redeployment.

### ⚠️ Note on GitHub Pages
Next.js applications can be statically exported using `output: 'export'` in `next.config.ts`, which makes them deployable to static hosts like **GitHub Pages**. However, **doing so is NOT recommended for NotesBazi** because static exports disable server-side runtimes.
* If exported statically:
  * **Server Actions** (used for uploading notes, adding ratings, and managing reports) will fail.
  * **Supabase SSR Middleware** (used for server-side auth checks and redirecting unauthorized users) will not execute.
* **Verdict**: Use **Vercel** or **Netlify** to host this project to keep all features fully functional.
