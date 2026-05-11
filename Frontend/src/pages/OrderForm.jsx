import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { 
  HiOutlineFolderPlus, 
  HiOutlineCalendar, 
  HiOutlineLink, 
  HiOutlineMusicalNote,
  HiOutlineDocumentText, 
  HiOutlineVideoCamera, 
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlinePaperAirplane,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineClock
} from "react-icons/hi2"; 

import { MdOutlineSlowMotionVideo } from "react-icons/md";

const API_BASE = "http://localhost:3000/workflow";

const editingRequirementOptions = [
  "Basic Cutting & Trimming",
  "Smooth Transitions",
  "Color Grading",
  "Captions / Subtitles",
  "Text Animations",
  "Sound Design",
  "Background Music Sync",
  "Zoom Effects",
  "Motion Graphics (basic)",
];

const initialForm = {
  projectTitle: "",
  videoType: "YouTube Video",
  videoDuration: "",
  deadline: "",
  rawFootageLink: "",
  voiceoverLink: "",
  musicLinks: "",
  scriptLink: "",
  referenceLinks: "",
  editingStyle: "Cinematic",
  editingStyleOther: "",
  instructions: "",
  requirements: [],
  revisionPolicyAgreed: false,
  priorityLevel: "Normal",
  autoPriceEstimate: 0,
  assignedEditorId: "",
};

const inputCls =
  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200";
const selectCls =
  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer";

const OrderForm = ({ editors, onSuccess, getAuthHeader, currentUserRole }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = currentUserRole === "freelancer" || currentUserRole === "client";

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleReq = (option) =>
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(option)
        ? prev.requirements.filter((r) => r !== option)
        : [...prev.requirements, option],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Only clients can submit project requests");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/orders`, form, getAuthHeader());
      toast.success("Great! Project has been queued.");
      setForm(initialForm);
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-9xl mx-auto py-2">
      {!canSubmit && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Client Request Form is restricted to users with Client role.
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 text-center tracking-tight">Order Submission</h2>
          <p className="text-sm text-gray-500 font-medium">Brief your editor with all the necessary details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <HiOutlineFolderPlus size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Project Identity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Project Title</label>
              <input
                className={inputCls}
                placeholder="e.g. 48 Hours in Dubai Vlog"
                value={form.projectTitle}
                onChange={(e) => set("projectTitle", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Expected Duration</label>
              <input
                className={inputCls}
                placeholder="e.g. 10-12 mins"
                value={form.videoDuration}
                onChange={(e) => set("videoDuration", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Deadline Date</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="date"
                  className={`${inputCls} pl-11`}
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Video Format</label>
              <select
                className={selectCls}
                value={form.videoType}
                onChange={(e) => set("videoType", e.target.value)}
              >
                {["YouTube Video", "Short", "Reel", "Podcast", "Ad", "Other"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <HiOutlineLink size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Media Assets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Raw Footage (Cloud Link)</label>
              <div className="relative">
                <HiOutlineVideoCamera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className={`${inputCls} pl-11`}
                  placeholder="Drive, Dropbox, or WeTransfer Link"
                  value={form.rawFootageLink}
                  onChange={(e) => set("rawFootageLink", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Music Preference</label>
              <div className="relative">
                <HiOutlineMusicalNote className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className={`${inputCls} pl-11`}
                  placeholder="Link to tracks or genre"
                  value={form.musicLinks}
                  onChange={(e) => set("musicLinks", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Script / Storyboard</label>
              <div className="relative">
                <HiOutlineDocumentText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  className={`${inputCls} pl-11`}
                  placeholder="Google Docs Link"
                  value={form.scriptLink}
                  onChange={(e) => set("scriptLink", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <HiOutlineSparkles size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Edit Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Editing Style</label>
              <select
                className={selectCls}
                value={form.editingStyle}
                onChange={(e) => set("editingStyle", e.target.value)}
              >
                {["Cinematic", "Fast-paced", "Vlog style", "Documentary", "Social Media viral style", "Other"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Priority</label>
              <select
                className={`${selectCls} ${form.priorityLevel === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}`}
                value={form.priorityLevel}
                onChange={(e) => set("priorityLevel", e.target.value)}
              >
                <option>Normal</option>
                <option>Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Budget Estimate (PKR)</label>
              <div className="relative">
                <HiOutlineCurrencyDollar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-lg" />
                <input
                  type="number"
                  className={`${inputCls} pl-11 font-bold text-emerald-700`}
                  placeholder="0.00"
                  value={form.autoPriceEstimate || ""}
                  onChange={(e) => set("autoPriceEstimate", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assign Professional</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <select
                  className={`${selectCls} pl-11`}
                  value={form.assignedEditorId}
                  onChange={(e) => set("assignedEditorId", e.target.value)}
                >
                  <option value="">Auto-assign best match</option>
                  {editors.map((ed) => (
                    <option key={ed.userId} value={ed.userId}>
                      {ed.name} ({ed.experience})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vision & Instructions</label>
              <textarea
                className={`${inputCls} min-h-[120px] pt-3`}
                placeholder="Tell us about the mood, pacing, and any specific timestamps or moments to include..."
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 text-black shadow-xl shadow-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <MdOutlineSlowMotionVideo size={24} className="text-indigo-400" />
            <h3 className="text-lg font-bold">Additional Requirements</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {editingRequirementOptions.map((option) => {
              const isChecked = form.requirements.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleReq(option)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                    isChecked 
                      ? "bg-white text-gray-500 border-white shadow-lg" 
                      : "bg-white text-gray-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isChecked ? <HiOutlineCheckCircle size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-600" />}
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center gap-6 border-t border-slate-200 pt-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.revisionPolicyAgreed}
                  onChange={(e) => set("revisionPolicyAgreed", e.target.checked)}
                  required
                />
                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${form.revisionPolicyAgreed ? 'bg-green-500 border-green-500' : 'border-slate-200 bg-white group-hover:border-slate-200'}`}>
                  {form.revisionPolicyAgreed && <HiOutlineCheckCircle className="text-white" size={16} />}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500">
                I agree to the <span className="text-gray-500 underline decoration-indigo-500 underline-offset-4">2-revision limit</span> policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="group relative w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {submitting ? (
                  <HiOutlineClock className="animate-spin text-xl" />
                ) : (
                  <>
                    <HiOutlinePaperAirplane className="rotate-45 text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    SUBMIT PROJECT NOW
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;