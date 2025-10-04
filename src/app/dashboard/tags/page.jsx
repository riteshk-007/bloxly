'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TagsPage() {
    const { data: session } = useSession();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
        } catch (error) {
            console.error('Error fetching tags:', error);
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
            const url = editingId ? `/api/tags/${editingId}` : '/api/tags';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, slug })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isNew === false) {
                    alert(`ℹ️ ${data.message || 'You already have this tag! Using your existing tag.'}`);
                } else {
                    alert(`✅ ${data.message || `Tag ${editingId ? 'updated' : 'created'} successfully!`}`);
                }
                fetchTags();
                setFormData({ name: '', slug: '' });
                setShowForm(false);
                setEditingId(null);
            } else {
                alert(`❌ Failed to ${editingId ? 'update' : 'create'} tag: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving tag:', error);
            alert('❌ Network error occurred while saving tag');
        }
    };

    const handleEdit = (tag) => {
        setFormData({ name: tag.name, slug: tag.slug });
        setEditingId(tag.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            try {
                const response = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
                const data = await response.json();

                if (response.ok) {
                    alert('✅ Tag deleted successfully!');
                    fetchTags();
                } else {
                    alert(`❌ Failed to delete tag: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting tag:', error);
                alert('❌ Network error occurred while deleting tag');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading tags...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Tags</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ name: '', slug: '' });
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg"
                >
                    {showForm ? 'Cancel' : 'Add Tag'}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingId ? 'Edit Tag' : 'Add New Tag'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Tag Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                                placeholder="Enter tag name"
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
                            {editingId ? 'Update Tag' : 'Create Tag'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-gray-900 rounded-lg border border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">All Tags</h2>
                    {tags.length === 0 ? (
                        <p className="text-gray-400">No tags found. Create your first tag above.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tags.map((tag) => (
                                <div key={tag.id} className="p-4 bg-gray-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-white font-medium">{tag.name}</h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="text-yellow-500 hover:text-yellow-400 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="text-red-500 hover:text-red-400 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm">Slug: {tag.slug}</p>
                                    <p className="text-gray-400 text-sm">{tag._count?.posts || 0} posts</p>
                                    <div className="mt-2">
                                        <span className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                                            🏷️ {tag.name}
                                        </span>
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