import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Zap, Briefcase } from "lucide-react";
import { getData } from "@/context/userContext";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { isClient, CLIENT_ROLES } from "@/lib/roles";
import StarRating from "@/components/StarRating";
import TopRatedBadge from "@/components/TopRatedBadge";
import HireNowModal from "@/components/HireNowModal";

const EditorPublicProfile = () => {
  const { editorId } = useParams();
  const { user } = getData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hireOpen, setHireOpen] = useState(false);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/editors/profile/${editorId}`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [editorId]);

  if (loading) return <p className="p-10 text-slate-400">Loading profile…</p>;
  if (!data?.editorProfile) return <p className="p-10">Editor not found</p>;

  const { editorProfile, stats, reviews } = data;
  const canHire = user && isClient(user.role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link to="/editor/gigs" className="text-sm font-bold text-green-600 hover:underline mb-6 inline-block">
          ← Browse editors
        </Link>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/3">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-green-600 to-emerald-800 rounded-[2rem] flex items-center justify-center text-white text-5xl font-bold">
                {editorProfile.name?.charAt(0)}
              </div>
              <div className="text-center mt-6">
                <h1 className="text-2xl font-bold text-slate-900">{editorProfile.name}</h1>
                <p className="text-green-600 font-semibold text-sm mt-1">{editorProfile.role}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <TopRatedBadge show={stats.isTopRated} />
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">
                    {stats.completedProjects} projects done
                  </span>
                </div>
                <div className="mt-4 flex justify-center">
                  <StarRating value={stats.avgRating} readonly size={22} />
                  <span className="ml-2 text-xs text-slate-400">({stats.totalReviews} reviews)</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">${editorProfile.rate}<span className="text-sm font-normal text-slate-400">/hr</span></p>
                {canHire && (
                  <button
                    onClick={() => setHireOpen(true)}
                    className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Zap size={18} fill="currentColor" /> Hire Now
                  </button>
                )}
              </div>
            </aside>

            <section className="lg:w-2/3 space-y-8">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">About</h2>
                <p className="text-slate-600 leading-relaxed italic">"{editorProfile.bio}"</p>
              </div>
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {editorProfile.skills?.map((s) => (
                    <span key={s} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Briefcase size={14} /> Client reviews
                </h2>
                {reviews.length === 0 ? (
                  <p className="text-slate-400 text-sm">No reviews yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-slate-800 text-sm">{r.clientId?.username}</p>
                          <StarRating value={r.rating} readonly size={14} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{r.orderId?.projectTitle}</p>
                        {r.feedback && <p className="text-sm text-slate-600 mt-2 italic">"{r.feedback}"</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {canHire && (
        <HireNowModal
          editorId={editorProfile._id}
          editorName={editorProfile.name}
          open={hireOpen}
          onClose={() => setHireOpen(false)}
        />
      )}
    </div>
  );
};

export default EditorPublicProfile;
