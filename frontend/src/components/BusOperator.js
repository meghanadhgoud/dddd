import React, { useEffect, useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import sharedBackend from '../sharedBackend';

function BusOperator() {
  const [formData, setFormData] = useState({
    id: '',
    driverName: '',
    busNumberPlate: '',
    inchargeName: '',
    lat: '',
    lng: '',
    arrivalTime: '',
  });
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    sharedBackend.onUpdate((updatedBuses) => {
      setBuses(updatedBuses);
    });
    setBuses(sharedBackend.buses);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manageBus = () => {
    const { id, driverName, busNumberPlate, inchargeName, lat, lng, arrivalTime } = formData;
    if (!driverName || !busNumberPlate || !inchargeName || !lat || !lng || !arrivalTime) {
      alert('Please fill all fields with valid data.');
      return;
    }

    const bus = {
      id: id ? parseInt(id) : (sharedBackend.buses.length ? Math.max(...sharedBackend.buses.map(b => b.id)) + 1 : 1),
      driverName,
      busNumberPlate,
      inchargeName,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      arrivalTime: parseInt(arrivalTime),
    };
    sharedBackend.updateBus(bus);
    setFormData({ id: '', driverName: '', busNumberPlate: '', inchargeName: '', lat: '', lng: '', arrivalTime: '' });
  };

  const deleteBus = (id) => {
    sharedBackend.deleteBus(id);
  };

  return (
    <div className="operator">
      <h2>Operator Bus Management</h2>
      <Box className="bus-form">
        <TextField
          label="Bus ID (for update/delete)"
          name="id"
          value={formData.id}
          onChange={handleChange}
          type="number"
          fullWidth
          margin="normal"
          placeholder="Leave blank for new bus"
        />
        <TextField label="Driver Name" name="driverName" value={formData.driverName} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Bus Number Plate" name="busNumberPlate" value={formData.busNumberPlate} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="In-charge Name" name="inchargeName" value={formData.inchargeName} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Latitude" name="lat" value={formData.lat} onChange={handleChange} type="number" step="any" fullWidth margin="normal" required />
        <TextField label="Longitude" name="lng" value={formData.lng} onChange={handleChange} type="number" step="any" fullWidth margin="normal" required />
        <TextField label="Arrival Time (seconds)" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} type="number" fullWidth margin="normal" required />
        <Button variant="contained" onClick={manageBus} style={{ backgroundColor: '#e91e63', marginTop: '10px' }}>
          Save/Update Bus
        </Button>
      </Box>
      <div className="bus-list">
        {buses.map((bus) => (
          <div key={bus.id} className="bus-item">
            <span>
              Bus {bus.busNumberPlate} (ID: {bus.id}) - {bus.driverName}, {bus.inchargeName}, Lat: {bus.lat}, Lng: {bus.lng}, Time: {bus.arrivalTime}s
            </span>
            <Button variant="contained" color="error" onClick={() => deleteBus(bus.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .operator {
          padding: 20px;
          background-color: #f4f4f4;
          min-height: calc(100vh - 120px);
        }
        h2 {
          color: #333;
          text-align: center;
        }
        .bus-form {
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .bus-list {
          max-width: 600px;
          margin: 20px auto;
        }
        .bus-item {
          padding: 10px;
          background-color: #fff;
          margin-bottom: 10px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        @media (max-width: 768px) {
          .bus-form, .bus-list {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}

export default BusOperator;