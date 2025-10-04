'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CategoriesPage() {
    const { data: session } = useSession();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const slug = formData.slug || generateSlug(formData.name);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/categories/${editingId}` : '/api/categories';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, slug })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isNew === false) {
                    alert(`ℹ️ ${data.message || 'You already have this category! Using your existing category.'}`);
                } else {
                    alert(`✅ ${data.message || `Category ${editingId ? 'updated' : 'created'} successfully!`}`);
                }
                fetchCategories();
                setFormData({ name: '', slug: '' });
                setShowForm(false);
                setEditingId(null);
            } else {
                alert(`❌ Failed to ${editingId ? 'update' : 'create'} category: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('❌ Network error occurred while saving category');
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name, slug: category.slug });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                const data = await response.json();

                if (response.ok) {
                    alert('✅ Category deleted successfully!');
                    fetchCategories();
                } else {
                    alert(`❌ Failed to delete category: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('❌ Network error occurred while deleting category');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Categories</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ name: '', slug: '' });
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg"
                >
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Category Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                placeholder="Enter category name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Slug (URL-friendly name)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                placeholder="Auto-generated from name"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg"
                        >
                            {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">All Categories</h2>
                    {categories.length === 0 ? (
                        <p className="text-gray-400">No categories found. Create your first category above.</p>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">{category.name}</h3>
                                        <p className="text-gray-400 text-sm">Slug: {category.slug}</p>
                                        <p className="text-gray-400 text-sm">{category._count?.posts || 0} posts</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-yellow-500 hover:text-yellow-400 px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-500 hover:text-red-400 px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}