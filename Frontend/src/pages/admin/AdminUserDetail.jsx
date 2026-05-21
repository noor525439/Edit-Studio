import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`${WORKFLOW_API}/admin/users/${id}`);
        setUser(res.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin — User details</h1>
              <p className="text-slate-500 mt-2">Inspect client or editor information in the admin panel.</p>
            </div>
            <Link
              to="/admin/projects"
              className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
            >
              Back to projects
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
            {loading ? (
              <p className="text-slate-500">Loading user details…</p>
            ) : !user ? (
              <p className="text-slate-600">User not found or you do not have permission.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{(user.username || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-slate-500 uppercase tracking-[0.32em] text-xs font-black">{user.role}</p>
                    <h2 className="text-3xl font-black text-slate-900">{user.username || "Unnamed user"}</h2>
                    <p className="text-slate-500 mt-1">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-black mb-3">Status</p>
                    <p className="text-slate-700 text-sm">{user.isApproved ? "Approved" : "Not approved"}</p>
                    <p className="text-slate-400 text-xs mt-2">Editor approval status</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-black mb-3">Verification</p>
                    <p className="text-slate-700 text-sm">{user.isVerified ? "Verified" : "Not verified"}</p>
                    <p className="text-slate-400 text-xs mt-2">Email verification</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-black mb-3">Contact</p>
                  <p className="text-slate-700 text-sm">Phone: {user.phone || "Not provided"}</p>
                  <p className="text-slate-700 text-sm mt-2">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminUserDetail;
