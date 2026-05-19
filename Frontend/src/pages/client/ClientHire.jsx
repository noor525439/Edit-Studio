import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import HireNowModal from "@/components/HireNowModal";
import { CLIENT_ROLES } from "@/lib/roles";
import { apiGet, WORKFLOW_API } from "@/lib/api";

const ClientHire = () => {
  const { editorId } = useParams();
  const navigate = useNavigate();
  const [editorName, setEditorName] = useState("Editor");
  const [realEditorId, setRealEditorId] = useState(null); // 👈 null rakho, "" nahi
  const [open, setOpen] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/editors/profile/${editorId}`)
      .then((res) => {
        const name =
          res.data.data?.editorProfile?.name ||
          res.data.data?.user?.username;
        const actualId =
          res.data.data?.user?._id ||
          res.data.data?.editorProfile?._id ||
          res.data.data?._id;

        if (name) setEditorName(name);
        if (actualId) setRealEditorId(actualId);
      })
      .catch(() => {
        // Fallback: agar fetch fail ho aur editorId email nahi hai toh use karo
        if (!String(editorId).includes("@")) {
          setRealEditorId(editorId);
        }
      });
  }, [editorId]);

  // 👇 Jab tak realEditorId nahi mili, modal render mat karo
  if (realEditorId === null) {
    return (
      <RoleGuard allowedRoles={CLIENT_ROLES}>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading editor info…</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-10">
        <HireNowModal
          editorId={realEditorId} // 👈 Sirf verified ObjectId pass hogi
          editorName={editorName}
          open={open}
          onClose={() => {
            setOpen(false);
            navigate("/client/dashboard");
          }}
        />
      </div>
    </RoleGuard>
  );
};

export default ClientHire;