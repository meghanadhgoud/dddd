import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OperatorPage from '../pages/OperatorPage';
import UserPage from '../pages/UserPage';
import DriverPage from '../pages/DriverPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<OperatorPage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/driver" element={<DriverPage />} />
        </Routes>
    );
}

export default App;