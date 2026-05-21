import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { getData } from "@/context/userContext";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { isClient } from "@/lib/roles";
import StarRating from "@/components/StarRating";
import TopRatedBadge from "@/components/TopRatedBadge";

const EditorGigs = () => {
  const { user } = getData();
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/editors/browse`)
      .then((res) => setEditors(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const allowed = !user || isClient(user.role) || user.role === "editor" || user.role === "admin";

  if (!allowed) {
    return (
      <div className="p-10 text-center">
        <Link to="/login" className="text-green-600 font-bold">Login</Link> to browse editors.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Editor Gigs</h1>
          <p className="text-slate-500 mt-2">
            Sorted by highest rating — top editors appear first.
          </p>
        </div>

        {user?.role === "editor" && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-800">
            <Link to="/editor-info" className="font-bold underline">Manage your gig profile</Link> to attract more clients.
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-center py-12">Loading editors…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {editors.map((ed) => (
              <article
                key={ed._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-green-300/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-bold text-xl">
                    {ed.name?.charAt(0)}
                  </div>
                  <TopRatedBadge show={ed.isTopRated} className="scale-90 origin-right" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{ed.name}</h3>
                <p className="text-sm text-slate-500">{ed.role}</p>

                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={ed.avgRating} readonly size={14} />
                  <span className="text-[10px] text-slate-400 font-bold">({ed.totalReviews})</span>
                </div>

                <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-wider">
                  {ed.completedProjects} completed · ${ed.rate}/hr
                </p>

                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    to={`/editor/profile/${ed._id}`}
                    className="w-full py-2.5 text-center bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                  >
                    View profile
                  </Link>
                  {user && isClient(user.role) && (
                    <Link
                      to={`/client/hire/${ed._id}`}
                      className="w-full py-2.5 border-2 border-green-600 text-green-700 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                      <Zap size={14} fill="currentColor" /> Hire Now
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorGigs;
