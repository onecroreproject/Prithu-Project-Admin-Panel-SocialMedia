import React from "react";
import BlogTable from "../../components/tables/BlogTable/BlogTable";
import { FileText } from "lucide-react";

const BlogListPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Blog Management
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    Manage your stories, insights, and journey updates.
                </p>
            </div>

            <BlogTable />
        </div>
    );
};

export default BlogListPage;
