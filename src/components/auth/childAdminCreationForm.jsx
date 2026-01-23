import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAdminAuth } from "../../context/adminAuthContext";

// Custom animation classes (add to your CSS/tailwind.config.js if needed)
// .animate-fadeInLeft { animation: fadeInLeft 0.6s cubic-bezier(.4,0,.2,1) both; }
// @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }

export default function ChildAdminForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);

  const { createChildAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!username.trim()) {
        throw new Error("User Name is required");
      }

      const res = await createChildAdmin({
        username: username.trim(),
        email,
        password,
        adminType: "Child_Admin",
      });

      if (res?.admin) {
        const { email, childAdminId, username, adminType } = res.admin;
        if (onSuccess) onSuccess({ email, childAdminId, username, adminType });

        setPopup({
          type: "success",
          message: null,
          content: (
            <div className="space-y-2">
              <p className="font-semibold text-green-600">Child Admin created successfully!</p>
              <div className="text-gray-700">
                <p><span className="font-semibold">Email:</span> {email}</p>
                <p><span className="font-semibold">Password:</span> {password}</p>
                <p><span className="font-semibold">ChildAdmin ID:</span> {childAdminId}</p>
              </div>
            </div>
          ),
        });

        setUsername("");
        setEmail("");
        setPassword("");
        setIsChecked(false);
      } else {
        const errMsg = res?.error || res?.message || "Failed to create Child Admin";
        setPopup({ type: "error", message: errMsg });
        setError(errMsg);
      }
    } catch (err) {
      const errMsg = err.message || "Something went wrong";
      setPopup({ type: "error", message: errMsg });
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-full no-scrollbar relative bg-gradient-to-br from-blue-50 to-brand-50 min-h-screen">
      {/* Response Modal */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-sm animate-fadeInLeft border-t-4 border-b-4 border-brand-400 transition-all duration-400">
            <h2 className={`text-lg font-semibold mb-2 ${popup.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {popup.type === "success" ? "Success" : "Error"}
            </h2>
            <div className="text-gray-700">
              {popup.content ? popup.content : <p>{popup.message}</p>}
            </div>
            <button
              onClick={() => setPopup(null)}
              className="mt-4 px-4 py-2 bg-brand-500 transition-colors duration-200 text-white rounded shadow-lg hover:bg-brand-600 hover:shadow-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 transition-colors duration-200">
          <ChevronLeftIcon className="size-5" />
          <span className="ml-1">Back to dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8 animate-fadeInLeft">
          <h1 className="mb-2 font-bold text-gray-800 text-title-sm sm:text-title-md">
            Create Child Admin
          </h1>
          <p className="text-sm text-gray-500">Fill in the details to create a new child admin account.</p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white rounded-2xl shadow-xl px-7 py-8 border border-transparent hover:border-brand-400/70 transition-all animate-fadeInLeft"
          style={{ boxShadow: ' 0 2px 12px 0 rgba(60, 82, 230, 0.08), 0 2px 4px 0 rgba(0,0,0,0.05)' }}
        >
          <div>
            <Label>User Name<span className="text-error-500">*</span></Label>
            <Input
              type="text"
              placeholder="Enter user name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="transition-shadow duration-300 focus:shadow-brand-200"
            />
          </div>

          <div>
            <Label>Email<span className="text-error-500">*</span></Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-shadow duration-300 focus:shadow-brand-200"
            />
          </div>

          <div>
            <Label>Password<span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-shadow duration-300 focus:shadow-brand-200 pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 transition-colors duration-200"
              >
                {showPassword ? <EyeIcon className="fill-gray-500 size-5" /> : <EyeCloseIcon className="fill-gray-500 size-5" />}
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" /></svg>
                  Creating...
                </span>
              ) : "Create Child Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
