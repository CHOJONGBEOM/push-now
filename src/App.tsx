import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Generate } from './pages/Generate';
import { Feed } from './pages/Feed';
import { Timing } from './pages/Timing';
import { Trends } from './pages/Trends';
import { Review } from './pages/Review';
import { Contact } from './pages/Contact';
import { trackPageView } from './utils/analytics';

const PAGE_NAMES: Record<string, string> = {
    '/': 'Landing',
    '/dashboard': 'Dashboard',
    '/generate': 'Generate',
    '/feed': 'Feed',
    '/timing': 'Timing',
    '/trends': 'Trends',
    '/review': 'Review',
    '/contact': 'Contact',
};

function PageTracker() {
    const location = useLocation();
    useEffect(() => {
        const pageName = PAGE_NAMES[location.pathname] ?? location.pathname;
        trackPageView(pageName, { path: location.pathname });
    }, [location.pathname]);
    return null;
}

const App: React.FC = () => {
    return (
        <Router>
            <PageTracker />
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
