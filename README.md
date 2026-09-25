# 🏫 CampusCare System

> A digital campus complaint management system for complaint submission, tracking, review, and resolution.

## 📌 Overview

**CampusCare System** is a web-based college complaint management platform with separate dashboards for students, principals, coordinators, and administrators.

Students can submit complaints and track their status, while authorized college personnel can review complaints, update statuses, provide responses, and manage portal activity.

The project uses **Firebase Authentication** and **Cloud Firestore**.

---

## ✨ Features

### 👨‍🎓 Student Portal
- Student registration and login
- Firebase authentication
- Submit new complaints
- View submitted complaints
- Track complaint status
- View principal responses
- Logout
- Password visibility toggle

### 👨‍💼 Principal Portal
- Principal authentication
- Complaint statistics
- View and review complaints
- Update complaint status
- Add responses
- Complaint resolution workflow

### 👨‍💻 Coordinator Portal
- Coordinator authentication
- View resolved complaints
- Record student notifications
- Coordinator profile
- Responsive sidebar navigation

### 🛠️ Admin Portal
- Admin authentication
- User and complaint statistics
- User management
- Complaint management
- Search and filtering
- Recent activity
- Complaint details
- Role-based access

---

## 🔐 User Roles

| Role | Main Responsibilities |
|------|------------------------|
| Student | Submit and track complaints |
| Principal | Review complaints, update status, and provide responses |
| Coordinator | Handle resolved complaints and student notifications |
| Admin | Manage users, complaints, and portal activity |

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend / Database
- Firebase Authentication
- Firebase Firestore

### Tools
- Visual Studio Code
- Git
- GitHub

---

## 📂 Project Structure

```text
CampusCare-System/
│
├── assets/
├── css/
├── js/
│   ├── firebase-config.js
│   ├── login.js
│   ├── auth.js
│   ├── student-dashboard.js
│   ├── my-complaints.js
│   ├── principal-dashboard.js
│   ├── coordinator-dashboard.js
│   ├── admin-dashboard.js
│   └── ...
│
├── login.html
├── register.html
├── student-dashboard.html
├── submit-complaint.html
├── my-complaints.html
├── principal-dashboard.html
├── coordinator-dashboard.html
├── admin-dashboard.html
├── .gitignore
└── README.md
```

---

## 🔄 Complaint Workflow

```text
Student
   │
   ▼
Submit Complaint
   │
   ▼
Complaint Stored in Firestore
   │
   ▼
Principal Reviews Complaint
   │
   ├───────────────┐
   │               │
   ▼               ▼
Under Review     Resolved
   │               │
   │               ▼
   │          Coordinator
   │               │
   │               ▼
   │        Student Notification
   │
   ▼
Principal Response
   │
   ▼
Student Tracks Status
```

---

## 🔥 Firebase

### Firebase Authentication

Used for:
- User registration
- User login
- Authentication sessions
- Firebase UID identification
- Role-based access

### Cloud Firestore

Stores application data such as:
- User profiles
- Student IDs
- Roles
- Complaints
- Complaint statuses
- Principal responses
- Timestamps
- Activity information

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jitendrachoudhary1401-hue/CampusCare-System.git
```

### 2. Open the project

```bash
cd CampusCare-System
```

Open the folder in Visual Studio Code.

### 3. Configure Firebase

Configure Firebase Authentication and Firestore for your Firebase project.

Update:

```text
js/firebase-config.js
```

with the appropriate Firebase web configuration.

### 4. Run the project

Run the project using a local development server such as VS Code Live Server.

Do not open the HTML files directly using `file://`, because Firebase modules require a proper local server environment.

---

## 🔒 Security

The project uses Firebase Authentication and Firestore security rules for access control.

The repository excludes unnecessary or sensitive files through `.gitignore`.

Do **not** upload:

```text
.env
serviceAccountKey.json
firebase-adminsdk*.json
node_modules/
.cache/
```

---

## 📊 Complaint Status

| Status | Meaning |
|--------|---------|
| Pending | Complaint is awaiting review |
| Under Review | Complaint is currently being reviewed |
| Resolved | Complaint has been resolved |
| Rejected | Complaint has been rejected |

---

## 🎯 Project Goals

CampusCare aims to provide:

- Centralized campus complaint management
- Easier complaint submission
- Complaint status tracking
- Role-based access
- Organized complaint resolution
- Better communication between students and administrators
- A structured digital complaint workflow

---

## 🔮 Future Scope

Potential future improvements:

- Email notifications
- Push notifications
- Complaint priority levels
- File and image attachments
- Advanced analytics
- Complaint escalation
- Department-wise complaint routing
- Automated complaint categorization
- Mobile application
- Advanced reporting

---

## 👥 Project

**CampusCare System**

A college web development project.

### Built With

```text
HTML • CSS • JavaScript • Firebase • Firestore
```

---

## 📜 License

This project is intended for educational and project-development purposes.
