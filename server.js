const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const inProduction = process.env.NODE_ENV === 'production'; // Check if in production
const SERVER_PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

app.use(cors({
    origin: '*', // Allow all origins (for testing purposes)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Connect to MongoDB Atlas
async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb+srv://meghanadh:70379999@cluster0.qcirzrf.mongodb.net/busTracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('MongoDB Atlas connection error:', err.message);
        process.exit(1);
    }
}

// Bus Schema
const busSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Change from Number to String
    driverName: { type: String, required: true },
    busNumberPlate: { type: String, required: true, unique: true },
    inchargeName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    arrivalTime: { type: Number, required: true }
});

const Bus = mongoose.model('Bus', busSchema);

// Socket.IO Connection
io.on('connection', async (socket) => {
    console.log('Client connected');

    // Send initial data based on role
    socket.on('role', async (role) => {
        if (role === 'user') {
            const buses = await Bus.find({ id: 'driver' }); // Only show the driver
            socket.emit('initial_buses', buses);
        } else if (role === 'driver') {
            const driver = await Bus.findOne({ id: 'driver' }); // Only the driver's data
            socket.emit('initial_buses', driver ? [driver] : []);
        } else if (role === 'operator') {
            const drivers = await Bus.find({ id: 'driver' }); // Only drivers
            socket.emit('initial_buses', drivers);
        }
    });

    socket.on('update_bus', async (bus) => {
        const updatedBus = await Bus.findOneAndUpdate(
            { id: bus.id },
            bus,
            { upsert: true, new: true }
        );
        const allBuses = await Bus.find();
        io.emit('bus_updated', allBuses); // Broadcast full list to all clients
    });

    socket.on('delete_bus', async (id) => {
        await Bus.findOneAndDelete({ id });
        const allBuses = await Bus.find();
        io.emit('bus_updated', allBuses); // Broadcast full list to all clients
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Seed initial data (optional)
async function seedData() {
    const count = await Bus.countDocuments();
    if (count === 0) {
        console.log('No initial data seeded'); // Remove the default bus
    }
}

// Serve static files in production
if (inProduction) {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Start Server
async function startServer() {
    await connectToMongoDB();
    await seedData();

    server.listen(SERVER_PORT, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${SERVER_PORT}`);

        // Dynamically find the first available IPv4 address
        const networkInterfaces = os.networkInterfaces();
        for (const interfaceName in networkInterfaces) {
            const addresses = networkInterfaces[interfaceName];
            for (const address of addresses) {
                if (address.family === 'IPv4' && !address.internal) {
                    console.log(`Accessible on your network at http://${address.address}:${SERVER_PORT}`);
                }
            }
        }
    });
}

startServer();