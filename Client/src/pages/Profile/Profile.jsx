import React, { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, MapPin, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AppContext';

const Profile = () => {
    const { isLoggedIn, user, login } = useAuth();
    const token = localStorage.getItem('token');

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(user?.profilePic || null);
    const [loading, setLoading] = useState(false);

    // Sync form state with user data when it loads
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setPreview(user.profilePic || null);
        }
    }, [user]);

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveOrUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!token) {
                throw new Error("No authentication token found. Please login again.");
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('address', address);
            if (photo) {
                formData.append('profilePic', photo);
            }

            const response = await fetch('http://localhost:5000/api/user/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`);
            }

            if (response.ok) {
                // Update local storage and context
                login(token, data.user);

                Swal.fire({
                    title: "Success!",
                    text: data.message || "Your profile has been updated successfully.",
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK"
                });
            } else {
                Swal.fire({
                    title: "Error!",
                    text: data.message || "Something went wrong.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire({
                title: "Error!",
                text: "Failed to connect to the server.",
                icon: "error",
                confirmButtonColor: "#d33",
                confirmButtonText: "OK"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50/50 p-4 font-sans">
            <div className="w-full max-w-3xl transform transition-all duration-500 hover:scale-[1.01]">
                <div className="relative overflow-hidden rounded-[40px] bg-white p-10 shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-gray-100 lg:p-16">

                    {/* Background Decorative Element */}
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-50 opacity-40 blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-purple-50 opacity-40 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">Profile</h2>
                            <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Personal Information</p>
                        </div>

                        <form onSubmit={handleSaveOrUpdate} className="space-y-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center mb-10">
                                <div className="group relative">
                                    <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-2xl ring-4 ring-gray-50 transition-all duration-500 group-hover:ring-blue-100 flex items-center justify-center bg-gray-100">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Profile Preview"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <User size={64} className="text-gray-400 transition-transform duration-700 group-hover:scale-110" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="profile-pic"
                                        className="absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-xl transition-all duration-300 hover:bg-gray-800 hover:scale-110 active:scale-95 border-2 border-white"
                                    >
                                        <Camera size={20} />
                                        <input
                                            type="file"
                                            id="profile-pic"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <span className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Photo</span>
                            </div>

                            {/* Input Fields - Grid for maximum width and clarity */}
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-gray-500">
                                        <User size={14} className="text-blue-500" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-2.5 px-4 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none`}
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-gray-500">
                                        <Mail size={14} className="text-purple-500" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        readOnly
                                        className={`w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-2.5 px-4 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none cursor-not-allowed opacity-60`}
                                        placeholder="Your Email"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-gray-500">
                                        <Phone size={14} className="text-green-500" /> Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-2.5 px-4 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none"
                                        placeholder="+91 "
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-gray-500">
                                        <MapPin size={14} className="text-red-500" /> Location / Address
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-2.5 px-4 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-black px-8 py-5 text-sm font-bold text-white transition-all duration-300 hover:bg-gray-900 active:scale-[0.98] shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={18} className="transition-transform duration-500 group-hover:rotate-180" />
                                            Update Profile
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
