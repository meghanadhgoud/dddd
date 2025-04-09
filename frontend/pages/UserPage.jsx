import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
    const [route, setRoute] = useState([]); // State to store the route coordinates
    const [stops, setStops] = useState([]);

    useEffect(() => {
        const fetchStops = async () => {
            const response = await fetch('https://your-server-url.com/stops');
            const data = await response.json();
            setStops(data);
        };

        fetchStops();
    }, []);

    useEffect(() => {
        // Listen for bus updates from sharedBackend
        sharedBackend.setRole('user'); // Set role as 'user'
        sharedBackend.onUpdate((updatedBuses) => {
            setBuses(updatedBuses.filter((bus) => bus.id === 'driver')); // Only show the driver
        });

        // Watch the user's current location
        if (navigator.geolocation) {
            const intervalId = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
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
            }, 3000); // Update every 3 seconds

            // Cleanup the interval on component unmount
            return () => clearInterval(intervalId);
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    useEffect(() => {
        // Fetch the route when userLocation and bus location are available
        if (userLocation && buses.length > 0) {
            const busLocation = buses[0]; // Assuming only one driver
            const fetchRoute = async () => {
                const apiKey = '5b3ce3597851110001cf6248161fa7d30a3146d498127102eeabbfc8'; // Your OpenRouteService API key
                const start = `${userLocation.lng},${userLocation.lat}`;
                const end = `${busLocation.lng},${busLocation.lat}`;
                const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.features && data.features[0]) {
                        const coordinates = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                        setRoute(coordinates); // Update the route state
                    }
                } catch (error) {
                    console.error('Error fetching route:', error);
                }
            };

            fetchRoute();
        }
    }, [userLocation, buses]);

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
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tracker</h1>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Tracking</h2>
                <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', width: '100%', height: '100%' }}>
                    <MapContainer
                        center={[17, 78]} // Default center
                        zoom={20}
                        style={{
                            height: 'calc(100vh - 200px)', // Full height minus header and footer
                            width: '100%', // Full width
                        }}
                    >
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
                            >
                                <Popup>
                                    <strong>Driver</strong>
                                    <br />
                                    Driver Name: {bus.driverName}
                                </Popup>
                            </Marker>
                        ))}
                        {route.length > 0 && (
                            <Polyline
                                positions={route}
                                color="blue"
                            />
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