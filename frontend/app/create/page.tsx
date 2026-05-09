"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'DevFest',
    city: '',
    budget: 5000,
    audience: 'developers',
    format: 'on-site'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget)
        })
      });
      
      const data = await res.json();
      if (data.event_id) {
        router.push(`/workflow/${data.event_id}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to start workflow. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7F77DD] to-[#378ADD]"></div>
        
        <h1 className="text-3xl font-bold mb-2">Event Parameters</h1>
        <p className="text-gray-400 mb-8">Define the constraints. The AI Operator will handle the rest.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Event Type</label>
              <select 
                value={formData.event_type}
                onChange={e => setFormData({...formData, event_type: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7F77DD] transition-all"
              >
                <option value="DevFest">DevFest</option>
                <option value="Build with AI">Build with AI</option>
                <option value="Google I/O Extended">Google I/O Extended</option>
                <option value="Women Techmakers">Women Techmakers</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">City</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Tunis"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7F77DD] transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Budget ($)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7F77DD] transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Target Audience</label>
              <select 
                value={formData.audience}
                onChange={e => setFormData({...formData, audience: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7F77DD] transition-all"
              >
                <option value="developers">Developers</option>
                <option value="students">Students</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-gray-300">Format</label>
            <div className="flex gap-4">
              {['on-site', 'hybrid', 'online'].map(fmt => (
                <label key={fmt} className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${formData.format === fmt ? 'border-[#7F77DD] bg-[#7F77DD]/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-750'}`}>
                  <input 
                    type="radio" 
                    name="format" 
                    value={fmt}
                    checked={formData.format === fmt}
                    onChange={e => setFormData({...formData, format: e.target.value})}
                    className="hidden"
                  />
                  <span className="capitalize">{fmt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-[#7F77DD] to-[#378ADD] text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(127,119,221,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Deploy AI Agents'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
