import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import kllogo from './kllogo.jpg'; // Adjust the path if necessary
import sharedBackend from '../public/sharedBackend'; // Import sharedBackend
import busMarker from './bus.png'; // Custom marker for buses

// Custom icon for the bus marker
const busIcon = new L.Icon({
    iconUrl: busMarker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Component to recenter the map based on drivers' locations
function RecenterMap({ buses }) {
    const map = useMap();

    useEffect(() => {
        if (buses.length > 0) {
            const bounds = L.latLngBounds(buses.map((bus) => [bus.lat, bus.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [buses, map]);

    return null;
}

export default function OperatorPage() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        // Set role as 'operator' to fetch only drivers
        sharedBackend.setRole('operator');

        // Listen for bus updates from sharedBackend
        sharedBackend.onUpdate((updatedBuses) => {
            setBuses(updatedBuses.filter((bus) => bus.id === 'driver')); // Only show drivers
        });
    }, []);

    const handleDelete = (id) => {
        sharedBackend.deleteBus(id); // Delete the driver by ID
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#a30000',
                color: 'white',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                width: '100%',
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={kllogo} alt="KL University Logo" style={{ width: '90px', height: 'auto', marginRight: '20px', borderRadius: '10px' }} />
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>Operator Tracker</h1>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Drivers</h2>
                <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', marginBottom: '35px', width: '100%' }}>
                    <MapContainer center={[17.385044, 78.486671]} zoom={13} style={{ height: '65vh', width: '100%', border: '2px solid #a30000' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <RecenterMap buses={buses} />
                        {buses.map((bus) => (
                            <Marker
                                key={bus.id}
                                position={[bus.lat, bus.lng]}
                                icon={busIcon}
                            >
                                <Popup>
                                    <strong>Driver: {bus.driverName}</strong>
                                    <br />
                                    Bus Number: {bus.busNumberPlate}
                                    <br />
                                    In-charge: {bus.inchargeName}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Driver List */}
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Driver List</h2>
                <ul style={{ listStyle: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)', borderRadius: '15px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', padding: '25px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                    {buses.map((bus) => (
                        <li key={bus.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}
                            onMouseOver={(e) => (e.target.style.transform = 'translateY(-5px)')}
                            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}>
                            <span style={{ flex: 1, color: '#2c3e50', fontSize: '16px' }}>
                                <strong>Driver: {bus.driverName}</strong> - Bus Number: {bus.busNumberPlate}, In-charge: {bus.inchargeName}
                            </span>
                            <button
                                onClick={() => handleDelete(bus.id)}
                                style={{
                                    background: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </main>

            {/* Footer */}
            <footer style={{
                background: 'linear-gradient(90deg, #a30000, #d32f2f)',
                color: 'white',
                padding: '15px 30px',
                textAlign: 'center',
                marginTop: 'auto',
                width: '100%',
                boxShadow: '0 -2px 6px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                    © {new Date().getFullYear()} KL Deemed to be University. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}