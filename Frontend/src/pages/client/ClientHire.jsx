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
  const [open, setOpen] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/editors/profile/${editorId}`)
      .then((res) => {
        const name = res.data.data?.editorProfile?.name || res.data.data?.user?.username;
        if (name) setEditorName(name);
      })
      .catch(() => {});
  }, [editorId]);

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-10">
        <HireNowModal
          editorId={editorId}
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
