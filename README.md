# 🏥 Smart Hospital Queue and Appointment Management System

> A real-time MERN Stack based Hospital Queue & Appointment Management System that reduces patient waiting time using dynamic queue management, live estimated consultation times, and Socket.IO powered real-time updates.

---

## 📖 Overview

The **Smart Hospital Queue and Appointment Management System** is a web-based application designed to improve hospital workflow and enhance the patient experience.

Unlike traditional appointment systems that only provide a token number, this system predicts an **Estimated Reporting Time** during booking and continuously updates it according to the doctor's real-time consultation progress.

The system consists of four major modules:

- 👤 Patient Portal
- 🏥 Reception Panel
- 👨‍⚕️ Doctor Assistant Panel
- ⚙️ Admin Dashboard

Using **Socket.IO**, queue updates are reflected instantly for all connected users without refreshing the page.

---

# 🚀 Features

## 👤 Patient Portal

- Register & Login
- Choose City
- View Hospitals
- Select Department
- Select Doctor
- Book Appointment
- Receive Booking Number
- View Estimated Reporting Time
- Track Live Queue
- Receive Real-Time Updates
- View Appointment History
- Cancel Appointment

---

## 🏥 Reception Panel

Reception staff can:

- Search Booking Number
- Verify Patient
- Collect Consultation Fee
- Update Payment Status
- Mark Patient as Arrived
- Move Patient to Doctor Queue
- Handle Emergency Priority (Optional)

---

## 👨‍⚕️ Doctor Assistant Panel

- View Verified Patients
- Call Next Patient
- Mark Consultation Started
- Mark Consultation Completed
- Update Patient Status
- Automatically Update Remaining Queue

---

## ⚙️ Admin Dashboard

Admin can manage:

- Cities
- Hospitals
- Departments
- Doctors
- Reception Staff
- Patients
- Reports
- Live Queue
- Daily Statistics

---

# 💡 Problem Statement

Traditional hospital appointment systems suffer from:

- Long waiting time
- Overcrowded waiting areas
- No live queue tracking
- Manual patient verification
- Poor patient experience
- Static appointment timings

This project solves these issues using a **real-time queue management system**.

---

# ✅ Proposed Solution

Patients can book appointments online.

During booking, the system:

- Generates a unique Booking Number
- Assigns Queue Number
- Calculates Estimated Reporting Time
- Stores the patient in the doctor's queue

When the patient arrives:

1. Reception verifies the booking.
2. Consultation fee is collected.
3. Patient moves to the doctor's waiting queue.
4. Doctor Assistant calls the next patient.
5. Consultation starts.
6. After completion, queue updates automatically.

Every completed consultation recalculates the waiting time of all remaining patients in real time.

---

# 🔄 System Workflow

## Step 1 – Appointment Booking

Patient selects:

- City
- Hospital
- Department
- Doctor
- Date

System generates:

- Booking Number (Example: **BK-2026-00125**)
- Queue Number
- Estimated Reporting Time

Estimated time is calculated using:

- Existing Queue
- Doctor Availability
- Average Consultation Duration
- Booking Sequence

---

## Step 2 – Patient Arrival

Reception verifies:

- Booking Number
- Patient Details
- Appointment
- Payment

Status changes to:

**Verified**

Patient is moved to the doctor's queue.

---

## Step 3 – Consultation

Doctor Assistant:

- Calls Next Patient
- Starts Consultation
- Completes Consultation

---

## Step 4 – Automatic Queue Update

After every completed consultation:

- Completed patient is removed
- Queue shifts automatically
- Estimated times are recalculated
- Patient dashboards update instantly
- Live notifications are sent

No page refresh is required.

---

# ⏰ Dynamic Estimated Time

Example:

Doctor Start Time: **10:00 AM**

Average Consultation Duration: **10 Minutes**

### Initial Queue

| Queue | Estimated Time |
|--------|----------------|
| 1 | 10:00 AM |
| 2 | 10:10 AM |
| 3 | 10:20 AM |
| 4 | 10:30 AM |
| 5 | 10:40 AM |

Suppose Patient 1 finishes in **6 minutes**.

### Updated Queue

| Queue | Updated Time |
|--------|--------------|
| 2 | 10:06 AM |
| 3 | 10:16 AM |
| 4 | 10:26 AM |
| 5 | 10:36 AM |

If consultations take longer than expected, the system automatically delays the remaining estimated times.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- HTML5
- CSS3
- JavaScript (ES6)
- Tailwind CSS / Bootstrap

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT Authentication
- Bcrypt

## Real-Time Communication

- Socket.IO

## Optional Integrations

- Cloudinary
- Email Notifications
- SMS Notifications

---

# 📂 Database Collections

## Users

```javascript
{
  _id,
  name,
  email,
  phone,
  password,
  role
}
```

