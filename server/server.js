// Blood Bank Management System - Backend Server
// Author: Shudhanshu Mishra
// Tech Stack: Node.js, Express, MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PHONE_REGEX = /^\d{10}$/;

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

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff'
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Models
const Donor = mongoose.model('Donor', donorSchema);
const Request = mongoose.model('Request', requestSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const User = mongoose.model('User', userSchema);

// ==================== AUTH HELPERS ====================

function sanitizeUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
    };
}

function createToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function sendError(res, status, message, errorCode, details = null) {
    return res.status(status).json({
        success: false,
        message,
        errorCode,
        details
    });
}

function validateRegisterInput(body) {
    const errors = [];
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) errors.push('name is required');
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) errors.push('valid email is required');
    if (!body.password || typeof body.password !== 'string' || body.password.length < 6) errors.push('password must be at least 6 characters');
    if (body.role && !['admin', 'staff'].includes(body.role)) errors.push('role must be admin or staff');
    return errors;
}

function validateLoginInput(body) {
    const errors = [];
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) errors.push('valid email is required');
    if (!body.password || typeof body.password !== 'string') errors.push('password is required');
    return errors;
}

function validateDonorInput(body) {
    const errors = [];
    if (!body.name || !String(body.name).trim()) errors.push('name is required');
    if (!Number.isFinite(Number(body.age)) || Number(body.age) < 18 || Number(body.age) > 65) errors.push('age must be between 18 and 65');
    if (!BLOOD_TYPES.includes(body.bloodType)) errors.push('invalid bloodType');
    if (!PHONE_REGEX.test(String(body.phone || ''))) errors.push('phone must be 10 digits');
    if (!body.address || !String(body.address).trim()) errors.push('address is required');
    return errors;
}

function validateRequestInput(body) {
    const errors = [];
    if (!body.patientName || !String(body.patientName).trim()) errors.push('patientName is required');
    if (!BLOOD_TYPES.includes(body.bloodType)) errors.push('invalid bloodType');
    if (!Number.isFinite(Number(body.units)) || Number(body.units) < 1) errors.push('units must be at least 1');
    if (!body.hospital || !String(body.hospital).trim()) errors.push('hospital is required');
    if (!body.contactPerson || !String(body.contactPerson).trim()) errors.push('contactPerson is required');
    if (!PHONE_REGEX.test(String(body.contactPhone || ''))) errors.push('contactPhone must be 10 digits');
    if (!['Critical', 'Urgent', 'Normal'].includes(body.urgency)) errors.push('urgency must be Critical, Urgent or Normal');
    return errors;
}

function validateInventoryUpdateInput(body, bloodType) {
    const errors = [];
    if (!BLOOD_TYPES.includes(bloodType)) errors.push('invalid bloodType');
    if (!Number.isFinite(Number(body.units)) || Number(body.units) < 0) errors.push('units must be a non-negative number');
    return errors;
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPagination(req) {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return sendError(res, 401, 'Authentication token is required', 'AUTH_TOKEN_MISSING');
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return sendError(res, 401, 'Invalid or expired token', 'AUTH_TOKEN_INVALID');
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 403, 'Access denied for this role', 'AUTH_FORBIDDEN');
        }
        next();
    };
}

// ==================== ROUTES ====================

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Blood Bank Management System API',
        status: 'Running',
        version: '1.0.0'
    });
});

// ========== AUTH ROUTES ==========

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const validationErrors = validateRegisterInput(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid registration input', 'VALIDATION_ERROR', validationErrors);
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return sendError(res, 409, 'User already exists with this email', 'USER_ALREADY_EXISTS');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            role: role === 'admin' ? 'admin' : 'staff'
        });

        const token = createToken(user);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: sanitizeUser(user),
                token
            }
        });
    } catch (error) {
        return sendError(res, 500, 'Error registering user', 'REGISTER_FAILED', error.message);
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const validationErrors = validateLoginInput(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid login input', 'VALIDATION_ERROR', validationErrors);
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return sendError(res, 401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return sendError(res, 401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
        }

        user.lastLogin = new Date();
        await user.save();

        const token = createToken(user);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: sanitizeUser(user),
                token
            }
        });
    } catch (error) {
        return sendError(res, 500, 'Error logging in', 'LOGIN_FAILED', error.message);
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.sub);
        if (!user) {
            return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
        }

        res.json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        return sendError(res, 500, 'Error fetching user profile', 'PROFILE_FETCH_FAILED', error.message);
    }
});

