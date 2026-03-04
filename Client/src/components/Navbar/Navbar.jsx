import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/lostify_logo.png';
import { useAuth } from '../../context/AppContext';

const Navbar = () => {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);

        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/login');
            }
        });
    };

    const closeMenu = () => setIsMenuOpen(false);

    const NavLinks = () => (
        <>
            <Link to="/home" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">Home</Link>
            <Link to="/lost" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">Lost</Link>
            <Link to="/report-lost" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">ReportLost</Link>
            <Link to="/found" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">Found</Link>
            <Link to="/report-found" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">ReportFound</Link>
            {isLoggedIn && (
                <Link to="/profile" onClick={closeMenu} className="text-black font-medium hover:text-gray-600 transition-colors">Profile</Link>
            )}
        </>
    );

    return (
        <nav className="sticky top-0 z-50 flex h-[70px] w-full items-center justify-between bg-white px-5 shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <Link to="/home" onClick={closeMenu}>
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-[60px] w-auto object-contain py-1"
                    />
                </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
                <NavLinks />

                {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt="User Profile"
                                    className="h-[35px] w-[35px] rounded-full object-cover border-2 border-black/10"
                                />
                            ) : (
                                <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-200 border-2 border-black/10">
                                    <User size={20} className="text-gray-600" />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2 cursor-pointer rounded-full border border-red-200 bg-red-50/50 px-5 py-1.5 text-sm font-bold text-red-600 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 shadow-sm"
                        >
                            <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                            <span>Log Out</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-black font-bold hover:text-gray-700 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-full bg-black px-5 py-1.5 text-sm font-bold text-white hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-4">
                {isLoggedIn && (
                    <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-200 border-2 border-black/10 overflow-hidden">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <User size={20} className="text-gray-600" />
                        )}
                    </div>
                )}
                <button
                    onClick={toggleMenu}
                    className="p-2 text-black hover:bg-black/5 rounded-lg transition-colors"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-xl font-bold">Menu</span>
                        <button onClick={toggleMenu} className="p-1 hover:bg-black/5 rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-5 text-lg">
                        <NavLinks />
                    </div>

                    <div className="mt-auto pt-10 border-t border-black/5">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-red-600 font-bold hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={20} />
                                <span>Log Out</span>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    onClick={closeMenu}
                                    className="w-full text-center py-3 font-bold text-black border-2 border-black rounded-xl hover:bg-black/5 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={closeMenu}
                                    className="w-full text-center py-3 font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay for Mobile Menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={toggleMenu}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;
