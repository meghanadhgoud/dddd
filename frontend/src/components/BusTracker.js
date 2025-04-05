import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import sharedBackend from '../sharedBackend';

function RecenterControl({ position }) {
  const map = useMap();
  return (
    <div
      className="leaflet-bar recenter-control"
      style={{
        backgroundColor: 'white',
        width: '30px',
        height: '30px',
        cursor: 'pointer',
        textAlign: 'center',
        lineHeight: '30px',
      }}
      title="Recenter map"
      onClick={() => map.setView(position, map.getZoom())}
    >
      <i className="fas fa-crosshairs"></i>
    </div>
  );
}

function BusTracker() {
  const [position, setPosition] = useState([17.385044, 78.486671]); // Default position
  const [busDetails, setBusDetails] = useState({
    driverName: '',
    busNumberPlate: '',
    inchargeName: '',
    arrivalTime: 0,
  });
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Show user location initially
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setTimeout(() => updateBusLocation(), 2000);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          updateBusLocation();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      updateBusLocation();
    }

    // Listen for bus updates
    sharedBackend.onUpdate((buses) => {
      const bus = buses.find((b) => b.id === 1);
      if (bus) {
        setPosition([bus.lat, bus.lng]);
        setBusDetails(bus);
      }
    });

    // Start countdown
    const interval = setInterval(() => {
      const bus = sharedBackend.buses.find((b) => b.id === 1);
      if (bus && bus.arrivalTime > 0) {
        const minutes = Math.floor(bus.arrivalTime / 60);
        const seconds = bus.arrivalTime % 60;
        setTimeRemaining(`${minutes}m ${seconds}s`);
        bus.arrivalTime--;
        sharedBackend.updateBus(bus);
      } else {
        setTimeRemaining('Bus has arrived!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateBusLocation = () => {
    const bus = sharedBackend.buses.find((b) => b.id === 1);
    if (bus) {
      setPosition([bus.lat, bus.lng]);
      setBusDetails(bus);
    }
  };

  return (
    <div className="tracker">
      <h1>Bus Tracker</h1>
      <MapContainer center={position} zoom={13} style={{ height: '60vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <b style={{ color: '#333' }}>Bus {busDetails.busNumberPlate} is here!</b>
          </Popup>
        </Marker>
        <RecenterControl position={position} />
      </MapContainer>
      <div className="details">
        <div>Bus arrives in: <span style={{ color: '#c91515' }}>{timeRemaining}</span></div>
        <div>Driver Name: <span>{busDetails.driverName}</span></div>
        <div>Bus Number Plate: <span>{busDetails.busNumberPlate}</span></div>
        <div>In-charge Name: <span>{busDetails.inchargeName}</span></div>
      </div>
      <style jsx>{`
        .tracker {
          padding: 20px;
          text-align: center;
        }
        h1 {
          color: #333;
          border-bottom: 5px solid #e91e63;
          padding-bottom: 10px;
        }
        .details {
          font-size: 20px;
          margin-top: 2vh;
          color: #333;
          padding: 1rem;
          background-color: #f9f9f9;
          border-radius: 5px;
          max-width: 90%;
          margin-left: auto;
          margin-right: auto;
        }
        .details div {
          margin: 0.5rem 0;
        }
        @media (max-width: 768px) {
          .tracker {
            padding: 10px;
          }
          .details {
            font-size: 16px;
            padding: 0.5rem;
          }
        }
        @media (max-width: 480px) {
          .details {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default BusTracker;