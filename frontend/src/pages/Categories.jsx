import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundCircles from "../components/BackgroundCircles";
import CategoryForm from "../components/froms/CategoryForm";
import {
  Plus,
  SquarePen,
  Trash2,
  Smartphone,
  Wallet,
  Tag,
  House,
  TrendingUp,
  Briefcase,
  Car,
  DollarSign,
  ShoppingCart,
  Utensils,
  Heart,
  Shirt,
  Gamepad,
  GraduationCap,
  Plane,
  Coffee,
  Gift,
  AlertTriangle,
} from "lucide-react";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Category
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-slate-700">
            Are you sure you want to delete the category{" "}
            <span className="font-semibold text-red-600">"{categoryName}"</span>
            ? This will remove the category permanently.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCategories(result.data);
        //toast.success("Categories loaded successfully");
      } else {
        throw new Error(result.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error.message || "Failed to load categories";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (activeTab === "all") return true;
    return category.type === activeTab;
  });

  const incomeCount = categories.filter((cat) => cat.type === "income").length;
  const expenseCount = categories.filter(
    (cat) => cat.type === "expense"
  ).length;

  const getIconComponent = (iconName) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case "smartphone":
        return <Smartphone {...iconProps} />;
      case "wallet":
        return <Wallet {...iconProps} />;
      case "tag":
        return <Tag {...iconProps} />;
      case "house":
        return <House {...iconProps} />;
      case "trending-up":
        return <TrendingUp {...iconProps} />;
      case "briefcase":
        return <Briefcase {...iconProps} />;
      case "car":
        return <Car {...iconProps} />;
      case "dollar-sign":
        return <DollarSign {...iconProps} />;
      case "shopping-cart":
        return <ShoppingCart {...iconProps} />;
      case "utensils":
        return <Utensils {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "shirt":
        return <Shirt {...iconProps} />;
      case "gamepad":
        return <Gamepad {...iconProps} />;
      case "graduation-cap":
        return <GraduationCap {...iconProps} />;
      case "plane":
        return <Plane {...iconProps} />;
      case "coffee":
        return <Coffee {...iconProps} />;
      case "gift":
        return <Gift {...iconProps} />;
      default:
        return <Tag {...iconProps} />;
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCategories((prev) => [...prev, result.data]);
        setIsCreateModalOpen(false);
        toast.success("Category created successfully");
      } else {
        throw new Error(result.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage = error.message || "Failed to create category";
      toast.error(errorMessage);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/categories/${editingCategory._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === editingCategory._id ? result.data : cat
          )
        );
        setIsEditModalOpen(false);
        setEditingCategory(null);
        toast.success("Category updated successfully");
      } else {
        throw new Error(result.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage = error.message || "Failed to update category";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (category) => {
    if (category.isDefault) {
      toast.warning("Default categories cannot be deleted");
      return;
    }
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/categories/${deletingCategory._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setCategories((prev) =>
          prev.filter((cat) => cat._id !== deletingCategory._id)
        );
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
        toast.success("Category deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage = error.message || "Failed to delete category";
      toast.error(errorMessage);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <BackgroundCircles />
        </div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* BackgroundCircles with lower z-index so it doesn't overlay text */}
      <div className="fixed inset-0 z-0">
        <BackgroundCircles />
      </div>

      <div className="width-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-6 pb-20">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
              <p className="text-slate-600 mt-0.5">
                Organize your transactions
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border-0 shadow-sm">
              <p className="text-green-700 text-sm font-medium mb-1">
                Income Categories
              </p>
              <p className="text-3xl font-bold text-green-900">{incomeCount}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-0 shadow-sm">
              <p className="text-red-700 text-sm font-medium mb-1">
                Expense Categories
              </p>
              <p className="text-3xl font-bold text-red-900">{expenseCount}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl p-4 border-0 shadow-sm">
            <div
              role="tablist"
              className="h-9 items-center justify-center rounded-lg p-1 text-muted-foreground grid w-full grid-cols-3 bg-slate-100"
            >
              <button
                type="button"
                role="tab"
                onClick={() => setActiveTab("all")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                onClick={() => setActiveTab("income")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTab === "income"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-200"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                role="tab"
                onClick={() => setActiveTab("expense")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer ${
                  activeTab === "expense"
                    ? "bg-green-500 text-white shadow"
                    : "hover:bg-slate-200"
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl bg-white text-card-foreground shadow group hover:shadow-md transition-all duration-200 border-0 overflow-hidden"
              >
                {/* Color bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: category.color }}
                />

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {getIconComponent(category.icon)}
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {category.name}
                          </h3>
                          {category.isDefault && (
                            <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                              Default
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 capitalize">
                          {category.type}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                      >
                        <SquarePen className="w-4 h-4 text-slate-600" />
                      </button>
                      {!category.isDefault && (
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl p-8 border-0 shadow-sm">
                <p className="text-slate-500 text-lg">No categories found</p>
                <p className="text-slate-400 mt-2">
                  {activeTab === "all"
                    ? "Get started by creating your first category"
                    : `No ${activeTab} categories found`}
                </p>
                {activeTab === "all" && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border border-transparent hover:border-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Category
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      <CategoryForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        isEdit={false}
      />

      {/* Edit Category Modal */}
      <CategoryForm
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateCategory}
        editData={editingCategory}
        isEdit={true}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        categoryName={deletingCategory?.name || ""}
      />
    </div>
  );
};

export default Categories;
