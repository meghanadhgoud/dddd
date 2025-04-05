import React, { useEffect, useState } from 'react';

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
        </div>
    );
}