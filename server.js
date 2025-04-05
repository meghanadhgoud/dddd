const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

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

app.get('/api/buses', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.status(200).json(buses);
    } catch (err) {
        console.error('Error fetching buses:', err.message);
        res.status(500).json({ error: 'Failed to fetch buses' });
    }
});

// Create a new bus
app.post('/api/buses', async (req, res) => {
    try {
        const newBus = new Bus(req.body);
        await newBus.save();
        res.status(201).json(newBus);
    } catch (err) {
        console.error('Error creating bus:', err.message);
        res.status(500).json({ error: 'Failed to create bus' });
    }
});

// Get a single bus by ID
app.get('/api/buses/:id', async (req, res) => {
    try {
        const bus = await Bus.findOne({ id: req.params.id });
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.status(200).json(bus);
    } catch (err) {
        console.error('Error fetching bus:', err.message);
        res.status(500).json({ error: 'Failed to fetch bus' });
    }
});

// Update a bus by ID
app.put('/api/buses/:id', async (req, res) => {
    try {
        const updatedBus = await Bus.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.status(200).json(updatedBus);
    } catch (err) {
        console.error('Error updating bus:', err.message);
        res.status(500).json({ error: 'Failed to update bus' });
    }
});

// Delete a bus by ID
app.delete('/api/buses/:id', async (req, res) => {
    try {
        const deletedBus = await Bus.findOneAndDelete({ id: req.params.id });
        if (!deletedBus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.status(200).json({ message: 'Bus deleted successfully' });
    } catch (err) {
        console.error('Error deleting bus:', err.message);
        res.status(500).json({ error: 'Failed to delete bus' });
    }
});

// Start Server
async function startServer() {
    await connectToMongoDB();
    await seedData();
    const PORT = 3000;
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();