import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Phone,
    Mail,
    MapPin,
    User,
    Calendar,
    Info,
    Image as ImageIcon,
    ChevronRight,
    MessageSquare,
    ShieldCheck,
    Clock,
    ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AppContext';

const ReportFound = () => {
    const { isLoggedIn, backendUrl } = useAuth();
    const token = localStorage.getItem('token');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && isLoggedIn) {
            fetchClaims();
        }
    }, [token, isLoggedIn]);

    const fetchClaims = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/discovery/my-lost-reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setClaims(data.reports);
            }
        } catch (error) {
            // console.error("Error fetching claims:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const status = action === 'accept' ? 'accepted' : 'rejected';

        Swal.fire({
            title: `Are you sure?`,
            text: `You are about to ${action} this claim.`,
            icon: action === 'accept' ? 'success' : 'warning',
            showCancelButton: true,
            confirmButtonColor: action === 'accept' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action}!`,
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[24px] border-none shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest',
                cancelButton: 'rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${backendUrl}/api/discovery/status/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ status })
                    });

                    const data = await res.json();
                    if (data.success) {
                        setClaims(prev => prev.map(c => c._id === id ? { ...c, status } : c));
                        setSelectedClaim(prev => prev?._id === id ? { ...prev, status } : prev);

                        Swal.fire({
                            title: action === 'accept' ? 'Claim Accepted!' : 'Claim Rejected',
                            text: action === 'accept' ? 'The item has been marked as claimed.' : 'The claim has been dismissed.',
                            icon: 'success',
                            confirmButtonColor: '#000',
                            customClass: {
                                popup: 'rounded-[24px]',
                                confirmButton: 'rounded-xl px-8 py-3 text-xs font-bold uppercase tracking-widest'
                            }
                        });
                    } else {
                        Swal.fire("Error", data.message || "Failed to update status", "error");
                    }
                } catch (error) {
                    // console.error("Error updating status:", error);
                    Swal.fire("Error", "Network error", "error");
                }
            }
        });
    };

    const PhotoCarousel = ({ photos, label, badge }) => {
        const [current, setCurrent] = useState(0);

        const next = () => setCurrent((prev) => (prev + 1) % photos.length);
        const prev = () => setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

        if (!photos || photos.length === 0) return null;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white ${badge === 'Reference' ? 'bg-black' : 'bg-blue-500'}`}>
                        {badge}
                    </span>
                </div>
                <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-white shadow-xl group">
                    <img
                        src={photos[current]}
                        alt={label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                            >
                                <ChevronRight className="rotate-180" size={16} />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                            >
                                <ChevronRight size={16} />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {photos.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                        {current + 1} / {photos.length}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-4 lg:p-10 font-sans text-gray-900">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-100">
                            <ShieldCheck size={14} /> Security Dashboard
                        </div>
                        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">Received Claims</h1>
                        <p className="text-sm font-bold text-gray-400 max-w-md">Verify ownership details and approve claims for items you've found.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center justify-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending</span>
                            <span className="text-2xl font-black">{claims.filter(c => c.status === 'pending').length}</span>
                        </div>
                        <div className="rounded-3xl bg-black p-6 shadow-xl shadow-black/20 flex flex-col items-center justify-center min-w-[120px] text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Approved</span>
                            <span className="text-2xl font-black">{claims.filter(c => c.status === 'accepted').length}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Claims List Section */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 px-2 flex items-center gap-2">
                            <Clock size={14} /> Recent Requests
                        </h3>
                        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
                                </div>
                            ) : claims.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No claims found</p>
                                </div>
                            ) : (
                                claims.map((claim) => (
                                    <div
                                        key={claim._id}
                                        onClick={() => setSelectedClaim(claim)}
                                        className={`group cursor-pointer rounded-[32px] p-5 transition-all duration-300 border-2 ${selectedClaim?._id === claim._id
                                            ? 'bg-black text-white border-black shadow-2xl scale-[1.02]'
                                            : 'bg-white text-gray-900 border-transparent hover:border-gray-200 shadow-lg shadow-black/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black ${selectedClaim?._id === claim._id ? 'bg-white/10' : 'bg-gray-100'}`}>
                                                {claim.reporter.name.charAt(0)}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${claim.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                claim.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-sm group-hover:translate-x-1 transition-transform">{claim.reporter.name}</h4>
                                        <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${selectedClaim?._id === claim._id ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Claimed: {claim.lostItem?.itemName}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedClaim?._id === claim._id ? 'text-gray-500' : 'text-gray-300'}`}>
                                                {new Date(claim.createdAt).toLocaleDateString()}
                                            </span>
                                            <ChevronRight size={14} className={selectedClaim?._id === claim._id ? 'text-white' : 'text-gray-300'} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detailed Claim Review View */}
                    <div className="lg:col-span-8">
                        {selectedClaim ? (
                            <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
                                {/* Review Header */}
                                <div className="bg-[#0a0a0a] p-8 lg:p-10 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/10">
                                            {selectedClaim.reporter.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{selectedClaim.reporter.name}</h2>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Claim ID: {selectedClaim._id}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-end gap-2 text-right">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <Calendar size={12} /> Received on {new Date(selectedClaim.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                            AI Match: {selectedClaim.similarityScore?.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 lg:p-12 space-y-10">
                                    {/* Contact Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                                    <User size={14} className="text-blue-500" /> Personal Details
                                                </h4>
                                                <div className="bg-gray-50 rounded-[24px] p-6 space-y-4 border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                                            <Phone size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                            <p className="text-xs font-black text-gray-900">{selectedClaim.reporter.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                                            <Mail size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                                            <p className="text-xs font-black text-gray-900">{selectedClaim.reporter.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                                                        <div className="h-10 w-10 text-red-500 shrink-0"><MapPin size={20} /></div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Permanent Address</p>
                                                            <p className="text-xs font-bold leading-relaxed text-gray-700">{selectedClaim.discoveryLocation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                                <MessageSquare size={14} className="text-orange-500" /> Claim Narrative
                                            </h4>
                                            <div className="bg-gray-50 rounded-[24px] p-6 min-h-[160px] flex flex-col justify-center border border-gray-100 relative overflow-hidden">
                                                <div className="absolute top-4 right-4 text-gray-200">
                                                    <Info size={40} strokeWidth={3} />
                                                </div>
                                                <p className="text-xs font-bold leading-relaxed text-gray-600 italic relative z-10 font-sans">
                                                    "{selectedClaim.discoveryDesc}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof Comparison Gallery with Carousels */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                            <ImageIcon size={14} className="text-emerald-500" /> Proof Comparison Gallery
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <PhotoCarousel
                                                photos={selectedClaim.lostItem?.images}
                                                label="Your Lost Photos"
                                                badge="Reference"
                                            />
                                            <PhotoCarousel
                                                photos={selectedClaim.discoveryPhotos}
                                                label="Reporter's Proof Photos"
                                                badge="Evidence"
                                            />
                                        </div>
                                    </div>


                                    {/* Action Buttons */}
                                    {selectedClaim.status === 'pending' && (
                                        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => handleAction(selectedClaim._id, 'reject')}
                                                className="flex-1 rounded-2xl border-2 border-gray-100 py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all duration-300"
                                            >
                                                <XCircle size={18} /> Dismiss Claim
                                            </button>
                                            <button
                                                onClick={() => handleAction(selectedClaim._id, 'accept')}
                                                className="flex-[2] rounded-2xl bg-black py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-gray-900 hover:shadow-2xl active:scale-[0.98] transition-all duration-500"
                                            >
                                                <CheckCircle size={18} className="text-green-500" /> Verify & Transfer Ownership
                                            </button>
                                        </div>
                                    )}

                                    {selectedClaim.status !== 'pending' && (
                                        <div className={`rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 border-2 ${selectedClaim.status === 'accepted' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                            {selectedClaim.status === 'accepted' ? (
                                                <CheckCircle size={48} className="text-green-500" />
                                            ) : (
                                                <XCircle size={48} className="text-red-500" />
                                            )}
                                            <h3 className={`text-xl font-black uppercase tracking-widest ${selectedClaim.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                                Claim {selectedClaim.status === 'accepted' ? 'Approved' : 'Rejected'}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-500 max-w-sm"> This request has been processed. No further actions are required from your end.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border-4 border-dashed border-gray-100">
                                <div className="h-24 w-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200 mb-8 animate-bounce">
                                    <ArrowLeft size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-300 uppercase tracking-[0.2em]">Select a Claim</h2>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-4 max-w-xs leading-loose">Choose a request from the sidebar to review evidence and contact details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default ReportFound;
