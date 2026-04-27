import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatters'

export interface AppProject {
  id?: string;
  title: string;
  description?: string;
  banner_url?: string;
  tech_stack: string | string[];
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
  category?: string;
  added_by?: string;
  created_at?: string;
}

const EMPTY_PROJECT: AppProject = {
  title: '', description: '', banner_url: '',
  tech_stack: '', github_url: '', demo_url: '',
  is_featured: false, category: 'Web Development'
}

export default function OCProjects() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AppProject>(EMPTY_PROJECT)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['oc_projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    setSaving(true); setError('')

    const techArray = typeof form.tech_stack === 'string' 
      ? form.tech_stack.split(',').map(t => t.trim()).filter(t => t)
      : form.tech_stack

    const { category, ...formData } = form

    const payload = {
      ...formData,
      tech_stack: techArray,
      added_by: profile?.id,
    }

    try {
      if (editId) {
        const { error: err } = await supabase.from('projects').update(payload).eq('id', editId)
        if (err) throw err
        queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) => 
          prev ? prev.map(p => p.id === editId ? { ...p, ...payload } : p) : []
        )
      } else {
        const { data, error: err } = await supabase.from('projects').insert(payload).select().single()
        if (err) throw err
        if (data) {
          queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) => prev ? [data, ...prev] : [data])
        }
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_PROJECT)
    } catch (err: any) {
      setError(`Failed to save: ${err.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this project?')) return
    const { error: err } = await supabase.from('projects').delete().eq('id', id)
    if (err) {
      alert('Delete failed: ' + err.message)
    } else {
      queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) => 
        prev ? prev.filter(p => p.id !== id) : []
      )
    }
  }

  function startEdit(project: AppProject) {
    setForm({
      ...EMPTY_PROJECT, ...project,
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : (project.tech_stack || '')
    })
    setEditId(project.id || null); setShowForm(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">Content</p>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase">Projects</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PROJECT); setError('') }}
          className="px-5 py-2.5 bg-[#00D4FF] rounded-lg text-[#0A0E1A] text-[13px] font-bold cursor-pointer hover:bg-[#00D4FF]/90 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-[#0D1829] border border-[#00D4FF]/20 rounded-xl p-6 mb-6">
          <h3 className="text-white text-[15px] font-semibold mb-5">
            {editId ? 'Edit Project' : 'Add New Project'}
          </h3>

          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3.5 py-2.5 mb-4 text-[#EF4444] text-[13px]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Tech Stack (comma separated)" value={form.tech_stack as string} onChange={v => setForm(p => ({ ...p, tech_stack: v }))} placeholder="React, Supabase, Tailwind..." />
            
            <FormField label="GitHub URL" value={form.github_url || ''} onChange={v => setForm(p => ({ ...p, github_url: v }))} />
            <FormField label="Live Demo URL" value={form.demo_url || ''} onChange={v => setForm(p => ({ ...p, demo_url: v }))} />

            <div className="col-span-2">
              <BannerUpload 
                value={form.banner_url || ''}
                onChange={url => setForm(p => ({ ...p, banner_url: url }))}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.05em] mb-2 cursor-pointer">Description</label>
              <textarea 
                value={form.description || ''}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-[13px] resize-y outline-none font-sans focus:border-[#00D4FF]/40"
              />
            </div>

            <div className="flex items-center gap-2.5 col-span-2">
              <input 
                type="checkbox" 
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                className="cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-gray-400 text-[13px] cursor-pointer">Featured Project</label>
            </div>
          </div>

          <div className="flex gap-2.5 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#00D4FF] rounded-lg text-[#0A0E1A] text-[13px] font-bold cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#00D4FF]/90"
            >
              {saving ? 'Saving...' : editId ? 'Update Project' : 'Create Project'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setError('') }}
              className="px-5 py-2.5 bg-transparent border border-white/10 rounded-lg text-gray-400 text-[13px] cursor-pointer hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden self-start">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-400 text-[13px] mb-5">No projects found yet.</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-5 py-2 rounded-lg text-[#00D4FF] text-[13px] font-semibold cursor-pointer hover:bg-[#00D4FF]/20"
              >Add your first project</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {['Project', 'Tech Stack', 'Featured', 'Created', 'Actions'].map(h => (
                    <th key={h} className="p-3 px-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.05em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p: AppProject) => (
                  <tr key={p.id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150">
                    <td className="p-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.banner_url ? (
                          <img src={p.banner_url} alt="" className="w-10 h-8 rounded-md object-cover shrink-0"/>
                        ) : (
                          <div className="w-10 h-8 rounded-md bg-white/5 border border-white/10 shrink-0"/>
                        )}
                        <span className="text-white text-[14px] font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(p.tech_stack) && p.tech_stack.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/10">{t}</span>
                        ))}
                        {Array.isArray(p.tech_stack) && p.tech_stack.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{p.tech_stack.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 px-4">
                      {p.is_featured && <span className="text-[#FF2D9B] text-[10px] font-bold uppercase tracking-[0.05em] bg-[#FF2D9B]/10 px-2 py-0.5 rounded-full border border-[#FF2D9B]/20">Yes</span>}
                    </td>
                    <td className="p-3 px-4 text-gray-400 text-[12px] whitespace-nowrap">
                      {formatDateShort(p.created_at || new Date().toISOString())}
                    </td>
                    <td className="p-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[11px] cursor-pointer hover:bg-white/10 hover:text-white">Edit</button>
                        <button onClick={() => p.id && handleDelete(p.id)} className="px-2.5 py-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] cursor-pointer hover:bg-[#EF4444]/20">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* Banner Upload Component */
function BannerUpload({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setUploading(true); setError('')

    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error(`Sign request failed with status: ${signRes.status}`)
      
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')

      const result = await uploadRes.json()
      if (result.secure_url) {
        onChange(result.secure_url)
      } else {
        throw new Error('No secure_url returned from Cloudinary')
      }
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-[0.05em] mb-2">Project Banner</label>
      <div className="border border-dashed border-white/20 rounded-xl p-5 text-center transition-colors hover:border-[#00D4FF]/40">
        {value ? (
          <div className="relative w-fit mx-auto">
            <img src={value} alt="" className="h-[120px] rounded-lg object-cover"/>
            <button onClick={() => onChange('')} className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#EF4444] border-none text-white cursor-pointer flex items-center justify-center hover:bg-[#dc2626]">×</button>
          </div>
        ) : (
          <div onClick={() => !uploading && fileRef.current?.click()} className={`${uploading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}>
            <div className="text-[24px] text-gray-400 mb-2">
              {uploading ? (
                <div className="w-5 h-5 mx-auto rounded-full border-2 border-gray-400/30 border-t-gray-400 animate-spin"/>
              ) : '+'}
            </div>
            <p className="text-gray-400 text-[13px]">{uploading ? 'Uploading...' : 'Click to upload banner'}</p>
          </div>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p className="text-[#EF4444] text-[11px] mt-1">{error}</p>}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div>
      <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-[0.05em] mb-2">{label}</label>
      <input 
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] outline-none placeholder:text-gray-600 focus:border-[#00D4FF]/40 transition-colors"
      />
    </div>
  )
}
