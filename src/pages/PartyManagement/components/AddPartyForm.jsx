import { useState, useEffect, useRef } from "react";
import { Save, Plus, X, Upload, User, Image as ImageIcon, Crop as CropIcon, Activity } from "lucide-react";
import Api from "../../../Utils/axiosApi";
import toast from "react-hot-toast";
import PostEditor from "../../../components/FeedUpload/PostEditor";
import getMediaUrl from "../../../Utils/mediaUrl";
import { clsx } from "clsx";

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
            // Use getMediaUrl to resolve relative paths to full URLs for previews
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
        // Reset the input so the same file can be selected again
        e.target.value = "";

        if (!file.type.startsWith('image/')) {
            toast.error("Only images are allowed");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        // Directly stage the file without requiring the cropper to complete.
        // The cropper is shown as a visual aid but saved file is always the raw file.
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

        // Also open the PostEditor for optional visual crop/filter preview
        setCropFile({
            id: 'crop-temp',
            file: file,
            preview: previewUrl,
            fileHash: Math.random().toString(36).substring(7)
        });
        setCropTarget(target);
    };

    const onCropSave = (id, metadata) => {
        // PostEditor only returns metadata (crop/filter settings), not a new Blob.
        // The file was already staged in handleFileSelect.
        // Just close the editor.
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

        // Send leaders metadata WITHOUT blob URLs — photos are sent separately as files
        const cleanedLeaders = leaders.map((l, i) => ({
            name: l.name,
            order: l.order || i + 1,
            // If photo is a File, backend will handle it via leaderPhotos[i]
            // If it's a full URL (existing), send as-is so backend can keep it
            photo: l.photo instanceof File ? null : (l.photoPreview || null),
        }));
        data.append("leaders", JSON.stringify(cleanedLeaders));

        // Append each leader photo file using plain 'leaderPhotos' field name
        // (Multer is configured with { name: 'leaderPhotos', maxCount: 10 })
        // Send parallel 'leaderPhotoIndices' so backend knows which leader each photo belongs to
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
        <form onSubmit={handleSubmit} className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Basic Details */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                            <Activity size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Core Identity</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Define entity architecture</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Geopolitical State</label>
                            <div className="relative group">
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-white/3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-[11px] font-black focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                                >
                                    <option value="">SELECT STATE</option>
                                    {states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-600 transition-colors">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Native Nomenclature</label>
                            <input
                                type="text"
                                name="stateRegionalName"
                                placeholder="E.G. தமிழ் நாடு"
                                value={formData.stateRegionalName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-[11px] font-black focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 uppercase"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Organization Name</label>
                            <input
                                type="text"
                                name="partyName"
                                placeholder="FULL ENTITY NAME"
                                value={formData.partyName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-[11px] font-black focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 uppercase tracking-wider"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategic Acronym</label>
                            <input
                                type="text"
                                name="partyShortName"
                                placeholder="SHORT NAME (E.G. DMK)"
                                value={formData.partyShortName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-[11px] font-black focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 uppercase tracking-[0.2em]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-all shadow-sm"></div>
                            <div className="ml-4">
                                <span className="block text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Global Status</span>
                                <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{formData.isActive ? 'ACTIVE IN PRODUCTION' : 'STANDBY MODE'}</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-600/20">
                            <ImageIcon size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Branding & Visuals</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">High-fidelity logo upload</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-16 bg-gray-50/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] group hover:border-blue-600/30 transition-all gap-8 relative overflow-hidden min-h-[360px]">
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {logoPreview ? (
                            <div className="relative group/logo z-10 scale-in duration-500">
                                <div className="absolute -inset-4 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl blur-2xl opacity-50" />
                                <img src={logoPreview} alt="Logo" className="w-56 h-56 object-contain rounded-3xl bg-white dark:bg-gray-900 shadow-xl p-6 relative z-10 border border-gray-100 dark:border-gray-800" />
                                <button
                                    type="button"
                                    onClick={() => { setPartyLogo(null); setLogoPreview(null); }}
                                    className="absolute -top-4 -right-4 p-3 bg-red-500 text-white rounded-2xl shadow-xl opacity-0 group-hover/logo:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 relative z-10 transition-transform group-hover:scale-105 duration-500">
                                <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2rem] flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <Upload size={36} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Select Entity Symbol</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Recommended: 512x512px WEBP/PNG</p>
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
            <div className="space-y-12 pt-12 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-600/10 rounded-2xl flex items-center justify-center border border-green-600/20">
                            <User size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Governance & Leadership</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Top-tier echelon mapping (Limit: 10)</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addLeader}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                    >
                        <Plus size={16} />
                        Append Leader
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {leaders.map((leader, index) => (
                        <div key={index} className="bg-gray-50/30 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 space-y-8 relative group transition-all hover:bg-white dark:hover:bg-white/[0.03] hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-2xl duration-500">
                            <button
                                type="button"
                                onClick={() => removeLeader(index)}
                                className="absolute top-8 right-8 p-2.5 text-gray-300 hover:text-red-500 transition-colors bg-white/50 dark:bg-black/20 rounded-xl"
                                title="Remove Personnel"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative group/leader-photo h-32 w-32 shrink-0">
                                    <div className="h-full w-full rounded-[2.2rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center relative group-hover/leader-photo:border-blue-600/50 transition-all shadow-lg group-hover:scale-105 duration-500">
                                        {leader.photoPreview ? (
                                            <img src={leader.photoPreview} alt="Leader" className="h-full w-full object-cover transition-transform group-hover/leader-photo:scale-125 duration-700" />
                                        ) : (
                                            <div className="text-gray-300 dark:text-gray-700 flex flex-col items-center gap-2">
                                                <User size={32} />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Upload</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileSelect(e, { type: 'leader', index })}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 z-20">
                                        <CropIcon size={16} />
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1 w-full text-center sm:text-left">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                                        <input
                                            type="text"
                                            placeholder="PERSONNEL NAME"
                                            value={leader.name}
                                            onChange={(e) => handleLeaderChange(index, "name", e.target.value)}
                                            className="w-full bg-white dark:bg-black/20 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 text-[11px] font-black tracking-widest focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-800 uppercase"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Rank & Priority</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={leader.order}
                                                onChange={(e) => handleLeaderChange(index, "order", parseInt(e.target.value))}
                                                className="w-full bg-white dark:bg-black/20 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 text-[11px] font-black tracking-widest focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none transition-all"
                                                required
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 font-black text-[9px] tracking-widest">
                                                RANK #{leader.order}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors" onClick={addLeader}>
                            <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800">
                                <Plus size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Initialize Leadership Protocol</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-16 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-10 py-5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all outline-none"
                >
                    Abandon Protocol
                </button>
                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="group px-20 py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-600/30 flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 outline-none"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={20} className="group-hover:rotate-12 transition-transform" />
                    )}
                    {initialData ? "Synchronize Updates" : "Finalize Entity Initialization"}
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
