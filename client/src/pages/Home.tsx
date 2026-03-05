import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { toast } from "sonner";
import {
  Music, Video, BookOpen, ShoppingBag, Store, Star, Zap, ArrowRight,
  Users, TrendingUp, DollarSign, Globe, Shield, Cpu, Play, Heart,
  MessageCircle, Share2, Eye, ChevronRight, Sparkles, Mic, PenTool,
  Upload, Download, Copyright, BarChart3, Bot, Rocket
} from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/hero-main-bGeN2xJHdBchxH78yg7oeE.webp";
const CREATOR_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/creator-studio-YN7xx46xuNtGAGfmivGB2f.webp";
const MARKET_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/marketplace-hero-YcLnwee9UYmUqxagHRjGWB.webp";
const FEED_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/social-feed-QhASQ8TDoD9rr2LrNyEutY.webp";
const SPOTLIGHT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/spotlight-hero-TYMSMXEemkZgFMLGmvjTMV.webp";

const TICKER_ITEMS = [
  "🎵 AI Music Generation — Create full songs in seconds",
  "🎬 AI Video Studio — Generate & edit videos with AI",
  "📚 eBook Publisher — Write & sell your books instantly",
  "🛒 Dropship Marketplace — 50,000+ products auto-listed",
  "⭐ Daily Spotlight — Get featured to 100K+ users",
  "💰 Earn on Every Sale — Automated profit deposits",
  "🤖 5 AI Agents — Running your store 24/7",
  "🎤 AI Song Mashup — Remix any track with AI",
  "✍️ Writing Workshop — Blog, forum, stories & more",
  "🏪 Vendor Portal — Open your shop in 60 seconds",
];

const FEATURES = [
  { icon: Music, label: "AI Music Studio", desc: "Generate full songs, beats, and mashups with AI", color: "text-purple-400", bg: "bg-purple-500/10", href: "/studio" },
  { icon: Video, label: "Video Creator", desc: "AI video generation and professional editing tools", color: "text-blue-400", bg: "bg-blue-500/10", href: "/studio" },
  { icon: PenTool, label: "Writing Workshop", desc: "Blogs, stories, eBooks, and educational content", color: "text-cyan-400", bg: "bg-cyan-500/10", href: "/studio" },
  { icon: BookOpen, label: "eBook Publisher", desc: "Generate, publish, and sell eBooks instantly", color: "text-green-400", bg: "bg-green-500/10", href: "/studio" },
  { icon: ShoppingBag, label: "Dropship Market", desc: "50,000+ products auto-listed and fulfilled", color: "text-yellow-400", bg: "bg-yellow-500/10", href: "/marketplace" },
  { icon: Store, label: "Vendor Portal", desc: "Open your storefront and sell your creations", color: "text-orange-400", bg: "bg-orange-500/10", href: "/vendor" },
  { icon: Star, label: "Daily Spotlight", desc: "Get featured and reach thousands of new fans", color: "text-amber-400", bg: "bg-amber-500/10", href: "/spotlight" },
  { icon: Rss2, label: "Social Feed", desc: "Share, discover, and connect with creators", color: "text-pink-400", bg: "bg-pink-500/10", href: "/feed" },
];

function Rss2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

const STATS = [
  { value: "50K+", label: "Products Listed", icon: ShoppingBag },
  { value: "5", label: "AI Agents Active", icon: Bot },
  { value: "∞", label: "Creator Tools", icon: Sparkles },
  { value: "24/7", label: "Fully Automated", icon: Cpu },
];

const REVENUE_STREAMS = [
  { icon: ShoppingBag, title: "Dropshipping Sales", pct: "50–150%", desc: "Margin on every product sold" },
  { icon: Store, title: "Vendor Commissions", pct: "10–20%", desc: "Cut from every vendor sale" },
  { icon: TrendingUp, title: "Auction Fees", pct: "5–10%", desc: "On every winning bid" },
  { icon: DollarSign, title: "Listing Fees", pct: "$0.50–$5", desc: "Per P2P listing posted" },
  { icon: Globe, title: "Ad Revenue", pct: "Passive", desc: "Google AdSense + affiliate" },
  { icon: Music, title: "Content Sales", pct: "15–30%", desc: "Platform cut on creator content" },
];

const TRENDING_CONTENT = [
  { type: "Music", title: "Neon Dreamscape EP", creator: "SynthWave_AI", likes: "2.4K", views: "18K", price: "$4.99", color: "from-purple-600 to-blue-600" },
  { type: "Video", title: "AI City Timelapse", creator: "VisualForge", likes: "1.8K", views: "24K", price: "$9.99", color: "from-blue-600 to-cyan-600" },
  { type: "eBook", title: "Prompt Engineering Bible", creator: "AIAuthor", likes: "3.1K", views: "41K", price: "$12.99", color: "from-green-600 to-teal-600" },
  { type: "Art", title: "Cosmic Portraits Pack", creator: "PixelMage", likes: "987", views: "9.2K", price: "$7.99", color: "from-pink-600 to-purple-600" },
];

