import React, { useState, useEffect } from 'react';
import { Search, Menu, Calendar, MapPin, Info, Phone, ChevronLeft, ChevronRight, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AppContext';

const Found = () => {
    const { isLoggedIn, backendUrl } = useAuth();
    const token = localStorage.getItem('token');
    const [searchQuery, setSearchQuery] = useState('');
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchAcceptedReports();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, token]);

    const fetchAcceptedReports = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/discovery/accepted`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                // Map discovery reports to the format expected by the UI
                const mappedItems = data.reports.map(report => ({
                    id: report._id,
                    ownerName: report.lostItem?.user?.name || "Owner",
                    finderName: report.reporter?.name || "Reporter",
                    finderEmail: report.reporter?.email || "N/A",
                    finderPhone: report.reporter?.phone || "N/A",
                    dateFound: new Date(report.discoveryDate).toLocaleDateString(),
                    item: report.lostItem?.itemName || "Item",
                    location: report.discoveryLocation,
                    description: report.discoveryDesc,
                    photos: report.discoveryPhotos || []
                }));
                setFoundItems(mappedItems);
            }
        } catch (error) {
            console.error("Error fetching accepted reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = foundItems.filter(item =>
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Item Card Component with Carousel
    const ItemCard = ({ item }) => {
        const [currentImg, setCurrentImg] = useState(0);

        const nextImg = (e) => {
            e.stopPropagation();
            setCurrentImg((prev) => (prev + 1) % item.photos.length);
        };
        const prevImg = (e) => {
            e.stopPropagation();
            setCurrentImg((prev) => (prev - 1 + item.photos.length) % item.photos.length);
        };

        return (
            <div className="group overflow-hidden rounded-[32px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-100/50 flex flex-col h-full">
                {/* Card Header - Owner's Detail */}
                <div className="flex items-center gap-4 p-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-lg uppercase">
                        {item.ownerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Owner</div>
                        <h3 className="font-bold text-gray-900 truncate text-sm">{item.ownerName}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={10} /> {item.dateFound}
                    </div>
                </div>

                {/* Card Image Carousel */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                        src={item.photos[currentImg]}
                        alt={item.item}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {item.photos.length > 1 && (
                        <>
                            <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-all hover:bg-black/60 shadow-lg border border-white/10">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-all hover:bg-black/60 shadow-lg border border-white/10">
                                <ChevronRight size={16} />
                            </button>
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {item.photos.map((_, i) => (
                                    <div key={i} className={`h-1 transition-all rounded-full ${i === currentImg ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute top-3 left-4">
                        <span className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                            {item.item}
                        </span>
                    </div>
                </div>

                {/* Card Content - Finder's Details */}
                <div className="flex-1 p-5 space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                <Info size={12} className="text-blue-500" /> Found By
                            </div>
                            <p className="text-xs font-bold text-gray-700 truncate">{item.finderName}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                <Phone size={12} className="text-purple-500" /> Contact
                            </div>
                            <p className="text-xs font-bold text-gray-700 truncate">{item.finderPhone}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <MapPin size={12} className="text-green-500" /> Location Found
                        </div>
                        <p className="text-xs font-bold text-gray-700 line-clamp-1">{item.location}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <Info size={12} className="text-blue-500" /> Email
                        </div>
                        <p className="text-xs font-medium text-gray-600 truncate">{item.finderEmail}</p>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-0">
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-50 py-3.5 text-[10px] font-black uppercase tracking-widest text-green-600 border border-green-100 shadow-sm">
                        <CheckCircle size={14} /> Item Found
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pt-10 font-sans">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">Recovered Items</h2>
                    <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Personal gallery of your successfully returned belongings</p>
                </div>

                {/* Search Bar */}
                <div className="flex justify-center mb-16 px-4">
                    <div className="relative w-full max-w-xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 transition-colors group-focus-within:text-black">
                            <Menu size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search recovered items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-3xl border border-gray-100 bg-white py-5 pl-14 pr-12 text-sm font-semibold shadow-xl shadow-black/5 outline-none transition-all duration-300 focus:ring-8 focus:ring-black/5"
                        />
                        <div className="absolute inset-y-0 right-5 flex items-center text-gray-400">
                            <Search size={20} />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
                        </div>
                    ) : !isLoggedIn ? (
                        <div className="col-span-full text-center py-20">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                                <Info size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Please Login</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">You need to be logged in to view your recovered items.</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))
                    )}
                </div>

                {isLoggedIn && filteredItems.length === 0 && !loading && (
                    <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-300">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No recovered items found</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-4">Items will appear here once you accept a discovery claim.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Found;
