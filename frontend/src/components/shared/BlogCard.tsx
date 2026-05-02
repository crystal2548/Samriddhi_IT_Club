import { Link } from 'react-router-dom'

interface Blog {
  id: string
  title: string
  slug: string
  category: string
  cover_image_url: string | null
  read_time_mins: number
  published_at: string
  profiles?: {
    full_name: string
  }
}

const CAT_COLORS: Record<string, string> = {
  development: 'text-cyan-400',
  'ai-ml': 'text-pink-400',
  career: 'text-purple-400',
  'club-news': 'text-amber-400',
}

export default function BlogCard({ post }: { post: Blog }) {
  const meta = CAT_COLORS[post.category.toLowerCase()] || 'text-cyan-400'

  return (
    <Link to={`/blog/${post.slug}`} className="premium-card group flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden bg-slate-950">
        {post.cover_image_url ? (
          <img 
            src={post.cover_image_url} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">
            ✦
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {post.category && (
          <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${meta}`}>
            {post.category.replace('-', ' ')}
          </span>
        )}
        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
              {post.profiles?.full_name?.[0] || 'A'}
            </div>
            <span className="text-slate-400 text-[11px] font-bold">
              {post.profiles?.full_name || 'Author'}
            </span>
          </div>
          <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            {post.read_time_mins} MIN
          </span>
        </div>
      </div>
    </Link>
  )
}

