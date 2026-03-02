import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/logo name.png';
import { useAuth } from '../../context/AppContext';

const Navbar = () => {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();

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

    return (
        <nav className="flex h-[70px] w-full items-center justify-between bg-[#FDFDEB] px-5 shadow-sm">
            <div className="flex items-center">
                <img
                    src={logo}
                    alt="Logo"
                    className="h-auto max-h-full w-[185px] object-contain"
                />
            </div>

            <div className="flex items-center gap-6">
                <Link to="/home" className="text-black font-medium hover:text-gray-600 transition-colors">Home</Link>
                <Link to="/lost" className="text-black font-medium hover:text-gray-600 transition-colors">Lost</Link>
                <Link to="/report-lost" className="text-black font-medium hover:text-gray-600 transition-colors">ReportLost</Link>
                <Link to="/found" className="text-black font-medium hover:text-gray-600 transition-colors">Found</Link>
                <Link to="/report-found" className="text-black font-medium hover:text-gray-600 transition-colors">ReportFound</Link>

                {isLoggedIn ? (
                    <>
                        <Link to="/profile" className="text-black font-medium hover:text-gray-600 transition-colors">Profile</Link>
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
                    </>
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
        </nav>
    );
};

export default Navbar;
