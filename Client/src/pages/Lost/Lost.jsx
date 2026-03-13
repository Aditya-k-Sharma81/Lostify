import React, { useState, useEffect } from 'react';
import { Search, Menu, User, Calendar, MapPin, Info, Phone, Mail, ChevronLeft, ChevronRight, X, Upload, MessageSquare, Package, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AppContext';

const Lost = () => {
    const { isLoggedIn, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('community'); // 'community' or 'my'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal Form State
    const [reporterName, setReporterName] = useState(user?.name || "");
    const [discoveryLocation, setDiscoveryLocation] = useState("");
    const [discoveryDate, setDiscoveryDate] = useState(new Date().toISOString().split('T')[0]);
    const [discoveryDesc, setDiscoveryDesc] = useState("");
    const [discoveryPhotos, setDiscoveryPhotos] = useState([]); // Array for up to 4 photos
    const [discoveryPhotoPreviews, setDiscoveryPhotoPreviews] = useState([]); // Array for previews

    // Fetch Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://lostify-backend-6nsq.onrender.com/api/lost/all');
                const data = await response.json();
                console.log('Fetched Lost Items:', data);
                console.log('Current User Context:', user);
                if (data.success) {
                    setItems(data.items);
                } else {
                    console.error('Failed to fetch items:', data.message);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Geolocation for Modal
    useEffect(() => {
        if (user) setReporterName(user.name || "");

        if (isModalOpen && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();
                    if (data && data.display_name) setDiscoveryLocation(data.display_name);
                } catch (err) { console.error(err); }
            });
        }
    }, [isModalOpen, user]);

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit to 4 photos total
        const remainingSlots = 4 - discoveryPhotos.length;
        if (remainingSlots <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached',
                text: 'You can only upload up to 4 photos.',
                confirmButtonColor: '#000'
            });
            return;
        }

        const newFiles = files.slice(0, remainingSlots);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        setDiscoveryPhotos(prev => [...prev, ...newFiles]);
        setDiscoveryPhotoPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setDiscoveryPhotos(prev => prev.filter((_, i) => i !== index));
        setDiscoveryPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const openContactModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();

        if (!discoveryDesc || discoveryPhotos.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Info',
                text: 'Please provide a description and at least one photo.',
                confirmButtonColor: '#000'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Verifying images with AI...',
                text: 'Please wait while we check image similarity.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();
            formData.append('lostItemId', selectedItem._id);
            formData.append('discoveryDate', discoveryDate);
            formData.append('discoveryLocation', discoveryLocation);
            formData.append('discoveryDesc', discoveryDesc);

            discoveryPhotos.forEach(photo => {
                formData.append('images', photo);
            });

            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            const response = await fetch('https://lostify-backend-6nsq.onrender.com/api/discovery/report', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Report Sent!',
                    text: data.message || `Your discovery report has been sent to the owner.`,
                    confirmButtonColor: '#000'
                });
                setIsModalOpen(false);
                setDiscoveryDesc("");
                setDiscoveryPhotos([]);
                setDiscoveryPhotoPreviews([]);
            } else {
                if (data.message === 'Photo is not similar enough.') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Verification Failed',
                        text: 'Photo is not similar enough.',
                        confirmButtonColor: '#000'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Error',
                        text: data.message || 'Something went wrong while submitting the report.',
                        confirmButtonColor: '#000'
                    });
                }
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to connect to the server.',
                confirmButtonColor: '#000'
            });
        }
    };

    const handleDelete = async (itemId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            background: '#fff',
            customClass: {
                popup: 'rounded-[30px]',
                confirmButton: 'rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest',
                cancelButton: 'rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest'
            }
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://lostify-backend-6nsq.onrender.com/api/lost/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Your report has been deleted.',
                        confirmButtonColor: '#000',
                        customClass: {
                            popup: 'rounded-[30px]',
                            confirmButton: 'rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest'
                        }
                    });
                    // Update local state
                    setItems(prev => prev.filter(item => item._id !== itemId));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Failed to delete the report.',
                        confirmButtonColor: '#000'
                    });
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to connect to the server.',
                    confirmButtonColor: '#000'
                });
            }
        }
    };

    const filteredItems = items.filter(item => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (item.itemName?.toLowerCase().includes(query)) ||
            (item.location?.toLowerCase().includes(query)) ||
            (item.description?.toLowerCase().includes(query));

        const isLost = item.status === 'lost';

        // Define isOwn by comparing item.user._id (populated) with user.id or user._id from context
        const userId = (user?.id || user?._id)?.toString();
        const itemUserId = (item.user?._id || item.user)?.toString();
        const isOwn = userId && itemUserId && userId === itemUserId;

        if (activeTab === 'my') {
            return matchesSearch && isOwn && isLost;
        }
        return matchesSearch && !isOwn && isLost; // Show only others in Community
    });

    // Item Card Component with Carousel
    const ItemCard = ({ item, isOwn }) => {
        const [currentImg, setCurrentImg] = useState(0);
        const images = item.images && item.images.length > 0 ? item.images : [];

        const nextImg = (e) => { e.stopPropagation(); if (images.length) setCurrentImg((prev) => (prev + 1) % images.length); };
        const prevImg = (e) => { e.stopPropagation(); if (images.length) setCurrentImg((prev) => (prev - 1 + images.length) % images.length); };

        return (
            <div className="group relative overflow-hidden rounded-[40px] bg-white shadow-xl transition-all duration-700 hover:scale-[1.05] hover:z-40 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col h-full active:scale-100">
                {/* Card Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-50 bg-white group-hover:bg-gray-50/50 transition-colors duration-500">
                    <div className="flex h-12 w-12 overflow-hidden rounded-2xl bg-black text-sm font-bold text-white shadow-lg items-center justify-center ring-4 ring-white transition-transform duration-500 group-hover:rotate-6">
                        {item.user?.profilePic ? (
                            <img src={item.user.profilePic} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            item.name.charAt(0)
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-gray-900 truncate text-base">{item.name}</h3>
                        <p className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <Calendar size={12} className="text-gray-300" /> {new Date(item.dateLost).toLocaleDateString()}
                        </p>
                    </div>
                    {!isOwn && (
                        <div className="flex animate-pulse items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-100 shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            Live
                        </div>
                    )}
                </div>

                {/* Card Image Carousel */}
                <div className="relative h-60 overflow-hidden bg-gray-100">
                    {images.length > 0 ? (
                        <img
                            src={images[currentImg]}
                            alt={item.itemName}
                            className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                            <Package size={56} />
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                    {images.length > 1 && (
                        <>
                            <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 border border-white/20">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100 border border-white/20">
                                <ChevronRight size={18} />
                            </button>
                            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                                {images.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImg ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute top-5 left-5">
                        <span className="rounded-xl bg-black/40 backdrop-blur-md px-4 py-2 text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-xl">
                            {item.itemName}
                        </span>
                    </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-[24px] bg-gray-50/50 border border-gray-100 transition-all duration-500 group-hover:bg-white group-hover:shadow-inner relative">
                        {/* Location Field */}
                        <div className="space-y-1 group/loc relative">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <MapPin size={14} className="text-red-500" /> Location
                            </div>
                            <div className="relative">
                                <p className="text-xs font-bold text-gray-700 line-clamp-1 transition-all duration-300">
                                    {item.location}
                                </p>
                                <div className="absolute left-0 top-0 z-[60] w-max max-w-[200px] rounded-xl bg-black px-4 py-2 text-xs font-bold text-white opacity-0 transition-opacity duration-300 pointer-events-none group-hover/loc:opacity-100 shadow-2xl">
                                    {item.location}
                                    <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-black"></div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <Phone size={14} className="text-green-500" /> Phone
                            </div>
                            <p className="text-xs font-bold text-gray-700">
                                {item.user?.phone || item.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2 px-1 group/desc relative">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Info size={14} className="text-blue-500" /> Description
                        </div>
                        <div className="relative">
                            <p className="text-xs font-medium leading-relaxed text-gray-600 line-clamp-2 transition-all duration-300">
                                {item.description}
                            </p>
                            <div className="absolute left-0 top-0 z-[60] w-[280px] rounded-2xl bg-[#1a1a1a] p-4 text-xs font-medium leading-relaxed text-white opacity-0 transition-all duration-300 translate-y-2 pointer-events-none group-hover/desc:opacity-100 group-hover/desc:translate-y-0 shadow-2xl border border-white/10">
                                {item.description}
                                <div className="absolute -top-1 left-6 h-2 w-2 rotate-45 bg-[#1a1a1a]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-white p-4 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-md hover:border-blue-100 group/email">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500 shadow-sm border border-blue-50 group-hover/email:bg-blue-600 group-hover/email:text-white transition-all duration-500">
                            <Mail size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">Direct Contact</p>
                            <p className="text-xs font-bold text-gray-700 truncate group-hover/email:text-blue-600 transition-colors uppercase">{item.user?.email || 'No email'}</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 bg-white group-hover:bg-gray-50/50 transition-colors duration-500 flex gap-3">
                    {isOwn ? (
                        <>
                            <div className="flex-1 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed text-center border border-gray-200">
                                Watching Item
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                                className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:rotate-12 hover:scale-110 shadow-sm border border-red-100"
                                title="Delete Report"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => openContactModal(item)}
                            className="w-full rounded-2xl bg-black py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all duration-300 hover:bg-gray-900 active:scale-[0.98]"
                        >
                            Contact Owner
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pt-10 font-sans">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">Lost Items</h2>
                    <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Help our community recover what's lost</p>
                </div>

                {/* Search & Tabs */}
                <div className="flex flex-col items-center gap-8 mb-16">
                    <div className="relative w-full max-w-xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 transition-colors group-focus-within:text-black">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, location, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-3xl border border-gray-100 bg-white py-5 pl-14 pr-12 text-sm font-semibold shadow-xl shadow-black/5 outline-none transition-all duration-300 focus:ring-8 focus:ring-black/5"
                        />
                        <div className="absolute inset-y-0 right-5 flex items-center text-gray-400">
                            <Menu size={20} />
                        </div>
                    </div>

                    <div className="flex rounded-2xl bg-white p-1.5 shadow-lg border border-gray-100">
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'my' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                        >
                            My Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'community' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                        >
                            Community
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map(item => (
                            <ItemCard key={item._id} item={item} isOwn={activeTab === 'my'} />
                        ))}
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-300">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-xl overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in duration-300 border border-gray-100 max-h-[90vh] flex flex-col">
                        {/* Premium Header - Solid Black/Dark Gray, No Gradient */}
                        <div className="flex h-32 shrink-0 flex-col items-center justify-center bg-[#0a0a0a] p-8 text-white relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300">
                                <X size={24} />
                            </button>
                            <div className="flex flex-col items-center gap-2">
                                <div className="rounded-2xl bg-white/10 p-2 border border-white/10">
                                    <MessageSquare size={24} className="text-blue-400" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em]">Contact Owner</h2>
                                    <p className="mt-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">Regarding your {selectedItem.itemName}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleReportSubmit} className="p-8 lg:p-10 space-y-7 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Reporter
                                    </label>
                                    <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center text-[10px] text-white">A</div>
                                        <span className="text-xs font-bold text-gray-500">{reporterName}</span>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Date Found
                                    </label>
                                    <input
                                        type="date"
                                        value={discoveryDate}
                                        onChange={(e) => setDiscoveryDate(e.target.value)}
                                        className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> Specific Location
                                </label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                                    <input
                                        type="text"
                                        value={discoveryLocation}
                                        onChange={(e) => setDiscoveryLocation(e.target.value)}
                                        placeholder="Enter coordinates or address..."
                                        className="w-full rounded-2xl border border-gray-100 bg-white py-4 pl-12 pr-4 text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Discovery Details
                                </label>
                                <textarea
                                    rows="3"
                                    value={discoveryDesc}
                                    onChange={(e) => setDiscoveryDesc(e.target.value)}
                                    placeholder="Tell the owner where and how you found it..."
                                    className="w-full rounded-3xl border border-gray-100 bg-white p-4 text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-black transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Proof of Discovery
                                    </label>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{discoveryPhotos.length}/4 Images</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {discoveryPhotoPreviews.map((preview, index) => (
                                        <div key={index} className="group/item relative aspect-square overflow-hidden rounded-2xl border-2 border-gray-50 shadow-sm transition-all hover:border-black">
                                            <img src={preview} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
                                            >
                                                <X size={16} className="text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {discoveryPhotos.length < 4 && (
                                        <label className={`relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 transition-all hover:border-black hover:bg-white group flex flex-col items-center justify-center`}>
                                            <Upload size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                                            <span className="mt-2 text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Add Pic</span>
                                            <input type="file" multiple onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all duration-500 hover:bg-gray-800 active:scale-[0.98]">
                                <MessageSquare size={16} />
                                Send Message to Owner
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lost;
