const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
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
    id: { type: Number, required: true, unique: true },
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
    const buses = await Bus.find();
    socket.emit('initial_buses', buses);

    socket.on('update_bus', async (bus) => {
        const updatedBus = await Bus.findOneAndUpdate(
            { id: bus.id },
            bus,
            { upsert: true, new: true }
        );
        const allBuses = await Bus.find(); // Send full list
        io.emit('bus_updated', allBuses); // Broadcast full list
    });

    socket.on('delete_bus', async (id) => {
        await Bus.findOneAndDelete({ id });
        const allBuses = await Bus.find();
        io.emit('bus_updated', allBuses); // Broadcast full list
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Seed initial data (optional)
async function seedData() {
    const count = await Bus.countDocuments();
    if (count === 0) {
        await Bus.create({
            id: 1,
            driverName: "Shivam",
            busNumberPlate: "TS 09 AB 1234",
            inchargeName: "Rakesh",
            lat: 51.505,
            lng: -0.09,
            arrivalTime: 300
        });
        console.log('Initial bus data seeded');
    }
}

// Start Server
async function startServer() {
    await connectToMongoDB();
    await seedData();
    const PORT = 3000;

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${PORT}`);

        // Dynamically find the first available IPv4 address
        const networkInterfaces = os.networkInterfaces();
        for (const interfaceName in networkInterfaces) {
            const addresses = networkInterfaces[interfaceName];
            for (const address of addresses) {
                if (address.family === 'IPv4' && !address.internal) {
                    console.log(`Accessible on your network at http://${address.address}:${PORT}`);
                }
            }
        }
    });
}

startServer();