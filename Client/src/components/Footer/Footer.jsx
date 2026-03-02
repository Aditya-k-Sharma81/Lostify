import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Github, Linkedin, Youtube, Phone, Mail } from 'lucide-react';
import footerLogo from '../../assets/Logo.png';

const Footer = () => {
    return (
        <footer className="w-full border-t border-gray-200 bg-linear-to-r from-[#fefaf4] to-[#f8fff2] px-15 py-7.5 font-sans">
            <div className="flex flex-wrap items-start justify-around gap-8">
                {/* Logo Section */}
                <div className="flex-shrink-0">
                    <img
                        src={footerLogo}
                        alt="Lost and Found Logo"
                        className="h-full w-[119px] object-cover"
                    />
                </div>

                {/* Footer Content */}
                <div className="flex flex-1 flex-wrap justify-between gap-10">
                    {/* Site Column */}
                    <div className="min-w-[150px]">
                        <h3 className="mb-2.5 text-[17px] font-bold">Site</h3>
                        <div className="flex flex-col gap-1.5">
                            <Link to="/lost" className="text-sm text-black transition-colors hover:text-[#0078d7]">Lost</Link>
                            <Link to="/report-lost" className="text-sm text-black transition-colors hover:text-[#0078d7]">Report Lost</Link>
                            <Link to="/found" className="text-sm text-black transition-colors hover:text-[#0078d7]">Found</Link>
                            <Link to="/report-found" className="text-sm text-black transition-colors hover:text-[#0078d7]">Report Found</Link>
                        </div>
                    </div>

                    {/* Help Column */}
                    <div className="min-w-[150px]">
                        <h3 className="mb-2.5 text-[17px] font-bold">Help</h3>
                        <div className="flex flex-col gap-1.5">
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Customer Support</Link>
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Terms & Conditions</Link>
                            <Link to="#" className="text-sm text-black transition-colors hover:text-[#0078d7]">Privacy Policy</Link>
                        </div>
                    </div>

                    {/* Copyright Column */}
                    <div className="mt-16 min-w-[150px] text-center text-[13px]">
                        <p>© Copyright 2025 Lost and Found</p>
                        <p>All Rights Reserved</p>
                    </div>

                    {/* Links Column */}
                    <div className="min-w-[150px]">
                        <h3 className="mb-2.5 text-[17px] font-bold">Links</h3>
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
                    <div className="min-w-[150px]">
                        <h3 className="mb-2.5 text-[17px] font-bold">Contact</h3>
                        <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
                            <p className="flex items-center gap-2"><Phone size={14} /> +94 716520690</p>
                            <p className="flex items-center gap-2"><Mail size={14} /> talkprojects@wrenix.com</p>
                        </div>
                        <div className="mt-2.5 flex gap-2.5">
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
