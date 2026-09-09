"use client";
import { toast } from "@/components/ui/Toast";
import React, { useState, useEffect } from "react";
import { Shield, Plus, Edit2, Trash2, RefreshCw, Lock, Check } from "lucide-react";
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from "@/lib/api";

interface PermissionItem {
  id: string;
  key: string;
  name: string;
  module: string;
  description?: string;
}

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionItem[];
}

export function RolesTab() {
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState("");
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [selectedPermKeys, setSelectedPermKeys] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles((rolesData.roles as RoleItem[]) || []);
      setPermissions((permsData.permissions as PermissionItem[]) || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setSelectedPermKeys(new Set());
    setEditingRole(null);
    setIsModalOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    if (role.name === "Super Admin") return;
    setEditingRole(role);
    setFormName(role.name);
    setFormDescription(role.description || "");
    setSelectedPermKeys(new Set(role.permissions.map((p) => p.key)));
    setIsModalOpen(true);
  };

  const togglePermissionKey = (key: string) => {
    setSelectedPermKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModulePermissions = (moduleName: string) => {
    const modulePerms = permissions.filter((p) => p.module === moduleName);
    const allSelected = modulePerms.every((p) => selectedPermKeys.has(p.key));

    setSelectedPermKeys((prev) => {
      const next = new Set(prev);
      modulePerms.forEach((p) => {
        if (allSelected) next.delete(p.key);
        else next.add(p.key);
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSubmitting(true);
    try {
      const permKeysArray = Array.from(selectedPermKeys);

      if (editingRole) {
        await updateRole(editingRole.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          permissionKeys: permKeysArray,
        });

        toast.success(`Role '${formName}' updated successfully`);
      } else {
        await createRole({
          name: formName.trim(),
          description: formDescription.trim(),
          permissionKeys: permKeysArray,
        });

        toast.success(`Role '${formName}' created successfully`);
      }

      resetForm();
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred while saving role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted!");
      return;
    }
    if (role.userCount > 0) {
      toast.error(`Cannot delete role. Assigned to ${role.userCount} user(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to delete custom role '${role.name}'?`)) return;

    try {
      await deleteRole(role.id);
      toast.success(`Role '${role.name}' deleted`);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  // Group permissions by module
  const modulesMap = new Map<string, PermissionItem[]>();
  permissions.forEach((p) => {
    if (!modulesMap.has(p.module)) modulesMap.set(p.module, []);
    modulesMap.get(p.module)!.push(p);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-ink/8 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-deep" /> Role & Permission Management
          </h2>
          <p className="text-xs text-steel mt-1">
            Configure system roles, custom permission matrices, and access privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2.5 rounded-xl border border-ink/8 hover:bg-ink/5 text-steel hover:text-ink transition-colors cursor-pointer" title="Refresh Roles">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-deep text-ink font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Create Custom Role
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-steel">Loading roles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.filter((role) => role.name !== "Super Admin").map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-ink/8 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-ink flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold-deep border border-gold/30">
                          <Lock className="w-2.5 h-2.5" /> System Role
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-steel mt-1">
                      {role.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleOpenEdit(role)} className="p-1.5 rounded-lg border border-ink/8 hover:bg-ink/5 text-steel hover:text-ink transition-colors cursor-pointer" title="Edit Permissions">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!role.isSystem && (
                      <button onClick={() => handleDelete(role)} className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer" title="Delete Role">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink/8">
                  <div className="text-[11px] font-semibold text-steel mb-2">Permissions ({role.permissions.length}): </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <span key={p.id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-ink/5 text-ink border border-ink/8"> {p.name} </span>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-[10px] text-steel/60 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-ink/8 flex items-center justify-between text-xs text-steel">
                <span>Assigned Users: <strong className="text-ink">{role.userCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-ink/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-deep" />
              {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-steel mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  disabled={editingRole?.isSystem}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Inventory Manager"
                  className="w-full px-3.5 py-2 rounded-xl border border-ink/10 bg-white text-ink focus:ring-2 focus:ring-gold outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-medium text-steel mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of role responsibilities..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ink/10 bg-white text-ink focus:ring-2 focus:ring-gold outline-none"
                />
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-ink text-sm">
                    Permissions Matrix
                  </div>
                </div>

                <div className="space-y-3">
                  {Array.from(modulesMap.entries()).map(([moduleName, modulePerms]) => {
                    const allSelected = modulePerms.every((p) => selectedPermKeys.has(p.key));
                    return (
                      <div
                        key={moduleName}
                        className="bg-ink/5 rounded-xl p-3 border border-ink/8 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink text-xs uppercase tracking-wide">
                            {moduleName}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(moduleName)}
                            className="text-[11px] text-gold-deep font-semibold hover:underline cursor-pointer"
                          >
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {modulePerms.map((p) => {
                            const isChecked = selectedPermKeys.has(p.key);
                            return (
                              <label
                                key={p.key}
                                onClick={() => togglePermissionKey(p.key)}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${isChecked ? "bg-gold/15 border-gold/50 text-ink font-medium"
                                  : "bg-white border-ink/10 text-steel hover:border-ink/20"
                                  }`}
                              >
                                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${isChecked ? "bg-gold border-gold text-ink" : "border-ink/20"}`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-3" />}
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-ink">{p.name}</div>
                                  <div className="text-[10px] text-steel leading-tight">
                                    {p.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 text-steel font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-deep text-ink font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
