# 🏛️ Sumbang - Community Report System

<div align="center">

**Empowering Communities Through Digital Reporting**

A comprehensive platform for citizens to report infrastructure needs and track government responses in real-time.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [⚡ Quick Start](#-quick-start)
- [🔧 Installation Guide](#-installation-guide)
- [⚙️ Configuration](#️-configuration)
- [🎯 Usage](#-usage)
- [📧 Email Notifications](#-email-notifications)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📊 System Requirements](#-system-requirements)
- [🤝 Contributing](#-contributing)

---

## 🌟 Features

### 👥 **For Citizens**
- 📝 **Easy Report Submission** - Submit repair/procurement requests to government institutions
- 📊 **Real-time Tracking** - Monitor your report status with detailed timestamps
- 📧 **Email Notifications** - Receive updates when your reports are processed
- 🕒 **Complete History** - View all your submitted reports and their progress

### 🏛️ **For Administrators**
- 📋 **Report Management** - Accept, reject, hold, process, or complete reports
- 🗂️ **Comprehensive Dashboard** - View all reports with filtering and sorting options
- 🧹 **Duplicate Detection** - Identify and remove duplicate reports
- 📧 **Automated Notifications** - Send email updates to users automatically
- 🏠 **Content Management** - CRUD operations for homepage content
- 📈 **Analytics & Reporting** - Track system usage and report statistics

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│     👤 Citizen   │    │  👨‍💼 Admin      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
    ┌─────────────────────────────────┐
    │     🌐 Frontend (React)        │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │      🔗 API Gateway             │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │    ⚡ Backend (Node.js)         │
    └─────┬───────────┬───────────────┘
          │           │
          ▼           ▼
┌─────────────┐ ┌─────────────────┐
│🗄️ MySQL DB │ │📧 Email Service │
└─────────────┘ └─────────────────┘
```

**Security Layer:** 🔑 JWT Authentication | 🛡️ Input Validation

---

## ⚡ Quick Start

### Prerequisites
- 🟢 **Node.js** (v14 or higher)
- 🐬 **MySQL** (v8.0 or higher)
- 📧 **Gmail Account** (for email notifications)

---

## 🔧 Installation Guide

### 📊 **Step 1: Database Setup**

1. **Import the database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE sumbang_db;
   USE sumbang_db;
   SOURCE backend/sumbang_db.sql;
   ```

2. **Verify installation:**
   ```sql
   SHOW TABLES;
   ```

---

### 🔙 **Step 2: Backend Configuration**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
npm install winston
npm install nodemailer

# Start the server
node index.js
```

**Expected Output:**
```
🚀 Server running on port 5000
📊 Database connected successfully
📧 Email service initialized
```

---

### 🎨 **Step 3: Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
npm install react-icons

# Start development server
npm start
```

### 🎨 **Step 4: Anti DDoS Attack ML(RF)**
```bash
cd backend/ml
npm install axios
python -m venv venv
venv\Scripts\activate
pip install flask scikit-learn pandas joblib
pip install waitress
pip install matplotlib
pip install seaborn
python train_ddos_model.py 
python rf_server.py

```


**Your app will open at:** `http://localhost:3000`

---

## ⚙️ Configuration

### 🔙 **Backend Environment (`backend/.env`)**

```env
# 🗄️ Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sumbang_db
PORT=5000

# 🔐 Security (DO NOT CHANGE)
# JWT_SECRET=3TmCjg1X2BaL7YuzoBem

# 📧 Email Configuration
EMAIL_USER=tumbalmagang@gmail.com 
//ganti email kamu
EMAIL_PASS=rwpjrefqpoctlhqy 
//ganti sandi apikasi kamu
```

**⚠️ Important Notes:**
- Replace `EMAIL_USER` with your actual Gmail address
- Replace `EMAIL_PASS` with your Gmail app-specific password
- The example email and password shown above are just samples

### 🎨 **Frontend Environment (`frontend/.env`)**

```env
# 🌐 API Configuration
REACT_APP_API_URL=http://localhost:5000
```

### 📧 **Setting up Gmail for Email Notifications**

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password:**
   - Go to Google Account settings
   - Navigate to: Security → 2-Step Verification
   - Click on: App passwords → Generate new password
   - Select app: Mail, Select device: Other (Custom name)
   - Enter: "Sumbang App"
3. **Use the 16-character password** in `EMAIL_PASS` field

---

## 🎯 Usage

### 👤 **For Citizens**

**📝 Submit a Report**
```
1. Open the website
2. Click "Submit New Report"
3. Fill out the form with:
   - Report title
   - Detailed description
   - Your contact information
   - Location details
4. Submit the report
5. Receive confirmation email
```

**📊 Track Your Reports**
```
1. Go to "My Reports" section
2. View all your submitted reports
3. Check current status:
   - 📝 Submitted
   - 👀 Under Review
   - ⏳ On Hold
   - 🔄 In Progress
   - ✅ Completed
   - ❌ Rejected
4. View detailed timeline for each report
```

### 👨‍💼 **For Administrators**

**📋 Manage Reports**
```
1. Access Admin Panel
2. View all incoming reports
3. Available actions:
   - ✅ Accept - Move report to processing queue
   - ❌ Reject - Decline report with reason
   - ⏸️ Hold - Pause processing temporarily
   - 🔄 Process - Mark as currently being worked on
   - ✅ Complete - Mark as finished
   - 🗑️ Delete - Remove duplicate entries
```

**🏠 Content Management**
```
1. Navigate to Content Management
2. Manage homepage sections:
   - 📝 Create new content blocks
   - 👀 View existing content
   - ✏️ Edit content and descriptions
   - 🗑️ Delete outdated content
```

---

## 📧 Email Notifications

The system automatically sends email notifications for these events:

### 📬 **Notification Types**

| Event | Recipient | When It's Sent |
|-------|-----------|----------------|
| 📝 **New Report Submitted** | User + Admin | Immediately after submission |
| ✅ **Report Accepted** | User | When admin accepts the report |
| ❌ **Report Rejected** | User | When admin rejects the report |
| ⏸️ **Report On Hold** | User | When admin puts report on hold |
| 🔄 **Report In Progress** | User | When admin starts processing |
| ✅ **Report Completed** | User | When admin marks as done |

### 📧 **Email Features**
- **Professional templates** with clear formatting
- **Report details** included in each notification
- **Status tracking links** for easy access
- **Admin contact information** for follow-ups
- **Timestamp information** for transparency

---

## 🛠️ Troubleshooting

### 🔴 **Database Connection Issues**

**Problem:** `Error: ER_ACCESS_DENIED_FOR_USER`

**Solutions:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check MySQL connection
mysql -u root -p -e "SELECT 1;"

# Reset MySQL root password if needed
sudo mysql_secure_installation
```

---

### 📧 **Email Service Issues**

**Problem:** `Error: Invalid login: 534-5.7.9 Application-specific password required`

**Solutions:**
1. **Verify 2FA is enabled** on your Gmail account
2. **Generate new app password:**
   - Google Account → Security → 2-Step Verification → App passwords
3. **Use the 16-character app password** (not your regular Gmail password)
4. **Check EMAIL_USER format:** should be complete email address

**Problem:** `Error: connect ETIMEDOUT`

**Solutions:**
- Check internet connection
- Verify firewall settings
- Try different SMTP settings if needed

---

### 🌐 **Frontend Connection Issues**

**Problem:** `Network Error` or `Cannot connect to backend`

**Solutions:**
```bash
# Verify backend is running
curl http://localhost:5000

# Check if port 5000 is in use
netstat -tulpn | grep 5000

# Restart backend server
cd backend
node index.js

# Check frontend environment
cat frontend/.env
```

---

### 🐛 **Common Development Issues**

**Problem:** `Module not found errors`

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version compatibility
node --version
npm --version
```

---

## 📊 System Requirements

### 💻 **Minimum Requirements**
| Component | Specification |
|-----------|---------------|
| **Operating System** | Windows 10, macOS 10.14, Ubuntu 18.04 |
| **RAM** | 2 GB available memory |
| **Storage** | 1 GB free disk space |
| **Node.js** | Version 14.0 or higher |
| **MySQL** | Version 8.0 or higher |
| **Browser Support** | Chrome 90+, Firefox 88+, Safari 14+ |

### 🚀 **Recommended Requirements**
| Component | Specification |
|-----------|---------------|
| **RAM** | 4 GB+ for optimal performance |
| **Storage** | 5 GB+ for logs and database growth |
| **Node.js** | Version 18.0+ (LTS) |
| **MySQL** | Version 8.0.30+ |
| **Network** | Stable internet for email notifications |

### 🌐 **Browser Compatibility**
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+
- ❌ **Internet Explorer** (Not supported)

---

## 🔒 Security Features

### 🛡️ **Built-in Security**
- 🔑 **JWT Authentication** - Secure session management
- 🔐 **Password Hashing** - bcrypt encryption for passwords
- 🛡️ **SQL Injection Protection** - Parameterized queries
- 🚫 **XSS Prevention** - Input sanitization
- 🔒 **CORS Configuration** - Controlled API access
- 📧 **Email Validation** - Prevent spam and abuse

### 🔐 **Security Best Practices**
- Regular security updates
- Environment variable protection
- Input validation on all forms
- Rate limiting for API endpoints
- Secure email handling

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🌟 **How to Contribute**

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **💻 Make your changes**
4. **✅ Test thoroughly**
5. **💾 Commit with clear message**
   ```bash
   git commit -m "Add: amazing new feature"
   ```
6. **📤 Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **🔄 Create a Pull Request**

### 🐛 **Reporting Bugs**
- Use the issue tracker
- Include steps to reproduce
- Provide system information
- Add screenshots if helpful

### 💡 **Feature Requests**
- Check existing issues first
- Describe the feature clearly
- Explain the use case
- Consider implementation impact

---

## 📞 Support & Contact

### 🆘 **Getting Help**

**📚 Documentation Issues**
- Check this README first
- Look for similar issues in the repository
- Search closed issues for solutions

**🐛 Bug Reports**
- Create detailed issue reports
- Include error messages and logs
- Provide steps to reproduce

**💬 Community Support**
- Join discussions in the issues section
- Help other users with their questions
- Share your implementation experiences

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License - Free for personal and commercial use
✅ Commercial use    ✅ Modification    ✅ Distribution
✅ Private use      ✅ Patent use      ❌ Liability
                                      ❌ Warranty
```

---

<div align="center">

**🏛️ Sumbang - Community Report System**

*Bridging the gap between citizens and government through technology*

**Made with ❤️ for stronger communities**

---

**Tech Stack:** React + Node.js + MySQL + Express.js

**Version:** 1.0.0 | **Last Updated:** 2025

</div>