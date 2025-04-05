import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import kllogo from './kllogo.jpg'; // Adjust the path if necessary
import sharedBackend from '../public/sharedBackend'; // Import sharedBackend
import busMarker from './bus.png'; // Updated to use bus.png as the custom marker

// Custom icon for the marker
const customIcon = new L.Icon({
    iconUrl: busMarker, // Path to your custom marker image (bus.png)
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});

// Component to recenter the map based on bus locations
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
    const [formData, setFormData] = useState({
        id: '',
        busNumber: '',
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
        const { id, busNumber, driverName, inchargeName, lat, lng } = formData;

        if (!busNumber || !driverName || !inchargeName || !lat || !lng) {
            alert('Please fill all required fields.');
            return;
        }

        const bus = {
            id: id || Date.now().toString(),
            busNumber,
            driverName,
            inchargeName,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
        };

        if (id) {
            sharedBackend.updateBus(bus);
        } else {
            sharedBackend.updateBus(bus);
        }

        setFormData({ id: '', busNumber: '', driverName: '', inchargeName: '', lat: '', lng: '' });
    };

    const handleDelete = (id) => {
        sharedBackend.deleteBus(id);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#a30000', // Changed to solid color
                color: 'white',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'flex-start', // Adjusted to left-align content after removing nav
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={kllogo} alt="KL University Logo" style={{ width: '90px', height: 'auto', marginRight: '20px', borderRadius: '10px' }} />
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>Admin Panel</h1>
                </div>
                {/* Removed the nav section with About Us and Contact Us */}
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', width: '100%' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Bus Locations</h2>
                <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', marginBottom: '35px', width: '100%' }}>
                    <MapContainer center={[17.385044, 78.486671]} zoom={13} style={{ height: '65vh', width: '100%', border: '2px solid #a30000' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <RecenterMap buses={buses} />
                        {buses.map((bus) => (
                            <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={customIcon}>
                                <Popup style={{ borderRadius: '10px' }}>
                                    <strong>Bus ID {bus.id}</strong>
                                    <br />
                                    Number: {bus.busNumber}
                                    <br />
                                    Driver: {bus.driverName}
                                    <br />
                                    In-charge: {bus.inchargeName}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Manage Buses</h2>
                <form onSubmit={handleSubmit} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)', padding: '35px', borderRadius: '15px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', marginBottom: '35px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="Bus ID (for update)"
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <input
                        type="text"
                        name="busNumber"
                        value={formData.busNumber}
                        onChange={handleChange}
                        placeholder="Bus Number"
                        required
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        placeholder="Driver Name"
                        required
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <input
                        type="text"
                        name="inchargeName"
                        value={formData.inchargeName}
                        onChange={handleChange}
                        placeholder="In-charge Name"
                        required
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <input
                        type="number"
                        name="lat"
                        value={formData.lat}
                        onChange={handleChange}
                        placeholder="Latitude"
                        required
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <input
                        type="number"
                        name="lng"
                        value={formData.lng}
                        onChange={handleChange}
                        placeholder="Longitude"
                        required
                        style={{ display: 'block', marginBottom: '25px', padding: '15px', width: '100%', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s' }}
                        onFocus={(e) => (e.target.style.borderColor = '#a30000')}
                        onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                    />
                    <button 
                        type="submit" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '10px',
                            background: 'linear-gradient(90deg, #a30000, #d32f2f)',
                            color: 'white',
                            border: 'none',
                            padding: '18px 40px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '100%',
                            transition: 'transform 0.3s, box-shadow 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 6px 12px rgba(163, 0, 0, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Save/Update Bus
                    </button>
                </form>

                <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Bus List</h2>
                <ul style={{ listStyle: 'none', padding: 0, background: 'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)', borderRadius: '15px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)', padding: '25px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                    {buses.map((bus) => (
                        <li key={bus.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}
                            onMouseOver={(e) => (e.target.style.transform = 'translateY(-5px)')}
                            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}>
                            <span style={{ flex: 1, color: '#2c3e50', fontSize: '16px' }}>
                                <strong>Bus ID {bus.id}</strong> - Number: {bus.busNumber}, Driver: {bus.driverName}, In-charge: {bus.inchargeName}
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
                    © {new Date().getFullYear()} KL Deemed to be University. All Rights Reserved. | <a href="#" style={{ color: '#ffd700', textDecoration: 'underline', transition: 'color 0.3s' }}
                        onMouseOver={(e) => (e.target.style.color = 'white')}
                        onMouseOut={(e) => (e.target.style.color = '#ffd700')}>ERP</a>
                </p>
            </footer>
        </div>
    );
}