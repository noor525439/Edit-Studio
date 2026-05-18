import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RoleGuard from "@/components/RoleGuard";
import HireNowModal from "@/components/HireNowModal";
import { CLIENT_ROLES } from "@/lib/roles";
import { API_BASE } from "@/lib/api";

const ClientHire = () => {
  const { editorId } = useParams();
  const navigate = useNavigate();
  const [editorName, setEditorName] = useState("Editor");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/user/all-editors`).then((res) => {
      const ed = res.data.data?.find((e) => e._id === editorId);
      if (ed) setEditorName(ed.name);
    });
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
