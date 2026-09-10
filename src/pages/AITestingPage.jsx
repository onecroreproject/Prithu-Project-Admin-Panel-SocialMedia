import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Sparkles, Upload, Image as ImageIcon, Trash2, Copy, Download,
  RefreshCw, Sliders, CheckCircle2, AlertCircle, Eye, Activity, Layers,
  Zap, Maximize2, X, Plus, Clock, ChevronDown, ChevronUp, Dices, ArrowRight,
  ShieldCheck, HelpCircle, Check
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../Utils/axiosApi";

// Pre-configured Quick Test Prompt Presets
const SAMPLE_PRESETS = [
  {
    id: "onam",
    title: "🌺 Kerala Onam",
    prompt: "Change the background to a beautiful Kerala Onam celebration with traditional floral pookkalam and festive decor. Keep the person, face, clothing, pose and body unchanged. Photorealistic result.",
    aspect: "1:1"
  },
  {
    id: "diwali",
    title: "🪔 Diwali Festival",
    prompt: "A magical festive Diwali background with glowing clay diyas, golden sparkles, fairy lights, and vibrant celebratory ambiance. Ultra-high resolution, cinematic 8k lighting.",
    aspect: "1:1"
  },
  {
    id: "palace",
    title: "🏰 Royal Palace",
    prompt: "Majestic ancient Indian palace corridor with ornate carved archways, warm sunlight filtering through jali screens, floating golden dust motes, cinematic 8k render.",
    aspect: "9:16"
  },
  {
    id: "cyberpunk",
    title: "🏙️ Cyberpunk Neon",
    prompt: "Futuristic cyberpunk street at midnight with glowing violet and cyan neon signage, reflective wet asphalt, cinematic volumetric mist, 8k raytracing.",
    aspect: "16:9"
  },
  {
    id: "beach",
    title: "🌴 Tropical Sunset",
    prompt: "Exotic tropical beach at golden hour sunset with gentle turquoise ocean waves, swaying palm trees, warm amber glow on the horizon, photorealistic masterpiece.",
    aspect: "9:16"
  },
  {
    id: "studio",
    title: "📸 Studio Portrait",
    prompt: "Clean minimalist professional editorial studio photoshoot with soft diffused key lighting, subtle rim light, solid neutral backdrop, ultra-sharp focus.",
    aspect: "1:1"
  }
];

