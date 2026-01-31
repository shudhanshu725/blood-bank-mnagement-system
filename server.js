// Blood Bank Management System - Backend Server
// Author: Shudhanshu Mishra
// Tech Stack: Node.js, Express, MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbank';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== SCHEMAS ====================

// Donor Schema
const donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 65
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    phone: {
        type: String,
        required: true,
        match: /^\d{10}$/
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true
    },
    lastDonation: {
        type: Date,
        default: Date.now
    },
    donationCount: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'eligible', 'ineligible'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Blood Request Schema
const requestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true,
        min: 1
    },
    hospital: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true,
        match: /^\d{10}$/
    },
    urgency: {
        type: String,
        required: true,
        enum: ['Critical', 'Urgent', 'Normal']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    fulfilledDate: Date
}, {
    timestamps: true
});

// Blood Inventory Schema
const inventorySchema = new mongoose.Schema({
    bloodType: {
        type: String,
        required: true,
        unique: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Models
const Donor = mongoose.model('Donor', donorSchema);
const Request = mongoose.model('Request', requestSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);

// ==================== ROUTES ====================

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Blood Bank Management System API',
        status: 'Running',
        version: '1.0.0'
    });
});

// ========== DONOR ROUTES ==========

// Get all donors
app.get('/api/donors', async (req, res) => {
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: donors.length,
            data: donors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donors',
            error: error.message
        });
    }
});

// Get donor by ID
app.get('/api/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id);
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }
        res.json({
            success: true,
            data: donor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donor',
            error: error.message
        });
    }
});

// Register new donor
app.post('/api/donors', async (req, res) => {
    try {
        const donor = new Donor(req.body);
        await donor.save();

        // Update inventory
        await updateInventory(donor.bloodType, 1);

        res.status(201).json({
            success: true,
            message: 'Donor registered successfully',
            data: donor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error registering donor',
            error: error.message
        });
    }
});

// Update donor
app.put('/api/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        res.json({
            success: true,
            message: 'Donor updated successfully',
            data: donor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating donor',
            error: error.message
        });
    }
});

// Delete donor
app.delete('/api/donors/:id', async (req, res) => {
    try {
        const donor = await Donor.findByIdAndDelete(req.params.id);
        
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        res.json({
            success: true,
            message: 'Donor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting donor',
            error: error.message
        });
    }
});

// Search donors by blood type
app.get('/api/donors/search/:bloodType', async (req, res) => {
    try {
        const donors = await Donor.find({ 
            bloodType: req.params.bloodType,
            status: 'active'
        });
        
        res.json({
            success: true,
            count: donors.length,
            data: donors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching donors',
            error: error.message
        });
    }
});

// ========== REQUEST ROUTES ==========

// Get all requests
app.get('/api/requests', async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching requests',
            error: error.message
        });
    }
});

// Create blood request
app.post('/api/requests', async (req, res) => {
    try {
        // Check inventory availability
        const inventory = await Inventory.findOne({ bloodType: req.body.bloodType });
        
        if (!inventory || inventory.units < req.body.units) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient blood units available',
                available: inventory ? inventory.units : 0
            });
        }

        const request = new Request(req.body);
        await request.save();

        // Update inventory
        await updateInventory(req.body.bloodType, -req.body.units);
        
        // Update request status
        request.status = 'approved';
        request.fulfilledDate = new Date();
        await request.save();

        res.status(201).json({
            success: true,
            message: 'Blood request approved and fulfilled',
            data: request
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating request',
            error: error.message
        });
    }
});

// Update request status
app.put('/api/requests/:id', async (req, res) => {
    try {
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            message: 'Request updated successfully',
            data: request
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating request',
            error: error.message
        });
    }
});

// ========== INVENTORY ROUTES ==========

// Get all inventory
app.get('/api/inventory', async (req, res) => {
    try {
        let inventory = await Inventory.find().sort({ bloodType: 1 });
        
        // Initialize inventory if empty
        if (inventory.length === 0) {
            inventory = await initializeInventory();
        }

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory',
            error: error.message
        });
    }
});

// Get inventory by blood type
app.get('/api/inventory/:bloodType', async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ bloodType: req.params.bloodType });
        
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Blood type not found'
            });
        }

        res.json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory',
            error: error.message
        });
    }
});

// Update inventory manually
app.put('/api/inventory/:bloodType', async (req, res) => {
    try {
        const inventory = await Inventory.findOneAndUpdate(
            { bloodType: req.params.bloodType },
            { 
                units: req.body.units,
                lastUpdated: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Inventory updated successfully',
            data: inventory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating inventory',
            error: error.message
        });
    }
});

// ========== STATISTICS ROUTES ==========

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const totalRequests = await Request.countDocuments();
        const successfulRequests = await Request.countDocuments({ status: 'fulfilled' });
        const inventory = await Inventory.find();
        const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);

        res.json({
            success: true,
            data: {
                totalDonors,
                totalRequests,
                successfulRequests,
                totalUnits,
                lowStockAlerts: inventory.filter(item => item.units < 10).length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Initialize inventory with default values
async function initializeInventory() {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const defaultUnits = { 'A+': 45, 'A-': 12, 'B+': 38, 'B-': 8, 'AB+': 15, 'AB-': 5, 'O+': 52, 'O-': 18 };
    
    const inventory = [];
    for (const bloodType of bloodTypes) {
        const item = await Inventory.create({
            bloodType,
            units: defaultUnits[bloodType] || 0
        });
        inventory.push(item);
    }
    
    return inventory;
}

// Update inventory helper
async function updateInventory(bloodType, change) {
    const inventory = await Inventory.findOne({ bloodType });
    
    if (inventory) {
        inventory.units += change;
        inventory.lastUpdated = new Date();
        await inventory.save();
    } else {
        await Inventory.create({
            bloodType,
            units: Math.max(0, change)
        });
    }
}

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🩸 Blood Bank Management System - Backend Active`);
});

module.exports = app;