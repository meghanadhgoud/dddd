// sharedBackend.js

import { io } from 'socket.io-client';
const socket = io('https://dddd-bx1p.onrender.com'); // Replace with your Render app URL

const sharedBackend = {
    buses: [],
    listeners: [],
    setRole(role) {
        socket.emit('role', role); // Notify the backend of the role
    },
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

export default sharedBackend;