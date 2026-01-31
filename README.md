# 🩸 Blood Bank Management System

A comprehensive web-based blood bank management system built with modern web technologies. This system helps manage blood donors, track inventory, and handle blood requests efficiently.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 👥 **Donor Management**
  - Register new donors with complete information
  - Track donation history
  - Search donors by blood type
  - Validate eligibility criteria

- 💉 **Blood Inventory Management**
  - Real-time inventory tracking
  - Automatic stock updates
  - Low stock alerts
  - Blood type categorization (A+, A-, B+, B-, AB+, AB-, O+, O-)

- 📋 **Blood Request System**
  - Submit blood requests with urgency levels
  - Check availability before approval
  - Track request status
  - Contact information management

- 📊 **Dashboard & Analytics**
  - Total donors count
  - Available blood units
  - Request statistics
  - Successful donations tracking

### Additional Features
- 🔍 Advanced search functionality
- ✅ Form validation
- 📱 Responsive design
- 💾 Local storage persistence (Frontend)
- 🗄️ MongoDB database integration (Backend)
- 🔄 RESTful API architecture
- ⚡ Real-time updates

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage** - Client-side data persistence

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)

### Tools & Libraries
- **CORS** - Cross-Origin Resource Sharing
- **Body-Parser** - Request body parsing
- **Nodemon** - Development auto-restart

## 📁 Project Structure

```
blood-banking-system/
├── frontend/
│   └── index.html          # Main frontend application
├── backend/
│   ├── server.js           # Express server & API routes
│   ├── package.json        # Dependencies
│   └── .env.example        # Environment variables template
└── README.md               # Project documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Frontend Setup

1. Simply open the `index.html` file in a web browser:
```bash
cd frontend
# Open index.html in your browser
# OR use a simple HTTP server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` file with your MongoDB connection string:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bloodbank
```

5. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 💻 Usage

### Using the Frontend Application

1. **Register a Donor**
   - Click "Register Donor" in the navigation
   - Fill in donor details (name, age, blood type, contact info)
   - Submit the form
   - Donor is added to the system and inventory is updated

2. **Request Blood**
   - Click "Request Blood"
   - Enter patient and hospital details
   - Select blood type and units needed
   - Choose urgency level
   - Submit request
   - System checks availability and approves if stock available

3. **View Inventory**
   - Click "Inventory" to see current blood stock
   - View availability by blood type
   - Monitor low stock alerts
   - Search specific blood types

4. **Track Donors**
   - View recent donors in the sidebar
   - Search donors by name or blood type
   - See donation history

### Using the API

#### Start the Backend Server
```bash
cd backend
npm run dev
```

#### Test API Endpoints
```bash
# Get all donors
curl http://localhost:5000/api/donors

# Register a new donor
curl -X POST http://localhost:5000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 25,
    "bloodType": "O+",
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St"
  }'

# Get inventory
curl http://localhost:5000/api/inventory

# Get statistics
curl http://localhost:5000/api/stats
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Donors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/donors` | Get all donors |
| GET | `/donors/:id` | Get donor by ID |
| POST | `/donors` | Register new donor |
| PUT | `/donors/:id` | Update donor |
| DELETE | `/donors/:id` | Delete donor |
| GET | `/donors/search/:bloodType` | Search by blood type |

#### Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requests` | Get all requests |
| POST | `/requests` | Create blood request |
| PUT | `/requests/:id` | Update request |

#### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Get all inventory |
| GET | `/inventory/:bloodType` | Get specific blood type |
| PUT | `/inventory/:bloodType` | Update inventory |

#### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get dashboard statistics |

### Request/Response Examples

#### Register Donor
**Request:**
```json
POST /api/donors
{
  "name": "Jane Smith",
  "age": 28,
  "bloodType": "A+",
  "phone": "9876543210",
  "email": "jane@example.com",
  "address": "456 Oak Avenue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donor registered successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Jane Smith",
    "age": 28,
    "bloodType": "A+",
    "phone": "9876543210",
    "email": "jane@example.com",
    "address": "456 Oak Avenue",
    "donationCount": 1,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Create Blood Request
**Request:**
```json
POST /api/requests
{
  "patientName": "Alice Johnson",
  "bloodType": "B+",
  "units": 2,
  "hospital": "City General Hospital",
  "contactPerson": "Bob Johnson",
  "contactPhone": "5551234567",
  "urgency": "Urgent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blood request approved and fulfilled",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "patientName": "Alice Johnson",
    "bloodType": "B+",
    "units": 2,
    "hospital": "City General Hospital",
    "contactPerson": "Bob Johnson",
    "contactPhone": "5551234567",
    "urgency": "Urgent",
    "status": "approved",
    "fulfilledDate": "2024-01-15T11:00:00.000Z"
  }
}
```

## 📸 Screenshots

### Dashboard
- Live statistics cards showing total donors, available units, requests
- Color-coded inventory status

### Donor Registration
- Clean, user-friendly form
- Real-time validation
- Success/error notifications

### Blood Inventory
- Searchable inventory table
- Stock level indicators (High/Medium/Low)
- Real-time updates

## 🔮 Future Enhancements

- [ ] User authentication & authorization
- [ ] Email notifications for donors
- [ ] SMS alerts for urgent requests
- [ ] Appointment scheduling system
- [ ] Donor eligibility calculator
- [ ] Blood donation camps management
- [ ] Reports & analytics dashboard
- [ ] Mobile application
- [ ] QR code for donor cards
- [ ] Integration with hospital systems
- [ ] Automated low-stock notifications
- [ ] Donor rewards program
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Shudhanshu Mishra**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: yourmail@gmail.com

## 🙏 Acknowledgments

- Inspired by real-world blood bank management needs
- Built following IEEE software engineering standards
- Designed with user experience in mind

## 📞 Support

For support, email yourmail@gmail.com or create an issue in the repository.

---

**⭐ If you find this project useful, please consider giving it a star!**

Made with ❤️ by Shudhanshu Mishra