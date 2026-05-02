import { Link } from 'react-router-dom'
import { formatDateShort } from '../../utils/formatters'

interface Event {
  id: string
  title: string
  type: string
  status: string
  event_date: string
  location: string | null
  description: string | null
  banner_url: string | null
}

const TYPE_COLORS: Record<string, string> = {
  hackathon: 'text-cyan-400',
  workshop: 'text-pink-400',
  seminar: 'text-emerald-400',
  bootcamp: 'text-purple-400',
  social: 'text-amber-400',
  fest: 'text-pink-400'
}

export default function EventCard({ event }: { event: Event }) {
  const statusConfig: Record<string, { label: string, classes: string }> = {
    upcoming: { label: 'Upcoming', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ongoing: { label: 'Live Now', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    completed: { label: 'Completed', classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  }
  
  const st = statusConfig[event.status] || statusConfig.upcoming
  const typeColor = TYPE_COLORS[event.type.toLowerCase()] || 'text-cyan-400'

  return (
    <Link to={`/events/${event.id}`} className="premium-card group flex flex-col h-full">
      {/* Banner */}
      <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden bg-slate-950">
        {event.banner_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-125"
              style={{ backgroundImage: `url(${event.banner_url})` }}
            />
            <img 
              src={event.banner_url} 
              alt={event.title} 
              className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 z-20 badge ${st.classes}`}>
          {st.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${typeColor}`}>
          {event.type}
        </span>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-cyan-400 transition-colors">
          {event.title}
        </h3>
        
        {event.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
            "{event.description}"
          </p>
        )}

        {/* Meta Info */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
            <svg className="text-cyan-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDateShort(event.event_date)}
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
              <svg className="text-pink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {event.location}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

