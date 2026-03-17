import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Users, Search, ArrowRight, CheckCircle2, Package, Globe, Heart, Camera, MessageSquare, MapPin, Zap } from 'lucide-react';
import Group64 from '../../assets/Group 64.png';
import Group2 from '../../assets/Group 2.png';
import Group3 from '../../assets/Group 3.png';
import Group6 from '../../assets/Group 6.png';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 overflow-x-hidden mt-12 mb-24 px-6 lg:px-8">
            {/* Hero Section: Dynamic Split with Floating Elements */}
            <section className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-[50px] bg-white p-10 lg:p-20 shadow-[0_32px_80px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col lg:flex-row items-center gap-12">
                    {/* Background Accents */}
                    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-50 blur-3xl opacity-60"></div>

                    <div className="relative z-10 w-full lg:w-3/5 space-y-10 text-left">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            Next Gen Recovery
                        </div>

                        <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl leading-[1.05]">
                            Bringing your <br />
                            <span className="text-blue-600">belongings</span> <span className="italic">home.</span>
                        </h1>

                        <p className="max-w-lg text-lg font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
                            Advanced AI matched items for the modern community. Secure. Fast. Reliable.
                        </p>

                        <div className="flex flex-wrap gap-5 pt-4">
                            <button
                                onClick={() => navigate('/report-lost')}
                                className="group flex items-center gap-4 rounded-3xl bg-black px-10 py-6 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                I've Lost Something
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                            <button
                                onClick={() => navigate('/lost')}
                                className="flex items-center gap-4 rounded-3xl bg-white px-10 py-6 text-[11px] font-black uppercase tracking-widest text-gray-900 shadow-xl border border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:scale-105 active:scale-95"
                            >
                                I've Found Something
                            </button>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-2/5 flex justify-center lg:justify-end">
                        <div className="relative group">
                            <div className="absolute -inset-4 rounded-[45px] bg-gradient-to-tr from-blue-500 to-indigo-500 opacity-10 blur-xl transition-all group-hover:opacity-20"></div>
                            <img src={Group64} alt="Illustration" className="relative z-10 h-auto w-full max-w-[450px] rounded-[40px] shadow-2xl transition-transform duration-700 group-hover:rotate-1 group-hover:scale-105" />

                            {/* Floating Indicator */}
                            <div className="absolute -top-6 -right-6 z-20 rounded-full bg-white p-4 shadow-2xl animate-bounce duration-[4s] border border-gray-50 flex items-center gap-2">
                                <MapPin size={24} className="text-red-500 fill-red-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Live Matching</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features Section */}
            <section className="mx-auto max-w-7xl mt-12 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-8">
                {/* Large Bento Card */}
                <div className="md:col-span-3 lg:col-span-8 rounded-[40px] bg-white p-10 shadow-sm border border-gray-50 flex flex-col justify-between hover:shadow-xl transition-all group">
                    <div className="space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 leading-tight">AI Vision Correlation Engine</h3>
                        <p className="max-w-md text-sm font-medium text-gray-400 capitalize">Our proprietary computer vision scans every pixel to ensure that what was lost is exactly what was found, reducing fraud by 99%.</p>
                    </div>
                    <div className="mt-8 flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 w-16 shrink-0 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                        ))}
                    </div>
                </div>

                {/* Small Bento Card */}
                <div className="md:col-span-3 lg:col-span-4 rounded-[40px] bg-black p-10 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -z-0"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white">Privacy First</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ownership verification is encrypted and anonymous until both sides agree.</p>
                    </div>
                    <div className="relative z-10 pt-6">
                        <div className="h-1 w-full bg-white/10 rounded-full">
                            <div className="h-full w-2/3 bg-white rounded-full"></div>
                        </div>
                        <p className="text-[10px] font-black text-white mt-2 uppercase tracking-widest">Active Security</p>
                    </div>
                </div>

                {/* Feature Card: Community */}
                <div className="md:col-span-3 lg:col-span-4 rounded-[40px] bg-[#EBFDFA] p-10 shadow-sm border border-emerald-50 hover:bg-emerald-100 transition-all flex flex-col gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">100% Community Driven</h3>
                    <p className="text-sm font-medium text-gray-600">Built by people, for people. A shared mission to reunite memories.</p>
                </div>

                {/* Feature Card: Speed */}
                <div className="md:col-span-3 lg:col-span-4 rounded-[40px] bg-white p-10 shadow-sm border border-gray-50 hover:shadow-xl transition-all flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Search size={24} />
                        </div>
                        <span className="text-2xl font-black text-gray-100 group-hover:text-orange-100 transition-colors">01</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Instant Search</h3>
                        <p className="text-sm font-medium text-gray-400 capitalize">Scan millions of records in milliseconds.</p>
                    </div>
                </div>

                {/* Feature Card: Global */}
                <div className="md:col-span-6 lg:col-span-4 rounded-[40px] bg-white p-10 shadow-sm border border-gray-50 hover:shadow-xl transition-all flex items-center gap-8">
                    <div className="h-16 w-16 shrink-0 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Globe size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Global Coverage</h3>
                        <p className="text-xs font-bold text-gray-400">Available across all major cities and transit hubs.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Stacked Container */}
            <section className="mx-auto max-w-7xl mt-12 bg-white rounded-[50px] p-10 lg:p-20 shadow-sm border border-gray-50">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-400">The Workflow</h2>
                    <h3 className="text-4xl font-black text-gray-900 lg:text-5xl mt-2 tracking-tight">Easy as ABC</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[60px] left-0 w-full h-0.5 bg-gray-100 -z-0"></div>

                    {[
                        { step: '01', title: 'Submit Details', desc: 'Securely upload item info and images.', icon: <Package size={24} />, bg: 'bg-blue-50', text: 'text-blue-600' },
                        { step: '02', title: 'AI Verification', desc: 'Our bots scan for vision matches.', icon: <Camera size={24} />, bg: 'bg-purple-50', text: 'text-purple-600' },
                        { step: '03', title: 'Coordinate Return', desc: 'Safe handoff via our protocol.', icon: <Heart size={24} />, bg: 'bg-red-50', text: 'text-red-600' }
                    ].map((item, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                            <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-[35px] ${item.bg} ${item.text} shadow-xl border-4 border-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {item.icon}
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[200px]">{item.desc}</p>
                            <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 group-hover:text-black transition-colors">{item.step}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dynamic Stats Bar */}
            <section className="mx-auto max-w-7xl mt-12 overflow-hidden bg-black rounded-[40px] p-12 text-center relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
                    <div className="lg:border-r border-white/10 space-y-1">
                        <p className="text-4xl lg:text-5xl font-black text-white">$4.2M</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Value Returned</p>
                    </div>
                    <div className="lg:border-r border-white/10 space-y-1">
                        <p className="text-4xl lg:text-5xl font-black text-white tracking-widest">12K+</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Happy Users</p>
                    </div>
                    <div className="lg:border-r border-white/10 space-y-1">
                        <p className="text-4xl lg:text-5xl font-black text-blue-500">2.5S</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Match Speed</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl lg:text-5xl font-black text-emerald-500">99%</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Safety Score</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;


// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import Group64 from '../../assets/Group 64.png';
// import Group2 from '../../assets/Group 2.png';
// import Group3 from '../../assets/Group 3.png';
// import Group6 from '../../assets/Group 6.png';

// const Home = () => {
//     const navigate = useNavigate();

//     return (
//         <div className="flex h-[495px] p-[50px]">
//             <div className="w-1/2">
//                 <img src={Group64} alt="Illustration" className="h-[400px] w-[716px] pl-[169px]" />
//             </div>
//             <div className="flex w-1/2 flex-col">
//                 <img
//                     src={Group2}
//                     className="ml-[100px] mt-[10px] mb-[20px] h-[82px] w-[268px] cursor-pointer"
//                     alt="Lost Items"
//                     onClick={() => navigate('/lost')}
//                 />
//                 <img
//                     src={Group3}
//                     className="ml-[100px] mb-[20px] h-[82px] w-[268px] cursor-pointer"
//                     alt="Found Items"
//                     onClick={() => navigate('/found')}
//                 />
//                 <img src={Group6} className="ml-[100px] mt-[30px] h-[200px] w-[400px]" alt="Statistics or Logo" />
//             </div>
//         </div>
//     );
// };

// export default Home;
