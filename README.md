# 🏥 MediCare

A full-stack Hospital Management System built using the **MERN Stack** that streamlines healthcare management by connecting patients, doctors, and administrators through a modern web application.

MediCare provides an intuitive platform for booking appointments, managing doctors, processing online payments, and handling hospital operations through dedicated user and admin interfaces.

---

## ✨ Features

### 👤 Patient Portal
- User Registration & Login
- Browse Doctors by Specialty
- Book Appointments
- View Upcoming Appointments
- Cancel Appointments
- Online Payment Integration
- Responsive User Interface

### 👨‍⚕️ Doctor Management
- Doctor Profiles
- Specialty-based Categorization
- Availability Management
- Profile Images via Cloudinary

### 🛠️ Admin Dashboard
- Secure Admin Authentication
- Add New Doctors
- Manage Doctor Information
- View All Appointments
- Monitor Hospital Activities

### 🔒 Security
- JWT Authentication
- Protected Routes
- Password Encryption
- Secure REST APIs

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary

## Database
- MongoDB Atlas

---

# 📁 Project Structure

```
MediCare
│
├── frontend          # Patient/User Website
│
├── admin             # Admin Dashboard
│
├── backend           # REST API & Database
│
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Rishav20Kapoor/MediCare.git
cd MediCare
```

---

## 2. Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

### Admin

```bash
cd ../admin
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=4000

MONGODB_URI=Your MongoDB URI

JWT_SECRET=Your Secret Key

CLOUDINARY_CLOUD_NAME=Your Cloudinary Name
CLOUDINARY_API_KEY=Your API Key
CLOUDINARY_API_SECRET=Your API Secret

STRIPE_SECRET_KEY=Your Stripe Secret Key
```

---

# ▶️ Running the Project

### Start Backend

```bash
cd backend
npm run server
```

### Start Frontend

```bash
cd frontend
npm run dev
```

### Start Admin Dashboard

```bash
cd admin
npm run dev
```

---


# 🔗 API Overview

Some of the major REST APIs include:

### Authentication
- Register User
- Login User

### Doctors
- Get All Doctors
- Add Doctor
- Update Doctor

### Appointments
- Book Appointment
- Cancel Appointment
- Get User Appointments

### Admin
- Admin Login
- Dashboard Statistics

---

# 🎯 Learning Outcomes

This project helped in gaining hands-on experience with:

- Full Stack MERN Development
- REST API Design
- Authentication using JWT
- MongoDB Database Design
- Cloudinary Image Upload
- Payment Gateway Integration
- State Management
- Responsive UI Development
- Secure Backend Architecture

---

# 📌 Future Improvements

- Email Notifications
- Video Consultation
- Medical Records Management
- Prescription Upload
- Appointment Reminders
- Analytics Dashboard

---

# 👨‍💻 Author

**Rishav Kapoor**

- GitHub: https://github.com/Rishav20Kapoor
- LinkedIn: https://www.linkedin.com/in/rishav-kapoor-3160b51b7/

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates further development.