// ========== DONOR ROUTES ==========

// Get all donors
app.get('/api/donors', async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const query = {};

        if (req.query.bloodType && BLOOD_TYPES.includes(req.query.bloodType)) {
            query.bloodType = req.query.bloodType;
        }

        if (req.query.status && ['active', 'inactive', 'eligible', 'ineligible'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        if (req.query.q) {
            const safeQ = escapeRegex(req.query.q.trim());
            query.$or = [
                { name: { $regex: safeQ, $options: 'i' } },
                { phone: { $regex: safeQ, $options: 'i' } },
                { email: { $regex: safeQ, $options: 'i' } }
            ];
        }

        const [donors, total] = await Promise.all([
            Donor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Donor.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: donors.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit))
            },
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
app.post('/api/donors', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const validationErrors = validateDonorInput(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid donor input', 'VALIDATION_ERROR', validationErrors);
        }

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
        return sendError(res, 400, 'Error registering donor', 'DONOR_CREATE_FAILED', error.message);
    }
});

// Update donor
app.put('/api/donors/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const validationErrors = validateDonorInput(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid donor input', 'VALIDATION_ERROR', validationErrors);
        }

        const donor = await Donor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!donor) {
            return sendError(res, 404, 'Donor not found', 'DONOR_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Donor updated successfully',
            data: donor
        });
    } catch (error) {
        return sendError(res, 400, 'Error updating donor', 'DONOR_UPDATE_FAILED', error.message);
    }
});

// Delete donor
app.delete('/api/donors/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const donor = await Donor.findByIdAndDelete(req.params.id);
        
        if (!donor) {
            return sendError(res, 404, 'Donor not found', 'DONOR_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Donor deleted successfully'
        });
    } catch (error) {
        return sendError(res, 500, 'Error deleting donor', 'DONOR_DELETE_FAILED', error.message);
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
        const { page, limit, skip } = getPagination(req);
        const query = {};

        if (req.query.bloodType && BLOOD_TYPES.includes(req.query.bloodType)) {
            query.bloodType = req.query.bloodType;
        }

        if (req.query.status && ['pending', 'approved', 'fulfilled', 'rejected'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        if (req.query.urgency && ['Critical', 'Urgent', 'Normal'].includes(req.query.urgency)) {
            query.urgency = req.query.urgency;
        }

        if (req.query.q) {
            const safeQ = escapeRegex(req.query.q.trim());
            query.$or = [
                { patientName: { $regex: safeQ, $options: 'i' } },
                { hospital: { $regex: safeQ, $options: 'i' } },
                { contactPerson: { $regex: safeQ, $options: 'i' } }
            ];
        }

        const [requests, total] = await Promise.all([
            Request.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Request.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: requests.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit))
            },
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
app.post('/api/requests', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const validationErrors = validateRequestInput(req.body);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid request input', 'VALIDATION_ERROR', validationErrors);
        }

        // Check inventory availability
        const inventory = await Inventory.findOne({ bloodType: req.body.bloodType });
        
        if (!inventory || inventory.units < req.body.units) {
            return sendError(
                res,
                400,
                'Insufficient blood units available',
                'INSUFFICIENT_INVENTORY',
                { available: inventory ? inventory.units : 0 }
            );
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
        return sendError(res, 400, 'Error creating request', 'REQUEST_CREATE_FAILED', error.message);
    }
});

// Update request status
app.put('/api/requests/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
    try {
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!request) {
            return sendError(res, 404, 'Request not found', 'REQUEST_NOT_FOUND');
        }

        res.json({
            success: true,
            message: 'Request updated successfully',
            data: request
        });
    } catch (error) {
        return sendError(res, 400, 'Error updating request', 'REQUEST_UPDATE_FAILED', error.message);
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
app.put('/api/inventory/:bloodType', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const validationErrors = validateInventoryUpdateInput(req.body, req.params.bloodType);
        if (validationErrors.length > 0) {
            return sendError(res, 400, 'Invalid inventory input', 'VALIDATION_ERROR', validationErrors);
        }

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
        return sendError(res, 400, 'Error updating inventory', 'INVENTORY_UPDATE_FAILED', error.message);
    }
});

// ========== STATISTICS ROUTES ==========

// Get dashboard statistics
app.get('/api/stats', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
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
    return sendError(res, 404, 'Route not found', 'ROUTE_NOT_FOUND');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR', err.message);
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🩸 Blood Bank Management System - Backend Active`);
});

module.exports = app;
