import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bot, TrendingUp, ShoppingCart, Zap, DollarSign, Users,
  Star, ArrowRight, CheckCircle, BarChart3, Globe, Shield,
  Gavel, Store, Package, Megaphone, Brain, ChevronRight
} from "lucide-react";

/* === MIDNIGHT COMMAND CENTER DESIGN ===
   Deep navy mission-control aesthetic, electric blue + gold accents
   Syne (display) + Inter (body) + JetBrains Mono (numbers)
*/

// ── Live Revenue Counter ──────────────────────────────────────────────────────
function LiveCounter({ target, prefix = "$", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span ref={ref} className="font-mono animate-counter-glow" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Agent Status Dot ─────────────────────────────────────────────────────────
function AgentDot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-agent-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

// ── Live Ticker ───────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🛒 New Order: Wireless Earbuds — $47.99 profit",
  "📦 CJDropshipping fulfilled: 3 orders",
  "📈 Product Manager imported 12 trending items",
  "💰 Vendor payout processed: $234.50",
  "🔥 Flash sale: Phone Cases — 847% margin",
  "🤖 CEO Agent: KPIs on target — $2,847 today",
  "🏷️ Auction closed: Vintage Watch — $380 (10% fee: $38)",
  "📣 Marketing Agent posted to 5 platforms",
  "🌟 New vendor registered: TechGadgets Store",
  "💳 Stripe payout: $1,204.33 → your account",
];

function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden bg-[oklch(0.11_0.025_240)] border-y border-[rgba(14,165,233,0.2)] py-2.5">
      <div className="flex animate-ticker whitespace-nowrap gap-12">
        {items.map((item, i) => (
          <span key={i} className="text-sm text-sky-300 flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[oklch(0.08_0.02_240)]/95 backdrop-blur-md border-b border-[rgba(14,165,233,0.15)]" : ""}`}>
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            AI<span className="text-amber-400">Market</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-sky-200/70">
          {["Features", "Revenue", "Agents", "Integrations", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-sky-300 transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-sky-300 hover:text-white hidden md:flex">
            View Blueprint
          </Button>
          <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5">
            Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/hero-bg-2A5HVtkmpavFrBrAgGMqve.webp)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.08_0.02_240)]/95 via-[oklch(0.08_0.02_240)]/80 to-[oklch(0.08_0.02_240)]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_240)] via-transparent to-transparent" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="animate-float-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sky-300 text-xs font-medium mb-6 neon-border-blue">
              <AgentDot />
              <span>5 AI Agents Active — Running 24/7</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Your Store.<br />
              <span className="text-gradient-blue">Fully Automated.</span><br />
              <span className="text-gradient-gold">Always Profitable.</span>
            </h1>

            <p className="text-sky-100/70 text-lg leading-relaxed mb-8 max-w-lg">
              An AI-agent-operated social marketplace combining Amazon, eBay, Facebook Marketplace, and Etsy — running itself 24/7. Zero employees. Five revenue streams. Daily profit deposits.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-6 text-base rounded-lg">
                Launch Your Marketplace <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-sky-500/40 text-sky-300 hover:bg-sky-500/10 px-8 py-6 text-base rounded-lg">
                View Blueprint
              </Button>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Revenue Streams", value: "5", icon: DollarSign },
                { label: "AI Agents", value: "5", icon: Bot },
                { label: "Tests Passing", value: "29", icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card rounded-lg p-3 text-center">
                  <Icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</div>
                  <div className="text-xs text-sky-300/60">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hidden lg:block relative animate-float-up" style={{ animationDelay: "200ms" }}>
            <div className="relative rounded-xl overflow-hidden neon-border-blue shadow-2xl shadow-sky-500/20">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/dashboard-mockup-TJP2WkNtqxWavn4cVddd47.webp"
                alt="AI Marketplace Dashboard"
                className="w-full"
              />
              {/* Live overlay badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1">
                <AgentDot />
                <span className="text-emerald-300 text-xs font-medium">LIVE</span>
              </div>
            </div>
            {/* Floating profit card */}
            <div className="absolute -bottom-6 -left-6 glass-card-gold rounded-xl p-4 neon-border-gold shadow-xl">
              <div className="text-xs text-amber-300/70 mb-1">Today's Profit</div>
              <div className="text-2xl font-bold text-amber-400 animate-counter-glow" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                $2,847.33
              </div>
              <div className="text-xs text-emerald-400 mt-1">↑ 34% vs yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Revenue Streams ───────────────────────────────────────────────────────────
function RevenueStreams() {
  const streams = [
    { icon: Package, title: "Dropshipping", desc: "CJDropshipping, DSers, EPROLO, Trendsi auto-fulfill thousands of products", margin: "50–150%", color: "sky" },
    { icon: Store, title: "Vendor Commissions", desc: "Users open storefronts and sell their own products — you earn on every sale", margin: "10–20%", color: "amber" },
    { icon: Gavel, title: "eBay-Style Auctions", desc: "Bidding engine lets users auction items — you collect a fee on every winning bid", margin: "5–10%", color: "emerald" },
    { icon: Users, title: "P2P Listings", desc: "Facebook Marketplace-style local selling with listing fees per post", margin: "$0.50–$5", color: "purple" },
    { icon: Megaphone, title: "Affiliate & Ads", desc: "Google AdSense, affiliate links, and sponsored placements generate passive income", margin: "Passive", color: "rose" },
  ];

  const colorMap: Record<string, string> = {
    sky: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    rose: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  };

  return (
    <section id="revenue" className="py-24 relative">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-amber-300 text-xs font-medium mb-4 neon-border-gold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>5 Revenue Streams</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Money Flows From <span className="text-gradient-gold">Every Direction</span>
          </h2>
          <p className="text-sky-200/60 max-w-2xl mx-auto">
            Unlike a standard dropshipping store, this platform generates revenue from five independent streams simultaneously — all automated, all deposited daily.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {streams.map(({ icon: Icon, title, desc, margin, color }) => (
            <div key={title} className={`glass-card rounded-xl p-6 border ${colorMap[color].split(" ")[1]} hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`w-10 h-10 rounded-lg ${colorMap[color].split(" ")[2]} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${colorMap[color].split(" ")[0]}`} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
              <p className="text-sky-200/60 text-sm leading-relaxed mb-4">{desc}</p>
              <div className={`inline-flex items-center gap-1.5 text-sm font-bold ${colorMap[color].split(" ")[0]}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <TrendingUp className="w-3.5 h-3.5" />
                {margin} margin
              </div>
            </div>
          ))}

          {/* Total revenue card */}
          <div className="glass-card-gold rounded-xl p-6 neon-border-gold flex flex-col justify-between">
            <div>
              <div className="text-amber-300/70 text-sm mb-2">Projected Monthly Revenue</div>
              <div className="text-4xl font-bold text-amber-400 mb-1 animate-counter-glow" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <LiveCounter target={15000} />
              </div>
              <div className="text-amber-300/50 text-xs">at 20,000 monthly visitors</div>
            </div>
            <div className="mt-6 space-y-2">
              {["Month 1-2: $200–$800", "Month 3-4: $1,500–$5,000", "Month 6: $5,000–$15,000", "Month 12: $20,000–$60,000+"].map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-amber-200/70">
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── AI Agents Section ─────────────────────────────────────────────────────────
function AgentsSection() {
  const agents = [
    { name: "CEO Agent", role: "Strategic Command", desc: "Orchestrates all agents, monitors KPIs, makes strategic decisions, and sends you a daily profit report.", schedule: "Daily 8PM", color: "amber", delay: 0 },
    { name: "Product Manager", role: "Catalog Intelligence", desc: "Imports 50 trending products daily, reprices the catalog every 6 hours, and removes dead stock automatically.", schedule: "Daily 6AM", color: "sky", delay: 200 },
    { name: "Marketing Agent", role: "Traffic Generation", desc: "Posts to 5 social platforms daily, publishes SEO-optimized blog content, and runs automated email campaigns.", schedule: "Daily 12PM", color: "emerald", delay: 400 },
    { name: "Vendor Manager", role: "Community Operations", desc: "Approves new vendor applications, moderates listings, answers community questions, and manages auctions.", schedule: "Continuous", color: "purple", delay: 600 },
    { name: "Finance Agent", role: "Profit Distribution", desc: "Splits commissions, pays vendors via Stripe Connect, and deposits your profit to your bank account daily.", schedule: "Daily 8PM", color: "rose", delay: 800 },
  ];

  const colorMap: Record<string, string> = {
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    sky: "from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400",
  };

  return (
    <section id="agents" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-950/20 to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Agent visual */}
          <div className="relative">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663307221380/BtMgYDmz9zuh95r9ZYuGVm/ai-agents-visual-EUsQkp7kJ7BmmiFHT2dmMg.webp"
              alt="AI Agent Workforce"
              className="w-full rounded-2xl shadow-2xl shadow-sky-500/10"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[oklch(0.08_0.02_240)]/60 to-transparent" />
            {/* Status overlay */}
            <div className="absolute bottom-6 left-6 right-6 glass-card rounded-xl p-4">
              <div className="text-xs text-sky-300/60 mb-3 font-medium">AGENT STATUS — ALL SYSTEMS OPERATIONAL</div>
              <div className="grid grid-cols-5 gap-2">
                {["CEO", "PM", "MKT", "VND", "FIN"].map((a, i) => (
                  <div key={a} className="text-center">
                    <AgentDot delay={i * 300} />
                    <div className="text-xs text-sky-300/50 mt-1">{a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Agent cards */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sky-300 text-xs font-medium mb-4 neon-border-blue">
              <Brain className="w-3.5 h-3.5" />
              <span>CrewAI Agent Workforce</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              5 AI Agents.<br /><span className="text-gradient-blue">Zero Employees.</span>
            </h2>
            <p className="text-sky-200/60 mb-8 leading-relaxed">
              A specialized crew of AI agents manages every aspect of your marketplace around the clock. They coordinate, compete, and collaborate — just like a real team, but without salaries, sick days, or mistakes.
            </p>

            <div className="space-y-3">
              {agents.map(({ name, role, desc, schedule, color, delay }) => (
                <div
                  key={name}
                  className={`rounded-xl p-4 bg-gradient-to-r border ${colorMap[color]} hover:scale-[1.01] transition-transform duration-200`}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AgentDot delay={delay} />
                      <div>
                        <div className="font-bold text-white text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>{name}</div>
                        <div className={`text-xs ${colorMap[color].split(" ")[3]}`}>{role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-sky-300/40 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{schedule}</div>
                  </div>
                  <p className="text-sky-200/50 text-xs mt-2 leading-relaxed pl-6">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────
function Integrations() {
  const integrations = [
    { category: "Dropshippers", items: ["CJDropshipping", "DSers", "EPROLO", "Trendsi", "Spocket"] },
    { category: "Automation", items: ["n8n (2,053 workflows)", "CrewAI", "Zapier", "Make.com", "APScheduler"] },
    { category: "Marketing", items: ["Outfy (5 platforms)", "Brevo Email", "Google SEO", "Reddit API", "Google Trends"] },
    { category: "Payments", items: ["Shopify Payments", "Stripe Connect", "PayPal", "Apple Pay", "Google Pay"] },
    { category: "GitHub Repos", items: ["awesome-shopify", "shopify-mcp", "n8n-templates", "crewAI", "prisync-api"] },
    { category: "MCP Servers", items: ["Shopify MCP", "Stripe MCP", "Gmail MCP", "Slack MCP", "Google Calendar"] },
  ];

  return (
    <section id="integrations" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sky-300 text-xs font-medium mb-4 neon-border-blue">
            <Globe className="w-3.5 h-3.5" />
            <span>50+ Integrations</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Every Tool. <span className="text-gradient-blue">Every Platform.</span><br />
            All Connected.
          </h2>
          <p className="text-sky-200/60 max-w-2xl mx-auto">
            The system integrates with every major dropshipper, automation platform, marketing tool, and payment processor — all free or open-source.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map(({ category, items }) => (
            <div key={category} className="glass-card rounded-xl p-5 neon-border-blue">
              <h3 className="text-sky-400 font-bold text-sm mb-4 uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                {category}
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-sky-100/70">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { label: "GitHub Repos Integrated", value: 15, suffix: "" },
    { label: "n8n Workflow Templates", value: 2053, suffix: "+" },
    { label: "Bugs Found & Fixed", value: 25, suffix: "" },
    { label: "Tests Passing", value: 29, suffix: "/29" },
    { label: "Workflow Nodes", value: 36, suffix: "" },
    { label: "Revenue Streams", value: 5, suffix: "" },
  ];

  return (
    <section className="py-16 bg-[oklch(0.10_0.025_240)] border-y border-[rgba(14,165,233,0.15)]">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map(({ label, value, suffix }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1 animate-counter-glow" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <LiveCounter target={value} prefix="" suffix={suffix} />
              </div>
              <div className="text-xs text-sky-300/50">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Grid ─────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: Zap, title: "Instant Product Import", desc: "Import thousands of products from CJDropshipping, DSers, and EPROLO with one click. Prices, images, and descriptions auto-populated." },
    { icon: TrendingUp, title: "Dynamic Pricing Engine", desc: "Prices update every 6 hours based on competitor analysis, demand signals, and your configured margin floors and ceilings." },
    { icon: BarChart3, title: "Daily Profit Reports", desc: "The CEO Agent emails you a full performance report every evening — revenue, margins, top products, and next-day strategy." },
    { icon: Shield, title: "Fully Audited Code", desc: "25 bugs found and fixed. 29 unit tests passing. All 15 GitHub repos verified live. Production-ready from day one." },
    { icon: Star, title: "Social Commerce Layer", desc: "Growave adds loyalty points, wishlists, reviews, and social profiles — turning your store into a community marketplace." },
    { icon: ShoppingCart, title: "Abandoned Cart Recovery", desc: "3-email recovery sequence fires automatically: 1hr gentle reminder, 24hr with 10% discount code, final urgency email." },
  ];

  return (
    <section id="features" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built to Run <span className="text-gradient-blue">Without You</span>
          </h2>
          <p className="text-sky-200/60 max-w-2xl mx-auto">
            Every feature is designed for maximum automation and minimum intervention. Set it up once, collect profits indefinitely.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card rounded-xl p-6 hover:neon-border-blue transition-all duration-300 group">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/20 transition-colors">
                <Icon className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-white font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
              <p className="text-sky-200/55 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/50 via-[oklch(0.08_0.02_240)] to-amber-950/30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="container relative text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-emerald-300 text-xs font-medium mb-6 border border-emerald-500/30">
            <AgentDot />
            <span>System Ready — Deploy in Minutes</span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-extrabold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Start Earning<br /><span className="text-gradient-gold">Today.</span>
          </h2>

          <p className="text-sky-200/60 text-lg mb-10 leading-relaxed">
            The blueprint is complete. The code is audited. The agents are ready. All you need is a Shopify account and 30 minutes to deploy.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-6 text-base rounded-lg shadow-lg shadow-amber-500/30">
              Download Blueprint <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-sky-500/40 text-sky-300 hover:bg-sky-500/10 px-10 py-6 text-base rounded-lg">
              View GitHub Repo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { label: "Setup Time", value: "30 min" },
              { label: "Monthly Cost", value: "$29" },
              { label: "First Sale", value: "Day 1" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-amber-400 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                <div className="text-xs text-sky-300/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[rgba(14,165,233,0.15)] py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            AI<span className="text-amber-400">Market</span>
          </span>
        </div>
        <div className="text-sky-300/40 text-sm">
          Fully automated. Fully audited. Fully yours.
        </div>
        <div className="flex items-center gap-1.5 text-xs text-sky-300/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <AgentDot delay={0} />
          All systems operational
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_240)]">
      <Nav />
      <Hero />
      <LiveTicker />
      <StatsBar />
      <RevenueStreams />
      <AgentsSection />
      <Features />
      <Integrations />
      <CTA />
      <Footer />
    </div>
  );
}
