// sharedBackend.js
// sharedBackend.js
// const socket = io('http://localhost:3000');
const socket = io('https://dddd-bx1p.onrender.com');

const sharedBackend = {
    buses: [],
    listeners: [],
    updateBus(bus) {
        socket.emit('update_bus', bus);
    },
    deleteBus(id) {
        socket.emit('delete_bus', id);
    },
    onUpdate(callback) {
        this.listeners.push(callback);
    },
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.buses));
    }
};

socket.on('initial_buses', (initialBuses) => {
    sharedBackend.buses = initialBuses;
    sharedBackend.notifyListeners();
});

socket.on('bus_updated', (buses) => {
    sharedBackend.buses = buses; // Replace entire list
    sharedBackend.notifyListeners();
});

socket.on('bus_deleted', (buses) => {
    sharedBackend.buses = buses; // Replace entire list
    sharedBackend.notifyListeners();
});

sharedBackend.updateBus({
    id: 'driver', // Ensure this is a string
    lat: location.lat,
    lng: location.lng,
    driverName: 'Driver', // Placeholder name
    busNumberPlate: 'N/A', // Placeholder bus number
    inchargeName: 'N/A', // Placeholder in-charge name
    arrivalTime: 0 // Not applicable for drivers
});

export default sharedBackend;