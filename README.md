# SmartMarks: Real-Time Bookmark Manager
SmartMarks is a high-performance, real-time web application designed to store and manage your favorite links with a focus on speed and privacy. Built with the MERN stack's modern alternatives—Next.js and Supabase—it features seamless Google Authentication and instant database synchronization.

## ✨ Features
- Google OAuth Integration: Secure one-click login via Supabase Auth.

- Real-Time Sync: Add or delete bookmarks and see changes reflect instantly across all devices without page refreshes.

- Private Vault: Each user's bookmarks are protected by Row Level Security (RLS).

- Deep Slate UI: A modern, high-contrast dark theme designed for focus and legibility.

- Responsive Design: Fully optimized for mobile, tablet, and desktop viewing.

## 🛠️ Tech Stack
- Frontend: Next.js 15+ (App Router), Tailwind CSS v4

- Backend: Supabase (PostgreSQL)

- Real-time: Supabase Realtime (WebSockets)

- Icons: Lucide React

- Deployment: Vercel

## 🚀 Getting Started
### Prerequisites
- Node.js 18.x or later

- A Supabase Project

### Installation
Clone the repository:

```Bash
git clone https://github.com/YOUR_USERNAME/smart-bookmarks.git
cd smart-bookmarks
```
Install dependencies:

```Bash
npm install
```
Configure Environment Variables:
Create a .env.local file in the root directory and add your credentials:

```Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run the development server:
```Bash
npm run dev
```
## 🔒 Security & Privacy
This project implements strict Row Level Security (RLS). No user can access or modify links created by another user, as the database filters every request using auth.uid() = user_id.
