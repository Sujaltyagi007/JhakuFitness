"use client";
import { z } from "zod";
import { motion } from "motion/react";
import { toast } from "@/components/ui/Toast";
import React, { useState, useEffect } from "react";
import { getUsers, getRoles, createUser, updateUser, deleteUser } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { usePreferences } from "@/components/admin/PreferencesProvider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Portal } from "@/components/ui/Portal";
import CountrieCodeBtn from "@/components/ui/CountrieCodeBtn";
import { COUNTRIES, type Country, parsePhone, formatPhone, validatePhoneNumber } from "@/lib/hooks/Countrielist";
import { Users, UserPlus, Search, Shield, ShieldAlert, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Key, } from "lucide-react";

/** Wraps a form field so it can shake + show an inline error, driven entirely by our own (Zod) validation rather than native HTML constraint validation. Remounting on `shakeToken` change is what makes the shake replay on every failed attempt, even if the field's error message didn't change. */
function ShakeField({ error, shakeToken, children }: { error?: string; shakeToken: number; children: React.ReactNode }) {
  return (
    <motion.div
      key={error ? `err-${shakeToken}` : "ok"}
      animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </motion.div>
  );
}

function buildUserFormSchema(isEditing: boolean) {
  return z.object({
    name: z.string().min(1, "Full name is required").max(100, "Name must be under 100 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().refine(
      (v) => (isEditing ? v === "" || v.length >= 8 : v.length >= 8),
      { message: "Password must be at least 8 characters" }
    ),
  });
}

interface RoleOption {
  id: string;
  name: string;
  isSystem: boolean;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isSuperUser: boolean;
  roleId: string | null;
  role: RoleOption | null;
  lastLoginAt: string | null;
  createdAt: string;
  phone?: string | null;
}

const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];

