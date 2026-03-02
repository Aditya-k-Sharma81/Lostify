import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Profile from './pages/Profile/Profile';
import ReportFound from './pages/ReportFound/ReportFound';
import ReportLost from './pages/ReportLost/ReportLost';
import Lost from './pages/Lost/Lost';
import Found from './pages/Found/Found';
import Home from './pages/Home/Home';
import { AuthProvider } from './context/AppContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex min-h-screen flex-col bg-gray-50">
                    <Navbar />


                    <main className="container mx-auto flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/lost" element={<div className="p-8"><Lost /></div>} />
                            <Route path="/report-lost" element={<div className="p-8"><ReportLost /></div>} />
                            <Route path="/found" element={<div className="p-8"><Found /></div>} />
                            <Route path="/report-found" element={<div className="p-8"><ReportFound /></div>} />
                            <Route path="/profile" element={<div className="p-8"><Profile /></div>} />
                            <Route path="/login" element={<div className="p-8"><Login /></div>} />
                            <Route path="/signup" element={<div className="p-8"><SignUp /></div>} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
