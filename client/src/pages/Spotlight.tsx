import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Star, Trophy, TrendingUp, Flame, Crown, Music, Video, BookOpen,
  Image, Heart, Eye, Share2, Play, ShoppingCart, Users, Zap, ArrowRight
} from "lucide-react";

const SPOTLIGHT_CATEGORIES = [
  { icon: Trophy, label: "Most Creative", color: "text-yellow-400", bg: "from-yellow-600/20 to-amber-600/20", badge: "bg-yellow-500/20 text-yellow-300" },
  { icon: Flame, label: "Most Popular", color: "text-red-400", bg: "from-red-600/20 to-orange-600/20", badge: "bg-red-500/20 text-red-300" },
  { icon: Star, label: "Editor's Pick", color: "text-purple-400", bg: "from-purple-600/20 to-blue-600/20", badge: "bg-purple-500/20 text-purple-300" },
  { icon: TrendingUp, label: "Fastest Rising", color: "text-green-400", bg: "from-green-600/20 to-teal-600/20", badge: "bg-green-500/20 text-green-300" },
  { icon: Crown, label: "Best Seller", color: "text-blue-400", bg: "from-blue-600/20 to-cyan-600/20", badge: "bg-blue-500/20 text-blue-300" },
];

const FEATURED_TODAY = [
  {
    rank: 1, category: "Most Creative", creator: "SynthWave_AI", title: "Neon Dreamscape EP",
    type: "Music", price: "$4.99", likes: "12.4K", views: "89K",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
    desc: "An 8-track AI-generated synthwave masterpiece that blends retro 80s vibes with futuristic AI production techniques.",
    badge: "bg-yellow-500/20 text-yellow-300", badgeLabel: "🏆 Most Creative"
  },
  {
    rank: 2, category: "Most Popular", creator: "VisualForge", title: "AI City Timelapse",
    type: "Video", price: "$9.99", likes: "8.7K", views: "62K",
    img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    desc: "A stunning 4K AI-generated city timelapse showing 24 hours of a futuristic metropolis in just 3 minutes.",
    badge: "bg-red-500/20 text-red-300", badgeLabel: "🔥 Most Popular"
  },
  {
    rank: 3, category: "Editor's Pick", creator: "AIAuthor", title: "Prompt Engineering Bible",
    type: "eBook", price: "$12.99", likes: "6.2K", views: "41K",
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
    desc: "The definitive 247-page guide to mastering AI prompts for every major model — ChatGPT, Claude, Gemini, and more.",
    badge: "bg-purple-500/20 text-purple-300", badgeLabel: "⭐ Editor's Pick"
  },
];

