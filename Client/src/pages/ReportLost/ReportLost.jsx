import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Calendar, Info, Phone, User, X, Upload, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AppContext';

const ReportLost = () => {
    const { isLoggedIn, user } = useAuth();
    const token = localStorage.getItem('token');

    // Form State
    const [name, setName] = useState(user?.name || "");
    const [item, setItem] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [myItems, setMyItems] = useState([]);
    const [discoveryReports, setDiscoveryReports] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // Images State
    const [images, setImages] = useState([]); // Array of { file, preview }
    const MAX_IMAGES = 4;

    // Prefill user data when loaded
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            fetchUserData();
        }
    }, [user, token]);

    const fetchUserData = async () => {
        if (!token) return;
        setDataLoading(true);
        try {
            const itemsRes = await fetch('http://localhost:5000/api/lost/my-items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const itemsData = await itemsRes.json();
            if (itemsData.success) setMyItems(itemsData.items);

            const reportsRes = await fetch('http://localhost:5000/api/discovery/my-lost-reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const reportsData = await reportsRes.json();
            if (reportsData.success) setDiscoveryReports(reportsData.reports);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setDataLoading(false);
        }
    };

    // Geolocation on Mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    if (data && data.display_name) {
                        setLocation(data.display_name);
                    }
                } catch (err) {
                    console.error("Error fetching location name:", err);
                }
            });
        }
    }, []);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > MAX_IMAGES) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached',
                text: `You can only upload up to ${MAX_IMAGES} images.`,
                confirmButtonColor: '#000'
            });
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    // Remove Image
    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            Swal.fire("Error", "Please login to report a lost item.", "error");
            return;
        }

        if (!item || !location || !date) {
            Swal.fire("Error", "Please fill in all required fields.", "error");
            return;
        }

        setLoading(true);
        Swal.fire({
            title: "Submitting...",
            text: "Please wait while we record your report.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formData = new FormData();
            formData.append('itemName', item);
            formData.append('location', location);
            formData.append('dateLost', date);
            formData.append('description', description);
            formData.append('name', name);
            formData.append('phone', phone);

            images.forEach((img) => {
                formData.append('images', img.file);
            });

            const response = await fetch('http://localhost:5000/api/lost/report', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: "Success!",
                    text: data.message || "Your lost item has been reported successfully.",
                    icon: "success",
                    confirmButtonColor: "#000"
                });

                // Reset Form
                setItem("");
                setDescription("");
                setImages([]);
                fetchUserData();
            } else {
                Swal.fire("Error", data.message || "Something went wrong.", "error");
            }
        } catch (error) {
            console.error('Submission error:', error);
            Swal.fire("Error", "Failed to connect to the server.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pt-12 font-sans overflow-hidden relative">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-100 opacity-20 blur-3xl anim-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-purple-100 opacity-20 blur-3xl anim-blob anim-delay-2000"></div>

            <div className="mx-auto max-w-4xl relative z-10">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">Report Lost Item</h2>
                    <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">We'll help you find what you've lost</p>
                </div>

                <div className="overflow-hidden rounded-[40px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-8 lg:p-16 space-y-10">
                        {/* Identity Section (Readonly) */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <User size={14} className="text-blue-500" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    readOnly
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-3 px-5 text-sm font-semibold text-gray-500 cursor-not-allowed outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <Phone size={14} className="text-green-500" /> Contact Number
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    readOnly
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-3 px-5 text-sm font-semibold text-gray-500 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        {/* Item Details */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors group-focus-within:text-black">
                                    <Package size={14} className="text-purple-500" /> Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => setItem(e.target.value)}
                                    required
                                    placeholder="What did you lose?"
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-3 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <Calendar size={14} className="text-orange-500" /> Date Lost *
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-3 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none appearance-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <MapPin size={14} className="text-red-500" /> Last Seen Location *
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                placeholder="Auto-fetching location..."
                                className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 py-3 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <Info size={14} className="text-blue-500" /> Detailed Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                placeholder="Color, brand, special marks, etc."
                                className="w-full rounded-3xl border border-gray-100 bg-gray-50/30 py-4 px-5 text-sm font-semibold transition-all duration-300 focus:bg-white focus:border-black focus:ring-8 focus:ring-black/5 focus:outline-none placeholder:text-gray-300 resize-none"
                            ></textarea>
                        </div>

                        {/* Multi-Image Upload Section */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <Camera size={14} className="text-pink-500" /> Upload Photos (Max 4)
                                </label>
                                <span className="text-[10px] font-bold text-gray-400 capitalize">{images.length} of {MAX_IMAGES} slots used</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-white shadow-md transition-all duration-300 hover:shadow-xl">
                                        <img src={img.preview} alt="Upload Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all duration-200 hover:bg-black hover:scale-110"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {images.length < MAX_IMAGES && (
                                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all duration-300 hover:border-black hover:bg-white group">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-black group-hover:text-white">
                                            <Upload size={18} />
                                        </div>
                                        <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Add Pic</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-black px-12 py-5 text-sm font-black uppercase tracking-widest text-white transition-all duration-500 hover:bg-gray-900 active:scale-[0.98] shadow-2xl shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? "Reporting..." : "Submit Report"}
                                <div className={`h-1.5 w-1.5 rounded-full bg-green-400 ${loading ? "animate-spin" : "animate-pulse"}`}></div>
                            </span>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        </button>
                    </form>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .anim-blob {
                    animation: blob 7s infinite alternate ease-in-out;
                }
                .anim-delay-2000 {
                    animation-delay: 2s;
                }
            `}} />
            </div>
        </div>
    );
};

export default ReportLost;
