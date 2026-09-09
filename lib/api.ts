import type { MovementType } from "@/lib/types";
import type { UserPreferences } from "@/components/admin/PreferencesProvider";

async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(path, { credentials: "include" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `GET ${path} failed (${res.status})`);
    }
    return res.json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `POST ${path} failed (${res.status})`);
    }
    return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `PATCH ${path} failed (${res.status})`);
    }
    return res.json();
}

async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(path, {
        method: "DELETE",
        credentials: "include",
        ...(body !== undefined && {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `DELETE ${path} failed (${res.status})`);
    }
    return res.json();
}

export const getSession = () => apiGet<{ authenticated: boolean; user?: Record<string, unknown> }>("/api/admin/auth");
export const login = (credentials: { email?: string; password: string }) => apiPost<{ success: boolean; user: Record<string, unknown> }>("/api/admin/auth", credentials);
export const logout = () => apiDelete<{ success: boolean }>("/api/admin/auth");

export interface ProductPayload {
    slug: string;
    name: string;
    categoryId: string;
    modelKind: string;
    tagline: string;
    specialFeature: string;
    specs?: Record<string, string>;
    featured?: boolean;
    featureBullets?: string[];
    imageUrl?: string | null;
    videoUrl?: string | null;
    price?: number | null;
    colorwayBody?: string;
    colorwayAccent?: string;
}

export const getProducts = () => apiGet<unknown[]>("/api/admin/products");
export const createProduct = (payload: ProductPayload) => apiPost<unknown>("/api/admin/products", payload);
export const updateProduct = (id: string, payload: Partial<ProductPayload>) => apiPatch<unknown>(`/api/admin/products/${id}`, payload);
export const deleteProduct = (id: string) => apiDelete<{ ok: boolean }>(`/api/admin/products/${id}`);
export const getCategories = () => apiGet<unknown[]>("/api/admin/categories");
export const createCategory = (payload: { id: string; name: string; blurb: string }) => apiPost<unknown>("/api/admin/categories", payload);
export const getInventory = () => apiGet<unknown[]>("/api/admin/inventory");

export const updateInventory = (payload: {
    productId: string;
    qty?: number;
    minQty?: number;
    price?: number;
}) => apiPatch<{ ok: boolean }>("/api/admin/inventory", payload);

export const getMovements = () => apiGet<unknown[]>("/api/admin/movements");

export const recordMovement = (payload: {
    productId: string;
    type: Uppercase<MovementType>;
    qty: number;
    note?: string;
}) => apiPost<unknown>("/api/admin/movements", payload);

export const getContent = () => apiGet<{ blocks: unknown[]; settings: unknown[] }>("/api/admin/content");

export const upsertSiteSetting = (key: string, value: string) => apiPatch<unknown>("/api/admin/content", { type: "setting", key, value });

export const upsertContentBlock = (payload: {
    slug: string;
    title?: string;
    bodyText?: string;
    mediaUrl?: string;
    metadata?: object;
}) => apiPatch<unknown>("/api/admin/content", { type: "block", ...payload });

export const getMediaAssets = () => apiGet<{ files: unknown[] }>("/api/admin/upload");

export const uploadAsset = async (formData: FormData) => {
    const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
    }
    return res.json() as Promise<{
        success: boolean;
        url: string;
        publicId: string;
        resourceType: string;
        fileName: string;
        sizeBytes: number;
        mimeType: string;
        uploadedAt: string;
    }>;
};

export const deleteAsset = (publicId: string, resourceType: string = "image") => apiDelete<{ success: boolean }>("/api/admin/upload", { publicId, resourceType });

export interface UserPayload {
    email: string;
    password: string;
    name: string;
    phone?: string;
    roleId?: string | null;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    isSuperUser?: boolean;
}

export const getUsers = () => apiGet<{ users: unknown[] }>("/api/admin/users");
export const createUser = (payload: UserPayload) => apiPost<{ user: unknown }>("/api/admin/users", payload);
export const updateUser = (id: string, payload: Partial<UserPayload & { email: string }>) => apiPatch<{ user: unknown }>(`/api/admin/users/${id}`, payload);
export const deleteUser = (id: string) => apiDelete<{ success: boolean; deletedId: string }>(`/api/admin/users/${id}`);

export interface RolePayload {
    name: string;
    description?: string;
    permissionKeys?: string[];
}

export const getRoles = () => apiGet<{ roles: unknown[] }>("/api/admin/roles");
export const createRole = (payload: RolePayload) => apiPost<{ role: unknown }>("/api/admin/roles", payload);
export const updateRole = (id: string, payload: Partial<RolePayload>) => apiPatch<{ role: unknown }>(`/api/admin/roles/${id}`, payload);
export const deleteRole = (id: string) => apiDelete<{ success: boolean; deletedId: string }>(`/api/admin/roles/${id}`);
export const getPermissions = () => apiGet<{ permissions: unknown[] }>("/api/admin/permissions");
export const getSiteInfo = () => apiGet<Record<string, string>>("/api/site-info");

export const updateAccount = (payload: { name?: string; currentPassword?: string; newPassword?: string }) => apiPatch<{ success: boolean; user?: unknown; message?: string }>("/api/admin/account", payload);

export const updatePreferences = (payload: Partial<UserPreferences>) => apiPatch<{ success: boolean; preferences: unknown }>("/api/admin/preferences", payload);
