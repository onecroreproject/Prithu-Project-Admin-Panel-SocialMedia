import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { 
  Plus, Search, Edit2, Trash2, Check, X, Sparkles, Filter, RefreshCw, Eye, Image as ImageIcon,
  Clipboard, Hash, FileText, Box, Crop, Tag, Info
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../Utils/axiosApi";

// Seed categories list
const CATEGORIES_LIST = [
  "Halloween",
  "Anniversary",
  "Kids Boy",
  "Kids Girl",
  "Couple",
  "Birthday",
  "Diwali",
  "Women",
  "3D Model",
  "Men",
  "Navaratri"
];

// Initial seed prompts to matching categories
const INITIAL_PROMPTS = [
  {
    id: "prompt_1",
    title: "Rajasthani Palace Corridor Walk",
    category: "Couple",
    prompt: "A highly detailed 3D digital illustration of a young Indian couple, a boy and a girl, walking hand-in-hand through an ancient Rajasthani palace corridor. The boy is wearing a deep brown traditional kurta and the girl is in a vibrant pink embroidered salwar-suit. Sunlight filters through the archways creating warm, golden highlights. Hyper-realistic details, cinematic lighting, 8k resolution.",
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "traditional", "palace", "sunlight"]
  },
  {
    id: "prompt_2",
    title: "Cozy Modern Cafe Date",
    category: "Couple",
    prompt: "A hyper-realistic 3D illustration of a modern couple sitting cozy in a cafe. The boy has a black sleeveless t-shirt, the girl is holding a tea cup, smiling at him. Soft warm indoor cafe lighting. Extremely detailed faces, romantic ambiance, detailed coffee shop background.",
    imageUrl: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=600&auto=format&fit=crop",
    aspectRatio: "1:1",
    tags: ["couple", "cafe", "cozy", "casual"]
  },
  {
    id: "prompt_3",
    title: "Park Bench Conversation",
    category: "Couple",
    prompt: "A 3D digital artwork of an Indian couple sitting together on a park bench. The girl is wearing a white printed top, boy in a dark casual shirt. They are looking at each other, green lush trees in the background. Calm and peaceful summer afternoon setting.",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "park", "summer", "conversation"]
  },
  {
    id: "prompt_4",
    title: "Dense Forest Embrace",
    category: "Couple",
    prompt: "3D render of a couple hugging tightly in a dense forest. The girl is in a white dress, the boy is in a grey hoodie. Soft, cinematic sun rays filtering through the tall green pine trees, misty and romantic atmospheric depth.",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop",
    aspectRatio: "1:1",
    tags: ["couple", "forest", "embrace", "nature"]
  },
  {
    id: "prompt_5",
    title: "Taj Mahal Romantic Pose",
    category: "Couple",
    prompt: "A romantic 3D digital illustration of a couple posing in front of the Taj Mahal in Agra. The boy in a sleek black suit, the girl in a beautiful red traditional saree. Clear sky, gorgeous reflections in the pool. Masterpiece detailing, cinematic shot.",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "taj mahal", "saree", "romantic"]
  },
  {
    id: "prompt_6",
    title: "Midnight Rain Under Umbrella",
    category: "Couple",
    prompt: "A stunning 3D illustration of a couple standing under a black umbrella in heavy rain at night. Saffron-themed streetlights, droplets reflecting light, warm yellow and deep black tones, hyper-detailed render, water splashes on the road.",
    imageUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "rain", "umbrella", "night"]
  },
  {
    id: "prompt_7",
    title: "Smiling Traditional Walk",
    category: "Couple",
    prompt: "A beautiful 3D render of a traditional couple smiling at each other. The boy in a green shirt, the girl in a sky blue floral patterned kurta. Natural outdoor background with golden hour lighting.",
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "traditional", "outdoor", "golden hour"]
  },
  {
    id: "prompt_8",
    title: "Courtyard Silk Saree Moment",
    category: "Couple",
    prompt: "A heartwarming 3D illustration of a traditional Indian couple, a boy and a girl, standing close together, looking at each other lovingly. The boy is in a white kurta with beautiful yellow embroidery, and the girl is wearing a bright red silk saree with gold details. Warm, soft glowing evening lighting, traditional house courtyard in the background.",
    imageUrl: "https://images.unsplash.com/photo-1583505260063-f24f9c51325c?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "traditional", "saree", "courtyard"]
  },
  {
    id: "prompt_9",
    title: "Twilight Lehenga Dance",
    category: "Couple",
    prompt: "A highly cinematic 3D digital art of a couple standing on a terrace during twilight, looking into each other's eyes. The girl is wearing a gorgeous deep blue lehenga with silver mirror work, and the boy is wearing a matching blue kurta. The background shows a beautifully lit royal palace under a starry sky, cozy fairy lights in the foreground, 8k resolution, romantic mood.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["couple", "lehenga", "palace", "twilight"]
  },
  {
    id: "prompt_10",
    title: "Spooky Pumpkin Kid",
    category: "Halloween",
    prompt: "A highly detailed 3D digital illustration of a cheerful child wearing a classic pumpkin costume, standing on the porch of a beautifully decorated Halloween house. Glowing jack-o'-lanterns, purple eerie lighting, bats silhouette against a massive yellow full moon, cinematic lighting, magical spooky vibes.",
    imageUrl: "https://images.unsplash.com/photo-1508349082403-b187a020736c?w=600&auto=format&fit=crop",
    aspectRatio: "1:1",
    tags: ["halloween", "kids", "spooky", "pumpkin"]
  },
  {
    id: "prompt_11",
    title: "Spooky Witch Cottage",
    category: "Halloween",
    prompt: "An atmospheric 3D render of a small cozy cottage decorated for Halloween. Giant glowing pumpkins on the steps, hanging skeletons, black cats resting near a bubbling green cauldron. Eerie purple mist flowing on the ground, full moon in the dark starry sky, hyper-detailed, trending on ArtStation.",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop",
    aspectRatio: "16:9",
    tags: ["halloween", "cottage", "spooky", "witch"]
  },
  {
    id: "prompt_12",
    title: "Elegant Anniversary Dinner Date",
    category: "Anniversary",
    prompt: "A beautiful 3D render of a luxurious outdoor anniversary dinner setup. A heart-shaped arch made of glowing white and red roses, warm fairy lights hung across trees, a beautifully set table with a customized cake showing 'Happy Anniversary' in gold lettering. Soft romantic golden hour backdrop.",
    imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e3a9?w=600&auto=format&fit=crop",
    aspectRatio: "16:9",
    tags: ["anniversary", "dinner", "flowers", "roses"]
  },
  {
    id: "prompt_13",
    title: "Cute Kids Playing in Autumn",
    category: "Kids Boy",
    prompt: "A lovely 3D digital art of two little kids, a boy and a girl, playing happily in a park full of falling orange autumn leaves. The kids are wearing warm cozy sweaters and beanies, laughing and tossing leaves into the air. Soft golden sunlight filtering through the trees, happy nostalgic vibes.",
    imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop",
    aspectRatio: "1:1",
    tags: ["kids", "autumn", "park", "play"]
  },
  {
    id: "prompt_14",
    title: "Glowing 21st Birthday Boy",
    category: "Birthday",
    prompt: "A 3D digital rendering of a boy celebrating his 21st birthday. He is wearing a modern black sweatshirt with '21' written in a glowing blue neon font. Holding a golden cupcake with a sparkling candle, glowing balloons and confetti floating around in a dark room with cool ambient neon-blue highlights.",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop",
    aspectRatio: "1:1",
    tags: ["birthday", "neon", "balloons", "boy"]
  },
  {
    id: "prompt_15",
    title: "Vibrant Diwali Diya Lighting",
    category: "Diwali",
    prompt: "A gorgeous 3D illustration of a young woman wearing a traditional yellow silk saree, lighting decorative clay diyas on the balcony of her house for Diwali. The background is filled with glowing lanterns, colorful rangoli on the floor, and distant fireworks lighting up the starry night sky. Extremely warm, festive, and detailed.",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["diwali", "diyas", "saree", "festival"]
  },
  {
    id: "prompt_16",
    title: "Mystic Mahadev Shiva Render",
    category: "3D Model",
    prompt: "A powerful 3D sculpture render of Lord Shiva meditating on a snowy peak of Mount Kailash. The third eye glowing with divine light, Ganga river flowing from the locks, Trishul standing majestically next to him with a red flag. Cosmic background with nebulas and stars, high fidelity 3D asset style, hyper-detailed.",
    imageUrl: "https://images.unsplash.com/photo-1561361062-6522af7afe63?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["3D model", "mahadev", "shiva", "divine"]
  },
  {
    id: "prompt_17",
    title: "Graceful Garba Dancer",
    category: "Navaratri",
    prompt: "A vibrant 3D rendering of a girl performing Garba dance for Navaratri. She is wearing a highly colorful, heavy mirror-work chaniya choli which is spinning dynamically. Holding decorated dandiya sticks, traditional festive lighting, joyful crowd blurred in the background, high energy, detailed embroidery, 8k.",
    imageUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["navaratri", "garba", "dance", "traditional"]
  },
  {
    id: "prompt_18",
    title: "Elegant Women Portrait in Forest",
    category: "Women",
    prompt: "A stunning 3D illustration of an elegant woman wearing a floral dress, standing in a magical sunlit forest clearing. Butterfies floating around her, holding a basket of fresh wildflowers, warm gentle breeze, highly detailed face with realistic expression, soft dreamy color grading.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["women", "floral", "forest", "dreamy"]
  },
  {
    id: "prompt_19",
    title: "Sleek Modern Men Style",
    category: "Men",
    prompt: "A hyper-detailed 3D digital model of a stylish man wearing a customized smart casual beige blazer and a white crewneck shirt, standing in front of a modern urban glass skyscraper during twilight. Sharp facial features, cinematic side-lighting, elegant and professional aesthetic.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop",
    aspectRatio: "9:16",
    tags: ["men", "fashion", "urban", "skyscraper"]
  }
];