const AI_AGENTS = [
  { name: "CEO Agent", time: "8PM CT Daily", task: "Reviews KPIs, sends profit report", status: "active" },
  { name: "Product Manager", time: "6AM CT Daily", task: "Imports 50 trending products", status: "active" },
  { name: "Marketing Agent", time: "12PM CT Daily", task: "Posts to 5 social platforms", status: "active" },
  { name: "Vendor Manager", time: "Continuous", task: "Approves vendors, moderates listings", status: "active" },
  { name: "Finance Agent", time: "8:30PM CT Daily", task: "Deposits profit to your account", status: "active" },
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => (prev + 1) % TICKER_ITEMS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />

      {/* Live Ticker */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-blue-600/20 border-b border-blue-500/20 overflow-hidden">
        <div className="flex items-center">
          <div className="shrink-0 bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">LIVE</div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-animate flex gap-16 py-1 px-4 whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="text-xs text-blue-200 shrink-0">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl float-anim" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl float-anim" style={{ animationDelay: "3s" }} />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm px-4 py-1.5 inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full pulse-live" />
              Fully Autonomous AI Marketplace — Live Now
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The World's First
              <br />
              <span className="text-gradient-rainbow">AI Social Marketplace</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create music, videos, eBooks, and more with AI. Sell to millions. Connect with creators.
              Run entirely by AI agents — <strong className="text-white">zero manual work required.</strong>
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 text-base px-8 glow-blue"
                onClick={() => toast.success("Welcome to NEXUS! Sign-up launching very soon.")}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating Free
              </Button>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="glass-card rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">Everything You Need</Badge>
            <h2 className="text-4xl font-bold text-gradient-blue mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              One Platform. Infinite Possibilities.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Create, sell, discover, and connect — all powered by AI and running autonomously 24/7.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color, bg, href }) => (
              <Link key={label} href={href}>
                <Card className="glass-card border-white/10 p-5 hover:border-blue-500/40 transition-all group cursor-pointer hover:scale-105">
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
                  <ChevronRight className={`w-3 h-3 ${color} mt-2 group-hover:translate-x-1 transition-transform`} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Studio Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">Creator Studio</Badge>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Your AI-Powered
                <br />
                <span className="text-gradient-rainbow">Creative Workspace</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Everything a creator needs in one place. Generate music with AI, edit videos, write eBooks,
                publish blogs, and sell your work — all with free, integrated tools.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: Music, text: "AI Music & Song Generation (Suno AI, AudioCraft, MusicGen)" },
                  { icon: Video, text: "AI Video Generation & Editing (Runway, CapCut, FFmpeg)" },
                  { icon: PenTool, text: "Writing Workshop — Blogs, Stories, Academic Papers" },
                  { icon: BookOpen, text: "eBook Generator & Publisher (Calibre, Pandoc, epub.js)" },
                  { icon: Upload, text: "Upload Photos, Videos, Audio & Files" },
                  { icon: Copyright, text: "Auto-Copyright & DMCA Protection" },
                  { icon: Download, text: "Download, Watermark & Distribute" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-300">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/studio">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                  Open Creator Studio <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden glow-purple">
                <img src={CREATOR_IMG} alt="Creator Studio" className="w-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 glass-card rounded-xl p-4 neon-border-blue">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">AI generating your track...</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Feed Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden glow-blue">
                <img src={FEED_IMG} alt="Social Feed" className="w-full object-cover" />
              </div>
              <div className="absolute -top-4 -left-4 glass-card rounded-xl p-3 neon-border-gold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-live" />
                  <span className="text-xs text-gray-300">1,247 creators online</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">Social Feed</Badge>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                A Social Network
                <br />
                <span className="text-gradient-blue">Built for Creators</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                A Facebook-style social experience designed for creators and buyers.
                Share your work, discover trending content, chat with fans, and sell — all in one feed.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Rss2, label: "Newsfeed", desc: "Personalized content stream" },
                  { icon: TrendingUp, label: "Trending", desc: "What's hot right now" },
                  { icon: MessageCircle, label: "Chat", desc: "Direct messages & groups" },
                  { icon: Eye, label: "Stories", desc: "24-hour content previews" },
                  { icon: Heart, label: "Reactions", desc: "Like, love, and share" },
                  { icon: ShoppingBag, label: "Buy Direct", desc: "Purchase from the feed" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="glass-card rounded-lg p-3 flex items-start gap-2">
                    <Icon className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/feed">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                  Explore the Feed <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Content */}
      <section className="py-20 relative">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge className="mb-2 bg-amber-500/20 text-amber-300 border-amber-500/30">Trending Now</Badge>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Hot Content Today
              </h2>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRENDING_CONTENT.map((item) => (
              <Card key={item.title} className="glass-card border-white/10 overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => toast.info(`"${item.title}" — Available in Marketplace`)}>
                <div className={`h-32 bg-gradient-to-br ${item.color} flex items-center justify-center relative`}>
                  <Play className="w-10 h-10 text-white/80 group-hover:scale-110 transition-transform" />
                  <Badge className="absolute top-2 left-2 text-xs bg-black/40 text-white border-0">{item.type}</Badge>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">{item.price}</div>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-white text-sm mb-1 truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 mb-3">by {item.creator}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" />{item.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-400" />{item.views}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-green-400" />Share</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Marketplace</Badge>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Shop, Sell & Auction
                <br />
                <span className="text-gradient-gold">Everything Imaginable</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                A virtual mall combining Amazon dropshipping, eBay auctions, Facebook Marketplace peer-to-peer sales,
                and a digital content store — all in one place.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Dropship Products", value: "50K+" },
                  { label: "Active Vendors", value: "1,200+" },
                  { label: "Daily Auctions", value: "340+" },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card rounded-xl p-4 text-center neon-border-gold">
                    <div className="text-2xl font-bold text-gradient-gold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
              <Link href="/marketplace">
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0">
                  Browse Marketplace <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden glow-gold">
                <img src={MARKET_IMG} alt="Marketplace" className="w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">Revenue Engine</Badge>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              6 Revenue Streams.
              <br />
              <span className="text-gradient-gold">All Automated.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every sale, every click, every listing — profit flows automatically to your account 24/7.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVENUE_STREAMS.map(({ icon: Icon, title, pct, desc }) => (
              <Card key={title} className="glass-card border-white/10 p-6 hover:border-green-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">{title}</div>
                    <div className="text-xl font-bold text-gradient-gold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{pct}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="py-20 relative">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">AI Workforce</Badge>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              5 AI Agents.
              <br />
              <span className="text-gradient-blue">Running Everything.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {AI_AGENTS.map((agent) => (
              <Card key={agent.name} className="glass-card border-white/10 p-5 text-center hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 glow-blue">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full pulse-live" />
                  <span className="text-xs text-green-400 font-medium">ACTIVE</span>
                </div>
                <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{agent.name}</div>
                <div className="text-xs text-blue-400 mb-2">{agent.time}</div>
                <div className="text-xs text-gray-400">{agent.task}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden glow-gold">
                <img src={SPOTLIGHT_IMG} alt="Daily Spotlight" className="w-full object-cover" />
              </div>
            </div>
            <div>
              <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">Daily Spotlight</Badge>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Your Moment
                <br />
                <span className="text-gradient-gold">In the Spotlight</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Every day, our AI curates the most impressive, creative, and popular content.
                Featured creators get massive exposure — and a surge in sales.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "🏆 Most Creative Content of the Day",
                  "🔥 Most Popular by Community Votes",
                  "⭐ Editor's Pick by AI Curation",
                  "📈 Fastest Rising Creator",
                  "💎 Best-Selling Vendor of the Week",
                ].map(cat => (
                  <div key={cat} className="flex items-center gap-3 glass-card rounded-lg px-4 py-2.5">
                    <span className="text-sm text-gray-200">{cat}</span>
                  </div>
                ))}
              </div>
              <Link href="/spotlight">
                <Button className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-0">
                  <Star className="w-4 h-4 mr-2" />
                  See Today's Spotlight
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations teaser */}
      <section className="py-20 relative">
        <div className="container">
          <div className="glass-card rounded-3xl p-10 text-center neon-border-blue">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-3 h-3 mr-1" /> 200+ Integrations
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Powered by the World's Best
              <br />
              <span className="text-gradient-blue">AI Tools & APIs</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              MCP servers, GitHub repos, AI agents, free APIs, social platforms, payment processors —
              all integrated and running autonomously.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {["CrewAI", "n8n", "Shopify", "Stripe Connect", "CJDropshipping", "Suno AI", "Runway ML",
                "Google AdSense", "Brevo", "Outfy", "Growave", "Webkul", "Calibre", "Pandoc", "FFmpeg",
                "AudioCraft", "Meta MusicGen", "TipTap", "Ghost CMS", "Discourse"].map(tool => (
                <Badge key={tool} variant="outline" className="text-xs border-white/20 text-gray-300">{tool}</Badge>
              ))}
            </div>
            <Link href="/integrations">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                View All Integrations <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10" />
        <div className="container relative z-10 text-center">
          <h2 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Build Your
            <br />
            <span className="text-gradient-rainbow">Autonomous Empire?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
            Join NEXUS today. Create, sell, and earn — while AI handles everything else.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 text-lg px-10 py-6 glow-blue"
              onClick={() => toast.success("You're on the waitlist! We'll notify you at launch.")}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Join the Waitlist — Free
            </Button>
            <Link href="/vendor">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-10 py-6">
                <Store className="w-5 h-5 mr-2" />
                Open Your Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NEXUS</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                The world's first fully autonomous AI-powered social content marketplace.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Social Feed", "Creator Studio", "Marketplace", "Vendor Portal", "Spotlight"] },
              { title: "Create", links: ["AI Music", "AI Video", "Writing Workshop", "eBook Publisher", "Upload Content"] },
              { title: "Earn", links: ["Dropshipping", "Sell Content", "Auctions", "Affiliate Program", "Ad Revenue"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div className="font-semibold text-white text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
                <div className="space-y-2">
                  {links.map(link => (
                    <div key={link} className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors"
                      onClick={() => toast.info(`${link} — Coming soon!`)}>{link}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">© 2026 NEXUS Marketplace. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-500">Secured by AI. Powered by automation.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
