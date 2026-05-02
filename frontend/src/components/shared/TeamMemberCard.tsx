interface Profile {
  id: string
  full_name: string
  role: string
  oc_position: string | null
  photo_url: string | null
  bio: string | null
  github_url: string | null
  linkedin_url: string | null
}

export default function TeamMemberCard({ member, variant = 'standard' }: { member: Profile, variant?: 'leadership' | 'standard' }) {
  const isLeadership = variant === 'leadership'

  return (
    <div className={`premium-card group ${isLeadership ? 'p-10' : 'p-6'}`}>
      {/* Photo */}
      <div className={`relative mb-8 mx-auto overflow-hidden rounded-[32px] ${isLeadership ? 'w-48 h-48' : 'w-32 h-32'}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-40 z-10" />
        {member.photo_url ? (
          <img 
            src={member.photo_url} 
            alt={member.full_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-2 block">
          {member.oc_position || member.role}
        </span>
        <h3 className={`${isLeadership ? 'text-2xl' : 'text-lg'} font-black text-white uppercase tracking-tighter mb-4 group-hover:text-cyan-400 transition-colors`}>
          {member.full_name}
        </h3>
        
        {member.bio && (
          <p className="text-slate-500 text-xs leading-relaxed mb-8 line-clamp-2 italic">
            "{member.bio}"
          </p>
        )}

        {/* Socials */}
        <div className="flex justify-center gap-3">
          {member.github_url && (
            <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </a>
          )}
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

