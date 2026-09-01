import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GalleryItem } from '../../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Calendar, 
  Tag 
} from 'lucide-react';

export const AdminGallery: React.FC = () => {
  const { gallery, addGalleryItem, deleteGalleryItem, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Leadership Summits');
  const [description, setDescription] = useState('');
  const [eventTag, setEventTag] = useState('Guimba Youth Summit');
  const [imageUrl, setImageUrl] = useState('');

  const filtered = gallery.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    addGalleryItem({
      title,
      category,
      description,
      eventTag,
      imageUrl,
      date: new Date().toISOString().split('T')[0]
    });

    addToast('New photo added to municipal gallery!', 'success');
    setIsModalOpen(false);
    setTitle('');
    setImageUrl('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Media & Gallery Management
          </h1>
          <p className="text-xs text-slate-500">
            Upload and organize youth activities photos and event highlights.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between group"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                {item.category}
              </span>
              <button
                onClick={() => {
                  if (confirm('Delete this photo?')) {
                    deleteGalleryItem(item.id);
                    addToast('Photo deleted.', 'info');
                  }
                }}
                className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-1 text-xs">
              <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
              <p className="text-[11px] text-slate-400">{item.date} • {item.eventTag}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 font-display">Add Gallery Photo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tree Planting Assembly"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Leadership Summits">Leadership Summits</option>
                    <option value="Environmental Action">Environmental Action</option>
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Sports & Tournaments">Sports & Tournaments</option>
                    <option value="Digital Workshops">Digital Workshops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Tag</label>
                  <input
                    type="text"
                    value={eventTag}
                    onChange={(e) => setEventTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors mt-2"
              >
                Upload to Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
