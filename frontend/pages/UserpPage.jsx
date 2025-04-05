import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import kllogo from './kllogo.jpg'; // Adjust the path if necessary
import sharedBackend from '../public/sharedBackend'; // Import sharedBackend
import busMarker from './bus.png'; // Custom marker for buses
import userMarker from './user.png'; // Custom marker for user location

// Custom icon for the bus marker
const busIcon = new L.Icon({
    iconUrl: busMarker,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Custom icon for the user marker
const userIcon = new L.Icon({
    iconUrl: userMarker,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// Component to recenter the map based on user and bus locations
function RecenterMap({ buses, userLocation }) {
    const map = useMap();

    useEffect(() => {
        if (userLocation) {
            const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                ...buses.map((bus) => [bus.lat, bus.lng]),
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [buses, userLocation, map]);

    return null;
}

export default function UserPage() {
    const [buses, setBuses] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedBus, setSelectedBus] = useState(null);

    useEffect(() => {
        // Listen for bus updates from sharedBackend
        sharedBackend.onUpdate((updatedBuses) => {
            setBuses(updatedBuses);
        });

        // Watch the user's current location
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error watching user location:', error);
                },
                { enableHighAccuracy: true }
            );

            // Cleanup the watcher on component unmount
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

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
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tracker</h1>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Tracking</h2>
                <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', marginBottom: '35px', width: '100%' }}>
                    <MapContainer center={[17.385044, 78.486671]} zoom={13} style={{ height: '65vh', width: '100%', border: '2px solid #a30000' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <RecenterMap buses={buses} userLocation={userLocation} />
                        {userLocation && (
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                <Popup>
                                    <strong>You are here!</strong>
                                    <br />
                                    Lat: {userLocation.lat.toFixed(4)}
                                    <br />
                                    Lng: {userLocation.lng.toFixed(4)}
                                </Popup>
                            </Marker>
                        )}
                        {buses.map((bus) => (
                            <Marker
                                key={bus.id}
                                position={[bus.lat, bus.lng]}
                                icon={busIcon}
                                eventHandlers={{
                                    click: () => setSelectedBus(bus),
                                }}
                            >
                                <Popup>
                                    <strong>Bus {bus.busNumber}</strong>
                                    <br />
                                    Distance: {userLocation ?
                                        (L.latLng(userLocation.lat, userLocation.lng)
                                            .distanceTo(L.latLng(bus.lat, bus.lng)) / 1000)
                                            .toFixed(2) + ' km' : 'N/A'}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Bus List */}
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Bus List</h2>
                <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, // Keep this padding
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)', 
                    borderRadius: '15px', 
                    boxShadow: '0 6px 18px rgba(0,0,0,0.15)', 
                    width: '100%', 
                    maxWidth: '900px', 
                    margin: '0 auto' 
                }}>
                    {buses.map((bus) => (
                        <li key={bus.id} style={{ 
                            marginBottom: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '15px', 
                            backgroundColor: '#ffffff', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
                            transition: 'transform 0.3s' 
                        }}>
                            {/* Bus details */}
                        </li>
                    ))}
                </ul>

                {/* Bus Details */}
                {selectedBus && (
                    <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '20px' }}>
                        <h3 style={{ color: '#2c3e50', fontSize: '24px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>Bus Details</h3>
                        <p><strong>Bus Number:</strong> {selectedBus.busNumber}</p>
                        <p><strong>Driver Name:</strong> {selectedBus.driverName}</p>
                        <p><strong>In-charge Name:</strong> {selectedBus.inchargeName}</p>
                        <p><strong>Status:</strong> {selectedBus.lat}</p>
                        <p><strong>Distance:</strong> {selectedBus.lng}</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{
                background: 'linear-gradient(90deg, #a30000, #d32f2f)',
                color: 'white',
                padding: '15px 30px',
                textAlign: 'center',
                marginTop: 'auto',
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