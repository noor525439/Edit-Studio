import React from 'react'
import { getData } from '@/context/UserContext'
import { Navigate } from 'react-router-dom'

const ClientDashboard = () => {
    const { user } = getData()

    // Ensuring only Freelancers can view this project board
    if (!user || user.role !== "freelancer") {
        return <Navigate to="/" />
    }

    // Dummy Data for Clients/Projects looking for editors
    const clientProjects = [
        {
            id: 1,
            company: "Pulse Media Group",
            project: "Full-time Content Editor",
            budget: "$4,000/mo",
            status: "Payment Verified",
            rating: 4.9,
            escrow: "100% Guaranteed",
            tags: ["Long-term", "High Budget"]
        },
        {
            id: 2,
            company: "Urban Tech Reviews",
            project: "YouTube Video Specialist",
            budget: "$150 / Video",
            status: "Identity Verified",
            rating: 4.7,
            escrow: "Escrow Active",
            tags: ["Tech", "Remote"]
        },
        {
            id: 3,
            company: "Creative Studio X",
            project: "Social Media Reel Editor",
            budget: "$500 / Project",
            status: "Payment Verified",
            rating: 5.0,
            escrow: "100% Guaranteed",
            tags: ["Fast-Paced", "Creative"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Trust Header Section */}
                <div className="bg-white border border-blue-100 rounded-3xl p-8 mb-10 shadow-sm flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Find Your Next <span className="text-blue-600">Secure Project</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            We use <span className="font-bold text-slate-700">Smart-Escrow</span> to ensure you get paid for every second of work.
                        </p>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-700 font-bold text-sm">24/7 Payment Protection</span>
                        </div>
                    </div>
                </div>

                {/* Main Feed Section */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-slate-800">Verified Client Postings</h2>
                        <div className="flex gap-2">
                             <span className="text-xs bg-white border px-3 py-1 rounded-full text-slate-400">Filter: Highest Trust Score</span>
                        </div>
                    </div>

                    {clientProjects.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-500 transition-all shadow-sm flex flex-col md:flex-row justify-between items-center group">
                            
                            {/* Client & Project Info */}
                            <div className="flex gap-5 items-center w-full md:w-auto">
                                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {item.company.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-slate-900 leading-none">{item.company}</h3>
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                                    </div>
                                    <h4 className="text-blue-600 font-medium mb-2">{item.project}</h4>
                                    <div className="flex gap-2">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trust & Budget Sidebar */}
                            <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                                
                                {/* Security Stats */}
                                <div className="text-center md:text-right">
                                    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{item.budget}</p>
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">{item.status}</p>
                                    <div className="flex items-center md:justify-end gap-1 mt-2">
                                        <span className="text-amber-400 text-xs">★</span>
                                        <span className="text-xs font-bold text-slate-600">{item.rating} Client Rating</span>
                                    </div>
                                </div>

                                {/* Secure CTA */}
                                <div className="flex flex-col items-center gap-2">
                                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all transform active:scale-95 group-hover:shadow-xl group-hover:shadow-blue-100">
                                        Partner with Client
                                    </button>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                        Funds held in Escrow
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tension-Free Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm">
                        Not seeing what you like? <button className="text-blue-600 font-bold underline">Post your availability</button> and let verified clients find you.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ClientDashboard