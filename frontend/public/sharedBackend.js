// sharedBackend.js

import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');

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

export default sharedBackend;