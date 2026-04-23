# **App Name**: Falaah - Smart Ibadah Tracker v.1.0

## Core Features:

- Daily Ibadah & Progress Tracker (Santri): Comprehensive checklist for daily religious activities including prayers (Wajib, Sunnah), Quran recitation (with Tilawah pages/verses & Setoran Hafalan input), daily activities (Sahur, Puasa, Terawih, Sedekah), Dzikir, and Murottal 'Playtime'. Users can set personal daily goals.
- Gamified Progression System: An EXP system rewards users for completing activities (e.g., Sholat = 50 EXP, Tilawah = 100 EXP), leading to rank tiering (Warrior to Mythic) with a visual progress bar. Includes a streak system for consistent Wajib prayer completion.
- Instructor's Verification & Management Console: A dashboard for Ustadz to manage students, review and mark 'Setoran Hafalan Tahfidz' as 'Verified' or 'Need Revision', and award 'Mumtaz Bonus' (+200 EXP) for excellent recitation.
- Parent's Read-Only Progress Monitor: A portal for Wali to link with a child's Student ID, view real-time activity feeds, and receive achievement notifications when the child levels up or reaches a new rank.
- Role-Based Access Control (RBAC): Secure authentication (Google Login, Email/Password) and authorization using Firebase Auth, redirecting users to specific dashboards based on their role (Santri, Pengajar/Ustadz, or Wali) as defined in Firestore.
- Personalized Motivational AI Insight: Integrates the Gemini API via Cloud Functions to generate custom motivational messages based on user progress and goals (e.g., 'you are 200 EXP away from reaching Rank Legend! Let's complete your Dzikir!'), leveraging an AI tool for personalized encouragement.

## Style Guidelines:

- The base color scheme is a deep dark mode. The background color is '#09090B' for a profound, clean canvas that is nearly black.
- Card and surface elements use '#151921', a slightly lighter, desaturated dark blue-grey hue, to provide subtle depth and separation against the primary background.
- The primary accent color is Emerald '#10B981', chosen to symbolize growth, renewal, and vitality, providing a strong visual contrast and vibrant pop on the dark theme.
- A secondary accent color is Gold '#F59E0B', used strategically for gamification elements, rewards, and highlights to convey achievement, warmth, and prestige.
- Critical actions or warnings are highlighted with Danger Red '#EF4444', ensuring immediate noticeability for error states or important notifications.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, slightly technical, and 'gamified' aesthetic, providing clear emphasis. Body font: 'Inter' (sans-serif) for clean readability, professionalism, and versatility across different content types, especially longer text blocks.
- All menu items, functional buttons, and key interactive elements consistently utilize 'Lucide Icons', providing a unified, modern, and outline-based visual language throughout the application.
- The design will follow Glassmorphism principles, using modern card components, and ensuring a mobile-first, fully responsive approach for a premium and consistent user experience across all device sizes.
- Smooth, fluid, and subtle transitions between UI states, screens, and interactive elements, inspired by Framer Motion's style, to enhance user engagement and contribute to the app's modern, 'gamified' feel.