const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("No canvas 2D context available"));
      }
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error("Canvas blob extraction failed"));
        }
        resolve(blob);
      }, "image/png");
    };
    image.onerror = (err) => reject(err);
  });
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function PromptManagementPage() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [previewPrompt, setPreviewPrompt] = useState(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formAspectRatio, setFormAspectRatio] = useState("1:1");
  const [formTags, setFormTags] = useState("");
  const [loading, setLoading] = useState(false);

  // Cropper & Upload states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Dynamic Categories State
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch categories from API
  const fetchCategoriesFromApi = async () => {
    try {
      const { data } = await api.get("/api/admin/aicategories");
      if (data && data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        if (data.data.length > 0 && !formCategory) {
          setFormCategory(data.data[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch prompts list from actual MongoDB database backend API
  const fetchPromptsFromApi = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/prompts");
      if (data && data.success && Array.isArray(data.data)) {
        // Map _id to id for seamless UI compatibility
        const mapped = data.data.map((p) => ({
          ...p,
          id: p._id || p.id,
        }));
        setPrompts(mapped);
      } else {
        setPrompts([]);
      }
    } catch (err) {
      console.error("Error fetching admin prompts:", err);
      toast.error("Failed to load prompts from database.");
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD Handlers
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return toast.error("Category name cannot be empty");
    
    setCategoryLoading(true);
    try {
      const { data } = await api.post("/api/admin/aicategories", { name: newCategoryName.trim() });
      if (data && data.success) {
        toast.success("Category added successfully! ✨");
        setNewCategoryName("");
        fetchCategoriesFromApi();
      }
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim()) return toast.error("Category name cannot be empty");
    if (!editingCategory) return;

    setCategoryLoading(true);
    try {
      const { data } = await api.put(`/api/admin/aicategories/${editingCategory._id}`, { name: editCategoryName.trim() });
      if (data && data.success) {
        toast.success("Category renamed successfully! ✏️");
        setEditingCategory(null);
        setEditCategoryName("");
        fetchCategoriesFromApi();
        fetchPromptsFromApi(); // prompts update
      }
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error(err.response?.data?.message || "Failed to rename category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategoryLoading(true);
      try {
        const { data } = await api.delete(`/api/admin/aicategories/${id}`);
        if (data && data.success) {
          toast.success("Category deleted successfully! 🗑️");
          fetchCategoriesFromApi();
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        toast.error(err.response?.data?.message || "Failed to delete category. Check if prompts are using it.");
      } finally {
        setCategoryLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPromptsFromApi();
    fetchCategoriesFromApi();
  }, []);

  // File upload handlers
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("image", file, file.name);

        const { data } = await api.post("/api/admin/prompts/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (data && data.success && data.imageUrl) {
          setFormImageUrl(data.imageUrl);
          toast.success("Image uploaded successfully! 🎨");
        } else {
          toast.error(data.message || "Failed to upload image");
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(err.response?.data?.message || "Error uploading image");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setFormTitle("");
    setFormCategory(categories[0]?.name || "Halloween");
    setFormPrompt("");
    setFormImageUrl(""); // Let it start empty for file choice
    setFormAspectRatio("1:1");
    setFormTags("");
    setIsFormOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormTitle(prompt.title);
    setFormCategory(prompt.category);
    setFormPrompt(prompt.prompt);
    setFormImageUrl(prompt.imageUrl);
    setFormAspectRatio(prompt.aspectRatio || "1:1");
    setFormTags(prompt.tags ? prompt.tags.join(", ") : "");
    setIsFormOpen(true);
  };

  // Submit Form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrompt.trim() || !formImageUrl.trim()) {
      return toast.error("Please fill in all required fields!");
    }

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const promptData = {
      title: formTitle.trim(),
      category: formCategory,
      prompt: formPrompt.trim(),
      imageUrl: formImageUrl.trim(),
      aspectRatio: formAspectRatio,
      tags: tagsArray,
    };

    try {
      if (editingPrompt) {
        // Edit mode (PUT request)
        const { data } = await api.put("/api/admin/prompts/" + editingPrompt.id, promptData);
        if (data && data.success) {
          toast.success("Prompt updated successfully! ✨");
          fetchPromptsFromApi();
        } else {
          toast.error(data.message || "Failed to update prompt");
        }
      } else {
        // Create mode (POST request)
        const { data } = await api.post("/api/admin/prompts", promptData);
        if (data && data.success) {
          toast.success("New prompt added successfully! 🚀");
          fetchPromptsFromApi();
        } else {
          toast.error(data.message || "Failed to add prompt");
        }
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error submitting prompt:", err);
      toast.error(err.response?.data?.message || "Server error while saving prompt.");
    }
  };

  // Delete Prompt
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      try {
        const { data } = await api.delete("/api/admin/prompts/" + id);
        if (data && data.success) {
          toast.success("Prompt deleted successfully! 🗑️");
          fetchPromptsFromApi();
        } else {
          toast.error(data.message || "Failed to delete prompt");
        }
      } catch (err) {
        console.error("Error deleting prompt:", err);
        toast.error(err.response?.data?.message || "Server error while deleting prompt.");
      }
    }
  };



  // Filter List
  const filteredPrompts = prompts.filter((p) => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic Statistics
  const totalPrompts = prompts.length;
  const totalCategories = new Set(prompts.map((p) => p.category)).size;
  const aspectRatios = prompts.reduce((acc, curr) => {
    const ratio = curr.aspectRatio || "1:1";
    acc[ratio] = (acc[ratio] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
      <Toaster position="top-right" />

      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Prompt Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add, edit, delete, and manage categories for consumer CreativeAI Photo Prompts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">

          <button
            onClick={() => navigate("/social/ai-categories")}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/10 active:scale-95"
          >
            <Filter className="w-4 h-4" />
            Manage Categories
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Prompt
          </button>
        </div>
      </header>

      {/* Statistics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Total Prompts
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
              {totalPrompts}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Categories Active
            </span>
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white leading-tight">
              {totalCategories} / {categories.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 flex items-center justify-center">
            <Clipboard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
              Standard Ratios
            </span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 block">
              1:1 ({aspectRatios["1:1"] || 0}) | 9:16 ({aspectRatios["9:16"] || 0}) | 16:9 ({aspectRatios["16:9"] || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Filter and search utilities */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 bg-transparent dark:text-white"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 py-2 px-3 bg-white dark:bg-gray-800 dark:text-white focus:outline-none w-full md:w-auto"
          >
            <option value="All">All Categories</option>
            {(categories.length > 0 ? categories : CATEGORIES_LIST.map(name => ({ _id: name, name }))).map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {(categoryFilter !== "All" || searchQuery !== "") && (
            <button
              onClick={() => {
                setCategoryFilter("All");
                setSearchQuery("");
              }}
              className="p-2 rounded-xl text-red-500 bg-red-50 dark:bg-red-950/20 border border-gray-200 dark:border-gray-700 hover:bg-red-100 transition-colors shrink-0"
              title="Clear Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prompts table list */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 w-16">Preview</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400">Title</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 w-32">Category</th>
                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 w-24">Aspect Ratio</th>

                <th className="p-4 font-bold text-gray-500 dark:text-gray-400 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 dark:text-gray-500">
                    No prompts registered matching your criteria. Click "Add New Prompt" to start.
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((prompt) => (
                  <tr 
                    key={prompt.id} 
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50">
                        <img
                          src={getFullImageUrl(prompt.imageUrl)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {prompt.title}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                        {prompt.category}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-gray-600 dark:text-gray-400">
                      {prompt.aspectRatio || "1:1"}
                    </td>



                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewPrompt(prompt)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(prompt)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(prompt.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row max-h-[95vh] overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full h-full overflow-hidden">
                
                {/* Left Column: Image Upload */}
                <div className="w-full md:w-[45%] p-6 md:p-8 bg-white dark:bg-gray-900 flex flex-col shrink-0">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    Prompt Image <span className="text-red-500">*</span>
                  </label>

                  <div className="flex-1 flex flex-col">
                    {uploadingImage ? (
                      <div className="flex-1 border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-transparent rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[250px]">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uploading Image...</span>
                      </div>
                    ) : formImageUrl ? (
                      <div className="flex-1 flex flex-col gap-4">
                        <div className={`relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex items-center justify-center w-full flex-1 min-h-[250px]`}>
                          <img
                            src={getFullImageUrl(formImageUrl)}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1547592180-85f173990554?w=100";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById("prompt-image-file").click()}
                          className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => document.getElementById("prompt-image-file").click()}
                        className="flex-1 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-[2rem] p-6 transition-all text-center cursor-pointer bg-transparent hover:bg-indigo-50/30 group flex flex-col items-center justify-center min-h-[250px]"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Choose Prompt Image</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Drag & drop an image here<br/>or <span className="text-indigo-600 font-semibold">click to browse</span>
                        </p>
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
                          <Info className="w-4 h-4" />
                          Aspect ratio matches: <span className="font-bold">{formAspectRatio}</span>
                        </div>
                      </div>
                    )}
                    <input
                      id="prompt-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Right Column: Form Inputs */}
                <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col overflow-y-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                          {editingPrompt ? "Edit AI Prompt" : "Register New AI Prompt"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Create and save a reusable AI prompt template.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors shadow-sm shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 flex-1 pr-2">
                    {/* Title */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        <Edit2 className="w-4 h-4 text-indigo-600" />
                        Prompt Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Autumn Forest Couple Embrace"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-shadow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category select */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          <Box className="w-4 h-4 text-indigo-600" />
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-shadow appearance-none"
                        >
                          {(categories.length > 0 ? categories : CATEGORIES_LIST.map(name => ({ _id: name, name }))).map((cat) => (
                            <option key={cat._id || cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Aspect Ratio select */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          <Crop className="w-4 h-4 text-indigo-600" />
                          Aspect Ratio <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formAspectRatio}
                          onChange={(e) => setFormAspectRatio(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-shadow appearance-none"
                        >
                          <option value="1:1">Square (1:1)</option>
                          <option value="9:16">Portrait (9:16)</option>
                          <option value="16:9">Landscape (16:9)</option>
                        </select>
                      </div>
                    </div>

                    {/* Prompt Text */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Prompt Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Enter the full AI generator prompt code exactly..."
                        value={formPrompt}
                        onChange={(e) => setFormPrompt(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm leading-relaxed transition-shadow resize-none"
                      />
                    </div>

                    {/* Tags input */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        Search Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., couple, romantic, forest, sunset"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {editingPrompt ? "Save Changes" : "Create Prompt"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* QUICK PREVIEW DRAWER/MODAL */}
      <AnimatePresence>
        {previewPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            onClick={() => setPreviewPrompt(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button placed absolutely on top right of the whole modal */}
              <button
                onClick={() => setPreviewPrompt(null)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Side: Prompt Text & Details */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center order-2 md:order-1 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-6">
                  {previewPrompt.title}
                </h3>
                
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  AI Prompt Code
                </span>
                
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 leading-relaxed max-h-48 overflow-y-auto mb-4 select-text">
                  {previewPrompt.prompt}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {previewPrompt.tags && previewPrompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-start gap-3 mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewPrompt.prompt);
                      toast.success("Prompt copied to clipboard!");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Copy Prompt
                  </button>
                  <button
                    onClick={() => setPreviewPrompt(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Right Side: Image */}
              <div className="relative w-full md:w-1/2 bg-gray-100 flex items-center justify-center order-1 md:order-2 shrink-0">
                <img
                  src={getFullImageUrl(previewPrompt.imageUrl)}
                  alt={previewPrompt.title}
                  className="w-full h-full object-cover max-h-[90vh]"
                />
                <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                  {previewPrompt.aspectRatio} | {previewPrompt.category}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
