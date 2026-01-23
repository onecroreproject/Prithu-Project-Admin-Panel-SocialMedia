import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "../../Services/FeedServices/feedServices";

export default function CategoryUploadForm() {
  const [names, setNames] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      alert("Categories added successfully!");
      setNames("");
      queryClient.invalidateQueries({ queryKey: ["categories"] }); 
    },
    onError: (err) => {
      alert(err.message || "Failed to add categories");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!names.trim()) return alert("Please enter category names");
    mutate({ names });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Add Categories
      </h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder="Enter categories separated by commas (e.g. Men, Women, Kids)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          rows="3"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add Categories"}
        </button>
      </form>
    </div>
  );
}
