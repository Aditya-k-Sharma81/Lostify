import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Github, Linkedin, Youtube, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="hidden md:block w-full border-t border-gray-200 bg-white px-6 md:px-15 py-10 font-sans mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                {/* Footer Content */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    {/* Site Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-[17px] font-bold">Site</h3>
                        <div className="flex flex-col gap-1.5">
                            <Link to="/lost" className="text-sm text-black transition-colors hover:text-[#0078d7]">Lost</Link>
                            <Link to="/report-lost" className="text-sm text-black transition-colors hover:text-[#0078d7]">Report Lost</Link>
                            <Link to="/found" className="text-sm text-black transition-colors hover:text-[#0078d7]">Found</Link>
                            <Link to="/report-found" className="text-sm text-black transition-colors hover:text-[#0078d7]">Report Found</Link>
                        </div>
                    </div>

                    {/* Help Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-[17px] font-bold">Help</h3>
                        <div className="flex flex-col gap-1.5">
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Customer Support</Link>
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Terms & Conditions</Link>
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Privacy Policy</Link>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-[17px] font-bold">Links</h3>
                        <div className="flex flex-col gap-1.5">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-black transition-colors hover:text-[#0078d7]">
                                <Linkedin size={16} /> LinkedIn
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-black transition-colors hover:text-[#0078d7]">
                                <Facebook size={16} /> Facebook
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-black transition-colors hover:text-[#0078d7]">
                                <Youtube size={16} /> YouTube
                            </a>
                            <Link to="/about" className="text-sm text-black transition-colors hover:text-[#0078d7]">About Us</Link>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-[17px] font-bold">Contact</h3>
                        <div className="flex flex-col gap-2 text-sm leading-relaxed">
                            <p className="flex items-center gap-2"><Phone size={14} /> +94 716520612</p>
                            <p className="flex items-center gap-2"><Mail size={14} /> support@lostify.com</p>
                        </div>
                        <div className="mt-2 flex gap-4">
                            <a href="#" className="text-black transition-colors hover:text-[#0078d7]"><Twitter size={18} /></a>
                            <a href="#" className="text-black transition-colors hover:text-[#0078d7]"><Facebook size={18} /></a>
                            <a href="#" className="text-black transition-colors hover:text-[#0078d7]"><Instagram size={18} /></a>
                            <a href="#" className="text-black transition-colors hover:text-[#0078d7]"><Github size={18} /></a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
