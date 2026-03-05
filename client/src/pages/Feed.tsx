import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  Heart, MessageCircle, Share2, Bookmark, Play, Music, Video, BookOpen,
  TrendingUp, Users, Eye, MoreHorizontal, Plus, Image, Mic, PenTool, ShoppingBag
} from "lucide-react";

const FEED_POSTS = [
  {
    id: 1, type: "music", user: "SynthWave_AI", avatar: "SW", time: "2m ago",
    content: "Just dropped my new AI-generated EP 'Neon Dreamscape' — 8 tracks of pure synthwave. Available in the marketplace now! 🎵",
    media: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
    likes: 2847, comments: 142, views: "18.4K", price: "$4.99", tag: "Music",
    tagColor: "bg-purple-500/20 text-purple-300", marketLink: "/marketplace"
  },
  {
    id: 2, type: "video", user: "VisualForge", avatar: "VF", time: "15m ago",
    content: "Created this AI city timelapse using Runway ML + my custom prompts. Full tutorial in my Writing Workshop post. Check it out! 🎬",
    media: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    likes: 1823, comments: 89, views: "24.1K", price: "$9.99", tag: "Video",
    tagColor: "bg-blue-500/20 text-blue-300", marketLink: "/marketplace"
  },
  {
    id: 3, type: "ebook", user: "AIAuthor", avatar: "AA", time: "1h ago",
    content: "My new eBook 'Prompt Engineering Bible' is now live! 247 pages covering every major AI model. Perfect for beginners and pros. 📚",
    media: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    likes: 3102, comments: 267, views: "41.2K", price: "$12.99", tag: "eBook",
    tagColor: "bg-green-500/20 text-green-300", marketLink: "/marketplace"
  },
  {
    id: 4, type: "art", user: "PixelMage", avatar: "PM", time: "3h ago",
    content: "New digital art pack — 'Cosmic Portraits' — 50 high-res AI-generated portraits. Commercial license included! 🎨",
    media: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    likes: 987, comments: 54, views: "9.2K", price: "$7.99", tag: "Art",
    tagColor: "bg-pink-500/20 text-pink-300", marketLink: "/marketplace"
  },
];

const TRENDING_TAGS = ["#AIMusic", "#VideoGen", "#eBookLife", "#DropShip", "#CreatorEconomy", "#NexusMarket", "#AIArt", "#WritingWorkshop"];

const STORIES = [
  { user: "You", avatar: "ME", isAdd: true },
  { user: "SynthWave", avatar: "SW", active: true },
  { user: "VisualForge", avatar: "VF", active: true },
  { user: "AIAuthor", avatar: "AA", active: false },
  { user: "PixelMage", avatar: "PM", active: true },
  { user: "BeatMaker", avatar: "BM", active: false },
];

const QUICK_CREATE = [
  { icon: Music, label: "New Music", color: "text-purple-400", href: "/studio" },
  { icon: Video, label: "New Video", color: "text-blue-400", href: "/studio" },
  { icon: PenTool, label: "Write Post", color: "text-cyan-400", href: "/studio" },
  { icon: BookOpen, label: "New eBook", color: "text-green-400", href: "/studio" },
  { icon: Image, label: "Upload Art", color: "text-pink-400", href: "/studio" },
  { icon: ShoppingBag, label: "List Product", color: "text-yellow-400", href: "/vendor" },
];