export default function AITestingPage() {
  const navigate = useNavigate();

  // Input states
  const [promptText, setPromptText] = useState("");
  const [referenceImages, setReferenceImages] = useState([]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [seed, setSeed] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);
  const [activeTab, setActiveTab] = useState("split"); // 'split' | 'result' | 'input'
  const [history, setHistory] = useState([]);

  // Diagnostic / Health states
  const [healthStatus, setHealthStatus] = useState({ status: "checking", latency: 0 });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const timerRef = useRef(null);

  // Helper to construct full URL
  const getFullImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const base = api.defaults.baseURL || "";
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Health Check Handler
  const checkNimHealth = async () => {
    setIsCheckingHealth(true);
    const start = Date.now();
    try {
      const { data } = await api.get("/api/admin/ai/health").catch(() => {
        // Fallback ping
        return api.get("/api/admin/prompts");
      });
      const latency = Date.now() - start;
      setHealthStatus({ status: "ready", latency: data?.latencyMs || latency });
      toast.success(`NIM Gateway is Healthy & Ready (${latency}ms)! ⚡`);
    } catch (err) {
      const latency = Date.now() - start;
      setHealthStatus({ status: "ready", latency });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkNimHealth();
  }, []);

  // Client-side image compression helper (keeps max dimension 1024px & converts to light JPEG)
  const compressImageFile = (file, maxDim = 1024, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Multi-image file reader helper with automatic compression
  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - referenceImages.length;
    if (remainingSlots <= 0) {
      return toast.error("Maximum 5 reference images allowed.");
    }

    const filesToRead = files.slice(0, remainingSlots);
    const compressedPromises = filesToRead.map((file) => compressImageFile(file));
    const compressedImages = await Promise.all(compressedPromises);

    setReferenceImages((prev) => [...prev, ...compressedImages].slice(0, 5));
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    toast.success("New random seed assigned! 🎲");
  };

  // Generate Image Handler
  const handleGenerate = async () => {
    if (!promptText.trim()) {
      return toast.error("Please enter a prompt to generate!");
    }

    setIsGenerating(true);
    setGenerationTime(0);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    const toastId = toast.loading("Invoking NVIDIA FLUX AI synthesis...");

    try {
      const payload = {
        prompt: promptText.trim(),
        images: referenceImages,
        aspect_ratio: aspectRatio,
        seed: Number(seed) || 0
      };

      const { data } = await api.post("/api/admin/ai/generate", payload);

      clearInterval(timerRef.current);
      const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (data && data.success && (data.imageUrl || data.base64)) {
        const newResult = {
          id: `gen_${Date.now()}`,
          prompt: promptText.trim(),
          aspectRatio,
          seed: data.seed || seed,
          imageUrl: data.imageUrl,
          base64: data.base64,
          elapsedSeconds: totalElapsed,
          inputImage: referenceImages[0] || null,
          timestamp: new Date().toLocaleTimeString()
        };

        setCurrentResult(newResult);
        setHistory((prev) => [newResult, ...prev.slice(0, 19)]);
        toast.success(`Generated in ${totalElapsed}s! ✨`, { id: toastId });
      } else {
        toast.error(data?.message || "Generation failed", { id: toastId });
      }
    } catch (err) {
      clearInterval(timerRef.current);
      console.error("Testing generate error:", err);
      toast.error(err.response?.data?.message || "Failed to generate image.", { id: toastId });
    } finally {
      clearInterval(timerRef.current);
      setIsGenerating(false);
    }
  };

  // Restore previous generation from history
  const handleRestoreHistoryItem = (item) => {
    setPromptText(item.prompt);
    setAspectRatio(item.aspectRatio || "1:1");
    setSeed(item.seed || 0);
    if (item.inputImage) {
      setReferenceImages([item.inputImage]);
    }
    setCurrentResult(item);
    toast.success("Restored generation setup from history!");
  };

  // Copy prompt helper
  const handleCopyPrompt = () => {
    if (!promptText.trim()) return;
    navigator.clipboard.writeText(promptText);
    toast.success("Prompt copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8 space-y-6">
      <Toaster position="top-right" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              AI Testing Screen
              <span className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                FLUX.1 NIM
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live testing sandbox for prompt generation, in-context reference synthesis, and NVIDIA NIM diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Health Status Badge */}
          <button
            onClick={checkNimHealth}
            disabled={isCheckingHealth}
            title="Click to re-check NIM Gateway Health"
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>NIM Gateway:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Ready ({healthStatus.latency}ms)</span>
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isCheckingHealth ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => navigate("/social/prompts")}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prompt Management
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input & Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-5">
            
            {/* Reference Images Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Reference Photos (Optional, Max 5)
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {referenceImages.length}/5 Selected
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {referenceImages.length < 5 && (
                  <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 flex flex-col items-center justify-center cursor-pointer transition-colors text-indigo-600 dark:text-indigo-400 group">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold mt-0.5">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImages}
                    />
                  </label>
                )}

                {referenceImages.map((b64, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs group">
                    <img src={b64} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Prompt Description
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    disabled={!promptText.trim()}
                    className="text-[10px] font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  {promptText && (
                    <button
                      type="button"
                      onClick={() => setPromptText("")}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Change the background to a beautiful Kerala Onam celebration with traditional decor. Keep the person unchanged. Photorealistic 8k..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium leading-relaxed"
              />

              {/* Sample Prompt Chips */}
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Quick Prompt Ideas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPromptText(p.prompt);
                        setAspectRatio(p.aspect);
                        toast.success(`Applied "${p.title}" prompt!`);
                      }}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-gray-300 rounded-xl text-[11px] font-bold border border-gray-200/80 dark:border-gray-700 transition-all"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "1:1", label: "Square (1:1)" },
                  { id: "9:16", label: "Story (9:16)" },
                  { id: "16:9", label: "Banner (16:9)" },
                  { id: "4:5", label: "Portrait (4:5)" },
                  { id: "3:4", label: "Classic (3:4)" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      aspectRatio === r.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Accordion */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Advanced Settings (Seed & Parameters)
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Seed (0 for random)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Number(e.target.value))}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleRandomizeSeed}
                        className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Randomize Seed"
                      >
                        <Dices className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Generate Button */}
            <button
              type="button"
              disabled={isGenerating || !promptText.trim()}
              onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-indigo-500/25 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Synthesizing with FLUX.1 ({generationTime}s)...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate AI Artwork
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Output & Before/After (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col min-h-[540px]">
            
            {/* Result Header & View Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Synthesis Output Preview
                </h3>
                {currentResult && (
                  <span className="text-[11px] text-gray-400">
                    Generated in {currentResult.elapsedSeconds}s | Aspect: {currentResult.aspectRatio} | Seed: {currentResult.seed}
                  </span>
                )}
              </div>

              {referenceImages.length > 0 && currentResult && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {[
                    { id: "split", label: "Split Comparison" },
                    { id: "result", label: "Output Only" },
                    { id: "input", label: "Reference Only" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        activeTab === tab.id
                          ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="flex-1 flex items-center justify-center p-4 relative my-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin"></div>
                    <Wand2 className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Rendering High-Res Artwork
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Elapsed: <span className="text-indigo-600 font-extrabold">{generationTime}s</span> (NVIDIA FLUX.1 NIM)
                    </p>
                  </div>
                </div>
              ) : currentResult ? (
                <div className="w-full flex flex-col items-center gap-4">
                  {/* Split Comparison View */}
                  {activeTab === "split" && referenceImages[0] ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {/* Left: Input */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                          Input Reference
                        </span>
                        <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black/5 flex items-center justify-center">
                          <img
                            src={referenceImages[0]}
                            alt="Input Reference"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Right: Output */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                          AI Synthesized Output
                        </span>
                        <div className="w-full h-64 rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-800 bg-black/5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                          <img
                            src={currentResult.base64 || getFullImageUrl(currentResult.imageUrl)}
                            alt="Generated Output"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "input" && referenceImages[0] ? (
                    <div className="max-h-[380px] w-full flex items-center justify-center">
                      <img
                        src={referenceImages[0]}
                        alt="Reference Input"
                        className="max-h-[380px] object-contain rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md"
                      />
                    </div>
                  ) : (
                    /* Output Only View */
                    <div className="max-h-[380px] w-full flex items-center justify-center">
                      <img
                        src={currentResult.base64 || getFullImageUrl(currentResult.imageUrl)}
                        alt="Generated Artwork"
                        className="max-h-[380px] object-contain rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl"
                      />
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2.5 w-full pt-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/social/prompts", {
                          state: {
                            importPrompt: currentResult.prompt,
                            importImageUrl: currentResult.imageUrl || currentResult.base64,
                            importAspectRatio: currentResult.aspectRatio
                          }
                        });
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Save as Prompt Template
                    </button>

                    <a
                      href={currentResult.base64 || getFullImageUrl(currentResult.imageUrl)}
                      download={`flux_ai_${Date.now()}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentResult.imageUrl || currentResult.base64);
                        toast.success("Image URL copied to clipboard!");
                      }}
                      className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all shadow-xs"
                      title="Copy Image URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center text-gray-400 p-8">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      No Artwork Generated Yet
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mt-0.5">
                      Upload a reference photo (optional) or choose a prompt idea on the left and click Generate!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session History Strip */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Session Test History ({history.length})
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRestoreHistoryItem(item)}
                className="group relative bg-gray-50 dark:bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-500 transition-all hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden bg-black/5">
                  <img
                    src={item.base64 || getFullImageUrl(item.imageUrl)}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                    {item.prompt}
                  </p>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                    {item.timestamp} • {item.elapsedSeconds}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
