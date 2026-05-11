import React from "react";
import { UserCircle, Briefcase, Star, Award, Mail, MapPin, Clock } from "lucide-react";

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-purple-100 text-purple-700",
];

const getInitials = (name = "") => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getStarRating = (rating = 0) => {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
};

const EditorsPanel = ({ editors = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!editors || editors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <UserCircle size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">No editors available</p>
        <p className="text-xs text-slate-400 mt-1">Check back later for new professionals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editors.map((editor, idx) => {
        const colorClass = avatarColors[idx % avatarColors.length];
        const hasSkills = editor.skills && editor.skills.length > 0;
        const hasRating = editor.averageRating !== undefined && editor.averageRating > 0;

        return (
          <div
            key={editor._id || editor.userId}
            className="group bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-200 hover:border-indigo-200 overflow-hidden"
          >
            <div className="p-5 flex flex-col md:flex-row gap-5">
              <div className="flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold ${colorClass} shadow-sm`}
                >
                  {getInitials(editor.name)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{editor.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {editor.role || "Editor"}
                      </span>
                      {editor.experience && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Briefcase size={12} />
                          {editor.experience}
                        </span>
                      )}
                      {editor.location && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {editor.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasRating && (
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                      <div className="text-amber-400 text-sm tracking-wide">
                        {getStarRating(editor.averageRating)}
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {editor.reviewCount || 0} review{editor.reviewCount !== 1 && "s"}
                      </span>
                    </div>
                  )}
                </div>

                {editor.bio && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">
                    {editor.bio}
                  </p>
                )}

                {hasSkills && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editor.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100"
                      >
                        {skill}
                      </span>
                    ))}
                    {editor.skills.length > 6 && (
                      <span className="text-xs text-slate-400">+{editor.skills.length - 6}</span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-2 text-xs text-slate-400 border-t border-slate-100">
                  {editor.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {editor.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Joined {editor.joinedDate || "recently"}
                  </span>
                </div>
              </div>

              {hasRating && editor.averageRating >= 4.5 && (
                <div className="absolute top-4 right-4 md:static md:self-start">
                  <div className="bg-amber-50 rounded-full p-2 shadow-sm">
                    <Award size={16} className="text-amber-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EditorsPanel;