export default function Feed() {
  useEffect(() => { document.title = "Social Feed — Connect & Discover | NEXUS"; }, []);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-24 pb-16">
        <div className="container">
          <div className="grid lg:grid-cols-[280px_1fr_280px] gap-6">

            {/* Left Sidebar */}
            <div className="hidden lg:block space-y-4">
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    ME
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Your Profile</div>
                    <div className="text-xs text-gray-400">Creator & Vendor</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  {[["Posts", "24"], ["Followers", "1.2K"], ["Sales", "$847"]].map(([label, val]) => (
                    <div key={label} className="bg-white/5 rounded-lg p-2">
                      <div className="text-sm font-bold text-white">{val}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
                <Link href="/vendor">
                  <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs">
                    View My Store
                  </Button>
                </Link>
              </Card>

              <Card className="glass-card border-white/10 p-4">
                <div className="font-semibold text-white text-sm mb-3">Quick Create</div>
                <div className="space-y-1">
                  {QUICK_CREATE.map(({ icon: Icon, label, color, href }) => (
                    <Link key={label} href={href}>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm text-gray-300">{label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="space-y-4">
              {/* Stories */}
              <Card className="glass-card border-white/10 p-4">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {STORIES.map(({ user, avatar, isAdd, active }) => (
                    <div key={user} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                      onClick={() => isAdd ? navigate("/studio") : toast.info(`${user}'s story — Stories feature coming soon!`)}>
                      <div className={`relative w-14 h-14 rounded-full ${active ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background" : "ring-1 ring-white/20"} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600`}>
                        <span className="text-white text-sm font-bold">{avatar}</span>
                        {isAdd && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 truncate w-14 text-center">{user}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Create Post */}
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">ME</div>
                  <Link href="/studio" className="flex-1">
                    <div className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-white/10 transition-colors">
                      What are you creating today?
                    </div>
                  </Link>
                </div>
                <div className="flex gap-2 justify-around border-t border-white/10 pt-3">
                  {[
                    { icon: Video, label: "Video", color: "text-blue-400" },
                    { icon: Image, label: "Photo", color: "text-green-400" },
                    { icon: Mic, label: "Audio", color: "text-purple-400" },
                    { icon: PenTool, label: "Write", color: "text-cyan-400" },
                  ].map(({ icon: Icon, label, color }) => (
                    <Link key={label} href="/studio">
                      <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
                        <Icon className={`w-4 h-4 ${color}`} />
                        {label}
                      </button>
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Posts */}
              {FEED_POSTS.map((post) => (
                <Card key={post.id} className="glass-card border-white/10 overflow-hidden hover:border-blue-500/20 transition-all">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600">
                          <AvatarFallback className="text-white text-sm font-bold bg-transparent">{post.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white text-sm">{post.user}</div>
                          <div className="text-xs text-gray-400">{post.time}</div>
                        </div>
                        <Badge className={`text-xs ${post.tagColor} border-0`}>{post.tag}</Badge>
                      </div>
                      <button className="text-gray-400 hover:text-white" onClick={() => toast.info("Report, hide, or share post")}>
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-200 mb-3 leading-relaxed">{post.content}</p>
                  </div>

                  {post.media && (
                    <Link href={post.marketLink}>
                      <div className="relative cursor-pointer group">
                        <img src={post.media} alt={post.tag} className="w-full h-52 object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Play className="w-7 h-7 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm font-bold px-3 py-1 rounded-full">
                          {post.price}
                        </div>
                      </div>
                    </Link>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-pink-400 transition-colors text-sm"
                          onClick={() => toast.success("Liked!")}>
                          <Heart className="w-4 h-4" />
                          <span>{post.likes.toLocaleString()}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                          onClick={() => toast.info("Comments — Full thread view coming soon!")}>
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors text-sm"
                          onClick={() => { navigator.clipboard?.writeText(window.location.origin + post.marketLink); toast.success("Link copied to clipboard!"); }}>
                          <Share2 className="w-4 h-4" />
                        </button>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3 h-3" />{post.views}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-yellow-400 transition-colors"
                          onClick={() => toast.success("Saved to collection!")}>
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <Link href={post.marketLink}>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs h-7">
                            Buy {post.price}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Load More */}
              <Link href="/marketplace">
                <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:bg-white/5">
                  Browse All Content in Marketplace
                </Button>
              </Link>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block space-y-4">
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white text-sm">Trending Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map(tag => (
                    <Link key={tag} href="/marketplace">
                      <Badge variant="outline" className="text-xs border-white/20 text-blue-300 cursor-pointer hover:bg-blue-500/10 transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white text-sm">Suggested Creators</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "BeatMaster_X", type: "Music Producer", followers: "4.2K" },
                    { name: "StoryWeaver", type: "Author & Blogger", followers: "2.8K" },
                    { name: "NeonArtist", type: "Digital Artist", followers: "6.1K" },
                    { name: "VideoAlchemy", type: "Video Creator", followers: "3.5K" },
                  ].map(({ name, type, followers }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {name[0]}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{name}</div>
                          <div className="text-xs text-gray-400">{type} · {followers}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-7 border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={() => toast.success(`Following ${name}!`)}>
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-white/10 p-4">
                <div className="font-semibold text-white text-sm mb-3">Today's Revenue</div>
                <div className="text-3xl font-bold text-gradient-gold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>$284.50</div>
                <div className="text-xs text-green-400 flex items-center gap-1 mb-3">
                  <TrendingUp className="w-3 h-3" /> +18% from yesterday
                </div>
                <div className="space-y-2 mb-3">
                  {[["Dropshipping", "$142.00"], ["Content Sales", "$89.50"], ["Commissions", "$53.00"]].map(([src, amt]) => (
                    <div key={src} className="flex justify-between text-xs">
                      <span className="text-gray-400">{src}</span>
                      <span className="text-green-400 font-medium">{amt}</span>
                    </div>
                  ))}
                </div>
                <Link href="/vendor">
                  <Button size="sm" className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white border-0 text-xs">
                    View Full Dashboard
                  </Button>
                </Link>
              </Card>

              <Card className="glass-card border-white/10 p-4">
                <div className="font-semibold text-white text-sm mb-3">Spotlight Today</div>
                <Link href="/spotlight">
                  <div className="cursor-pointer group">
                    <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80" alt="Spotlight" className="w-full h-24 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity" />
                    <div className="text-xs text-white font-medium">Neon Dreamscape EP</div>
                    <div className="text-xs text-gray-400">by SynthWave_AI · #1 Today</div>
                  </div>
                </Link>
                <Link href="/spotlight">
                  <Button size="sm" variant="outline" className="w-full mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs">
                    See All Spotlight
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>

        {/* Ad Revenue + Integration Banner */}
        <div className="container mt-8 pb-10 space-y-6">
          {/* Google AdSense Placeholder */}
          <div className="w-full bg-white/5 border border-dashed border-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Advertisement</div>
            <div className="h-16 flex items-center justify-center">
              <span className="text-gray-600 text-sm">[ Google AdSense — 728×90 Leaderboard Ad Unit ]</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Passive ad revenue on every page view ·{" "}
              <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Set up AdSense →</a>
            </div>
          </div>

          {/* Social & Feed Integration Banner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-lg">⚡</span>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Feed & Social Powered By</h2>
              <a href="/integrations" className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 hover:bg-blue-500/30 transition-colors">View All 200+ Integrations</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: "Outfy", desc: "Auto Social Post", url: "https://outfy.com", color: "text-blue-400" },
                { name: "Buffer", desc: "Schedule Posts", url: "https://buffer.com", color: "text-cyan-400" },
                { name: "Hootsuite", desc: "Social Mgmt", url: "https://hootsuite.com", color: "text-green-400" },
                { name: "Google AdSense", desc: "Ad Revenue", url: "https://adsense.google.com", color: "text-yellow-400" },
                { name: "Meta Ads", desc: "Facebook Ads", url: "https://www.facebook.com/business/ads", color: "text-blue-500" },
                { name: "TikTok Ads", desc: "TikTok Mktg", url: "https://ads.tiktok.com", color: "text-pink-400" },
                { name: "Pinterest Ads", desc: "Pinterest Mktg", url: "https://ads.pinterest.com", color: "text-red-400" },
                { name: "CrewAI", desc: "AI Agents", url: "https://www.crewai.com", color: "text-purple-400" },
                { name: "n8n", desc: "Automation", url: "https://n8n.io", color: "text-orange-400" },
                { name: "Zapier", desc: "Workflows", url: "https://zapier.com", color: "text-amber-400" },
                { name: "Make", desc: "Automation", url: "https://www.make.com", color: "text-indigo-400" },
                { name: "Growave", desc: "Social Proof", url: "https://growave.io", color: "text-teal-400" },
                { name: "Tidio", desc: "Live Chat", url: "https://www.tidio.com", color: "text-sky-400" },
                { name: "Brevo", desc: "Email/SMS", url: "https://www.brevo.com", color: "text-emerald-400" },
                { name: "Pushover", desc: "Push Notifs", url: "https://pushover.net", color: "text-rose-400" },
                { name: "Algolia", desc: "Search", url: "https://www.algolia.com", color: "text-violet-400" },
              ].map(({ name, desc, url, color }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  className="glass-card border-white/10 rounded-xl p-3 text-center hover:border-blue-500/30 transition-all group cursor-pointer block">
                  <div className={`text-sm font-bold ${color} group-hover:scale-105 transition-transform`}>{name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
