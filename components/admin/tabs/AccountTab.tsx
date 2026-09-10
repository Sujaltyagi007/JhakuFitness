"use client";
import { useState, useEffect } from "react";
import { type AdminUser } from "@/lib/useAdminAuth";
import { User, Shield, Bell, Settings, Database, Trash2, Smartphone, Download, Loader2, Check, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toast";

import { updateAccount } from "@/lib/api";
import { usePreferences } from "@/components/admin/PreferencesProvider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type SubTabId = "profile" | "preferences" | "notifications" | "security" | "advanced";

export default function AccountTab({ user, activeTab = "profile", onTabChange }: { user: AdminUser | null, activeTab?: string, onTabChange?: (tab: string) => void }) {
  const [name, setName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const { preferences, updatePreferences, isLoading: isSavingPrefs } = usePreferences();
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [newSignupAlerts, setNewSignupAlerts] = useState(false);
  const [isCustomizingAvatar, setIsCustomizingAvatar] = useState(false);
  const [tempAvatarStyle, setTempAvatarStyle] = useState(preferences.avatarStyle || "bottts");
  const [tempAvatarSeed, setTempAvatarSeed] = useState(preferences.avatarSeed || user?.name || "Felix");

  const avatarStyles = ["bottts", "adventurer", "notionists", "lorelei", "fun-emoji"];

  useEffect(() => {
    setLowStockAlerts(localStorage.getItem("adminLowStockAlerts") !== "false");
    setNewSignupAlerts(localStorage.getItem("adminNewSignupAlerts") === "true");
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setIsSavingProfile(true);
    try {
      const data = await updateAccount({ name });
      if (data.success) toast.success("Profile updated successfully");
    } catch (error: any) { toast.error(error.message); }
    finally { setIsSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error("Please fill in both password fields");
    setIsSavingPassword(true);
    try {
      const data = await updateAccount({ currentPassword, newPassword });
      if (data.success) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "personal_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handlePrefChange = async (key: keyof typeof preferences, value: any) => {
    try {
      await updatePreferences({ [key]: value });
      toast.success("Preference saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save preference");
    }
  };

  const handleToggleLowStockAlerts = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLowStockAlerts(e.target.checked);
    localStorage.setItem("adminLowStockAlerts", String(e.target.checked));
    toast.success("Notification preferences saved");
  };

  const handleToggleNewSignupAlerts = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSignupAlerts(e.target.checked);
    localStorage.setItem("adminNewSignupAlerts", String(e.target.checked));
    toast.success("Notification preferences saved");
  };

  const tabs = [
    { id: "profile", label: "General Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Login & Security", icon: Shield },
    { id: "advanced", label: "Advanced", icon: Database },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 shrink-0 space-y-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm h-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onTabChange?.(tab.id as SubTabId)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
              ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"}`}            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-stone-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-6">
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">General Profile</h3>
              <p className="text-sm text-stone-500 mt-1">Manage your personal information and identity.</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-xl font-bold text-stone-600 overflow-hidden border-2 border-stone-200">
                    {preferences.avatarStyle ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={`https://api.dicebear.com/9.x/${preferences.avatarStyle}/svg?seed=${preferences.avatarSeed || user?.name}`} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.substring(0, 2).toUpperCase() || "AD"
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setIsCustomizingAvatar(true); setTempAvatarStyle(preferences.avatarStyle || "bottts"); setTempAvatarSeed(preferences.avatarSeed || user?.name || "Felix"); }} className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                      {preferences.avatarStyle ? "Change Character" : "Create Character"}
                    </button>
                    {preferences.avatarStyle && (
                      <button onClick={() => { handlePrefChange("avatarStyle", null); handlePrefChange("avatarSeed", null); }} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {isCustomizingAvatar && (
                  <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://api.dicebear.com/9.x/${tempAvatarStyle}/svg?seed=${tempAvatarSeed}`} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Choose Style</label>
                        <div className="flex gap-2 flex-wrap">
                          {avatarStyles.map(style => (
                            <button key={style} onClick={() => setTempAvatarStyle(style)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${tempAvatarStyle === style ? 'bg-gold text-black border-transparent shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-stone-200/60">
                      <button onClick={() => setTempAvatarSeed(Math.random().toString(36).substring(7))} className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors">
                        <RefreshCw size={14} /> Shuffle
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => setIsCustomizingAvatar(false)} className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => { handlePrefChange("avatarStyle", tempAvatarStyle); handlePrefChange("avatarSeed", tempAvatarSeed); setIsCustomizingAvatar(false); }} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                        Save Avatar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold outline-none text-sm text-stone-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input type="email" defaultValue={user?.email || ""} className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-500 cursor-not-allowed outline-none text-sm" readOnly />
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-amber-600 text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Change Password</h3>
                <p className="text-sm text-stone-500 mt-1">Ensure your account is using a long, random password.</p>
              </div>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold outline-none text-sm text-stone-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold outline-none text-sm text-stone-900" />
                </div>
                <button onClick={handleSavePassword} disabled={isSavingPassword} className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                  {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-stone-500 mt-1">Add an extra layer of security to your account.</p>
              </div>
              <div className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-stone-400" />
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Authenticator App</div>
                    <div className="text-xs text-stone-500">Not configured</div>
                  </div>
                </div>
                <button className="px-4 py-1.5 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6 relative overflow-hidden">
            {isSavingPrefs && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-stone-900">UI Preferences</h3>
              <p className="text-sm text-stone-500 mt-1">Customize how the admin panel looks and feels.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Theme Mode</label>
                  <Select value={preferences.theme ?? "system"} onValueChange={(v) => handlePrefChange("theme", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Accent Color</label>
                  <div className="flex gap-3">
                    {[
                      { name: "Gold", hex: "#fbbf24" },
                      { name: "Ocean", hex: "#3b82f6" },
                      { name: "Emerald", hex: "#10b981" },
                      { name: "Rose", hex: "#e11d48" },
                    ].map(c => {
                      const isSelected = preferences.accentColor === c.hex;
                      return (
                        <button key={c.hex} onClick={() => handlePrefChange("accentColor", c.hex)} title={c.name}
                          className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${c.hex}, 0 4px 6px -1px rgba(0,0,0,0.15)` : undefined,
                          }}
                        >
                          {isSelected && <Check className="w-5 h-5 text-white drop-shadow" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    Selected: {["Gold", "Ocean", "Emerald", "Rose"][["#fbbf24", "#3b82f6", "#10b981", "#e11d48"].indexOf(preferences.accentColor ?? "#fbbf24")] ?? "Gold"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Layout Density</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "compact", label: "Compact", gaps: [2, 2] },
                      { value: "comfortable", label: "Comfortable", gaps: [4, 4] },
                      { value: "spacious", label: "Spacious", gaps: [7, 7] },
                    ].map((d) => {
                      const isSelected = (preferences.density ?? "comfortable") === d.value;
                      return (
                        <button key={d.value} type="button" onClick={() => handlePrefChange("density", d.value)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition-colors ${isSelected ? "border-gold bg-gold/10" : "border-stone-200 hover:border-stone-300"}`}
                        >
                          <div className="flex w-8 flex-col" style={{ gap: d.gaps[0] }}>
                            <span className={`h-1 rounded-full ${isSelected ? "bg-gold-deep" : "bg-stone-300"}`} />
                            <span className={`h-1 rounded-full ${isSelected ? "bg-gold-deep" : "bg-stone-300"}`} />
                            <span className={`h-1 rounded-full ${isSelected ? "bg-gold-deep" : "bg-stone-300"}`} />
                          </div>
                          <span className={`text-[11px] font-semibold ${isSelected ? "text-gold-deep" : "text-stone-600"}`}>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Default Landing Page</label>
                  <Select value={preferences.defaultPage ?? "analytics"} onValueChange={(v) => handlePrefChange("defaultPage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="users">User Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Localization</h3>
                <p className="text-sm text-stone-500 mt-1">Regional settings for dates and currency.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Currency format</label>
                  <Select value={preferences.currency ?? "INR"} onValueChange={(v) => handlePrefChange("currency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Time format</label>
                  <Select value={preferences.timeFormat ?? "12h"} onValueChange={(v) => handlePrefChange("timeFormat", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (1:00 PM)</SelectItem>
                      <SelectItem value="24h">24-hour (13:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Notification Settings</h3>
              <p className="text-sm text-stone-500 mt-1">Control how you receive alerts and system updates.</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-stone-900">Low Stock Alerts</div>
                  <div className="text-xs text-stone-500">Receive an email when products drop below minimum quantity.</div>
                </div>
                <input type="checkbox" checked={lowStockAlerts} onChange={handleToggleLowStockAlerts} className="w-4 h-4 text-gold rounded border-stone-300 focus:ring-gold" />
              </label>
              <label className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-stone-900">New User Signups</div>
                  <div className="text-xs text-stone-500">Receive alerts when new staff accounts are created.</div>
                </div>
                <input type="checkbox" checked={newSignupAlerts} onChange={handleToggleNewSignupAlerts} className="w-4 h-4 text-gold rounded border-stone-300 focus:ring-gold" />
              </label>
            </div>
          </div>
        )}

        {/* ADVANCED */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Export Personal Data</h3>
                <p className="text-sm text-stone-500 mt-1">Download a copy of your account activity logs and data.</p>
              </div>
              <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                <Download className="w-4 h-4" /> Export as JSON
              </button>
            </div>

            {user?.isSuperUser && (
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-rose-900">Danger Zone</h3>
                  <p className="text-sm text-rose-700/80 mt-1">Irreversible account actions. Proceed with caution.</p>
                </div>
                <div className="pt-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-colors">
                    <Trash2 className="w-4 h-4" /> Transfer Super User Ownership
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
