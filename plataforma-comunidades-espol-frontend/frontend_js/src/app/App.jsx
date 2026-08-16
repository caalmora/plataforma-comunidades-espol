import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api, clearToken, getToken } from "./api";
import { Users, LogOut, Search, Plus, Edit2, Trash2, Check, X, Eye, EyeOff, ChevronRight, Menu, FileText, User, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, Home, GraduationCap, UserPlus, ArrowLeft, Filter, Building2, Hash, Camera, KeyRound, Shield } from "lucide-react";
// ─── LIVE DATA ───────────────────────────────────────────────────
const CATEGORIES = ["Tecnología", "Deportes", "Arte y Cultura", "Emprendimiento", "Ciencias", "Voluntariado"];
// ─── UTILITIES ──────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d) => new Date(d).toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "numeric" });
const initials = (name) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
// ─── ROLE HELPERS (por comunidad, no global) ────────────────────
// ¿El usuario es admin de esta comunidad específica?
const isCommunityAdmin = (userId, communityId, memberships) => memberships.some(m => m.userId === userId && m.communityId === communityId && m.role === "admin");
// ¿El usuario es admin de al menos una comunidad?
const isAdminOfAny = (userId, memberships) => memberships.some(m => m.userId === userId && m.role === "admin");
// ─── CATEGORY COLORS ────────────────────────────────────────────
const CAT_COLORS = {
    "Tecnología": "bg-blue-100 text-blue-700 border-blue-200",
    "Deportes": "bg-green-100 text-green-700 border-green-200",
    "Arte y Cultura": "bg-purple-100 text-purple-700 border-purple-200",
    "Emprendimiento": "bg-orange-100 text-orange-700 border-orange-200",
    "Ciencias": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Voluntariado": "bg-red-100 text-red-700 border-red-200",
};
function Btn({ children, onClick, variant = "primary", size = "md", type = "button", disabled = false, className = "", fullWidth = false }) {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";
    const sz = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
    const vr = {
        primary: "bg-[#0b3d91] text-white hover:bg-[#09347a] focus:ring-[#0b3d91] shadow-sm",
        secondary: "bg-[#e6eeff] text-[#0b3d91] hover:bg-[#d6e2ff] focus:ring-[#0b3d91]",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
        ghost: "text-[#5a709a] hover:bg-[#edf1fb] hover:text-[#0d1e4d] focus:ring-[#0b3d91]",
        outline: "border border-[rgba(11,61,145,0.2)] text-[#0d1e4d] hover:bg-[#edf1fb] focus:ring-[#0b3d91]",
    };
    return (_jsx("button", { type: type, onClick: onClick, disabled: disabled, className: cn(base, sz[size], vr[variant], fullWidth && "w-full", className), children: children }));
}
function Badge({ label }) {
    const cls = CAT_COLORS[label] || "bg-gray-100 text-gray-700 border-gray-200";
    return (_jsxs("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cls), children: [_jsx(Hash, { size: 10 }), label] }));
}
function StatusPill({ status }) {
    const cfg = {
        pending: { label: "Pendiente", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
        approved: { label: "Aprobada", cls: "bg-green-50 text-green-700 border-green-200", Icon: CheckCircle2 },
        rejected: { label: "Rechazada", cls: "bg-red-50 text-red-700 border-red-200", Icon: XCircle },
    };
    const { label, cls, Icon } = cfg[status];
    return (_jsxs("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cls), children: [_jsx(Icon, { size: 11 }), label] }));
}
function ToastRack({ toasts }) {
    return (_jsx("div", { className: "fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none", children: toasts.map(t => {
            const icn = { success: CheckCircle2, error: XCircle, info: AlertCircle };
            const cls = {
                success: "bg-green-50 border-green-200 text-green-800",
                error: "bg-red-50 border-red-200 text-red-800",
                info: "bg-blue-50 border-blue-200 text-blue-800",
            };
            const Icon = icn[t.type];
            return (_jsxs("div", { className: cn("flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-[360px] pointer-events-auto", cls[t.type]), children: [_jsx(Icon, { size: 16, className: "shrink-0" }), _jsx("span", { className: "text-sm font-medium", children: t.message })] }, t.id));
        }) }));
}
function Empty({ icon: Icon, title, desc, action }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center px-4", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-[#edf1fb] flex items-center justify-center mb-4", children: _jsx(Icon, { size: 28, className: "text-[#5a709a]" }) }), _jsx("h3", { className: "text-base font-semibold text-[#0d1e4d] mb-1", children: title }), _jsx("p", { className: "text-sm text-[#5a709a] max-w-xs mb-5", children: desc }), action] }));
}
function ConfirmModal({ msg, onOk, onCancel }) {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[rgba(11,61,145,0.1)]", children: [_jsxs("div", { className: "flex items-start gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0", children: _jsx(AlertCircle, { size: 20, className: "text-red-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-[#0d1e4d] text-base", children: "Confirmar eliminaci\u00F3n" }), _jsx("p", { className: "text-sm text-[#5a709a] mt-0.5", children: "Esta acci\u00F3n no se puede deshacer." })] })] }), _jsx("p", { className: "text-sm text-[#0d1e4d] mb-6 leading-relaxed", children: msg }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx(Btn, { variant: "outline", size: "sm", onClick: onCancel, children: "Cancelar" }), _jsxs(Btn, { variant: "danger", size: "sm", onClick: onOk, children: [_jsx(Trash2, { size: 14 }), "Eliminar"] })] })] }) }));
}
function CommunityLogo({ c, size = "md" }) {
    const sz = { sm: "w-9 h-9 text-sm rounded-lg", md: "w-12 h-12 text-lg rounded-xl", lg: "w-16 h-16 text-xl rounded-2xl", xl: "w-24 h-24 text-3xl rounded-3xl" };
    return (_jsx("div", { className: cn("flex items-center justify-center font-bold text-white shrink-0 shadow-sm", sz[size]), style: { backgroundColor: c.logoColor }, children: c.logoInitial }));
}
function Avatar({ name, photo, size = "sm" }) {
    const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
    return (_jsx("div", { className: cn("rounded-full bg-[#0b3d91] flex items-center justify-center font-semibold text-white shrink-0 overflow-hidden", sz[size]), children: photo ? _jsx("img", { src: photo, alt: name, className: "w-full h-full object-cover" }) : initials(name) }));
}
function FieldWrap({ label, error, hint, children }) {
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-sm font-medium text-[#0d1e4d]", children: label }), children, hint && !error && _jsx("p", { className: "text-xs text-[#5a709a]", children: hint }), error && (_jsxs("p", { className: "flex items-center gap-1 text-xs text-red-600", children: [_jsx(AlertCircle, { size: 11 }), error] }))] }));
}
const inputCls = "w-full px-3 py-2.5 text-sm bg-[#f8faff] border border-[rgba(11,61,145,0.15)] rounded-lg text-[#0d1e4d] placeholder:text-[#5a709a] focus:outline-none focus:ring-2 focus:ring-[#0b3d91]/25 focus:border-[#0b3d91] transition-colors";
function Inp(props) {
    return _jsx("input", { className: inputCls, ...props });
}
function Txa(props) {
    return _jsx("textarea", { className: cn(inputCls, "resize-none"), ...props });
}
function Sel({ children, ...props }) {
    return _jsx("select", { className: inputCls, ...props, children: children });
}
function PageWrap({ children }) {
    return _jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: children });
}
function Card({ children, className }) {
    return (_jsx("div", { className: cn("bg-white rounded-2xl border border-[rgba(11,61,145,0.08)] shadow-sm", className), children: children }));
}
// ─── NAVBAR ─────────────────────────────────────────────────────
function Navbar({ user, photo, currentView, memberships, navigate, onLogout }) {
    const [open, setOpen] = useState(false);
    const adminOfAny = isAdminOfAny(user.id, memberships);
    const links = [
        { label: "Inicio", view: "dashboard", icon: Home },
        { label: "Comunidades", view: "communities", icon: Building2 },
        { label: "Mis Comunidades", view: "my-communities", icon: Users },
        ...(adminOfAny ? [{ label: "Solicitudes", view: "requests", icon: UserPlus }] : []),
        { label: "Perfil", view: "profile", icon: User },
    ];
    const isActive = (v) => currentView === v;
    return (_jsxs("nav", { className: "sticky top-0 z-40 bg-white border-b border-[rgba(11,61,145,0.1)] shadow-sm", children: [_jsx("div", { className: "max-w-6xl mx-auto px-4 sm:px-6", children: _jsxs("div", { className: "flex items-center justify-between h-16 gap-4", children: [_jsxs("button", { onClick: () => navigate("dashboard"), className: "flex items-center gap-2.5 shrink-0 group", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-[#0b3d91] flex items-center justify-center shadow-sm group-hover:bg-[#09347a] transition-colors", children: _jsx(GraduationCap, { size: 18, className: "text-white" }) }), _jsxs("div", { className: "hidden sm:block leading-tight", children: [_jsx("p", { className: "text-base font-bold text-[#0b3d91]", style: { fontFamily: "'Outfit', sans-serif" }, children: "ESPOL" }), _jsx("p", { className: "text-[10px] text-[#5a709a] font-medium -mt-0.5 leading-none", children: "Comunidades" })] })] }), _jsx("div", { className: "hidden md:flex items-center gap-1", children: links.map(l => (_jsxs("button", { onClick: () => navigate(l.view), className: cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive(l.view) ? "bg-[#e6eeff] text-[#0b3d91]" : "text-[#5a709a] hover:text-[#0d1e4d] hover:bg-[#f4f7ff]"), children: [_jsx(l.icon, { size: 15 }), l.label] }, l.view))) }), _jsxs("div", { className: "hidden md:flex items-center gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d] leading-tight", children: user.name.split(" ")[0] }), _jsx("p", { className: "text-[11px] text-[#5a709a] leading-tight", children: user.position })] }), _jsx(Avatar, { name: user.name, photo: photo, size: "sm" }), _jsx("button", { onClick: onLogout, title: "Cerrar sesi\u00F3n", className: "w-8 h-8 flex items-center justify-center rounded-lg text-[#5a709a] hover:text-red-600 hover:bg-red-50 transition-colors", children: _jsx(LogOut, { size: 16 }) })] }), _jsx("button", { onClick: () => setOpen(v => !v), className: "md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#5a709a] hover:bg-[#f4f7ff] transition-colors", children: open ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) })] }) }), open && (_jsx("div", { className: "md:hidden border-t border-[rgba(11,61,145,0.08)] bg-white", children: _jsxs("div", { className: "px-4 py-3 space-y-1", children: [links.map(l => (_jsxs("button", { onClick: () => { navigate(l.view); setOpen(false); }, className: cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors", isActive(l.view) ? "bg-[#e6eeff] text-[#0b3d91]" : "text-[#5a709a] hover:bg-[#f4f7ff] hover:text-[#0d1e4d]"), children: [_jsx(l.icon, { size: 16 }), l.label] }, l.view))), _jsxs("div", { className: "pt-2 mt-2 border-t border-[rgba(11,61,145,0.08)] flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { name: user.name, photo: photo, size: "sm" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: user.name.split(" ").slice(0, 2).join(" ") }), _jsx("p", { className: "text-xs text-[#5a709a]", children: user.email })] })] }), _jsxs("button", { onClick: onLogout, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors", children: [_jsx(LogOut, { size: 13 }), "Salir"] })] })] }) }))] }));
}
// ─── LOGIN PAGE ──────────────────────────────────────────────────
function LoginPage({ onLogin, goRegister }) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const validate = () => {
    const e = {};

    if (!email.trim())
        e.email = "El correo es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        e.email = "Ingresa un correo válido.";
    else if (!email.toLowerCase().endsWith("@espol.edu.ec"))
        e.email = "Debes utilizar un correo @espol.edu.ec";
    if (!pass)
        e.pass = "La contraseña es requerida.";
        return e;
    };
    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        try {
            const data = await api.login(email.trim(), pass);
            await onLogin(data.usuario);
        }
        catch (error) {
            setErrors({ general: error?.message || "Credenciales incorrectas." });
        }
        finally {
            setLoading(false);
        }
    };
}
// ─── REGISTER PAGE ───────────────────────────────────────────────
function RegisterPage({ goLogin }) {
    const [form, setForm] = useState({ name: "", email: "", pass: "", confirm: "" });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors({}); };
    const validate = () => {
        const e = {};
        if (!form.name.trim())
            e.name = "El nombre es requerido.";
        else if (form.name.trim().split(" ").length < 2)
            e.name = "Ingresa nombre y apellido.";
        
        if (!form.email.trim())
            e.email = "El correo es requerido.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Ingresa un correo válido.";
        else if (!form.email.toLowerCase().endsWith("@espol.edu.ec"))
            e.email = "Debes utilizar un correo @espol.edu.ec";
                
        if (!form.pass)
            e.pass = "La contraseña es requerida.";
        else if (form.pass.length < 8)
            e.pass = "Mínimo 8 caracteres.";
        if (form.pass !== form.confirm)
            e.confirm = "Las contraseñas no coinciden.";
        return e;
    };
    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        try {
            await api.register(form.name.trim(), form.email.trim(), form.pass);
            setDone(true);
        }
        catch (error) {
            setErrors({ general: error?.message || "No fue posible crear la cuenta." });
        }
        finally {
            setLoading(false);
        }
    };
    if (done)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#f4f7ff] p-6", children: _jsxs(Card, { className: "p-10 max-w-sm w-full text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4", children: _jsx(CheckCircle2, { size: 32, className: "text-green-600" }) }), _jsx("h2", { className: "text-xl font-bold text-[#0d1e4d] mb-2", style: { fontFamily: "'Outfit', sans-serif" }, children: "\u00A1Cuenta creada!" }), _jsx("p", { className: "text-sm text-[#5a709a] mb-6", children: "Tu cuenta ha sido registrada correctamente." }), _jsx(Btn, { fullWidth: true, onClick: goLogin, children: "Ir al inicio de sesi\u00F3n" })] }) }));
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#f4f7ff] p-6", children: _jsxs("div", { className: "w-full max-w-[440px]", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-8 justify-center", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-[#0b3d91] flex items-center justify-center", children: _jsx(GraduationCap, { size: 20, className: "text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold text-[#0b3d91]", style: { fontFamily: "'Outfit', sans-serif" }, children: "ESPOL" }), _jsx("p", { className: "text-xs text-[#5a709a]", children: "Gesti\u00F3n de Comunidades" })] })] }), _jsxs(Card, { className: "p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-[#0d1e4d] mb-1", style: { fontFamily: "'Outfit', sans-serif" }, children: "Crear cuenta" }), _jsx("p", { className: "text-sm text-[#5a709a] mb-6", children: "Reg\u00EDstrate para participar en las comunidades." }), errors.general && _jsxs("div", { className: "mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700", children: [_jsx(AlertCircle, { size: 15 }), errors.general] }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsx(FieldWrap, { label: "Nombre completo", error: errors.name, children: _jsx(Inp, { placeholder: "Nombre Apellido", value: form.name, onChange: e => upd("name", e.target.value) }) }), _jsx(FieldWrap, { label: "Correo electr\u00F3nico", error: errors.email, children: _jsx(Inp, { type: "email", placeholder: "nombre@espol.edu.ec", value: form.email, onChange: e => upd("email", e.target.value) }) }), _jsx(FieldWrap, { label: "Contrase\u00F1a", error: errors.pass, children: _jsxs("div", { className: "relative", children: [_jsx(Inp, { type: showPass ? "text" : "password", placeholder: "M\u00EDnimo 8 caracteres", value: form.pass, onChange: e => upd("pass", e.target.value), className: "pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPass(v => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-[#5a709a]", children: showPass ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] }) }), _jsx(FieldWrap, { label: "Confirmar contrase\u00F1a", error: errors.confirm, children: _jsx(Inp, { type: "password", placeholder: "Repite tu contrase\u00F1a", value: form.confirm, onChange: e => upd("confirm", e.target.value) }) }), _jsx(Btn, { type: "submit", fullWidth: true, disabled: loading, children: loading ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" }), "Creando cuenta..."] }) : "Registrarse" })] }), _jsxs("p", { className: "mt-4 text-center text-sm text-[#5a709a]", children: ["\u00BFYa tienes cuenta? ", _jsx("button", { onClick: goLogin, className: "text-[#0b3d91] font-semibold hover:underline", children: "Iniciar sesi\u00F3n" })] })] })] }) }));
}
// ─── DASHBOARD ───────────────────────────────────────────────────
function DashboardPage({ user, communities, publications, memberships, navigate, requests }) {
    const myMems = memberships.filter(m => m.userId === user.id);
    const myAdminMems = myMems.filter(m => m.role === "admin");
    const myCommIds = new Set(myMems.map(m => m.communityId));
    const recentPubs = publications.slice(0, 3);
    const pendingForMe = requests.filter(r => r.status === "pending" && isCommunityAdmin(user.id, r.communityId, memberships)).length;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "bg-[#0b3d91] rounded-2xl p-6 md:p-8 mb-8 text-white overflow-hidden relative", children: [_jsx("div", { className: "absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" }), _jsx("div", { className: "absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" }), _jsxs("div", { className: "relative z-10", children: [_jsxs("p", { className: "text-blue-200 text-sm font-medium mb-1", children: [greeting, ","] }), _jsx("h1", { className: "text-2xl md:text-3xl font-bold mb-2", style: { fontFamily: "'Outfit', sans-serif" }, children: user.name.split(" ").slice(0, 2).join(" ") }), _jsx("p", { className: "text-blue-200 text-sm max-w-md", children: "Bienvenido a la Plataforma de Gesti\u00F3n de Comunidades ESPOL." })] })] }), _jsx("div", { className: cn("grid gap-4 mb-8", myAdminMems.length > 0 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"), children: [
                    { label: "Mis comunidades", val: myMems.length, icon: Users, color: "text-[#0b3d91] bg-[#e6eeff]" },
                    { label: "Total disponibles", val: communities.length, icon: Building2, color: "text-purple-600 bg-purple-50" },
                    { label: "Publicaciones", val: publications.length, icon: FileText, color: "text-green-600 bg-green-50" },
                    ...(myAdminMems.length > 0
                        ? [{ label: "Solicitudes pendientes", val: pendingForMe, icon: Clock, color: "text-amber-600 bg-amber-50" }]
                        : []),
                ].map(s => (_jsxs(Card, { className: "p-4 flex items-center gap-3", children: [_jsx("div", { className: cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color), children: _jsx(s.icon, { size: 18 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xl font-bold text-[#0d1e4d]", children: s.val }), _jsx("p", { className: "text-xs text-[#5a709a] leading-tight", children: s.label })] })] }, s.label))) }), myAdminMems.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Comunidades que administras" }), _jsx("p", { className: "text-xs text-[#5a709a] mt-0.5", children: "Tienes permisos de administraci\u00F3n en estas comunidades." })] }), _jsxs("button", { onClick: () => navigate("my-communities"), className: "text-sm text-[#0b3d91] font-medium hover:underline flex items-center gap-1", children: ["Ver todas ", _jsx(ChevronRight, { size: 14 })] })] }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: myAdminMems.slice(0, 3).map(m => {
                            const c = communities.find(x => x.id === m.communityId);
                            if (!c)
                                return null;
                            const pending = requests.filter(r => r.communityId === c.id && r.status === "pending").length;
                            return (_jsxs(Card, { className: "p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer", onClick: () => navigate("community-detail", c.id), children: [_jsx(CommunityLogo, { c: c, size: "sm" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d] truncate", children: c.name }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsxs("span", { className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e6eeff] text-[#0b3d91] border border-[rgba(11,61,145,0.2)]", children: [_jsx(Shield, { size: 9 }), "Admin"] }), pending > 0 && (_jsxs("span", { className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200", children: [_jsx(Clock, { size: 9 }), pending, " pendiente", pending > 1 ? "s" : ""] }))] })] }), _jsx(ChevronRight, { size: 15, className: "text-[#5a709a] shrink-0" })] }, c.id));
                        }) })] })), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Publicaciones recientes" }), _jsxs("button", { onClick: () => navigate("publications"), className: "text-sm text-[#0b3d91] font-medium hover:underline flex items-center gap-1", children: ["Ver todas ", _jsx(ChevronRight, { size: 14 })] })] }), recentPubs.length === 0 ? (_jsx(Card, { className: "p-6", children: _jsx(Empty, { icon: FileText, title: "Sin publicaciones", desc: "No hay publicaciones recientes." }) })) : (_jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: recentPubs.map(p => (_jsxs(Card, { className: "p-4 hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex items-center gap-2 mb-2", children: _jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-[#e6eeff] text-[#0b3d91] truncate max-w-[140px]", children: p.communityName }) }), _jsx("p", { className: "text-sm font-semibold text-[#0d1e4d] mb-1 line-clamp-2", children: p.title }), _jsx("p", { className: "text-xs text-[#5a709a] line-clamp-2 mb-3", children: p.content }), _jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-[rgba(11,61,145,0.06)]", children: [_jsx("span", { className: "text-xs text-[#5a709a]", children: p.authorName.split(" ")[0] }), _jsxs("span", { className: "text-xs text-[#5a709a] flex items-center gap-1", children: [_jsx(Calendar, { size: 10 }), fmtDate(p.createdAt)] })] })] }, p.id))) }))] })] }));
}
// ─── COMMUNITIES PAGE ────────────────────────────────────────────
function CommunitiesPage({ user, communities, memberships, navigate, onDelete, onJoinRequest, toast }) {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("Todas");
    const myCommIds = new Set(memberships.filter(m => m.userId === user.id).map(m => m.communityId));
    const filtered = communities.filter(c => (cat === "Todas" || c.category === cat) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())));
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Comunidades" }), _jsxs("p", { className: "text-sm text-[#5a709a] mt-0.5", children: [communities.length, " comunidades disponibles"] })] }), _jsxs(Btn, { onClick: () => navigate("create-community"), size: "sm", children: [_jsx(Plus, { size: 15 }), "Nueva comunidad"] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-[#5a709a]" }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar comunidades...", className: cn(inputCls, "pl-9") })] }), _jsxs("div", { className: "relative", children: [_jsx(Filter, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-[#5a709a]" }), _jsxs("select", { value: cat, onChange: e => setCat(e.target.value), className: cn(inputCls, "pl-9 sm:w-48"), children: [_jsx("option", { value: "Todas", children: "Todas las categor\u00EDas" }), CATEGORIES.map(c => _jsx("option", { value: c, children: c }, c))] })] })] }), filtered.length === 0 ? (_jsx(Empty, { icon: Search, title: "Sin resultados", desc: "No se encontraron comunidades con esos criterios.", action: _jsx(Btn, { size: "sm", variant: "outline", onClick: () => { setSearch(""); setCat("Todas"); }, children: "Limpiar filtros" }) })) : (_jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5", children: filtered.map(c => {
                    const isMember = myCommIds.has(c.id);
                    // Admin de esta comunidad = la creó (o tiene rol admin en membresías)
                    const isAdmin = isCommunityAdmin(user.id, c.id, memberships);
                    const pendingReqs = memberships.filter(m => m.userId === user.id && m.communityId === c.id && m.role === "member").length;
                    return (_jsxs(Card, { className: "flex flex-col overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "p-5 flex-1", children: [_jsxs("div", { className: "flex items-start gap-3 mb-3", children: [_jsx(CommunityLogo, { c: c, size: "md" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-[#0d1e4d] text-sm leading-tight mb-1.5 line-clamp-2", children: c.name }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [_jsx(Badge, { label: c.category }), isAdmin && (_jsxs("span", { className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e6eeff] text-[#0b3d91] border border-[rgba(11,61,145,0.2)]", children: [_jsx(Shield, { size: 9 }), "Admin"] }))] })] })] }), _jsx("p", { className: "text-xs text-[#5a709a] leading-relaxed line-clamp-2 mb-3", children: c.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-[#5a709a]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { size: 11 }), c.adminName] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { size: 11 }), c.memberCount] })] })] }), _jsxs("div", { className: "px-5 pb-5 flex flex-wrap gap-2 border-t border-[rgba(11,61,145,0.06)] pt-4", children: [_jsxs(Btn, { size: "sm", variant: "secondary", onClick: () => navigate("community-detail", c.id), className: "flex-1", children: [_jsx(ChevronRight, { size: 14 }), "Ver comunidad"] }), !isAdmin && !isMember && (_jsxs(Btn, { size: "sm", variant: "outline", onClick: () => { onJoinRequest(c.id); toast("success", `Solicitud enviada a "${c.name}".`); }, children: [_jsx(UserPlus, { size: 14 }), "Solicitar ingreso"] })), isMember && !isAdmin && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: [_jsx(Check, { size: 12 }), "Miembro"] })), isAdmin && (_jsxs(_Fragment, { children: [_jsx(Btn, { size: "sm", variant: "ghost", onClick: () => navigate("edit-community", c.id), children: _jsx(Edit2, { size: 13 }) }), _jsx(Btn, { size: "sm", variant: "ghost", onClick: () => onDelete(c.id), className: "text-red-500 hover:bg-red-50", children: _jsx(Trash2, { size: 13 }) })] }))] })] }, c.id));
                }) }))] }));
}
// ─── COMMUNITY DETAIL ─────────────────────────────────────────────
function CommunityDetailPage({ user, communities, publications, memberships, selectedId, navigate, onJoinRequest, onDeletePub, requests, toast }) {
    const [tab, setTab] = useState("publications");
    const c = communities.find(x => x.id === selectedId);
    if (!c)
        return _jsx(Empty, { icon: Building2, title: "Comunidad no encontrada", desc: "La comunidad que buscas no existe.", action: _jsx(Btn, { onClick: () => navigate("communities"), children: "Volver" }) });
    const myMem = memberships.find(m => m.userId === user.id && m.communityId === c.id);
    const isMember = !!myMem;
    const isAdmin = isCommunityAdmin(user.id, c.id, memberships) || c.adminId === user.id;
    const communityPubs = publications.filter(p => p.communityId === c.id);
    const [communityMembers, setCommunityMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [myPendingReq, setMyPendingReq] = useState(null);
    useEffect(() => {
        let active = true;
        setLoadingMembers(true);
        api.members(c.id).then(data => {
            if (!active)
                return;
            setCommunityMembers((data || []).map((m) => ({
                userId: m.user_id, userName: m.user?.name || "Usuario", userEmail: m.user?.email || "",
                role: m.user_id === c.adminId ? "admin" : "member", joinedAt: m.joined_at
            })));
        }).catch(() => { if (active)
            setCommunityMembers([]); }).finally(() => active && setLoadingMembers(false));
        return () => { active = false; };
    }, [c.id, c.adminId]);
    useEffect(() => {
        let active = true;
        if (isMember || isAdmin) { setMyPendingReq(null); return undefined; }
        api.communityRequests(c.id).then(data => {
            if (!active) return;
            const mine = (data || []).find(r => r.user_id === user.id && r.status === "pending");
            setMyPendingReq(mine || null);
        }).catch(() => { if (active) setMyPendingReq(null); });
        return () => { active = false; };
    }, [c.id, user.id, isMember, isAdmin]);
    const pendingReq = requests.find(r => r.userId === user.id && r.communityId === c.id && r.status === "pending") || (myPendingReq ? { id: myPendingReq.id } : null);
    return (_jsxs(PageWrap, { children: [_jsxs("button", { onClick: () => navigate("communities"), className: "flex items-center gap-1.5 text-sm text-[#5a709a] hover:text-[#0d1e4d] mb-5 transition-colors", children: [_jsx(ArrowLeft, { size: 15 }), "Volver a comunidades"] }), _jsxs(Card, { className: "p-6 md:p-8 mb-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start gap-5", children: [_jsx(CommunityLogo, { c: c, size: "lg" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-start gap-3 justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: c.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5 flex-wrap", children: [_jsx(Badge, { label: c.category }), isMember && !isAdmin && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: [_jsx(Check, { size: 11 }), "Miembro"] })), isAdmin && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6eeff] text-[#0b3d91] border border-[rgba(11,61,145,0.2)]", children: [_jsx(Shield, { size: 11 }), "Administrador"] }))] })] }), isAdmin && (_jsxs(Btn, { size: "sm", variant: "outline", onClick: () => navigate("edit-community", c.id), children: [_jsx(Edit2, { size: 13 }), "Editar"] }))] }), _jsx("p", { className: "text-sm text-[#5a709a] leading-relaxed mb-4", children: c.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-[#5a709a]", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(User, { size: 14 }), _jsx("strong", { className: "text-[#0d1e4d]", children: "Administrador:" }), " ", c.adminName] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Users, { size: 14 }), c.memberCount, " miembros"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Calendar, { size: 14 }), "Desde ", fmtDate(c.createdAt)] })] })] })] }), !isMember && !isAdmin && (_jsx("div", { className: "mt-5 pt-5 border-t border-[rgba(11,61,145,0.08)]", children: pendingReq ? (_jsxs("div", { className: "flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 w-fit", children: [_jsx(Clock, { size: 15 }), "Solicitud de ingreso pendiente"] })) : (_jsxs(Btn, { onClick: () => { onJoinRequest(c.id); toast("success", "Solicitud de ingreso enviada."); }, children: [_jsx(UserPlus, { size: 15 }), "Solicitar ingreso a esta comunidad"] })) }))] }), _jsxs("div", { className: "flex gap-1 mb-5 bg-white rounded-xl p-1 border border-[rgba(11,61,145,0.08)] w-fit", children: [_jsx("button", { onClick: () => setTab("publications"), className: cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", tab === "publications" ? "bg-[#0b3d91] text-white shadow-sm" : "text-[#5a709a] hover:text-[#0d1e4d]"), children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(FileText, { size: 14 }), "Publicaciones (", communityPubs.length, ")"] }) }), _jsx("button", { onClick: () => setTab("members"), className: cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", tab === "members" ? "bg-[#0b3d91] text-white shadow-sm" : "text-[#5a709a] hover:text-[#0d1e4d]"), children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 14 }), "Miembros (", communityMembers.length, ")"] }) })] }), tab === "publications" && (_jsxs("div", { children: [isAdmin && (_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Btn, { size: "sm", onClick: () => navigate("create-publication", c.id), children: [_jsx(Plus, { size: 14 }), "Nueva publicaci\u00F3n"] }) })), communityPubs.length === 0 ? (_jsx(Empty, { icon: FileText, title: "Sin publicaciones", desc: "Esta comunidad a\u00FAn no tiene publicaciones." })) : (_jsx("div", { className: "space-y-4", children: communityPubs.map(p => (_jsxs(Card, { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("h3", { className: "text-base font-semibold text-[#0d1e4d] leading-tight", children: p.title }), isAdmin && (_jsxs("div", { className: "flex gap-1 shrink-0", children: [_jsx(Btn, { size: "sm", variant: "ghost", onClick: () => navigate("edit-publication", c.id, p.id), children: _jsx(Edit2, { size: 13 }) }), _jsx(Btn, { size: "sm", variant: "ghost", onClick: () => { onDeletePub(p.id); toast("success", "Publicación eliminada."); }, className: "text-red-500 hover:bg-red-50", children: _jsx(Trash2, { size: 13 }) })] }))] }), _jsx("p", { className: "text-sm text-[#5a709a] leading-relaxed mt-2 mb-3", children: p.content }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-[#5a709a]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { size: 11 }), p.authorName] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 11 }), fmtDate(p.createdAt)] })] })] }, p.id))) }))] })), tab === "members" && (_jsx("div", { children: loadingMembers ? (_jsx(Card, { className: "p-8 text-sm text-[#5a709a]", children: "Cargando miembros..." })) : communityMembers.length === 0 ? (_jsx(Empty, { icon: Users, title: "Sin miembros", desc: "Esta comunidad a\u00FAn no tiene miembros registrados." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden sm:block", children: _jsx(Card, { className: "overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#f4f7ff]", children: _jsx("tr", { children: ["Miembro", "Correo", "Rol en comunidad", "Ingresó"].map(h => (_jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-[#5a709a] uppercase tracking-wide", children: h }, h))) }) }), _jsx("tbody", { className: "divide-y divide-[rgba(11,61,145,0.06)]", children: communityMembers.map(m => (_jsxs("tr", { className: "hover:bg-[#f8faff] transition-colors", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Avatar, { name: m.userName, size: "sm" }), _jsx("span", { className: "text-sm font-medium text-[#0d1e4d]", children: m.userName })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-[#5a709a]", children: m.userEmail }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: cn("px-2 py-0.5 rounded-full text-xs font-medium border", m.role === "admin" ? "bg-[#e6eeff] text-[#0b3d91] border-[rgba(11,61,145,0.2)]" : "bg-gray-50 text-gray-600 border-gray-200"), children: m.role === "admin" ? "Administrador" : "Miembro" }) }), _jsx("td", { className: "px-4 py-3 text-sm text-[#5a709a]", children: fmtDate(m.joinedAt) })] }, m.userId))) })] }) }) }), _jsx("div", { className: "sm:hidden space-y-3", children: communityMembers.map(m => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Avatar, { name: m.userName, size: "sm" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: m.userName }), _jsx("p", { className: "text-xs text-[#5a709a]", children: m.userEmail })] })] }), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsx("span", { className: cn("px-2 py-0.5 rounded-full text-xs font-medium border", m.role === "admin" ? "bg-[#e6eeff] text-[#0b3d91] border-[rgba(11,61,145,0.2)]" : "bg-gray-50 text-gray-600 border-gray-200"), children: m.role === "admin" ? "Administrador" : "Miembro" }), _jsx("span", { className: "text-xs text-[#5a709a]", children: fmtDate(m.joinedAt) })] })] }, m.userId))) })] })) }))] }));
}
// ─── CREATE / EDIT COMMUNITY ─────────────────────────────────────
function CreateCommunityPage({ navigate, onSave, existingId, communities }) {
    const existing = existingId ? communities.find(c => c.id === existingId) : null;
    const LOGO_COLORS = ["#1e56c8", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#dc2626", "#d97706", "#0d9488"];
    const [form, setForm] = useState({
        name: existing?.name || "", description: existing?.description || "",
        category: existing?.category || CATEGORIES[0],
        logoInitial: existing?.logoInitial || "", logoColor: existing?.logoColor || LOGO_COLORS[0],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
    const validate = () => {
        const e = {};
        if (!form.name.trim())
            e.name = "El nombre es requerido.";
        if (!form.description.trim())
            e.description = "La descripción es requerida.";
        else if (form.description.length < 20)
            e.description = "Escribe al menos 20 caracteres.";
        if (!form.logoInitial.trim())
            e.logoInitial = "Las iniciales del logo son requeridas.";
        else if (form.logoInitial.length > 3)
            e.logoInitial = "Máximo 3 caracteres.";
        return e;
    };
    const submit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        try {
            await onSave(form, !!existing);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(PageWrap, { children: [_jsxs("button", { onClick: () => navigate("communities"), className: "flex items-center gap-1.5 text-sm text-[#5a709a] hover:text-[#0d1e4d] mb-5 transition-colors", children: [_jsx(ArrowLeft, { size: 15 }), "Volver"] }), _jsxs("div", { className: "max-w-xl mx-auto", children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d] mb-1", style: { fontFamily: "'Outfit', sans-serif" }, children: existing ? "Editar comunidad" : "Crear nueva comunidad" }), _jsx("p", { className: "text-sm text-[#5a709a] mb-6", children: existing ? "Actualiza la información de la comunidad." : "Al crear la comunidad, serás su administrador y podrás gestionarla." }), _jsxs(Card, { className: "p-6 md:p-8", children: [!existing && (_jsxs("div", { className: "mb-6 p-4 rounded-xl bg-[#e6eeff] border border-[rgba(11,61,145,0.15)] flex items-start gap-3", children: [_jsx(Shield, { size: 16, className: "text-[#0b3d91] shrink-0 mt-0.5" }), _jsxs("p", { className: "text-sm text-[#0b3d91]", children: ["Al crear esta comunidad, ser\u00E1s autom\u00E1ticamente su ", _jsx("strong", { children: "administrador" }), ". Podr\u00E1s gestionar miembros, publicaciones y solicitudes de ingreso."] })] })), (form.name || form.logoInitial) && (_jsxs("div", { className: "flex items-center gap-3 mb-6 p-4 rounded-xl bg-[#f4f7ff] border border-[rgba(11,61,145,0.1)]", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0", style: { backgroundColor: form.logoColor || "#0b3d91" }, children: form.logoInitial || "?" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: form.name || "Nombre de la comunidad" }), form.category && _jsx(Badge, { label: form.category })] })] })), _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(FieldWrap, { label: "Nombre de la comunidad", error: errors.name, children: _jsx(Inp, { placeholder: "Ej: Club de Rob\u00F3tica ESPOL", value: form.name, onChange: e => upd("name", e.target.value) }) }), _jsx(FieldWrap, { label: "Descripci\u00F3n", error: errors.description, children: _jsx(Txa, { rows: 4, placeholder: "Describe el prop\u00F3sito, actividades y objetivos de la comunidad...", value: form.description, onChange: e => upd("description", e.target.value) }) }), _jsx(FieldWrap, { label: "Categor\u00EDa", children: _jsx(Sel, { value: form.category, onChange: e => upd("category", e.target.value), children: CATEGORIES.map(c => _jsx("option", { value: c, children: c }, c)) }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FieldWrap, { label: "Iniciales del logo", error: errors.logoInitial, children: _jsx(Inp, { placeholder: "Ej: CR", maxLength: 3, value: form.logoInitial, onChange: e => upd("logoInitial", e.target.value.toUpperCase()), className: "uppercase tracking-widest" }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#0d1e4d] mb-1.5", children: "Color del logo" }), _jsx("div", { className: "flex flex-wrap gap-2", children: LOGO_COLORS.map(col => (_jsx("button", { type: "button", onClick: () => upd("logoColor", col), className: cn("w-7 h-7 rounded-full transition-transform hover:scale-110", form.logoColor === col && "ring-2 ring-offset-2 ring-[#0b3d91] scale-110"), style: { backgroundColor: col } }, col))) })] })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Btn, { type: "submit", disabled: loading, children: loading
                                                    ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" }), existing ? "Guardando..." : "Creando..."] })
                                                    : existing ? "Guardar cambios" : "Crear comunidad" }), _jsx(Btn, { variant: "outline", type: "button", onClick: () => navigate("communities"), children: "Cancelar" })] })] })] })] })] }));
}
// ─── PUBLICATIONS PAGE ───────────────────────────────────────────
function PublicationsPage({ user, publications, communities, memberships, navigate, onDelete, selectedCommunityId }) {
    const [search, setSearch] = useState("");
    const [commFilter, setCommFilter] = useState(selectedCommunityId ? String(selectedCommunityId) : "all");
    const filtered = publications.filter(p => (commFilter === "all" || p.communityId === Number(commFilter)) &&
        (p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase())));
    // Admin de publicaciones: admin de la comunidad de esa publicación
    const canEditPub = (p) => isCommunityAdmin(user.id, p.communityId, memberships);
    // Puede crear si es admin de al menos una comunidad
    const canCreate = isAdminOfAny(user.id, memberships);
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Publicaciones" }), _jsxs("p", { className: "text-sm text-[#5a709a] mt-0.5", children: [filtered.length, " publicaciones"] })] }), canCreate && (_jsxs(Btn, { size: "sm", onClick: () => navigate("create-publication"), children: [_jsx(Plus, { size: 15 }), "Nueva publicaci\u00F3n"] }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-[#5a709a]" }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar publicaciones...", className: cn(inputCls, "pl-9") })] }), _jsxs("select", { value: commFilter, onChange: e => setCommFilter(e.target.value), className: cn(inputCls, "sm:w-52"), children: [_jsx("option", { value: "all", children: "Todas las comunidades" }), communities.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), filtered.length === 0 ? (_jsx(Empty, { icon: FileText, title: "Sin publicaciones", desc: "No hay publicaciones que coincidan con la b\u00FAsqueda." })) : (_jsx("div", { className: "space-y-4", children: filtered.map(p => (_jsxs(Card, { className: "p-5 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: _jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-[#e6eeff] text-[#0b3d91]", children: p.communityName }) }), _jsx("h3", { className: "text-base font-semibold text-[#0d1e4d]", children: p.title })] }), canEditPub(p) && (_jsxs("div", { className: "flex gap-1 shrink-0", children: [_jsx(Btn, { size: "sm", variant: "ghost", onClick: () => navigate("edit-publication", p.communityId, p.id), children: _jsx(Edit2, { size: 13 }) }), _jsx(Btn, { size: "sm", variant: "ghost", onClick: () => onDelete(p.id), className: "text-red-500 hover:bg-red-50", children: _jsx(Trash2, { size: 13 }) })] }))] }), _jsx("p", { className: "text-sm text-[#5a709a] leading-relaxed mb-4 line-clamp-3", children: p.content }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-[#5a709a] pt-3 border-t border-[rgba(11,61,145,0.06)]", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Avatar, { name: p.authorName, size: "sm" }), p.authorName] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 11 }), fmtDate(p.createdAt)] })] })] }, p.id))) }))] }));
}
// ─── CREATE / EDIT PUBLICATION ───────────────────────────────────
function CreatePublicationPage({ user, navigate, onSave, publications, communities, memberships, selectedPubId, selectedCommunityId }) {
    // Solo comunidades donde el usuario es admin
    const adminCommunities = communities.filter(c => isCommunityAdmin(user.id, c.id, memberships));
    const existing = selectedPubId ? publications.find(p => p.id === selectedPubId) : null;
    const [form, setForm] = useState({
        title: existing?.title || "",
        content: existing?.content || "",
        communityId: existing?.communityId || selectedCommunityId || (adminCommunities[0]?.id ?? 0),
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
    const validate = () => {
        const e = {};
        if (!form.title.trim())
            e.title = "El título es requerido.";
        if (!form.content.trim())
            e.content = "El contenido es requerido.";
        else if (form.content.length < 20)
            e.content = "Mínimo 20 caracteres.";
        return e;
    };
    const submit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        const comm = communities.find(c => c.id === Number(form.communityId));
        try {
            await onSave({ ...form, communityId: Number(form.communityId), communityName: comm?.name || "", id: existing?.id }, !!existing);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(PageWrap, { children: [_jsxs("button", { onClick: () => navigate("publications"), className: "flex items-center gap-1.5 text-sm text-[#5a709a] hover:text-[#0d1e4d] mb-5 transition-colors", children: [_jsx(ArrowLeft, { size: 15 }), "Volver"] }), _jsxs("div", { className: "max-w-xl mx-auto", children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d] mb-1", style: { fontFamily: "'Outfit', sans-serif" }, children: existing ? "Editar publicación" : "Nueva publicación" }), _jsx("p", { className: "text-sm text-[#5a709a] mb-6", children: existing ? "Modifica el contenido de la publicación." : "Publica en las comunidades donde eres administrador." }), _jsx(Card, { className: "p-6 md:p-8", children: _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(FieldWrap, { label: "Comunidad", error: errors.communityId, children: _jsx(Sel, { value: form.communityId, onChange: e => upd("communityId", Number(e.target.value)), children: adminCommunities.map(c => _jsx("option", { value: c.id, children: c.name }, c.id)) }) }), _jsx(FieldWrap, { label: "T\u00EDtulo", error: errors.title, children: _jsx(Inp, { placeholder: "T\u00EDtulo claro y descriptivo", value: form.title, onChange: e => upd("title", e.target.value) }) }), _jsx(FieldWrap, { label: "Contenido", error: errors.content, hint: `${form.content.length} caracteres`, children: _jsx(Txa, { rows: 8, placeholder: "Escribe el contenido de la publicaci\u00F3n...", value: form.content, onChange: e => upd("content", e.target.value) }) }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Btn, { type: "submit", disabled: loading, children: loading
                                                ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" }), existing ? "Guardando..." : "Publicando..."] })
                                                : existing ? "Guardar cambios" : "Publicar" }), _jsx(Btn, { variant: "outline", type: "button", onClick: () => navigate("publications"), children: "Cancelar" })] })] }) })] })] }));
}
// ─── REQUESTS PAGE ───────────────────────────────────────────────
function RequestsPage({ user, requests, memberships, setRequests, toast }) {
    const [filter, setFilter] = useState("pending");
    // Solo mostrar solicitudes de comunidades donde el usuario es admin
    const myRequests = requests.filter(r => isCommunityAdmin(user.id, r.communityId, memberships));
    const shown = myRequests.filter(r => filter === "all" || r.status === "pending");
    const handle = async (id, status) => {
        try {
            if (status === "approved")
                await api.approveRequest(id);
            else
                await api.rejectRequest(id);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            toast("success", status === "approved" ? "Solicitud aprobada." : "Solicitud rechazada.");
        }
        catch (error) {
            toast("error", error?.message || "No fue posible procesar la solicitud.");
        }
    };
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Solicitudes de ingreso" }), _jsxs("p", { className: "text-sm text-[#5a709a] mt-0.5", children: [myRequests.filter(r => r.status === "pending").length, " solicitudes pendientes en tus comunidades"] })] }), _jsxs("div", { className: "flex bg-white rounded-xl p-1 border border-[rgba(11,61,145,0.08)] gap-1 w-fit", children: [_jsx("button", { onClick: () => setFilter("pending"), className: cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", filter === "pending" ? "bg-[#0b3d91] text-white" : "text-[#5a709a] hover:text-[#0d1e4d]"), children: "Pendientes" }), _jsx("button", { onClick: () => setFilter("all"), className: cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", filter === "all" ? "bg-[#0b3d91] text-white" : "text-[#5a709a] hover:text-[#0d1e4d]"), children: "Todas" })] })] }), shown.length === 0 ? (_jsx(Empty, { icon: UserPlus, title: "Sin solicitudes", desc: filter === "pending" ? "No hay solicitudes pendientes en tus comunidades." : "No hay solicitudes registradas." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden md:block", children: _jsx(Card, { className: "overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#f4f7ff]", children: _jsx("tr", { children: ["Solicitante", "Comunidad", "Fecha", "Estado", "Acciones"].map(h => (_jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold text-[#5a709a] uppercase tracking-wide", children: h }, h))) }) }), _jsx("tbody", { className: "divide-y divide-[rgba(11,61,145,0.06)]", children: shown.map(r => (_jsxs("tr", { className: "hover:bg-[#f8faff] transition-colors", children: [_jsx("td", { className: "px-5 py-4", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Avatar, { name: r.userName, size: "sm" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-[#0d1e4d]", children: r.userName }), _jsx("p", { className: "text-xs text-[#5a709a]", children: r.userEmail })] })] }) }), _jsx("td", { className: "px-5 py-4 text-sm text-[#5a709a]", children: r.communityName }), _jsx("td", { className: "px-5 py-4 text-sm text-[#5a709a]", children: fmtDate(r.createdAt) }), _jsx("td", { className: "px-5 py-4", children: _jsx(StatusPill, { status: r.status }) }), _jsx("td", { className: "px-5 py-4", children: r.status === "pending" ? (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Btn, { size: "sm", onClick: () => handle(r.id, "approved"), className: "!bg-green-600 hover:!bg-green-700", children: [_jsx(Check, { size: 13 }), "Aprobar"] }), _jsxs(Btn, { size: "sm", variant: "outline", onClick: () => handle(r.id, "rejected"), className: "!text-red-600 hover:!bg-red-50 !border-red-200", children: [_jsx(X, { size: 13 }), "Rechazar"] })] })) : (_jsx("span", { className: "text-xs text-[#5a709a]", children: "Procesada" })) })] }, r.id))) })] }) }) }), _jsx("div", { className: "md:hidden space-y-4", children: shown.map(r => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-3", children: [_jsx(Avatar, { name: r.userName, size: "sm" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: r.userName }), _jsx("p", { className: "text-xs text-[#5a709a]", children: r.userEmail })] }), _jsx("div", { className: "ml-auto", children: _jsx(StatusPill, { status: r.status }) })] }), _jsxs("div", { className: "text-xs text-[#5a709a] space-y-1 mb-3", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium text-[#0d1e4d]", children: "Comunidad:" }), " ", r.communityName] }), _jsxs("p", { children: [_jsx("span", { className: "font-medium text-[#0d1e4d]", children: "Fecha:" }), " ", fmtDate(r.createdAt)] })] }), r.status === "pending" && (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Btn, { size: "sm", fullWidth: true, onClick: () => handle(r.id, "approved"), className: "!bg-green-600 hover:!bg-green-700", children: [_jsx(Check, { size: 13 }), "Aprobar"] }), _jsxs(Btn, { size: "sm", variant: "outline", fullWidth: true, onClick: () => handle(r.id, "rejected"), className: "!text-red-600 hover:!bg-red-50 !border-red-200", children: [_jsx(X, { size: 13 }), "Rechazar"] })] }))] }, r.id))) })] }))] }));
}
// ─── MEMBERS PAGE ────────────────────────────────────────────────
function MembersPage({ user, communities, memberships }) {
    const relevantComms = communities.filter(c => memberships.some(m => m.userId === user.id && m.communityId === c.id) || c.created_by === user.id || c.adminId === user.id);
    const [selected, setSelected] = useState(relevantComms[0]?.id || communities[0]?.id || 0);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let active = true;
        if (!selected)
            return;
        setLoading(true);
        api.members(selected).then(data => {
            if (!active)
                return;
            const community = communities.find(c => c.id === selected);
            setMembers((data || []).map((m) => ({
                userId: m.user_id,
                userName: m.user?.name || "Usuario",
                userEmail: m.user?.email || "",
                communityId: m.community_id,
                role: m.user_id === community?.adminId ? "admin" : "member",
                joinedAt: m.joined_at,
            })));
        }).catch(() => { if (active)
            setMembers([]); }).finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [selected, communities]);
    const selectedCommunity = communities.find(c => c.id === selected);
    const isAdmin = selectedCommunity ? selectedCommunity.adminId === user.id : false;
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Miembros" }), _jsxs("p", { className: "text-sm text-[#5a709a] mt-0.5", children: [members.length, " miembros en esta comunidad"] })] }), _jsx("select", { value: selected, onChange: e => setSelected(Number(e.target.value)), className: cn(inputCls, "sm:w-64"), children: relevantComms.map(c => _jsx("option", { value: c.id, children: c.name }, c.id)) })] }), loading ? _jsx(Card, { className: "p-8 text-sm text-[#5a709a]", children: "Cargando miembros..." }) : members.length === 0 ? _jsx(Empty, { icon: Users, title: "Sin miembros", desc: "Esta comunidad no tiene miembros registrados." }) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden sm:block", children: _jsx(Card, { className: "overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#f4f7ff]", children: _jsx("tr", { children: ["Miembro", "Correo institucional", "Rol en comunidad", "Fecha de ingreso"].map(h => _jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold text-[#5a709a] uppercase tracking-wide", children: h }, h)) }) }), _jsx("tbody", { className: "divide-y divide-[rgba(11,61,145,0.06)]", children: members.map(m => _jsxs("tr", { className: "hover:bg-[#f8faff] transition-colors", children: [_jsx("td", { className: "px-5 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { name: m.userName, size: "sm" }), _jsx("span", { className: "text-sm font-medium text-[#0d1e4d]", children: m.userName })] }) }), _jsx("td", { className: "px-5 py-4 text-sm text-[#5a709a]", children: isAdmin ? m.userEmail : "—" }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", m.role === "admin" ? "bg-[#e6eeff] text-[#0b3d91] border-[rgba(11,61,145,0.2)]" : "bg-gray-50 text-gray-600 border-gray-200"), children: m.role === "admin" ? "Administrador" : "Miembro" }) }), _jsx("td", { className: "px-5 py-4 text-sm text-[#5a709a]", children: fmtDate(m.joinedAt) })] }, `${m.communityId}-${m.userId}`)) })] }) }) }), _jsx("div", { className: "sm:hidden space-y-3", children: members.map(m => _jsxs(Card, { className: "p-4 flex items-center gap-3", children: [_jsx(Avatar, { name: m.userName, size: "md" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: m.userName }), isAdmin && _jsx("p", { className: "text-xs text-[#5a709a] truncate", children: m.userEmail }), _jsx("p", { className: "text-xs text-[#5a709a] mt-0.5", children: fmtDate(m.joinedAt) })] }), _jsx("span", { className: cn("px-2 py-0.5 rounded-full text-xs font-medium border shrink-0", m.role === "admin" ? "bg-[#e6eeff] text-[#0b3d91] border-[rgba(11,61,145,0.2)]" : "bg-gray-50 text-gray-600 border-gray-200"), children: m.role === "admin" ? "Admin" : "Miembro" })] }, `${m.communityId}-${m.userId}`)) })] }))] }));
}
// ─── MY COMMUNITIES ──────────────────────────────────────────────
function MyCommunitiesPage({ user, communities, memberships, navigate }) {
    const myMems = memberships.filter(m => m.userId === user.id);
    const myIds = new Set(myMems.map(m => m.communityId));
    const myComms = communities.filter(c => myIds.has(c.id));
    return (_jsxs(PageWrap, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Mis comunidades" }), _jsxs("p", { className: "text-sm text-[#5a709a] mt-0.5", children: [myComms.length, " ", myComms.length === 1 ? "comunidad" : "comunidades"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Btn, { size: "sm", variant: "secondary", onClick: () => navigate("communities"), children: [_jsx(Search, { size: 14 }), "Explorar m\u00E1s"] }), _jsxs(Btn, { size: "sm", onClick: () => navigate("create-community"), children: [_jsx(Plus, { size: 14 }), "Crear comunidad"] })] })] }), myComms.length === 0 ? (_jsx(Empty, { icon: Users, title: "Sin comunidades", desc: "A\u00FAn no perteneces a ninguna comunidad. Puedes explorar las existentes o crear la tuya propia.", action: _jsxs("div", { className: "flex gap-2", children: [_jsxs(Btn, { onClick: () => navigate("communities"), children: [_jsx(Building2, { size: 15 }), "Explorar"] }), _jsxs(Btn, { variant: "secondary", onClick: () => navigate("create-community"), children: [_jsx(Plus, { size: 15 }), "Crear comunidad"] })] }) })) : (_jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5", children: myComms.map(c => {
                    const mem = myMems.find(m => m.communityId === c.id);
                    const isAdmin = mem?.role === "admin";
                    return (_jsxs(Card, { className: "flex flex-col hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "p-5 flex-1", children: [_jsxs("div", { className: "flex items-start gap-3 mb-3", children: [_jsx(CommunityLogo, { c: c, size: "md" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-[#0d1e4d] text-sm leading-tight mb-1.5 line-clamp-2", children: c.name }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [_jsx(Badge, { label: c.category }), _jsx("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", isAdmin ? "bg-[#e6eeff] text-[#0b3d91] border-[rgba(11,61,145,0.2)]" : "bg-green-50 text-green-700 border-green-200"), children: isAdmin ? _jsxs(_Fragment, { children: [_jsx(Shield, { size: 10 }), "Admin"] }) : _jsxs(_Fragment, { children: [_jsx(Check, { size: 10 }), "Miembro"] }) })] })] })] }), _jsx("p", { className: "text-xs text-[#5a709a] leading-relaxed line-clamp-2 mb-2", children: c.description }), _jsxs("p", { className: "text-xs text-[#5a709a] flex items-center gap-1", children: [_jsx(Calendar, { size: 10 }), isAdmin ? "Creada el" : "Ingresé el", " ", fmtDate(mem?.joinedAt || c.createdAt)] })] }), _jsxs("div", { className: "px-5 pb-5 border-t border-[rgba(11,61,145,0.06)] pt-4 flex gap-2", children: [_jsxs(Btn, { size: "sm", fullWidth: true, variant: "secondary", onClick: () => navigate("community-detail", c.id), children: [_jsx(ChevronRight, { size: 14 }), "Ver comunidad"] }), isAdmin && (_jsx(Btn, { size: "sm", variant: "ghost", onClick: () => navigate("edit-community", c.id), children: _jsx(Edit2, { size: 13 }) }))] })] }, c.id));
                }) }))] }));
}
// ─── PROFILE PAGE ────────────────────────────────────────────────
function ProfilePage({ user, memberships, communities, onLogout, onUpdateUser, onDeleteAccount, toast, showConfirm }) {
    const [photo, setPhoto] = useState(null);
    const [editingInfo, setEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({ name: user.name, email: user.email, position: user.position });
    const [editErrors, setEditErrors] = useState({});
    const [showPassForm, setShowPassForm] = useState(false);
    const [passForm, setPassForm] = useState({ current: "", newPass: "", confirm: "" });
    const [passErrors, setPassErrors] = useState({});
    const [showPass, setShowPass] = useState({ current: false, newp: false, confirm: false });
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingPass, setSavingPass] = useState(false);
    const myMems = memberships.filter(m => m.userId === user.id);
    const adminMems = myMems.filter(m => m.role === "admin");
    const memberMems = myMems.filter(m => m.role === "member");
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(URL.createObjectURL(file));
            toast("success", "Foto de perfil actualizada.");
        }
    };
    const validateInfo = () => {
        const e = {};
        if (!editForm.name.trim())
            e.name = "El nombre es requerido.";
        else if (editForm.name.trim().split(" ").length < 2)
            e.name = "Ingresa nombre y apellido.";
        if (!editForm.email.trim())
            e.email = "El correo es requerido.";
        else if (!editForm.email.toLowerCase().endsWith("@espol.edu.ec"))
            e.email = "Debes utilizar un correo @espol.edu.ec";
        if (!editForm.position.trim())
            e.position = "La posición es requerida.";
        return e;
    };
    const saveInfo = async () => {
        const errs = validateInfo();
        if (Object.keys(errs).length) { setEditErrors(errs); return; }
        setSavingInfo(true);
        try {
            const data = await api.updateProfile({ name: editForm.name.trim(), email: editForm.email.trim(), position: editForm.position.trim() });
            const updated = data.usuario || data.user || data;
            onUpdateUser({ name: updated.name, email: updated.email, position: updated.position || editForm.position });
            setEditingInfo(false);
            toast("success", "Información actualizada correctamente.");
        } catch (error) {
            setEditErrors({ general: error?.message || "No fue posible actualizar la información." });
            toast("error", error?.message || "No fue posible actualizar la información.");
        } finally { setSavingInfo(false); }
    };
    const validatePass = () => {
        const e = {};
        if (!passForm.current)
            e.current = "Ingresa tu contraseña actual.";
        if (!passForm.newPass)
            e.newPass = "Ingresa la nueva contraseña.";
        else if (passForm.newPass.length < 8)
            e.newPass = "Mínimo 8 caracteres.";
        if (passForm.newPass !== passForm.confirm)
            e.confirm = "Las contraseñas no coinciden.";
        return e;
    };
    const savePass = async () => {
        const errs = validatePass();
        if (Object.keys(errs).length) { setPassErrors(errs); return; }
        setSavingPass(true);
        try {
            await api.changePassword({ current_password: passForm.current, password: passForm.newPass, password_confirmation: passForm.confirm });
            setPassForm({ current: "", newPass: "", confirm: "" });
            setShowPassForm(false);
            toast("success", "Contraseña actualizada correctamente.");
        } catch (error) {
            setPassErrors({ current: error?.message || "No fue posible actualizar la contraseña." });
            toast("error", error?.message || "No fue posible actualizar la contraseña.");
        } finally { setSavingPass(false); }
    };
    const cancelEdit = () => {
        setEditingInfo(false);
        setEditErrors({});
        setEditForm({ name: user.name, email: user.email, position: user.position });
    };
    return (_jsxs(PageWrap, { children: [_jsx("h1", { className: "text-2xl font-bold text-[#0d1e4d] mb-6", style: { fontFamily: "'Outfit', sans-serif" }, children: "Mi perfil" }), _jsxs("div", { className: "max-w-2xl mx-auto space-y-5", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-5", children: [_jsxs("div", { className: "relative shrink-0", children: [_jsx("div", { className: "w-24 h-24 rounded-full overflow-hidden bg-[#0b3d91] flex items-center justify-center shadow-lg border-4 border-white", children: photo
                                                ? _jsx("img", { src: photo, alt: "Foto de perfil", className: "w-full h-full object-cover" })
                                                : _jsx("span", { className: "text-2xl font-bold text-white", children: initials(user.name) }) }), _jsxs("label", { htmlFor: "photo-upload", className: "absolute -bottom-1 -right-1 w-8 h-8 bg-[#0b3d91] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#09347a] transition-colors shadow-md border-2 border-white", title: "Cambiar foto de perfil", children: [_jsx(Camera, { size: 14, className: "text-white" }), _jsx("input", { id: "photo-upload", type: "file", accept: "image/png,image/jpeg,image/webp", className: "hidden", onChange: handlePhotoChange })] })] }), _jsxs("div", { className: "flex-1 text-center sm:text-left", children: [_jsx("h2", { className: "text-xl font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: user.name }), _jsx("p", { className: "text-sm text-[#5a709a] mt-0.5", children: user.email }), _jsx("p", { className: "text-sm text-[#5a709a] mt-0.5 font-medium", children: user.position }), _jsxs("div", { className: "flex flex-wrap justify-center sm:justify-start gap-2 mt-2.5", children: [adminMems.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e6eeff] text-[#0b3d91] border border-[rgba(11,61,145,0.2)]", children: [_jsx(Shield, { size: 11 }), "Admin de ", adminMems.length, " comunidad", adminMems.length > 1 ? "es" : ""] })), _jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: [_jsx(Users, { size: 11 }), "Miembro de ", myMems.length, " comunidad", myMems.length !== 1 ? "es" : ""] })] }), _jsxs("p", { className: "text-xs text-[#5a709a] mt-2 flex items-center gap-1 justify-center sm:justify-start", children: [_jsx(Calendar, { size: 11 }), "En ESPOL Comunidades desde ", fmtDate(user.joinedAt)] })] })] }) }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsx("h3", { className: "text-base font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Informaci\u00F3n de cuenta" }), !editingInfo ? (_jsxs(Btn, { size: "sm", variant: "outline", onClick: () => setEditingInfo(true), children: [_jsx(Edit2, { size: 13 }), "Editar"] })) : (_jsxs("div", { className: "flex gap-2", children: [_jsx(Btn, { size: "sm", disabled: savingInfo, onClick: saveInfo, children: savingInfo ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" }), "Guardando..."] }) : _jsxs(_Fragment, { children: [_jsx(Check, { size: 13 }), "Guardar"] }) }), _jsxs(Btn, { size: "sm", variant: "outline", onClick: cancelEdit, children: [_jsx(X, { size: 13 }), "Cancelar"] })] }))] }), editingInfo ? (_jsxs("div", { className: "space-y-4", children: [_jsx(FieldWrap, { label: "Nombre completo", error: editErrors.name, children: _jsx(Inp, { value: editForm.name, onChange: e => { setEditForm(f => ({ ...f, name: e.target.value })); setEditErrors(p => ({ ...p, name: "" })); } }) }), _jsx(FieldWrap, { label: "Correo electr\u00F3nico institucional", error: editErrors.email, children: _jsx(Inp, { type: "email", value: editForm.email, onChange: e => { setEditForm(f => ({ ...f, email: e.target.value })); setEditErrors(p => ({ ...p, email: "" })); } }) }), _jsx(FieldWrap, { label: "Posici\u00F3n / Estado", error: editErrors.position, hint: "Ej: Estudiante de Computaci\u00F3n, Graduado, Docente...", children: _jsx(Inp, { placeholder: "Tu posici\u00F3n en ESPOL", value: editForm.position, onChange: e => { setEditForm(f => ({ ...f, position: e.target.value })); setEditErrors(p => ({ ...p, position: "" })); } }) })] })) : (_jsx("div", { className: "space-y-0", children: [
                                    { label: "Nombre completo", value: user.name },
                                    { label: "Correo institucional", value: user.email },
                                    { label: "Posición", value: user.position },
                                ].map(item => (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-[rgba(11,61,145,0.06)] last:border-0", children: [_jsx("span", { className: "text-sm text-[#5a709a] sm:w-48 shrink-0", children: item.label }), _jsx("span", { className: "text-sm font-medium text-[#0d1e4d]", children: item.value })] }, item.label))) }))] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-[#0d1e4d]", style: { fontFamily: "'Outfit', sans-serif" }, children: "Cambiar contrase\u00F1a" }), !showPassForm && _jsx("p", { className: "text-xs text-[#5a709a] mt-0.5", children: "Actualiza tu contrase\u00F1a de acceso." })] }), !showPassForm ? (_jsxs(Btn, { size: "sm", variant: "outline", onClick: () => setShowPassForm(true), children: [_jsx(KeyRound, { size: 13 }), "Cambiar"] })) : (_jsxs(Btn, { size: "sm", variant: "ghost", onClick: () => { setShowPassForm(false); setPassErrors({}); setPassForm({ current: "", newPass: "", confirm: "" }); }, children: [_jsx(X, { size: 13 }), "Cancelar"] }))] }), showPassForm && (_jsxs("div", { className: "mt-5 space-y-4 pt-5 border-t border-[rgba(11,61,145,0.08)]", children: [_jsx(FieldWrap, { label: "Contrase\u00F1a actual", error: passErrors.current, children: _jsxs("div", { className: "relative", children: [_jsx(Inp, { type: showPass.current ? "text" : "password", placeholder: "Contrase\u00F1a actual", value: passForm.current, onChange: e => { setPassForm(f => ({ ...f, current: e.target.value })); setPassErrors(p => ({ ...p, current: "" })); }, className: "pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPass(p => ({ ...p, current: !p.current })), className: "absolute right-3 top-1/2 -translate-y-1/2 text-[#5a709a] hover:text-[#0d1e4d]", children: showPass.current ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] }) }), _jsx(FieldWrap, { label: "Nueva contrase\u00F1a", error: passErrors.newPass, children: _jsxs("div", { className: "relative", children: [_jsx(Inp, { type: showPass.newp ? "text" : "password", placeholder: "M\u00EDnimo 8 caracteres", value: passForm.newPass, onChange: e => { setPassForm(f => ({ ...f, newPass: e.target.value })); setPassErrors(p => ({ ...p, newPass: "" })); }, className: "pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPass(p => ({ ...p, newp: !p.newp })), className: "absolute right-3 top-1/2 -translate-y-1/2 text-[#5a709a] hover:text-[#0d1e4d]", children: showPass.newp ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] }) }), _jsx(FieldWrap, { label: "Confirmar nueva contrase\u00F1a", error: passErrors.confirm, children: _jsxs("div", { className: "relative", children: [_jsx(Inp, { type: showPass.confirm ? "text" : "password", placeholder: "Repite la contrase\u00F1a", value: passForm.confirm, onChange: e => { setPassForm(f => ({ ...f, confirm: e.target.value })); setPassErrors(p => ({ ...p, confirm: "" })); }, className: "pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPass(p => ({ ...p, confirm: !p.confirm })), className: "absolute right-3 top-1/2 -translate-y-1/2 text-[#5a709a] hover:text-[#0d1e4d]", children: showPass.confirm ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] }) }), _jsx(Btn, { disabled: savingPass, onClick: savePass, children: savingPass ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" }), "Actualizando..."] }) : "Actualizar contraseña" })] }))] }), _jsxs(Card, { className: "p-6 border border-red-100", children: [_jsx("h3", { className: "text-base font-bold text-red-700 mb-1", style: { fontFamily: "'Outfit', sans-serif" }, children: "Zona de peligro" }), _jsx("p", { className: "text-sm text-[#5a709a] mb-4", children: "Las siguientes acciones son irreversibles. Procede con precauci\u00F3n." }), _jsxs("div", { className: "divide-y divide-red-100", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: "Cerrar sesi\u00F3n" }), _jsx("p", { className: "text-xs text-[#5a709a] mt-0.5", children: "Salir de tu cuenta en este dispositivo." })] }), _jsxs(Btn, { variant: "outline", size: "sm", onClick: onLogout, className: "!text-red-600 !border-red-200 hover:!bg-red-50 shrink-0", children: [_jsx(LogOut, { size: 13 }), "Cerrar sesi\u00F3n"] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0d1e4d]", children: "Eliminar cuenta" }), _jsx("p", { className: "text-xs text-[#5a709a] mt-0.5", children: "Elimina permanentemente tu cuenta y todos tus datos." })] }), _jsxs(Btn, { variant: "danger", size: "sm", onClick: () => showConfirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente e irreversible. Perderás todas tus membresías y comunidades.", onDeleteAccount), className: "shrink-0", children: [_jsx(Trash2, { size: 13 }), "Eliminar cuenta"] })] })] })] })] })] }));
}
// ─── MAIN APP ────────────────────────────────────────────────────
export default function App() {
    const [view, setView] = useState("login");
    const [user, setUser] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [selCommunityId, setSelCommunityId] = useState(null);
    const [selPubId, setSelPubId] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [publications, setPublications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [confirm, setConfirm] = useState(null);
    const navigate = (v, cid, pid) => {
        setView(v);
        if (cid !== undefined)
            setSelCommunityId(cid);
        if (pid !== undefined)
            setSelPubId(pid);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const toast = (type, message) => {
        const id = Date.now();
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };
    const showConfirm = (msg, onOk) => setConfirm({ msg, onOk });
    const categoryColor = (category) => ({
        "Tecnología": "#1e56c8", "Deportes": "#16a34a", "Arte y Cultura": "#9333ea",
        "Emprendimiento": "#ea580c", "Ciencias": "#0891b2", "Voluntariado": "#dc2626"
    }[category] || "#0b3d91");
    const mapUser = (u) => ({
        id: u.id, name: u.name, email: u.email, position: u.position || "Estudiante", joinedAt: u.created_at || new Date().toISOString()
    });
    const mapCommunity = (c) => ({
        id: c.id, name: c.name, description: c.description, category: c.category,
        adminId: c.created_by, adminName: c.creator?.name || "Administrador",
        memberCount: 0, logoColor: categoryColor(c.category), logoInitial: initials(c.name),
        createdAt: c.created_at || new Date().toISOString()
    });
    const loadData = async (currentUser) => {
        const [communityData, myCommsData] = await Promise.all([api.communities(), api.myCommunities()]);
        const mappedCommunities = (communityData || []).map(mapCommunity);
        const currentMemberships = (myCommsData || []).map((m) => ({
            userId: m.user_id, communityId: m.community_id, role: m.community?.created_by === currentUser.id ? "admin" : "member", joinedAt: m.joined_at
        }));
        // El creador es administrador, aunque no exista todavía una membresía en datos antiguos.
        for (const c of mappedCommunities) {
            if (c.adminId === currentUser.id && !currentMemberships.some(m => m.communityId === c.id && m.userId === currentUser.id)) {
                currentMemberships.push({ userId: currentUser.id, communityId: c.id, role: "admin", joinedAt: c.createdAt });
            }
        }
        const publicationGroups = await Promise.all(mappedCommunities.map(c => api.publications(c.id).catch(() => [])));
        const pubs = publicationGroups.flat().map((p) => ({
            id: p.id, title: p.title, content: p.content, authorId: p.user_id, authorName: p.user?.name || "Usuario",
            communityId: p.community_id, communityName: mappedCommunities.find(c => c.id === p.community_id)?.name || "Comunidad",
            createdAt: p.published_at || p.created_at
        }));
        const requestGroups = await Promise.all(mappedCommunities.filter(c => c.adminId === currentUser.id).map(c => api.communityRequests(c.id).catch(() => [])));
        const reqs = requestGroups.flat().map((r) => ({
            id: r.id, userId: r.user_id, userName: r.user?.name || "Usuario", userEmail: r.user?.email || "",
            communityId: r.community_id, communityName: mappedCommunities.find(c => c.id === r.community_id)?.name || "Comunidad",
            status: r.status, createdAt: r.created_at
        }));
        const memberCounts = await Promise.all(mappedCommunities.map(c => api.members(c.id).catch(() => [])));
        const withCounts = mappedCommunities.map((c, i) => { const list = memberCounts[i] || []; const creatorPresent = list.some(m => m.user_id === c.adminId); return { ...c, memberCount: list.length + (creatorPresent ? 0 : 1) }; });
        setCommunities(withCounts);
        setMemberships(currentMemberships);
        setPublications(pubs);
        setRequests(reqs);
    };
    useEffect(() => {
        if (!getToken())
            return;
        api.me().then(async (data) => {
            const u = mapUser(data.usuario || data);
            setUser(u);
            await loadData(data.usuario || data);
            setView("dashboard");
        }).catch(() => { clearToken(); setUser(null); setView("login"); });
    }, []);
    const handleLogin = async (rawUser) => {
        const u = mapUser(rawUser);
        setUser(u);
        await loadData(rawUser);
        navigate("dashboard");
    };
    const handleLogout = async () => {
        try {
            await api.logout();
        }
        catch {
            clearToken();
        }
        setUser(null);
        setPhoto(null);
        setCommunities([]);
        setPublications([]);
        setRequests([]);
        setMemberships([]);
        navigate("login");
        setSelCommunityId(null);
        setSelPubId(null);
    };
    const handleUpdateUser = (updates) => setUser(prev => prev ? { ...prev, ...updates } : prev);
    const handleDeleteAccount = async () => { try { await api.deleteAccount(); await handleLogout(); } catch (error) { toast("error", error?.message || "No fue posible eliminar la cuenta."); } finally { setConfirm(null); } };
    const handleJoinRequest = async (cid) => {
        if (!user)
            return;
        try {
            await api.requestJoin(cid);
            setRequests(prev => prev);
            toast("success", "Solicitud enviada correctamente.");
        }
        catch (error) {
            toast("error", error?.message || "No fue posible enviar la solicitud.");
        }
    };
    const handleDeleteCommunity = (id) => showConfirm("¿Deseas eliminar esta comunidad? Se eliminarán también sus publicaciones y datos.", async () => {
        try {
            await api.deleteCommunity(id);
            setCommunities(p => p.filter(c => c.id !== id));
            setPublications(p => p.filter(pub => pub.communityId !== id));
            setMemberships(p => p.filter(m => m.communityId !== id));
            setConfirm(null);
            toast("success", "Comunidad eliminada.");
            navigate("communities");
        }
        catch (error) {
            setConfirm(null);
            toast("error", error?.message || "No fue posible eliminar la comunidad.");
        }
    });
    const handleDeletePublication = (id) => showConfirm("¿Deseas eliminar esta publicación?", async () => {
        try {
            await api.deletePublication(id);
            setPublications(p => p.filter(pub => pub.id !== id));
            setConfirm(null);
            toast("success", "Publicación eliminada.");
        }
        catch (error) {
            setConfirm(null);
            toast("error", error?.message || "No fue posible eliminar la publicación.");
        }
    });
    const handleSaveCommunity = async (data, editing) => {
        try {
            if (editing && selCommunityId) {
                const updated = await api.updateCommunity(selCommunityId, { name: data.name, description: data.description, category: data.category, logo: data.logo || null });
                setCommunities(p => p.map(c => c.id === selCommunityId ? { ...c, ...mapCommunity(updated.comunidad || updated) } : c));
                toast("success", "Comunidad actualizada correctamente.");
            }
            else {
                const created = await api.createCommunity({ name: data.name, description: data.description, category: data.category, logo: data.logo || null });
                const mapped = mapCommunity(created.comunidad || created);
                mapped.memberCount = 1;
                mapped.adminId = user.id;
                mapped.adminName = user.name;
                setCommunities(p => [...p, mapped]);
                setMemberships(p => [...p, { userId: user.id, communityId: mapped.id, role: "admin", joinedAt: mapped.createdAt }]);
                toast("success", "Comunidad creada. ¡Ahora eres su administrador!");
            }
            navigate("communities");
        }
        catch (error) {
            toast("error", error?.message || "No fue posible guardar la comunidad.");
        }
    };
    const handleSavePublication = async (data, editing) => {
        try {
            if (editing && selPubId) {
                const updated = await api.updatePublication(selPubId, { title: data.title, content: data.content });
                const p = updated.publicacion || updated;
                setPublications(prev => prev.map(pub => pub.id === selPubId ? { ...pub, title: p.title, content: p.content, createdAt: p.published_at || p.updated_at || pub.createdAt } : pub));
                toast("success", "Publicación actualizada.");
            }
            else {
                const created = await api.createPublication(data.communityId, { title: data.title, content: data.content });
                const p = created.publicacion || created;
                setPublications(prev => [{ id: p.id, title: p.title, content: p.content, authorId: p.user_id, authorName: user.name, communityId: p.community_id, communityName: communities.find(c => c.id === p.community_id)?.name || "Comunidad", createdAt: p.published_at || p.created_at }, ...prev]);
                toast("success", "Publicación creada exitosamente.");
            }
            navigate("publications");
        }
        catch (error) {
            toast("error", error?.message || "No fue posible guardar la publicación.");
        }
    };
    if (!user) {
        if (view === "register")
            return _jsx(RegisterPage, { goLogin: () => setView("login") });
        return _jsx(LoginPage, { onLogin: handleLogin, goRegister: () => setView("register") });
    }
    return (_jsxs("div", { className: "min-h-screen bg-[#f4f7ff]", style: { fontFamily: "'Inter', sans-serif" }, children: [_jsx("style", { children: `h1,h2,h3,h4 { font-family:'Outfit',sans-serif; } * { scrollbar-width:thin; scrollbar-color:rgba(11,61,145,0.2) transparent; }` }), _jsx(Navbar, { user: user, photo: photo, currentView: view, memberships: memberships, navigate: (v) => navigate(v), onLogout: handleLogout }), _jsxs("main", { children: [view === "dashboard" && _jsx(DashboardPage, { user: user, communities: communities, publications: publications, memberships: memberships, navigate: navigate, requests: requests }), view === "communities" && _jsx(CommunitiesPage, { user: user, communities: communities, memberships: memberships, navigate: navigate, onDelete: handleDeleteCommunity, onJoinRequest: handleJoinRequest, toast: toast }), view === "community-detail" && _jsx(CommunityDetailPage, { user: user, communities: communities, publications: publications, memberships: memberships, selectedId: selCommunityId, navigate: navigate, onJoinRequest: handleJoinRequest, onDeletePub: handleDeletePublication, requests: requests, toast: toast }), (view === "create-community" || view === "edit-community") && _jsx(CreateCommunityPage, { navigate: navigate, onSave: handleSaveCommunity, existingId: view === "edit-community" ? selCommunityId : null, communities: communities }), view === "publications" && _jsx(PublicationsPage, { user: user, publications: publications, communities: communities, memberships: memberships, navigate: navigate, onDelete: handleDeletePublication, selectedCommunityId: selCommunityId }), (view === "create-publication" || view === "edit-publication") && _jsx(CreatePublicationPage, { user: user, navigate: navigate, onSave: handleSavePublication, publications: publications, communities: communities, memberships: memberships, selectedPubId: view === "edit-publication" ? selPubId : null, selectedCommunityId: selCommunityId }), view === "requests" && isAdminOfAny(user.id, memberships) && _jsx(RequestsPage, { user: user, requests: requests, memberships: memberships, setRequests: setRequests, toast: toast }), view === "members" && _jsx(MembersPage, { user: user, communities: communities, memberships: memberships }), view === "my-communities" && _jsx(MyCommunitiesPage, { user: user, communities: communities, memberships: memberships, navigate: navigate }), view === "profile" && _jsx(ProfilePage, { user: user, memberships: memberships, communities: communities, onLogout: handleLogout, onUpdateUser: handleUpdateUser, onDeleteAccount: handleDeleteAccount, toast: toast, showConfirm: showConfirm })] }), _jsx(ToastRack, { toasts: toasts }), confirm && _jsx(ConfirmModal, { msg: confirm.msg, onOk: confirm.onOk, onCancel: () => setConfirm(null) })] }));
}
