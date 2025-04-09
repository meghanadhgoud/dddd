import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import kllogo from './kllogo.jpg'; // Adjust the path if necessary
import sharedBackend from '../public/sharedBackend'; // Import sharedBackend
import busMarker from './bus.png'; // Custom marker for drivers

// Custom icon for the driver marker
const driverIcon = new L.Icon({
    iconUrl: busMarker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Component to recenter the map based on driver location
function RecenterMap({ driverLocation }) {
    const map = useMap();

    useEffect(() => {
        if (driverLocation) {
            map.setView([driverLocation.lat, driverLocation.lng], 13);
        }
    }, [driverLocation, map]);

    return null;
}

export default function DriverPage() {
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        // Set role as 'driver'
        sharedBackend.setRole('driver');

        // Update the driver's location every 3 seconds
        const intervalId = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setDriverLocation(location);

                        // Update the driver's location in the backend
                        sharedBackend.updateBus({
                            id: 'driver', // Unique ID for the driver
                            lat: location.lat,
                            lng: location.lng,
                            driverName: 'Driver', // Placeholder name
                            busNumberPlate: 'N/A', // Placeholder bus number
                            inchargeName: 'N/A', // Placeholder in-charge name
                            arrivalTime: 0, // Not applicable for drivers
                        });
                    },
                    (error) => {
                        console.error('Error fetching driver location:', error);
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        }, 3000); // Update every 3 seconds

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            background: '#ffffff', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
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
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>Driver Tracker</h1>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Your Location</h2>
                <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', width: '100%', height: '100%' }}>
                    <MapContainer
                        center={[17.385044, 78.486671]} // Default center
                        zoom={13}
                        style={{
                            height: 'calc(100vh - 200px)', // Full height minus header and footer
                            width: '100%', // Full width
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <RecenterMap driverLocation={driverLocation} />
                        {driverLocation && (
                            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                                <Popup>
                                    <strong>You are here!</strong>
                                    <br />
                                    Lat: {driverLocation.lat.toFixed(4)}
                                    <br />
                                    Lng: {driverLocation.lng.toFixed(4)}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                background: 'linear-gradient(90deg, #a30000, #d32f2f)',
                color: 'white',
                padding: '15px 30px',
                textAlign: 'center',
                width: '100%',
                boxShadow: '0 -2px 6px rgba(0,0,0,0.1)',
            }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                    © {new Date().getFullYear()} KL Deemed to be University. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}