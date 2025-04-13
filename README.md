Web Quiz Application
A secure and interactive quiz platform built with Next.js 14, MongoDB, and Next-Auth. This application allows teachers to create, manage, and assign quizzes to students, while students can take quizzes and view their results.

Features

🔐 Secure authentication with role-based access (Teacher/Student)
📝 Quiz creation and management
👥 Group management for organizing students
📊 Quiz assignment with customizable settings
🎯 Real-time quiz taking experience
🔄 Automatic grading system
📱 Responsive design using Tailwind CSS
🎨 Modern UI with shadcn/ui components

Tech Stack

Framework: Next.js 14 (App Router)
Database: MongoDB
Authentication: Next-Auth
Styling: Tailwind CSS
UI Components: shadcn/ui
Form Handling: React Hook Form
Types: TypeScript
State Management: React Context + Hooks

Project Structure
text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── teacher/
│   │   └── student/
│   └── api/
├── components/
│   ├── ui/
│   └── forms/
├── lib/
│   ├── db.ts
│   └── auth.ts
├── models/
│   ├── user.ts
│   └── quiz.ts
└── types/
Getting Started
