// components/Reports/Forms/AddFollowUpQuestionForm.jsx
import { useEffect, useState } from "react";
import axios from "../../../Utils/axiosApi";
import { motion } from "framer-motion";
import { GitBranch, ArrowRightCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AddFollowUpQuestionForm() {
  const [types, setTypes] = useState([]);
  const [step, setStep] = useState(1);

  // Step data states
  const [typeId, setTypeId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [parentQuestionId, setParentQuestionId] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState("");

  // New / Edit follow-up question
  const [followQuestionText, setFollowQuestionText] = useState("");
  const [followOptions, setFollowOptions] = useState([{ text: "" }]);
  const [loading, setLoading] = useState(false);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  // Load report types on mount
  useEffect(() => {
    fetchTypes();
  }, []);

  // Fetch all report types
  const fetchTypes = async () => {
    try {
      const res = await axios.get("/api/admin/get/ReportTypes");
      setTypes(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load types");
    }
  };

  // Fetch questions for a selected type
  const fetchQuestionsByType = async (tid) => {
    if (!tid) return;
    try {
      const res = await axios.get(`/api/admin/get/Questions/ByType?typeId=${tid}`);
      setQuestions(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load questions");
    }
  };

  // When user selects a parent question → load its options
  const onParentQuestionChange = async (qid) => {
    setParentQuestionId(qid);
    setSelectedOptionId("");
    setOptions([]);
    resetEditState();

    if (!qid) return;

    try {
      const res = await axios.get(`/api/admin/get/QuestionById?questionId=${qid}`);
      const q = res.data.data;
      setOptions(q?.options || []);
    } catch (err) {
      toast.error("Failed to load options");
    }
  };

  // Called when admin selects an option in step 3
  const onOptionSelect = async (optionId) => {
    setSelectedOptionId(optionId);
    setIsEditMode(false);
    setEditQuestionId(null);
    setFollowQuestionText("");
    setFollowOptions([{ text: "" }]);

    // find option object
    const opt = options.find((o) => String(o._id) === String(optionId));
    const nextQId = opt?.nextQuestion || null;

    if (nextQId) {
      // load existing follow-up question for edit
      try {
        const res = await axios.get(`/api/admin/get/QuestionById?questionId=${nextQId}`);
        const q = res.data.data;

        if (q) {
          setIsEditMode(true);
          setEditQuestionId(q._id);
          setFollowQuestionText(q.questionText || "");
          // map options: include _id for existing ones
          const mapped = (q.options || []).map((o) => ({ _id: o._id, text: o.text }));
          setFollowOptions(mapped.length ? mapped : [{ text: "" }]);
          // jump to step 4 so admin can edit immediately
          setStep(4);
          toast.success("Loaded existing follow-up for editing");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load linked follow-up question");
      }
    } else {
      // no linked question → prepare create form
      setIsEditMode(false);
      setEditQuestionId(null);
      setFollowQuestionText("");
      setFollowOptions([{ text: "" }]);
    }
  };

  // Add, update or remove follow-up options
  const addFollowOption = () => setFollowOptions([...followOptions, { text: "" }]);
  const updateFollowOption = (i, val) => {
    const copy = [...followOptions];
    copy[i].text = val;
    setFollowOptions(copy);
  };
  const removeFollowOption = (i) => {
    const updated = followOptions.filter((_, idx) => idx !== i);
    setFollowOptions(updated.length ? updated : [{ text: "" }]);
  };

  const resetEditState = () => {
    setIsEditMode(false);
    setEditQuestionId(null);
    setFollowQuestionText("");
    setFollowOptions([{ text: "" }]);
  };

  // Step navigation with correct validation
  const nextStep = async () => {
    if (step === 1 && !typeId) return toast.error("Select report type");

    if (step === 1) await fetchQuestionsByType(typeId);

    if (step === 2 && !parentQuestionId) return toast.error("Select parent question");

    if (step === 3 && !selectedOptionId) return toast.error("Select an option to attach follow-up");

    setStep((s) => s + 1);
  };

  const prevStep = () => {
    // when moving backwards from edit state, keep edit state until option changes
    setStep((s) => Math.max(1, s - 1));
  };

  // Final submit: either create new follow-up question OR update existing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!followQuestionText.trim()) return toast.error("Enter follow-up question");
    const validOpts = followOptions.filter((o) => o.text && o.text.trim());
    if (!validOpts.length) return toast.error("Add at least 1 option");

    setLoading(true);
    try {
      if (isEditMode && editQuestionId) {
        // UPDATE existing question
        // Ensure options include _id for existing ones; frontend preserves _id where present
        await axios.patch(
          `/api/admin/update/report/question?questionId=${editQuestionId}`,
          {
            questionText: followQuestionText.trim(),
            options: validOpts.map((o) => {
              // if option has _id keep it, else it's a new option
              if (o._id) return { _id: o._id, text: o.text.trim() };
              return { text: o.text.trim() };
            }),
          }
        );

        // ensure parent option is linked to this follow-up (in case admin selected a different option)
        await axios.patch("/api/admin/linkNextQuestion", {
          parentQuestionId,
          optionId: selectedOptionId,
          nextQuestionId: editQuestionId,
        });

        toast.success("Follow-up updated and linked");
      } else {
        // CREATE new follow-up question
        const createRes = await axios.post("/api/admin/add/report/questions", {
          typeId,
          questionText: followQuestionText.trim(),
          options: validOpts.map((o) => ({ text: o.text.trim() })),
        });

        const newQuestion = createRes.data.data;
        if (!newQuestion || !newQuestion._id) throw new Error("Failed to create question");

        // Link new question to parent option
        await axios.patch("/api/admin/linkNextQuestion", {
          parentQuestionId,
          optionId: selectedOptionId,
          nextQuestionId: newQuestion._id,
        });

        toast.success("Follow-up question created & linked");
      }

      // Reset all fields
      setStep(1);
      setTypeId("");
      setQuestions([]);
      setParentQuestionId("");
      setOptions([]);
      setSelectedOptionId("");
      resetEditState();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving follow-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add / Edit Follow-Up Question</h3>
        </div>
        {isEditMode && editQuestionId && (
          <div className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Edit Mode</div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <Step pill="1" title="Select Type" active={step === 1} done={step > 1} />
        <Step pill="2" title="Select Question" active={step === 2} done={step > 2} />
        <Step pill="3" title="Select Option" active={step === 3} done={step > 3} />
        <Step pill="4" title={isEditMode ? "Edit Follow-Up" : "Create Follow-Up"} active={step === 4} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <label className="text-sm">Report Type</label>
            <select
              value={typeId}
              onChange={(e) => {
                setTypeId(e.target.value);
                // reset downstream when changing type
                setQuestions([]);
                setParentQuestionId("");
                setOptions([]);
                setSelectedOptionId("");
                resetEditState();
              }}
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">-- Select Type --</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button onClick={nextStep} type="button" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <label className="text-sm">Parent Question</label>
            <select
              value={parentQuestionId}
              onChange={(e) => {
                onParentQuestionChange(e.target.value);
                resetEditState();
              }}
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">-- Select Question --</option>
              {questions.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.questionText}
                </option>
              ))}
            </select>

            <div className="mt-4 flex gap-2">
              <button onClick={prevStep} type="button" className="px-4 py-2 border rounded">
                Back
              </button>
              <button onClick={nextStep} type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <label className="text-sm">Choose Option to Attach</label>
            <div className="mt-3 space-y-2">
              {options.length === 0 && <p className="text-sm text-gray-500">No options found for this question.</p>}
              {options.map((opt) => (
                <label key={opt._id} className="flex items-center gap-3 border p-2 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="selectedOption"
                    value={opt._id}
                    checked={String(selectedOptionId) === String(opt._id)}
                    onChange={() => onOptionSelect(opt._id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm">{opt.text}</div>
                    {opt.nextQuestion ? (
                      <div className="text-xs text-gray-500">Already linked to a follow-up</div>
                    ) : (
                      <div className="text-xs text-gray-400">No follow-up yet</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={prevStep} type="button" className="px-4 py-2 border rounded">
                Back
              </button>
              <button onClick={nextStep} type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <label className="text-sm">Follow-Up Question</label>

            <input
              value={followQuestionText}
              onChange={(e) => setFollowQuestionText(e.target.value)}
              placeholder="Enter follow-up question"
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            />

            <label className="text-sm mt-4 block">Options</label>

            <div className="mt-2 space-y-3">
              {followOptions.map((o, idx) => (
                <div key={o._id ?? idx} className="flex items-center gap-2">
                  <input
                    value={o.text}
                    onChange={(e) => updateFollowOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-4 py-2 border rounded bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    className="px-2 py-1 border rounded"
                    onClick={() => removeFollowOption(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" onClick={addFollowOption} className="text-blue-600">
                + Add Option
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={prevStep} type="button" className="px-4 py-2 border rounded">
                Back
              </button>

              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                <ArrowRightCircle className="h-4 w-4" />
                {loading ? "Saving..." : isEditMode ? "Update & Link" : "Create & Link"}
              </button>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
}

// Step bubble component
function Step({ pill, title, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold 
        ${active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
      >
        {pill}
      </div>
      <span className="text-sm">{title}</span>
    </div>
  );
}