export function UsersTab() {
  const { preferences } = usePreferences();
  const timeFormat = (preferences.timeFormat as "12h" | "24h") || "12h";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCountry, setFormCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeToken, setShakeToken] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers((usersData.users as UserItem[]) || []);
      setRoles((rolesData.roles as RoleOption[]) || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load user and role data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormCountry(DEFAULT_COUNTRY);
    setFormPhone("");
    setFormPassword("");
    setFormRoleId("");
    setFormStatus("ACTIVE");
    setEditingUser(null);
    setIsCreateOpen(false);
    setFieldErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    if (roles.length > 0) setFormRoleId(roles[0].id);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    const { country, local } = parsePhone(user.phone, DEFAULT_COUNTRY);
    setFormCountry(country);
    setFormPhone(local);
    setFormPassword("");
    setFormRoleId(user.roleId || "");
    setFormStatus(user.status);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = buildUserFormSchema(!!editingUser);
    const result = schema.safeParse({ name: formName.trim(), email: formEmail.trim(), password: formPassword });

    const errors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!errors[field]) errors[field] = issue.message;
      }
    }
    if (formPhone.trim()) {
      const phoneCheck = validatePhoneNumber(formPhone, formCountry);
      if (!phoneCheck.isValid) errors.phone = phoneCheck.message || "Enter a valid phone number";
    }

    if (Object.keys(errors).length > 0 || !result.success) {
      setFieldErrors(errors);
      setShakeToken((t) => t + 1);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setFieldErrors({});

    const { name, email, password } = result.data;
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name,
          email,
          phone: formatPhone(formCountry, formPhone) || undefined,
          roleId: formRoleId || null,
          status: formStatus,
          ...(password ? { password } : {}),
        });

        toast.success(`User '${name}' updated successfully`);
      } else {
        await createUser({
          name,
          email,
          phone: formatPhone(formCountry, formPhone) || undefined,
          password,
          roleId: formRoleId || null,
          status: formStatus,
        });

        toast.success(`User '${name}' created successfully`);
      }

      resetForm();
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred while saving user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (user.isSuperUser) {
      const activeSuperUsers = users.filter((u) => u.isSuperUser && u.status === "ACTIVE");
      if (activeSuperUsers.length <= 1) {
        toast.error("Cannot delete the last active Super User!");
        return;
      }
    }

    if (!confirm(`Are you sure you want to delete user '${user.name}' (${user.email})?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.success(`User '${user.name}' deleted`);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.role?.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" /> User Management
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Manage administrative user accounts, statuses, and role assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 :bg-stone-800 text-stone-600 transition-colors" title="Refresh Users">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs rounded-xl shadow-sm transition-all">
            <UserPlus className="w-4 h-4" /> Create User
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
        <input type="text" placeholder="Search users by name, email, or role..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-gold outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700 ">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 ">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 ">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 :bg-stone-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-700 uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            {u.name}
                            {u.isSuperUser && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                <ShieldAlert className="w-3 h-3" /> Super User
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 ">
                        <Shield className="w-3 h-3 text-gold" /> {u.role?.name || (u.isSuperUser ? "Super Admin" : "No Role")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                      {u.status === "INACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-500/10 text-stone-600 border border-stone-500/20">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                      {u.status === "SUSPENDED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {u.lastLoginAt ? formatTime(u.lastLoginAt, timeFormat) : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 :bg-stone-800 text-stone-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 :bg-rose-950/30 text-rose-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-2xl max-h-[90dvh] overflow-y-auto shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                {editingUser ? "Edit User Account" : "Create New User"}
              </h3>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 text-sm">
                <ShakeField error={fieldErrors.name} shakeToken={shakeToken}>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`w-full px-3.5 py-2 rounded-xl border bg-white text-stone-900 outline-none focus:ring-2 ${fieldErrors.name ? "border-red-300 focus:ring-red-300" : "border-stone-200 focus:ring-gold"}`}
                  />
                </ShakeField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ShakeField error={fieldErrors.email} shakeToken={shakeToken}>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="user@jhakufitness.com"
                      className={`w-full px-3.5 py-2 rounded-xl border bg-white text-stone-900 outline-none focus:ring-2 ${fieldErrors.email ? "border-red-300 focus:ring-red-300" : "border-stone-200 focus:ring-gold"}`}
                    />
                  </ShakeField>
                  <ShakeField error={fieldErrors.phone} shakeToken={shakeToken}>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <div className={`flex w-full items-stretch overflow-hidden rounded-xl border bg-white focus-within:ring-2 ${fieldErrors.phone ? "border-red-300 focus-within:ring-red-300" : "border-stone-200 focus-within:ring-gold"}`}>
                      <CountrieCodeBtn value={formCountry} onChange={setFormCountry} autoDetected={false} onManualChange={() => { }} className="bg-transparent! border-0! rounded-none! px-2.5! py-2 hover:bg-stone-100!" />
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ""))}
                        maxLength={formCountry.len}
                        placeholder="9876543210"
                        className="w-full min-w-0 bg-transparent px-2.5 py-2 text-stone-900 outline-none"
                      />
                    </div>
                  </ShakeField>
                </div>

                <ShakeField error={fieldErrors.password} shakeToken={shakeToken}>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                    {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-stone-900 outline-none focus:ring-2 ${fieldErrors.password ? "border-red-300 focus:ring-red-300" : "border-stone-200 focus:ring-gold"}`}
                    />
                  </div>
                </ShakeField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Assigned Role</label>
                    <Select value={formRoleId} onValueChange={setFormRoleId}>
                      <SelectTrigger><SelectValue placeholder="-- Select Role --" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Select Role --</SelectItem>
                        {roles.filter(r => r.name !== "Super Admin").map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Account Status</label>
                    <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "ACTIVE" | "INACTIVE" | "SUSPENDED")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                        <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 :bg-stone-800 text-stone-600 ">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-gold hover:bg-amber-600 text-black font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50">
                    {submitting ? "Saving..." : editingUser ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
