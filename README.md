
# Web Quizz 
Quentin & Salomé & Leo

A modern quiz management system built with Next.js 14, MongoDB, and NextAuth. This application allows teachers to create, manage, and assign quizzes to students, while students can take quizzes and view their results.

## 🚀 Features

### Authentication System
- Role-based access (Teacher/Student)
- Secure password handling
- Protected routes and API endpoints

### Teachers
- Create and manage quizzes
- Add and edit questions
- Assign quizzes to groups
- View student results
- Customize quiz settings
- Student Features

### Student
- Take assigned quizzes
- View quiz history
- Track progress
- Join groups


```
src/
└── app/
    ├── (auth)/
    │   ├── login/
    │   └── register/
    ├── (dashboard)/
    │   ├── dashboard/
    │   ├── grades/
    │   ├── groups/
    │   ├── join/
    │   ├── quiz/
    │   |   ├── attempt/
    │   |   ├── manage/
    │   |   └── results/
    │   └── settings/
    └── api/
        ├── auth/
        ├── grades/
        ├── goups/
        ├── profile/
        ├── quiz/
        └── users/
```

