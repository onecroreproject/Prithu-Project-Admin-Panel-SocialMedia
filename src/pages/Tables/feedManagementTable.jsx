import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash, Calendar, Play, X } from "lucide-react";
import toast from "react-hot-toast";

import { fetchFeeds, deleteFeed, removeFeedCategory, fetchCategories } from "../../Services/FeedServices/feedServices";
import useFeedFilter from "../../hooks/filter";
import usePagination from "../../hooks/pagePagination";
import FeedPreviewModal from "../../components/common/FeedPreviewModal";

export default function FeedManagement() {
  const queryClient = useQueryClient();
  const { filters, handleFilterChange, resetFilters, applyFilters } = useFeedFilter();
  const [selectedFeed, setSelectedFeed] = useState(null);

  // Fetch feeds
  const { data: feeds = [], isLoading: feedsLoading, isError: feedsError, error: feedsErr } = useQuery({
    queryKey: ["feeds"],
    queryFn: fetchFeeds,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Mutation: Delete feed
  const deleteMutation = useMutation({
    mutationFn: ({ feedId }) => deleteFeed({ feedId }),
    onSuccess: () => {
      toast.success("Feed deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
    onError: (err) => toast.error(err.message || "Delete failed"),
  });

  // Mutation: Remove category from feed
  const categoryMutation = useMutation({
    mutationFn: ({ feedId, categoryId }) => removeFeedCategory({ feedId, categoryId }),
    onSuccess: () => {
      toast.success("Category removed from feed!");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
    onError: (err) => toast.error(err.message || "Removal failed"),
  });

  // Filter feeds
  const filteredFeeds = applyFilters(feeds);

  // Pagination
  const { page, totalPages, currentItems, nextPage, prevPage, resetPage } =
    usePagination(filteredFeeds, 10);

  // Date picker refs
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Delete Handler
  const handleDelete = (feedId) => {
    if (confirm("Are you sure you want to delete this feed?")) {
      deleteMutation.mutate({ feedId });
    }
  };

  // Category Remove Handler
  const handleRemoveCategory = (feedId, categoryId) => {
    if (confirm("Are you sure you want to remove this category from the feed?")) {
      categoryMutation.mutate({ feedId, categoryId });
    }
  };

  if (feedsLoading) return <p>Loading feeds...</p>;
  if (feedsError) return <p className="text-red-500">Error: {feedsErr.message}</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold mb-4 dark:text-white/90">Feed Management</h2>

      {/* ============================================
          FILTER SECTION
      ============================================ */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        {/* Type Filter */}
        <div>
          <label className="block text-sm mb-1 font-medium">Type</label>
          <select
            className="border border-gray-300 rounded p-2 w-32"
            value={filters.type}
            onChange={(e) => {
              handleFilterChange("type", e.target.value);
              resetPage();
            }}
          >
            <option value="">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm mb-1 font-medium">Category</label>
          <select
            className="border border-gray-300 rounded p-2 w-44"
            value={filters.categoryId}
            onChange={(e) => {
              handleFilterChange("categoryId", e.target.value);
              resetPage();
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoriesName}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm mb-1 font-medium">Start Date</label>
          <div className="relative flex items-center">
            <input
              ref={startDateRef}
              type="date"
              className="border border-gray-300 rounded p-2 pr-10 w-40"
              value={filters.startDate}
              onChange={(e) => {
                handleFilterChange("startDate", e.target.value);
                resetPage();
              }}
            />
            <Calendar
              className="absolute right-3 text-gray-500 cursor-pointer hover:text-blue-500 hidden sm:block"
              onClick={() => startDateRef.current?.showPicker()}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm mb-1 font-medium">End Date</label>
          <div className="relative flex items-center">
            <input
              ref={endDateRef}
              type="date"
              className="border border-gray-300 rounded p-2 pr-10 w-40"
              value={filters.endDate}
              onChange={(e) => {
                handleFilterChange("endDate", e.target.value);
                resetPage();
              }}
            />
            <Calendar
              className="absolute right-3 text-gray-500 cursor-pointer hover:text-blue-500 hidden sm:block"
              onClick={() => endDateRef.current?.showPicker()}
            />
          </div>
        </div>

        {/* Today Filter */}
        <div className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            id="todayFilter"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={filters.isToday}
            onChange={(e) => {
              handleFilterChange("isToday", e.target.checked);
              resetPage();
            }}
          />
          <label
            htmlFor="todayFilter"
            className="text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap"
          >
            Today's Feeds
          </label>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            resetFilters();
            resetPage();
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md h-[42px]"
        >
          Reset
        </button>
      </div>

      {/* ============================================
          TABLE SECTION
      ============================================ */}
      {currentItems.length === 0 ? (
        <p>No feeds found.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">#</th>
              <th className="p-2">Content</th>
              <th className="p-2">Type</th>
              <th className="p-2">Creator</th>
              <th className="p-3">Categories</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((feed, idx) => (
              <tr key={feed._id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-2">{(page - 1) * 10 + idx + 1}</td>

                {/* FEED MEDIA */}
                <td className="p-2">
                  {feed.type === "video" ? (
                    <div className="relative w-20 h-20 cursor-pointer">
                      <video
                        src={feed.contentUrl}
                        className="w-full h-full object-cover rounded-md"
                        muted
                        onClick={() => setSelectedFeed(feed)}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md"
                        onClick={() => setSelectedFeed(feed)}
                      >
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : feed.contentUrl ? (
                    <img
                      className="w-20 h-20 object-cover rounded-md cursor-pointer"
                      src={feed.contentUrl}
                      alt="feed"
                      onClick={() => setSelectedFeed(feed)}
                    />
                  ) : (
                    <span>No media</span>
                  )}
                </td>

                <td className="p-2 capitalize">{feed.type}</td>
                <td className="p-2">{feed.creator?.userName || "Unknown"}</td>

                {/* CATEGORIES COLUMN */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {feed.categories && feed.categories.length > 0 ? (
                      feed.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-wider dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50"
                        >
                          {cat.name}
                          <button
                            onClick={() => handleRemoveCategory(feed._id, cat.id)}
                            className="hover:text-red-500 transition-colors p-0.5"
                            title="Remove Category"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">No Categories</span>
                    )}
                  </div>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-2 flex gap-2">
                  {/* View */}
                  <button
                    className="btn-action"
                    title="View"
                    onClick={() => setSelectedFeed(feed)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    className="btn-action text-red-500 hover:text-red-700"
                    title="Delete"
                    onClick={() => handleDelete(feed._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ============================================
          PAGINATION SECTION
      ============================================ */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md ${page === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {page} of {totalPages || 1}
        </span>

        <button
          onClick={nextPage}
          disabled={page === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-md ${page === totalPages || totalPages === 0
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          Next
        </button>
      </div>

      {/* ============================================
          FEED PREVIEW MODAL
      ============================================ */}
      {selectedFeed && (
        <FeedPreviewModal
          feed={selectedFeed}
          onClose={() => setSelectedFeed(null)}
        />
      )}
    </div>
  );
}
