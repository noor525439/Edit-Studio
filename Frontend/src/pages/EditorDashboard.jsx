import React, { useState, useEffect } from 'react'
import { getData } from '@/context/UserContext'
import { Navigate } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react'

const EditorDashboard = () => {
  const { user } = getData()
  // Mock state for projects - in a real app, fetch this from your backend
  const [projects, setProjects] = useState([
    { id: 1, title: "Wedding Cinematic Edit", client: "John Doe", status: "In Progress", deadline: "2024-05-20" },
    { id: 2, title: "YouTube Intro Design", client: "TechChannel", status: "Review", deadline: "2024-05-18" }
  ])

  if (user?.role !== "editor" && user?.role !== "admin") {
    return <Navigate to="/" />
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Editor Workspace</h1>
          <p className="text-slate-500">Welcome back, {user?.username}. Here is what's on your plate today.</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <span className="text-sm text-slate-500">Current Earnings</span>
          <p className="text-2xl font-bold text-green-600">$1,250.00</p>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Clock className="text-blue-500" />} label="Active Tasks" value="3" />
        <StatCard icon={<CheckCircle className="text-green-500" />} label="Completed" value="12" />
        <StatCard icon={<AlertCircle className="text-orange-500" />} label="Pending Review" value="2" />
      </div>

      {/* --- PROJECT TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">Assigned Projects</h2>
          <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{project.title}</td>
                <td className="px-6 py-4 text-slate-600">{project.client}</td>
                <td className="px-6 py-4 text-slate-600">{project.deadline}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="flex items-center gap-2 ml-auto bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
                    <Upload size={14} /> Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
)

export default EditorDashboard