const API_URL = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";
export function getToken() {
    return localStorage.getItem("espol_token");
}
export function setToken(token) {
    localStorage.setItem("espol_token", token);
}
export function clearToken() {
    localStorage.removeItem("espol_token");
}
async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    const token = getToken();
    if (token)
        headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    }
    catch {
        data = { mensaje: text || "Respuesta no válida" };
    }
    if (!response.ok) {
        const message = data?.mensaje || data?.message || data?.message?.[0] || "No fue posible completar la operación.";
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}
export const api = {
    login: async (email, password) => {
        const data = await request("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        return data;
    },
    register: async (name, email, password) => {
        const data = await request("/registro", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });
        setToken(data.token);
        return data;
    },
    logout: async () => {
        try {
            await request("/logout", { method: "POST" });
        }
        finally {
            clearToken();
        }
    },
    me: () => request("/usuario"),
  updateProfile: (payload) => request("/usuario", { method: "PATCH", body: JSON.stringify(payload) }),
  changePassword: (payload) => request("/usuario/password", { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAccount: () => request("/usuario", { method: "DELETE" }),
    communities: () => request("/comunidades"),
    community: (id) => request(`/comunidades/${id}`),
    createCommunity: (payload) => request("/comunidades", { method: "POST", body: JSON.stringify(payload) }),
    updateCommunity: (id, payload) => request(`/comunidades/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteCommunity: (id) => request(`/comunidades/${id}`, { method: "DELETE" }),
    publications: (communityId) => request(`/comunidades/${communityId}/publicaciones`),
    publication: (id) => request(`/publicaciones/${id}`),
    createPublication: (communityId, payload) => request(`/comunidades/${communityId}/publicaciones`, { method: "POST", body: JSON.stringify(payload) }),
    updatePublication: (id, payload) => request(`/publicaciones/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deletePublication: (id) => request(`/publicaciones/${id}`, { method: "DELETE" }),
    requestJoin: (communityId) => request(`/comunidades/${communityId}/solicitudes`, { method: "POST" }),
    communityRequests: (communityId) => request(`/comunidades/${communityId}/solicitudes`),
    approveRequest: (id) => request(`/solicitudes/${id}/aprobar`, { method: "PATCH" }),
    rejectRequest: (id) => request(`/solicitudes/${id}/rechazar`, { method: "PATCH" }),
    members: (communityId) => request(`/comunidades/${communityId}/miembros`),
    myCommunities: () => request("/mis-comunidades"),
    comments: (publicationId) => request(`/publicaciones/${publicationId}/comentarios`),
    createComment: (publicationId, payload) => request(`/publicaciones/${publicationId}/comentarios`, { method: "POST", body: JSON.stringify(payload) }),
    updateComment: (id, payload) => request(`/comentarios/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteComment: (id) => request(`/comentarios/${id}`, { method: "DELETE" }),
    notifications: () => request("/notificaciones"),
    unreadNotificationCount: () => request("/notificaciones/conteo"),
    markNotificationRead: (id) => request(`/notificaciones/${id}/leer`, { method: "PATCH" }),
    markAllNotificationsRead: () => request("/notificaciones/leer-todas", { method: "PATCH" }),
};