const RISING_CREATORS = [
  { name: "BeatMaster_X", type: "Music Producer", growth: "+847%", followers: "4.2K", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&q=80" },
  { name: "StoryWeaver", type: "Author", growth: "+612%", followers: "2.8K", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=100&q=80" },
  { name: "NeonArtist", type: "Digital Artist", growth: "+1,240%", followers: "6.1K", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&q=80" },
  { name: "VideoAlchemy", type: "Video Creator", growth: "+389%", followers: "3.5K", img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&q=80" },
  { name: "CodePoet", type: "Tech Writer", growth: "+521%", followers: "1.9K", img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&q=80" },
];

const WEEKLY_BEST = [
  { rank: 1, name: "SynthWave_AI", type: "Music", revenue: "$2,847", badge: "👑 #1 Vendor" },
  { rank: 2, name: "AIAuthor", type: "eBooks", revenue: "$2,102", badge: "🥈 #2 Vendor" },
  { rank: 3, name: "VisualForge", type: "Video", revenue: "$1,923", badge: "🥉 #3 Vendor" },
  { rank: 4, name: "PixelMage", type: "Art", revenue: "$987", badge: "#4 Vendor" },
  { rank: 5, name: "BeatMaster_X", type: "Music", revenue: "$743", badge: "#5 Vendor" },
];

export default function Spotlight() {
  useEffect(() => { document.title = "Spotlight — Today's Best Creators | NEXUS"; }, []);
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/10 to-yellow-600/10 border-b border-white/10 py-8">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 bg-amber-500/20 text-amber-300 border-amber-500/30">
                  <Star className="w-3 h-3 mr-1" /> Daily Spotlight
                </Badge>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Today's Best Content
                </h1>
                <p className="text-gray-400 text-sm">AI-curated daily — the most impressive, creative, and popular work on NEXUS</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 glass-card rounded-xl px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse-live" />
                <span className="text-sm text-gray-300">Updated <strong className="text-white">2 hours ago</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-6 space-y-8">
          {/* Spotlight Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SPOTLIGHT_CATEGORIES.map(({ icon: Icon, label, color, bg, badge }) => (
              <Card key={label} className={`glass-card border-white/10 p-4 text-center hover:border-yellow-500/30 transition-all cursor-pointer bg-gradient-to-br ${bg}`}
                onClick={() => navigate("/marketplace")}>
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className="text-sm font-semibold text-white">{label}</div>
              </Card>
            ))}
          </div>

          {/* Featured Today — Top 3 */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                🌟 Featured Today
              </h2>
              <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => navigate("/marketplace")}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {FEATURED_TODAY.map((item) => (
                <Card key={item.rank} className={`glass-card border-white/10 overflow-hidden hover:border-yellow-500/30 transition-all ${item.rank === 1 ? "lg:col-span-1 ring-1 ring-yellow-500/30" : ""}`}>
                  <div className="relative">
                    <img src={item.img} alt={item.title} className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className={`absolute top-3 left-3 text-xs ${item.badge} border-0`}>{item.badgeLabel}</Badge>
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-sm font-bold px-3 py-1 rounded-full">{item.price}</div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {item.creator[0]}
                        </div>
                        <span className="text-white text-sm font-medium">{item.creator}</span>
                      </div>
                      <Badge className="text-xs bg-black/40 text-white border-0">{item.type}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-pink-400" />{item.likes}</span>
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-blue-400" />{item.views}</span>
                      <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied to clipboard!"); }}>
                        <Share2 className="w-4 h-4 text-green-400" />Share
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0 text-sm"
                        onClick={() => { toast.success(`Added "${item.title}" to cart!`); }}>
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Buy Now
                      </Button>
                      <Button variant="outline" size="icon" className="border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={() => { toast.info(`Preview for "${item.title}" — full player coming soon!`); }}>
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Rising Creators */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              📈 Fastest Rising Creators
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {RISING_CREATORS.map(({ name, type, growth, followers, img }) => (
                <Card key={name} className="glass-card border-white/10 p-4 text-center hover:border-green-500/30 transition-all cursor-pointer"
                  onClick={() => navigate("/vendor")}>
                  <img src={img} alt={name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover ring-2 ring-green-500/30" />
                  <div className="font-semibold text-white text-sm mb-1">{name}</div>
                  <div className="text-xs text-gray-400 mb-2">{type}</div>
                  <Badge className="bg-green-500/20 text-green-300 border-0 text-xs mb-2">{growth} this week</Badge>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Users className="w-3 h-3" />{followers}
                  </div>
                  <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600 text-white border-0 text-xs h-7"
                    onClick={(e) => { e.stopPropagation(); toast.success(`Now following ${name}! 🎉`); }}>
                    Follow
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Weekly Best Sellers */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Weekly Best Sellers</h3>
              </div>
              <div className="space-y-3">
                {WEEKLY_BEST.map(({ rank, name, type, revenue, badge }) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate("/vendor")}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? "bg-yellow-500 text-black" : rank === 2 ? "bg-gray-400 text-black" : rank === 3 ? "bg-amber-700 text-white" : "bg-white/10 text-gray-300"}`}>
                        {rank}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {name[0]}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{name}</div>
                        <div className="text-xs text-gray-400">{type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{revenue}</div>
                      <div className="text-xs text-gray-400">{badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Get Featured CTA */}
            <Card className="glass-card border-white/10 p-6 bg-gradient-to-br from-yellow-600/10 to-amber-600/10 flex flex-col justify-between">
              <div>
                <Star className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Get Featured in Tomorrow's Spotlight
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Our AI curates the best content daily. Upload your best work, get community votes,
                  and you could be featured to 100,000+ users tomorrow.
                </p>
                <div className="space-y-2 mb-6">
                  {["Upload high-quality content in Creator Studio", "Get likes and shares from the community", "AI selects top performers each day", "Featured creators see 10x sales spike"].map(step => (
                    <div key={step} className="flex items-center gap-2 text-sm text-gray-300">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white border-0"
                onClick={() => navigate("/studio")}>
                <Star className="w-4 h-4 mr-2" />
                Start Creating Now
              </Button>
            </Card>
          </div>
        </div>

        {/* Ad Revenue + Spotlight Integration Banner */}
        <div className="container mt-8 pb-10 space-y-6">
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
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-lg">⚡</span>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Spotlight Powered By</h2>
              <a href="/integrations" className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 hover:bg-blue-500/30 transition-colors">View All 200+ Integrations</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: "CrewAI", desc: "AI Curation", url: "https://www.crewai.com", color: "text-purple-400" },
                { name: "Suno AI", desc: "Music Gen", url: "https://suno.com", color: "text-pink-400" },
                { name: "Runway ML", desc: "Video Gen", url: "https://runwayml.com", color: "text-blue-400" },
                { name: "NovelAI", desc: "Story Gen", url: "https://novelai.net", color: "text-cyan-400" },
                { name: "Midjourney", desc: "Art Gen", url: "https://www.midjourney.com", color: "text-indigo-400" },
                { name: "ElevenLabs", desc: "Voice Gen", url: "https://elevenlabs.io", color: "text-green-400" },
                { name: "Udio", desc: "Music AI", url: "https://www.udio.com", color: "text-amber-400" },
                { name: "Pika Labs", desc: "Video AI", url: "https://pika.art", color: "text-orange-400" },
                { name: "Leonardo AI", desc: "Art AI", url: "https://leonardo.ai", color: "text-yellow-400" },
                { name: "Canva", desc: "Design", url: "https://www.canva.com", color: "text-teal-400" },
                { name: "Google AdSense", desc: "Ad Revenue", url: "https://adsense.google.com", color: "text-sky-400" },
                { name: "Outfy", desc: "Social Auto", url: "https://outfy.com", color: "text-rose-400" },
                { name: "DMCA.com", desc: "Copyright", url: "https://www.dmca.com", color: "text-red-400" },
                { name: "Stripe", desc: "Payments", url: "https://stripe.com", color: "text-emerald-400" },
                { name: "n8n", desc: "Automation", url: "https://n8n.io", color: "text-lime-400" },
                { name: "Algolia", desc: "Search", url: "https://www.algolia.com", color: "text-violet-400" },
              ].map(({ name, desc, url, color }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  className="glass-card border-white/10 rounded-xl p-3 text-center hover:border-amber-500/30 transition-all group cursor-pointer block">
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
