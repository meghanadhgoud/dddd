import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function OperatorPage() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        async function fetchBuses() {
            try {
                const response = await fetch('http://localhost:3000/api/buses');
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setBuses(data);
            } catch (error) {
                console.error('Failed to fetch buses:', error);
            }
        }

        fetchBuses();
    }, []);

    return (
        <div>
            <h1>Operator Page</h1>
            <p>This is the operator page.</p>
            <h2>Bus List</h2>
            <ul>
                {buses.map((bus) => (
                    <li key={bus.id}>
                        <strong>Bus {bus.busNumberPlate}</strong> - Driver: {bus.driverName}, In-charge: {bus.inchargeName}
                    </li>
                ))}
            </ul>
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
        </div>
    );
}