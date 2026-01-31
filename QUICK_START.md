# 🚀 Quick Start Guide - Blood Bank Management System

## ⚡ Get Started in 5 Minutes

### Option 1: Frontend Only (No Installation Required)

1. **Open the Frontend**
   ```bash
   # Navigate to the frontend folder
   cd blood-banking-system/frontend
   
   # Simply open index.html in your browser
   # Double-click the file OR right-click → Open with → Your Browser
   ```
   
2. **Start Using**
   - The application works immediately with LocalStorage
   - Register donors, make requests, manage inventory
   - All data is saved in your browser

### Option 2: Full Stack Setup (Frontend + Backend)

#### Prerequisites
- Install Node.js from https://nodejs.org/
- Install MongoDB from https://www.mongodb.com/try/download/community
  OR use MongoDB Atlas (free cloud database)

#### Step 1: Setup Backend

```bash
# Navigate to backend folder
cd blood-banking-system/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your MongoDB connection
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017/bloodbank
# For MongoDB Atlas: Use your connection string

# Start the server
npm run dev
```

Server will start at: **http://localhost:5000**

#### Step 2: Test API (Optional)

```bash
# Import postman-collection.json into Postman
# OR test with curl:

curl http://localhost:5000/api/stats
```

#### Step 3: Open Frontend

Simply open `frontend/index.html` in your browser!

## 📝 Quick Test Data

### Register a Donor
- Name: John Doe
- Age: 25
- Blood Type: O+
- Phone: 1234567890
- Email: john@example.com
- Address: 123 Main Street

### Create a Blood Request
- Patient: Alice Johnson
- Blood Type: B+
- Units: 2
- Hospital: City Hospital
- Contact: Bob Johnson
- Phone: 9876543210
- Urgency: Urgent

## 🎯 Key Features to Try

1. **Dashboard**: View real-time statistics
2. **Register Donor**: Add new blood donors
3. **Request Blood**: Create urgent blood requests
4. **Inventory**: Check available blood units
5. **Search**: Find donors or blood types

## 🛠️ Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
# For local MongoDB, start with:
mongod

# OR use MongoDB Atlas cloud database
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### Frontend Not Updating
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

## 📚 Next Steps

1. **Read the full README.md** for detailed documentation
2. **Check API Documentation** for all available endpoints
3. **Import Postman Collection** for API testing
4. **Customize** the application for your needs

## 💡 Tips

- Frontend works standalone with LocalStorage
- Backend provides persistent database storage
- Use Postman collection for API testing
- Check browser console for any errors
- MongoDB must be running for backend

## 🆘 Need Help?

- Check README.md for detailed documentation
- Review server.js for API endpoints
- Test with Postman collection
- Ensure MongoDB is running

---

**Happy Coding! 🩸**

Made with ❤️ by Shudhanshu Mishra