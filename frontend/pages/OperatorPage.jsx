import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import kllogo from './kllogo.jpg'; // Adjust the path if necessary
import sharedBackend from '../public/sharedBackend'; // Import sharedBackend

export default function OperatorPage() {
    const [buses, setBuses] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        busNumberPlate: '',
        driverName: '',
        inchargeName: '',
        lat: '',
        lng: '',
    });

    useEffect(() => {
        // Listen for updates from sharedBackend
        sharedBackend.onUpdate((updatedBuses) => {
            setBuses(updatedBuses);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { id, busNumberPlate, driverName, inchargeName, lat, lng } = formData;

        if (!busNumberPlate || !driverName || !inchargeName || !lat || !lng) {
            alert('Please fill all required fields.');
            return;
        }

        const bus = {
            id: id || Date.now().toString(),
            busNumberPlate,
            driverName,
            inchargeName,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
        };

        if (id) {
            sharedBackend.updateBus(bus); // Update existing bus
        } else {
            sharedBackend.updateBus(bus); // Add new bus
        }

        setFormData({ id: '', busNumberPlate: '', driverName: '', inchargeName: '', lat: '', lng: '' });
    };

    const handleDelete = (id) => {
        sharedBackend.deleteBus(id);
    };

    return (
        <div>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img src={kllogo} alt="KL University Logo" style={{ width: '100px', height: 'auto', marginRight: '20px' }} />
                <h1>Admin Panel</h1>
            </header>
            <h2>Bus Locations</h2>
            <MapContainer center={[17.385044, 78.486671]} zoom={13} style={{ height: '60vh', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {buses.map((bus) => (
                    <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                        <Popup>
                            <strong>Bus {bus.busNumberPlate}</strong>
                            <br />
                            Driver: {bus.driverName}
                            <br />
                            In-charge: {bus.inchargeName}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <h2>Manage Buses</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="Bus ID (for update)"
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <input
                    type="text"
                    name="busNumberPlate"
                    value={formData.busNumberPlate}
                    onChange={handleChange}
                    placeholder="Bus Number Plate"
                    required
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    placeholder="Driver Name"
                    required
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <input
                    type="text"
                    name="inchargeName"
                    value={formData.inchargeName}
                    onChange={handleChange}
                    placeholder="In-charge Name"
                    required
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <input
                    type="number"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    placeholder="Latitude"
                    required
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <input
                    type="number"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    placeholder="Longitude"
                    required
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <button type="submit" style={{ display: 'block', marginBottom: '10px' }}>
                    Save/Update Bus
                </button>
            </form>

            <h2>Bus List</h2>
            <ul>
                {buses.map((bus) => (
                    <li key={bus.id}>
                        <strong>Bus {bus.busNumberPlate}</strong> - Driver: {bus.driverName}, In-charge: {bus.inchargeName}
                        <button onClick={() => handleDelete(bus.id)} style={{ marginLeft: '10px' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}