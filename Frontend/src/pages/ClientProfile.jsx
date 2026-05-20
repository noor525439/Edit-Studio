import React, { useEffect, useState } from 'react'
import { getData } from '@/context/userContext'
import { Navigate, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { CLIENT_ROLES } from '@/lib/roles'
import { apiGet, WORKFLOW_API } from '@/lib/api'
import StarRating from '@/components/StarRating'
import TopRatedBadge from '@/components/TopRatedBadge'

const ClientProfile = () => {
    const { user } = getData()
    const [editors, setEditors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet(`${WORKFLOW_API}/editors/browse`)
            .then((res) => setEditors(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (!user || (!CLIENT_ROLES.includes(user.role) && user.role !== 'admin')) {
        return <Navigate to="/login" />
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-black text-slate-900">Find Editors</h2>
                    <Link to="/editor/gigs" className="text-sm font-bold text-green-600 hover:underline">
                        View all gigs →
                    </Link>
                </div>
                <p className="text-slate-500 text-sm mb-8">Sorted by highest rating</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <p className="col-span-full text-center py-10 text-slate-400 italic">Searching for talent…</p>
                    ) : editors.map((editor) => (
                        <div key={editor._id} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-green-300/40 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-bold text-xl">
                                    {editor.name.charAt(0)}
                                </div>
                                <TopRatedBadge show={editor.isTopRated} className="scale-90" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                                {editor.name}
                            </h3>
                            <p className="text-sm text-slate-500">{editor.role}</p>

                            <div className="flex items-center gap-2 mt-2 mb-1">
                                <StarRating value={editor.avgRating} readonly size={14} />
                                <span className="text-[10px] text-slate-400">({editor.totalReviews})</span>
                            </div>

                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-4">
                                {editor.completedProjects} completed · ${editor.rate}/hr
                            </p>

                            <div className="flex flex-col gap-2">
                                <Link
                                    to={`/editor/profile/${editor._id}`}
                                    className="w-full py-2.5 text-center bg-slate-900 text-white rounded-xl font-medium hover:bg-green-600 transition-all text-sm"
                                >
                                    View Profile
                                </Link>
                                <Link
                                    to={`/client/hire/${editor._id}`}
                                    className="w-full py-2.5 border-2 border-green-600 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} fill="currentColor" /> Hire Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default ClientProfile
