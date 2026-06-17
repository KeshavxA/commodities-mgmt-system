"use client";

import { useState } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Sidebar from "@/src/components/layout/Sidebar";
import PermissionGuard from "@/src/components/auth/PermissionGuard";
import { Shield, Plus, Lock, Pencil, Trash2, Check, X } from "lucide-react";
import { useRBAC, type Role, type Permission } from "@/src/context/RBACContext";
import clsx from "clsx";

const PERMISSION_CATEGORIES = {
    Dashboard: ["dashboard:view"],
    Products: ["products:read", "products:create", "products:edit", "products:delete"],
    Orders: ["orders:read", "orders:create", "orders:approve"],
    Suppliers: ["suppliers:read", "suppliers:manage"],
    System: ["audit:view", "roles:manage"],
};

export default function RolesPage() {
    return (
        <PermissionGuard requiredPermissions={["roles:manage"]}>
            <RolesContent />
        </PermissionGuard>
    );
}

function RolesContent() {
    const { roles, createRole, updateRole, deleteRole } = useRBAC();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form state
    const [name, setName] = useState("");
    const [permissions, setPermissions] = useState<Permission[]>([]);

    function handleEdit(role: Role) {
        setEditingRole(role);
        setName(role.name);
        setPermissions([...role.permissions]);
        setIsCreating(false);
    }

    function handleCreate() {
        setEditingRole(null);
        setName("");
        setPermissions([]);
        setIsCreating(true);
    }

    function handleCancel() {
        setEditingRole(null);
        setIsCreating(false);
        setName("");
        setPermissions([]);
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        if (isCreating) {
            createRole(name.trim(), permissions);
        } else if (editingRole) {
            updateRole(editingRole.id, permissions); // name isn't editable for simplicity, or we could add updateRoleName
        }
        
        handleCancel();
    }

    function togglePermission(p: Permission) {
        setPermissions((prev) => 
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-black">
            <Sidebar />

            <div className="flex flex-1 flex-col transition-all duration-300 lg:pl-[280px]">
                <Navbar />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 shadow-sm dark:bg-violet-900/20">
                                <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Roles & Permissions
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manage access control and define custom roles
                                </p>
                            </div>
                        </div>
                        
                        {!isCreating && !editingRole && (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span>Create Role</span>
                            </button>
                        )}
                    </div>

                    {(isCreating || editingRole) ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isCreating ? "Create New Role" : `Edit Role: ${editingRole.name}`}
                                </h2>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                {isCreating && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                                            placeholder="e.g. Auditor, Intern"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">Permissions</h3>
                                    
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
                                            <div key={category} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/20">
                                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    {category}
                                                </h4>
                                                <div className="space-y-3">
                                                    {perms.map((p) => {
                                                        const isSelected = permissions.includes(p as Permission);
                                                        return (
                                                            <label key={p} className="flex cursor-pointer items-center gap-3" onClick={(e) => { e.preventDefault(); togglePermission(p as Permission); }}>
                                                                <div className={clsx(
                                                                    "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                                                                    isSelected 
                                                                        ? "border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500" 
                                                                        : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                                                )}>
                                                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                                                </div>
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {p.split(":")[1]}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98]"
                                        disabled={!isCreating && permissions.length === 0}
                                    >
                                        Save Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {roles.map((role) => (
                                <div key={role.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                                {role.name}
                                                {role.isSystem && (
                                                    <Lock className="h-3.5 w-3.5 text-gray-400" title="System Role" />
                                                )}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {role.permissions.length} permissions
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(role)}
                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            {!role.isSystem && (
                                                <button
                                                    onClick={() => deleteRole(role.id)}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            {role.permissions.slice(0, 5).map(p => (
                                                <span key={p} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                    {p}
                                                </span>
                                            ))}
                                            {role.permissions.length > 5 && (
                                                <span className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-400 dark:bg-gray-800/50 dark:text-gray-500">
                                                    +{role.permissions.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
