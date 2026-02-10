import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Generate } from './pages/Generate';
import { Feed } from './pages/Feed';
import { Timing } from './pages/Timing';
import { Trends } from './pages/Trends';
import { Review } from './pages/Review';
import { Contact } from './pages/Contact';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/timing" element={<Timing />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/review" element={<Review />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </Router>
    );
};

export default App;