## Cities

```javascript
{
  _id,
  cityName
}
```

## Hospitals

```javascript
{
  _id,
  hospitalName,
  cityId,
  address
}
```

## Departments

```javascript
{
  _id,
  departmentName
}
```

## Doctors

```javascript
{
  _id,
  hospitalId,
  departmentId,
  doctorName,
  specialization,
  consultationDuration,
  availability
}
```

## Appointments

```javascript
{
  _id,
  bookingNumber,
  patientId,
  doctorId,
  hospitalId,
  appointmentDate,
  queueNumber,
  estimatedTime,
  paymentStatus,
  appointmentStatus,
  arrivalTime
}
```

## Queue

```javascript
{
  _id,
  doctorId,
  currentToken,
  nextPatient,
  averageConsultationTime
}
```

---

# ⚡ Real-Time Features

Using **Socket.IO**

- Live Queue Updates
- Live Estimated Time Updates
- Instant Status Changes
- Reception Notifications
- Doctor Notifications
- Patient Notifications

---

# 👥 User Roles

### 👤 Patient

- Book Appointment
- Track Queue
- View Estimated Time
- View Appointment History
- Cancel Appointment

### 🏥 Reception

- Verify Booking
- Collect Payment
- Mark Arrival
- Send Patient to Queue

### 👨‍⚕️ Doctor Assistant

- Call Next Patient
- Start Consultation
- Complete Consultation
- Update Queue

### ⚙️ Admin

- Manage Cities
- Manage Hospitals
- Manage Departments
- Manage Doctors
- Manage Users
- Monitor Queue
- Generate Reports

---

# 📁 Project Structure

```
Smart-Hospital-Queue-System/
│
├── client/
│   ├── src/
│   ├── public/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── sockets/
│   ├── config/
│
├── package.json
├── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/Smart-Hospital-Queue-System.git
```

## Backend

```bash
cd server
npm install
npm run dev
```

## Frontend

```bash
cd client
npm install
npm start
```

---

# 📸 Screenshots

Add screenshots here after completing the project.

- Home Page
  <img width="1900" height="912" alt="Screenshot 2026-07-21 061835" src="https://github.com/user-attachments/assets/0a11f06d-2b86-4e76-b421-4da69bddfc0a" />

- Patient Dashboard
  <img width="1913" height="886" alt="Screenshot 2026-07-21 062122" src="https://github.com/user-attachments/assets/8ec46aa7-998e-4907-a194-5f9c0738ad9c" />

- Reception Panel
  <img width="1917" height="903" alt="Screenshot 2026-07-21 062640" src="https://github.com/user-attachments/assets/27404f2e-cb92-452c-88a6-46dd4143d937" />

- Doctor Assistant Panel
  <img width="1917" height="912" alt="Screenshot 2026-07-21 062837" src="https://github.com/user-attachments/assets/e736a2b3-e59f-457f-8a64-cbd185081dd6" />

- Admin Dashboard
  <img width="1862" height="767" alt="Screenshot 2026-07-21 063001" src="https://github.com/user-attachments/assets/86443454-2d25-4b8f-8972-369ee81a8c16" />

- Live Queue
 <img width="1911" height="817" alt="Screenshot 2026-07-21 063045" src="https://github.com/user-attachments/assets/dddc14e8-48f8-4523-9e10-a64b5527d808" />

- Appointment Booking
   <img width="1902" height="867" alt="Screenshot 2026-07-21 062351" src="https://github.com/user-attachments/assets/fee79652-c4af-417c-8994-438e34650d74" />

 
---

# 🚀 Future Enhancements

- QR Code Check-in
- WhatsApp Notifications
- SMS Alerts
- Online Payment Gateway
- AI-Based Waiting Time Prediction
- Video Consultation
- Electronic Medical Records (EMR)
- Prescription Upload
- Lab Report Integration
- Multi-Hospital Support
- React Native Mobile App

---

# 🎯 Advantages

- Reduces patient waiting time
- Prevents overcrowding
- Live queue tracking
- Dynamic estimated consultation time
- Better hospital workflow
- Improves doctor productivity
- Paperless system
- Easily scalable

---

# 🌟 Key Innovation

The main innovation of this project is the **Dynamic Estimated Reporting Time**.

Instead of assigning only a token number, the system continuously recalculates every patient's expected consultation time whenever a consultation finishes earlier or later than expected.

Using **Socket.IO**, updates are pushed instantly to patients, reception staff, and doctor assistants, reducing unnecessary waiting and improving hospital efficiency.

---

# 👨‍💻 Author

**Pratham Kumar**

**B.Tech - Computer Science & Information Technology**

**MERN Stack Developer**

---

## ⭐ If you found this project helpful, don't forget to Star ⭐ the repository.
