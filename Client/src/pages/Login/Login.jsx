import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Twitter, Facebook, Instagram, Github } from 'lucide-react';
import { useAuth } from '../../context/AppContext';

// Asset imports
import heroPic from '../../assets/HeroPic.png';

const Login = () => {
    const { login, backendUrl } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            Swal.fire({
                title: "Oops!",
                text: "Please enter both email and password.",
                icon: "warning",
                confirmButtonText: "OK"
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: "Success!",
                    text: data.message || "Logged in successfully!",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    login(data.token, data.user);
                    navigate('/home');
                });
            } else {
                throw new Error(data.message || "Invalid credentials.");
            }
        } catch (error) {
            // console.error('Login error:', error);
            Swal.fire({
                title: "Oops!",
                text: error.message,
                icon: "warning",
                confirmButtonText: "OK"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col font-sans">

            {/* Hero & Login Section */}
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
                {/* Hero Side */}
                <div className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden bg-white p-6 lg:w-[60%] lg:min-h-[540px]">
                    {/* Animated Background Blobs */}
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-reverse"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>

                    {/* Decorative Grid Overlay */}
                    <div className="absolute inset-0 bg-grid-black opacity-[0.02]"></div>

                    <div className="relative group max-w-[824px] transform transition-all duration-1000">
                        <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
                            <img
                                src={heroPic}
                                alt="Hero"
                                className="h-auto w-full transition-all duration-700 group-hover:scale-105 lg:h-[460px] lg:w-[824px] object-cover"
                            />
                        </div>

                        {/* High-Visibility Card */}
                        <div className="absolute top-1/2 left-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/90 p-8 text-center backdrop-blur-md border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] lg:w-[80%] lg:p-12 animate-fade-in-up transition-all duration-500 group-hover:bg-white">
                            <h2 className="mb-6 text-3xl font-black tracking-tight text-black lg:text-5xl">
                                <span className="block italic font-serif text-2xl lg:text-3xl font-medium text-gray-600 mb-2">Welcome to Your</span>
                                <span className="text-black">Lost and Found</span>
                            </h2>
                            <p className="text-sm leading-relaxed font-semibold text-gray-800 lg:text-xl max-w-2xl mx-auto">
                                Reconnecting people with their cherished belongings. Our intuitive platform makes reporting and recovering items simpler, faster, and more efficient than ever before.
                            </p>

                            {/* Decorative Elements */}
                            <div className="mt-8 flex justify-center items-center gap-4">
                                <div className="h-[1px] w-12 bg-gray-200"></div>
                                <div className="flex gap-2">
                                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                    <div className="h-2 w-2 rounded-full bg-pink-400"></div>
                                    <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                                </div>
                                <div className="h-[1px] w-12 bg-gray-200"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Side */}
                <div className="flex w-full items-center justify-center bg-white p-8 lg:w-[40%]">
                    <form
                        onSubmit={handleLogin}
                        className="relative flex w-full max-w-[400px] flex-col rounded-3xl bg-white p-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] lg:p-10 transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-black tracking-tighter text-black lg:text-4xl">Login</h2>
                            <p className="mt-2 text-sm font-medium text-gray-500">Access your dashboard</p>
                        </div>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm transition-all duration-300 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none placeholder:text-gray-400"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm transition-all duration-300 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none placeholder:text-gray-400"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative mt-10 w-full overflow-hidden rounded-xl bg-black p-4 text-sm font-bold text-white transition-all duration-300 hover:bg-gray-900 active:scale-[0.98] shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Logging In...' : 'Sign In'}
                                {!loading && (
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </span>
                        </button>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm font-medium text-gray-500">
                                Don't have an account?
                                <Link to="/signup" className="ml-2 font-bold text-black hover:underline underline-offset-4 decoration-2 transition-all">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
