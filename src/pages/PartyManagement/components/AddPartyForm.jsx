import { useState, useEffect, useRef } from "react";
import { Save, Plus, X, Upload, User, Image as ImageIcon, Crop as CropIcon, Building2, Globe, Shield } from "lucide-react";
import Api from "../../../Utils/axiosApi";
import toast from "react-hot-toast";
import PostEditor from "../../../components/FeedUpload/PostEditor";
import getMediaUrl from "../../../Utils/mediaUrl";

export default function AddPartyForm({ initialData, onSuccess }) {
    const [formData, setFormData] = useState({
        state: "",
        stateRegionalName: "",
        partyName: "",
        partyShortName: "",
        isActive: true,
    });

    const [leaders, setLeaders] = useState([{ name: "", order: 1, photo: null, photoPreview: null }]);
    const [partyLogo, setPartyLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For Cropping
    const [cropFile, setCropFile] = useState(null);
    const [cropTarget, setCropTarget] = useState(null); // { type: 'logo' | 'leader', index?: number }

    useEffect(() => {
        if (initialData) {
            setFormData({
                state: initialData.state,
                stateRegionalName: initialData.stateRegionalName || "",
                partyName: initialData.partyName,
                partyShortName: initialData.partyShortName || "",
                isActive: initialData.isActive,
            });
            setLogoPreview(getMediaUrl(initialData.partyLogo));
            setLeaders(initialData.leaders.map(l => ({
                ...l,
                photoPreview: getMediaUrl(l.photo)
            })));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleLeaderChange = (index, field, value) => {
        const newLeaders = [...leaders];
        newLeaders[index][field] = value;
        setLeaders(newLeaders);
    };

    const addLeader = () => {
        if (leaders.length >= 10) {
            toast.error("Maximum 10 leaders allowed");
            return;
        }
        setLeaders([...leaders, { name: "", order: leaders.length + 1, photo: null, photoPreview: null }]);
    };

    const removeLeader = (index) => {
        setLeaders(leaders.filter((_, i) => i !== index));
    };

    const handleFileSelect = (e, target) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = "";

        if (!file.type.startsWith('image/')) {
            toast.error("Only images are allowed");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (target.type === 'logo') {
            setPartyLogo(file);
            setLogoPreview(previewUrl);
        } else if (target.type === 'leader') {
            const newLeaders = [...leaders];
            newLeaders[target.index] = {
                ...newLeaders[target.index],
                photo: file,
                photoPreview: previewUrl,
            };
            setLeaders(newLeaders);
        }

        setCropFile({
            id: 'crop-temp',
            file: file,
            preview: previewUrl,
            fileHash: Math.random().toString(36).substring(7)
        });
        setCropTarget(target);
    };

    const onCropSave = (id, metadata) => {
        setCropFile(null);
        setCropTarget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.state || !formData.partyName || (!partyLogo && !initialData)) {
            toast.error("State, Party Name and Logo are required");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append("state", formData.state);
        data.append("stateRegionalName", formData.stateRegionalName);
        data.append("partyName", formData.partyName);
        data.append("partyShortName", formData.partyShortName);
        data.append("isActive", formData.isActive);

        if (partyLogo instanceof File) {
            data.append("partyLogo", partyLogo);
        }

        const cleanedLeaders = leaders.map((l, i) => ({
            name: l.name,
            order: l.order || i + 1,
            photo: l.photo instanceof File ? null : (l.photoPreview || null),
        }));
        data.append("leaders", JSON.stringify(cleanedLeaders));

        leaders.forEach((leader, index) => {
            if (leader.photo instanceof File) {
                data.append('leaderPhotos', leader.photo, leader.photo.name);
                data.append('leaderPhotoIndices', index.toString());
            }
        });

        try {
            if (initialData) {
                await Api.put(`/api/admin/party/${initialData._id}`, data);
                toast.success("Party updated successfully");
            } else {
                await Api.post("/api/admin/party", data);
                toast.success("Party created successfully");
            }
            onSuccess();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error.response?.data?.message || "Failed to save party");
        } finally {
            setIsSubmitting(false);
        }
    };

    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Basic Details Section */}
                <div className="space-y-8 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                            <Building2 size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Party Details</h3>
                            <p className="text-sm text-gray-500 font-medium">Basic information regarding the political entity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Select State</label>
                            <div className="relative">
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">CHOOSE STATE</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Globe size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Regional Name</label>
                            <input
                                type="text"
                                name="stateRegionalName"
                                placeholder="e.g. தமிழ் நாடு"
                                value={formData.stateRegionalName}
                                onChange={handleChange}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Official Party Name</label>
                            <input
                                type="text"
                                name="partyName"
                                placeholder="Enter full name of the organization"
                                value={formData.partyName}
                                onChange={handleChange}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Short Name/Abbreviation</label>
                            <input
                                type="text"
                                name="partyShortName"
                                placeholder="e.g. DMK, AIADMK, BJP"
                                value={formData.partyShortName}
                                onChange={handleChange}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-300 tracking-wider"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-50 transition-all hover:bg-blue-50/50">
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 transition-all shadow-sm"></div>
                            <div className="ml-4">
                                <span className="block text-sm font-bold text-gray-900">Active Status</span>
                                <span className="block text-xs font-medium text-gray-400 mt-0.5">{formData.isActive ? 'Currently visibile in portals' : 'Hidden from public view'}</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="space-y-8 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                            <ImageIcon size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Party Branding</h3>
                            <p className="text-sm text-gray-500 font-medium">Official logo and visual identity</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[2.5rem] group hover:border-blue-500/30 transition-all gap-6 relative overflow-hidden min-h-[320px]">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {logoPreview ? (
                            <div className="relative group/logo z-10">
                                <div className="absolute -inset-4 bg-white rounded-3xl shadow-xl blur-xl opacity-50" />
                                <img src={logoPreview} alt="Logo" className="w-48 h-48 object-contain rounded-2xl bg-white shadow-md p-4 relative z-10 border border-gray-100" />
                                <button
                                    type="button"
                                    onClick={() => { setPartyLogo(null); setLogoPreview(null); }}
                                    className="absolute -top-3 -right-3 p-2.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover/logo:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">Upload Party Logo</p>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Recommended: 512x512px WEBP/PNG</p>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => handleFileSelect(e, { type: 'logo' })}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                    </div>
                </div>
            </div>

            {/* Leaders Section */}
            <div className="space-y-8 pt-10 border-t border-gray-50">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                            <Shield size={24} className="text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Leadership Profiles</h3>
                            <p className="text-sm text-gray-500 font-medium">Prominent figures of the organization (Max. 10)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addLeader}
                        className="flex items-center gap-2.5 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Add New Leader
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leaders.map((leader, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 relative group transition-all hover:border-gray-200 hover:shadow-xl duration-500">
                            <button
                                type="button"
                                onClick={() => removeLeader(index)}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg shadow-sm"
                                title="Remove Leader"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group/leader-photo h-32 w-32 shrink-0">
                                    <div className="h-full w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative group-hover/leader-photo:border-blue-500/50 transition-all shadow-sm group-hover:scale-105 duration-500">
                                        {leader.photoPreview ? (
                                            <img src={leader.photoPreview} alt="Leader" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-gray-300 flex flex-col items-center gap-1">
                                                <User size={36} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileSelect(e, { type: 'leader', index })}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white z-20">
                                        <CropIcon size={16} />
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Leader Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter full name"
                                            value={leader.name}
                                            onChange={(e) => handleLeaderChange(index, "name", e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all placeholder:text-gray-300"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Display Order</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={leader.order}
                                                onChange={(e) => handleLeaderChange(index, "order", parseInt(e.target.value))}
                                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all"
                                                required
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 font-bold text-xs">
                                                Rank {leader.order}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="col-span-full py-16 bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white transition-all shadow-inner" onClick={addLeader}>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                                <Plus size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configure Leadership</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Submission Section */}
            <div className="flex items-center justify-end gap-6 pt-12 border-t border-gray-50">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-8 py-4 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                    Cancel Action
                </button>
                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="px-16 py-4 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm tracking-tight shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {initialData ? "Save Global Changes" : "Deploy New Entity"}
                </button>
            </div>

            {/* Cropper Modal Integration */}
            {cropFile && (
                <PostEditor
                    fileData={cropFile}
                    onClose={() => { setCropFile(null); setCropTarget(null); }}
                    onSave={onCropSave}
                />
            )}
        </form>
    );
}
