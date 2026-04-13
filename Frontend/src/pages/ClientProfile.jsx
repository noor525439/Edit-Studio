import React, { useEffect, useState } from 'react'
import { getData } from '@/context/UserContext'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ClientProfile = () => {
    const { user } = getData()
    const navigate = useNavigate();
    const [editors, setEditors] = useState([])
    const [loading, setLoading] = useState(true) 
    
     useEffect(() => {
        const fetchEditors = async () => {
            try {
                const res = await axios.get('http://localhost:3000/user/all-editors')
                setEditors(res.data.data)
            } catch (err) {
                console.error("Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchEditors()
    }, [])

    if (!user || user.role !== "freelancer" && user?.role !== "admin") {
        return <Navigate to="/" />
    }



    // const editors = [
    //     { id: 1, name: "Waseeq Niaz", role: "MERN Stack Developer", rate: "$45/hr", skills: ["MongoDB", "Express", "React", "Node"], status: "Available", },
    //     { id: 2, name: "Marcus Vane", role: "Photo Retoucher", rate: "$35/hr", skills: ["Photoshop", "Lightroom"], status: "Busy" },
    //     { id: 3, name: "Elena Rodriguez", role: "Content Editor", rate: "$50/hr", skills: ["Copywriting", "SEO"], status: "Available" },
    //     { id: 4, name: "David Kross", role: "Motion Designer", rate: "$60/hr", skills: ["C4D", "After Effects"], status: "Available" },
    // ]

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
         <main className="max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
            Recommended Editors <span className="text-sm font-normal text-slate-400 ml-2">({editors.length})</span>
        </h2>
    </div>

    {/* Yahan grid vahi hai jo aapne di, bas data real backend wala map ho raha hai */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
            <p className="col-span-full text-center py-10 text-slate-400 italic">Searching for talent...</p>
        ) : editors.map((editor) => (
            <div key={editor._id} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    {/* Profile Avatar with First Letter */}
                    <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {editor.name.charAt(0)}
                    </div>
                    {/* Rate Badge - Chota sa addition UI ko behtar karne ke liye */}
                    <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-lg font-black text-slate-500">
                        ${editor.rate}/hr
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {editor.name}
                </h3>
                
                {/* Role aur Experience */}
                <p className="text-sm text-slate-500 mb-1">{editor.role}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase mb-4 tracking-wider">
                    {editor.experience} Exp
                </p>

                {/* Updated Button to Navigate using _id from Database */}
                <button
                    onClick={() => navigate(`/editor/${editor._id}`)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                >
                    View Profile
                </button>
            </div>
        ))}
    </div>
</main>
        </div>
    )
}

export default ClientProfile