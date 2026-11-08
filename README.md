# 📦 BorrowBox — A Community-Based Sharing and Borrowing Platform

> **BCA FYUGP Mini Project**  
> **Guiding Principle:** *“Don’t Buy It. Borrow It. Share It. Reuse It.”*

---

## 🌟 1. Project Introduction
In today's world, many people purchase items such as cameras, power tools, books, sports equipment, camping gear, musical instruments, and electronic devices that end up being used only occasionally. These items often remain idle for long periods after purchase, while other individuals nearby may need the very same items temporarily but are unwilling or unable to buy them outright.

**BorrowBox** is a digital community-based sharing platform built around the principle of **“Borrow Instead of Buy.”** The platform allows item owners to list products they are willing to lend, while borrowers can search for required items by category, location, and availability, and send borrowing requests directly to owners. The system manages the entire lifecycle of a transaction — from request and approval, to handover, active borrowing, return, and finally rating and review.

---

## 🚀 2. System Architecture & Modules

### **Module 1: User Registration, Login & Profile**
- Account creation with Name, Email, Phone, Password, Location, and Bio.
- Secure JWT authentication with bcrypt password encryption.
- Verification status badge and trust scores.
- Combined borrowing and lending activity history.

### **Module 2: Item Listing & Discovery**
- Owners list items with name, category, description, photos, condition, location, optional security deposit, and maximum borrowing duration.
- Multi-criteria discovery: Search by keyword, filter by category, condition, location, and real-time availability.

### **Module 3: Borrowing Request, Management & Notifications**
- Borrower submits start date, return date, and purpose.
- **Transaction Lifecycle Engine**:
  $$\text{Requested} \longrightarrow \text{Approved} \longrightarrow \text{Active (Handed Over)} \longrightarrow \text{Returned} \longrightarrow \text{Completed}$$
- In-app notification center for approvals, handovers, and return alerts.

### **Module 4: Rating, Trust Score & Admin Panel**
- Two-way ratings and reviews after completed transactions.
- Automated Trust Score computation (1.0 to 5.0 stars).
- **Admin Control Panel**:
  - Verification of user identities.
  - Category management (add/remove categories).
  - Listing moderation (approve, flag, or hide inappropriate items).
  - Dispute and report handling.

---

## 🛠️ 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive web interface for borrowers and owners |
| **Backend** | Node.js, Express.js, REST API | Business logic, authentication, request lifecycle |
| **Database** | SQLite (zero-config, self-contained) | Users, items, requests, reviews, notifications, disputes |
| **Security** | JWT (JSON Web Tokens), bcryptjs | Role-based access control, encrypted passwords |

---

## 🔑 4. Pre-Configured Demo Accounts (Viva / Evaluator Ready)

The system is pre-seeded with realistic community data and includes a **1-Click Demo Login Switcher** in the navigation bar and login screen:

| Role | Name | Email | Password | Pre-loaded Context |
|---|---|---|---|---|
| **Admin** | System Admin | `admin@borrowbox.com` | `admin123` | Full access to user verification, categories, moderation & disputes |
| **Owner / Lender** | Priya Sharma | `priya@example.com` | `password123` | Lists Sony Camera & DJI Drone; manages incoming requests |
| **Borrower / Student** | Rahul Verma | `rahul@example.com` | `password123` | Student borrower with active tool loan & textbook listing |

---

## 🏃 5. How to Run BorrowBox

### **Prerequisites**
- Node.js (v18 or higher)
- npm

### **Option A: Run Both Server & Client Concurrently (Recommended)**
From the root project folder:
```powershell
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

### **Option B: Run Individually**

**1. Start Backend Server:**
```powershell
cd server
node src/server.js
```

**2. Start Frontend Client (in a separate terminal):**
```powershell
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔄 6. Complete Transaction Lifecycle Walkthrough (For Demonstration)

1. **Sign in as Borrower (Rahul)**:
   - Click *“Viva Demo Mode: Rahul”*.
   - Go to **Explore Items**, find **“Yamaha F310 Acoustic Guitar”** or **“Sony Alpha Camera”**.
   - Click **Borrow**, choose dates, enter a reason, and submit the request.
2. **Switch to Owner (Priya / Ananya)**:
   - Go to **Exchange Dashboard ➔ As Lender / Owner**.
   - See the incoming request and click **Approve Request**.
   - When meeting physically, click **Confirm Physical Handover (Mark Active)**.
3. **Return & Rating**:
   - Once the borrowing period concludes, click **Confirm Item Safely Returned**.
   - Click **Close Transaction (Completed)**.
   - Both parties click **Rate Experience** to give 5-star reviews and feedback.
   - The user's **Trust Score** updates dynamically on their Profile!
4. **Admin Inspection**:
   - Switch to **Admin** via the Navbar demo switcher.
   - Open **Admin Panel** to see updated platform statistics, toggle user verification badges, and inspect activity.

