import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import { apiPost, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

const initial = {
  projectTitle: "",
  videoType: "YouTube Video",
  videoDuration: "",
  deadline: "",
  editingStyle: "Cinematic",
  instructions: "",
  rawFootageLink: "",
  revisionPolicyAgreed: true,
  priorityLevel: "Normal",
  autoPriceEstimate: 0,
};

const ClientProjectCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const pendingEditorId = searchParams.get("editorId");
  const pendingEditorName = searchParams.get("editorName");
  const isHireFlow = !!pendingEditorId;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiPost(`${WORKFLOW_API}/orders`, form);
      const orderId = res.data.data._id;

      if (publish) {
        await apiPost(`${WORKFLOW_API}/orders/${orderId}/publish`);
        toast.success("Project published successfully!");
      } else {
        toast.success("Project saved as draft");
      }

      if (isHireFlow) {
        toast.info(`Now hire ${pendingEditorName || "the editor"} for your project!`);
        navigate(`/client/hire/${pendingEditorId}?orderId=${orderId}`);
      } else {
        navigate(`/client/projects/${orderId}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">

          {/* Hire flow banner */}
          {isHireFlow && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200">
              <Zap size={18} className="text-amber-500 shrink-0" fill="currentColor" />
              <p className="text-sm text-amber-800 font-medium">
                You're hiring{" "}
                <span className="font-bold">{pendingEditorName || "an editor"}</span>.
                Create a project first — you'll be redirected back to complete the hire automatically.
              </p>
            </div>
          )}

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Project</h1>
          <p className="text-slate-500 mb-8">
            {isHireFlow
              ? "Fill in your project details to continue with hiring."
              : "Publish your project to make it visible to editors."}
          </p>

          <form
            onSubmit={(e) => handleSubmit(e, false)}
            className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5"
          >
            <div>
              <Label>Project title</Label>
              <Input
                value={form.projectTitle}
                onChange={(e) => set("projectTitle", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Video type</Label>
                <select
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  value={form.videoType}
                  onChange={(e) => set("videoType", e.target.value)}
                >
                  {["YouTube Video", "Short", "Reel", "Podcast", "Ad", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={form.videoDuration}
                  onChange={(e) => set("videoDuration", e.target.value)}
                  placeholder="e.g. 10 min"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Raw footage link</Label>
              <Input
                value={form.rawFootageLink}
                onChange={(e) => set("rawFootageLink", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Instructions</Label>
              <textarea
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Budget estimate ($)</Label>
              <Input
                type="number"
                value={form.autoPriceEstimate}
                onChange={(e) => set("autoPriceEstimate", Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="outline"
                disabled={submitting}
                className="flex-1"
              >
                {isHireFlow ? "Save & Continue to Hire" : "Save as Draft"}
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isHireFlow ? "Publish & Hire Editor" : "Publish Project"}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </RoleGuard>
  );
};

export default ClientProjectCreate;