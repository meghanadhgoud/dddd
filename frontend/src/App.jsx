import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OperatorPage from '../pages/OperatorPage';
import UserPage from '../pages/UserPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<OperatorPage />} />
            <Route path="/user" element={<UserPage />} />
        </Routes>
    );
}

export default App;