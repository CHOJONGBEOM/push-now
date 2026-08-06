import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Generate } from './pages/Generate';
import { Feed } from './pages/Feed';
import { Timing } from './pages/Timing';
import { Trends } from './pages/Trends';
import { Review } from './pages/Review';
import { Contact } from './pages/Contact';
import { trackPageView } from './utils/analytics';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';

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

// Generate 페이지 - 로그인 필요
function ProtectedGenerate() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;

    // 비로그인: 모달 표시, X 누르면 랜딩으로 이동
    if (!user) {
        return <LoginModal onClose={() => navigate(-1)} />;
    }

    return <Generate />;
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <PageTracker />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/generate" element={<ProtectedGenerate />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/timing" element={<Timing />} />
                    <Route path="/trends" element={<Trends />} />
                    <Route path="/review" element={<Review />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
