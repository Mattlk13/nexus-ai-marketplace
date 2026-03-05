import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Zap, Bot, Globe, Music, Video, BookOpen, ShoppingBag, DollarSign,
  BarChart3, Shield, Cpu, GitBranch, Server, Webhook, Code, ArrowRight,
  CheckCircle, ExternalLink
} from "lucide-react";

const INTEGRATION_CATEGORIES = [
  {
    id: "ai-agents", icon: Bot, label: "AI Agents & Frameworks", color: "text-blue-400", bg: "from-blue-600/20 to-purple-600/20",
    tools: [
      { name: "CrewAI", desc: "Multi-agent orchestration framework", status: "active", link: "https://github.com/joaomdmoura/crewAI" },
      { name: "n8n", desc: "2,000+ workflow automation templates", status: "active", link: "https://n8n.io" },
      { name: "LangChain", desc: "LLM application framework", status: "active", link: "https://langchain.com" },
      { name: "AutoGPT", desc: "Autonomous AI task execution", status: "planned", link: "https://github.com/Significant-Gravitas/AutoGPT" },
      { name: "AgentGPT", desc: "Browser-based AI agent deployment", status: "planned", link: "https://agentgpt.reworkd.ai" },
      { name: "Flowise", desc: "Low-code LLM app builder", status: "active", link: "https://github.com/FlowiseAI/Flowise" },
    ]
  },
  {
    id: "mcp", icon: Server, label: "MCP Servers", color: "text-purple-400", bg: "from-purple-600/20 to-pink-600/20",
    tools: [
      { name: "Shopify MCP", desc: "Direct Shopify store control via AI", status: "active", link: "https://github.com/GeLi2001/shopify-mcp" },
      { name: "Stripe MCP", desc: "Payment processing automation", status: "active", link: "https://github.com/stripe/agent-toolkit" },
      { name: "Slack MCP", desc: "Team notifications & alerts", status: "active", link: "https://github.com/modelcontextprotocol/servers" },
      { name: "Gmail MCP", desc: "Email automation & campaigns", status: "active", link: "https://github.com/modelcontextprotocol/servers" },
      { name: "Google Calendar MCP", desc: "Schedule & task automation", status: "active", link: "https://github.com/modelcontextprotocol/servers" },
      { name: "GitHub MCP", desc: "Code repo management", status: "planned", link: "https://github.com/modelcontextprotocol/servers" },
    ]
  },
  {
    id: "music", icon: Music, label: "Music & Audio AI", color: "text-pink-400", bg: "from-pink-600/20 to-purple-600/20",
    tools: [
      { name: "Suno AI", desc: "Full song generation with lyrics", status: "active", link: "https://suno.ai" },
      { name: "AudioCraft (Meta)", desc: "Open-source music & audio gen", status: "active", link: "https://github.com/facebookresearch/audiocraft" },
      { name: "MusicGen", desc: "Text-to-music generation", status: "active", link: "https://github.com/facebookresearch/audiocraft" },
      { name: "Demucs", desc: "AI stem separator & vocal remover", status: "active", link: "https://github.com/facebookresearch/demucs" },
      { name: "Whisper", desc: "OpenAI speech-to-text transcription", status: "active", link: "https://github.com/openai/whisper" },
      { name: "Udio", desc: "AI music generation platform", status: "planned", link: "https://udio.com" },
    ]
  },
  {
    id: "video", icon: Video, label: "Video & Image AI", color: "text-cyan-400", bg: "from-cyan-600/20 to-blue-600/20",
    tools: [
      { name: "Runway ML", desc: "AI video generation & editing", status: "active", link: "https://runwayml.com" },
      { name: "FFmpeg", desc: "Video processing & conversion", status: "active", link: "https://ffmpeg.org" },
      { name: "Stable Diffusion", desc: "Open-source image generation", status: "active", link: "https://github.com/CompVis/stable-diffusion" },
      { name: "CapCut API", desc: "Video editing automation", status: "planned", link: "https://capcut.com" },
      { name: "Pika Labs", desc: "Text-to-video generation", status: "planned", link: "https://pika.art" },
      { name: "DALL-E 3", desc: "OpenAI image generation", status: "active", link: "https://openai.com/dall-e-3" },
    ]
  },
  {
    id: "publishing", icon: BookOpen, label: "Publishing & Writing", color: "text-green-400", bg: "from-green-600/20 to-teal-600/20",
    tools: [
      { name: "Calibre", desc: "eBook creation & conversion", status: "active", link: "https://calibre-ebook.com" },
      { name: "Pandoc", desc: "Universal document converter", status: "active", link: "https://pandoc.org" },
      { name: "TipTap", desc: "Rich text editor for web", status: "active", link: "https://tiptap.dev" },
      { name: "Ghost CMS", desc: "Publishing platform & blog engine", status: "active", link: "https://ghost.org" },
      { name: "epub.js", desc: "eBook reader & renderer", status: "active", link: "https://github.com/futurepress/epub.js" },
      { name: "Discourse", desc: "Community forum platform", status: "planned", link: "https://discourse.org" },
    ]
  },
  {
    id: "ecommerce", icon: ShoppingBag, label: "E-Commerce & Dropshipping", color: "text-yellow-400", bg: "from-yellow-600/20 to-orange-600/20",
    tools: [
      { name: "Shopify", desc: "E-commerce platform foundation", status: "active", link: "https://shopify.com" },
      { name: "CJDropshipping", desc: "50,000+ products, free to use", status: "active", link: "https://cjdropshipping.com" },
      { name: "DSers", desc: "AliExpress dropshipping automation", status: "active", link: "https://dsers.com" },
      { name: "EPROLO", desc: "Free dropshipping & branding", status: "active", link: "https://eprolo.com" },
      { name: "Trendsi", desc: "Fashion dropshipping", status: "active", link: "https://trendsi.com" },
      { name: "Spocket", desc: "US/EU supplier network", status: "planned", link: "https://spocket.co" },
    ]
  },
  {
    id: "marketing", icon: Globe, label: "Marketing & SEO", color: "text-orange-400", bg: "from-orange-600/20 to-red-600/20",
    tools: [
      { name: "Outfy", desc: "Auto-post to 5 social platforms", status: "active", link: "https://outfy.com" },
      { name: "Brevo (Sendinblue)", desc: "Free email marketing (300/day)", status: "active", link: "https://brevo.com" },
      { name: "Buffer", desc: "Social media scheduling", status: "active", link: "https://buffer.com" },
      { name: "Google Analytics 4", desc: "Traffic & conversion tracking", status: "active", link: "https://analytics.google.com" },
      { name: "Semrush API", desc: "SEO keyword research", status: "planned", link: "https://semrush.com" },
      { name: "Mailchimp", desc: "Email campaigns & automation", status: "planned", link: "https://mailchimp.com" },
    ]
  },
  {
    id: "payments", icon: DollarSign, label: "Payments & Revenue", color: "text-emerald-400", bg: "from-emerald-600/20 to-green-600/20",
    tools: [
      { name: "Stripe Connect", desc: "Vendor payouts & commissions", status: "active", link: "https://stripe.com/connect" },
      { name: "Google AdSense", desc: "Display ad revenue", status: "active", link: "https://adsense.google.com" },
      { name: "PayPal", desc: "Alternative payment method", status: "planned", link: "https://paypal.com" },
      { name: "Coinbase Commerce", desc: "Crypto payment acceptance", status: "planned", link: "https://commerce.coinbase.com" },
      { name: "Amazon Associates", desc: "Affiliate product links", status: "active", link: "https://affiliate-program.amazon.com" },
      { name: "ShareASale", desc: "Affiliate marketing network", status: "planned", link: "https://shareasale.com" },
    ]
  },
  {
    id: "github", icon: GitBranch, label: "GitHub Repositories", color: "text-gray-300", bg: "from-gray-600/20 to-slate-600/20",
    tools: [
      { name: "awesome-shopify", desc: "Curated Shopify tools & resources", status: "active", link: "https://github.com/julionc/awesome-shopify" },
      { name: "n8n-workflow-templates", desc: "2,053 ready-to-use workflows", status: "active", link: "https://github.com/Danitilahun/n8n-workflow-templates" },
      { name: "shopify-mcp", desc: "Shopify MCP server for AI agents", status: "active", link: "https://github.com/GeLi2001/shopify-mcp" },
      { name: "crewAI", desc: "Multi-agent AI framework", status: "active", link: "https://github.com/joaomdmoura/crewAI" },
      { name: "audiocraft", desc: "Meta AI music generation", status: "active", link: "https://github.com/facebookresearch/audiocraft" },
      { name: "ai-sales-agent", desc: "Autonomous sales agent", status: "active", link: "https://github.com/filip-michalsky/SalesGPT" },
    ]
  },
];

const AUTOMATION_STATS = [
  { label: "Integrations", value: "200+", icon: Zap },
  { label: "GitHub Repos", value: "15+", icon: GitBranch },
  { label: "MCP Servers", value: "6", icon: Server },
  { label: "AI Agents", value: "5", icon: Bot },
];

export default function Integrations() {
  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/10 py-8">
          <div className="container">
            <Badge className="mb-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-3 h-3 mr-1" /> AI Integration Stack
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The Full Automation Stack
            </h1>
            <p className="text-gray-400 text-sm">Every tool, API, MCP server, and GitHub repo powering NEXUS autonomously</p>
          </div>
        </div>

        <div className="container mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AUTOMATION_STATS.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="glass-card border-white/10 p-4 text-center">
                <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </Card>
            ))}
          </div>

          {/* Integration Categories */}
          {INTEGRATION_CATEGORIES.map(({ id, icon: Icon, label, color, bg, tools }) => (
            <Card key={id} className="glass-card border-white/10 overflow-hidden">
              <div className={`bg-gradient-to-r ${bg} p-5 border-b border-white/10`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</h3>
                    <p className="text-xs text-gray-400">{tools.filter(t => t.status === "active").length} active · {tools.filter(t => t.status === "planned").length} planned</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map(({ name, desc, status, link }) => (
                    <div key={name} className="flex items-start justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{name}</span>
                          <Badge className={`text-xs border-0 shrink-0 ${status === "active" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                            {status === "active" ? "✓ Active" : "Planned"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{desc}</p>
                      </div>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="ml-2 text-gray-500 hover:text-blue-400 transition-colors shrink-0"
                        onClick={(e) => { e.stopPropagation(); }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {/* Automation Architecture */}
          <Card className="glass-card border-white/10 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>How It All Works Together</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "1", title: "AI Agents (CrewAI)", desc: "5 specialized agents manage every task — products, marketing, finance, vendors, and strategy", icon: Bot },
                { step: "2", title: "n8n Workflows", desc: "2,000+ automation templates connect all tools and trigger actions based on events", icon: Webhook },
                { step: "3", title: "MCP Servers", desc: "6 MCP servers give AI agents direct control over Shopify, Stripe, Gmail, and more", icon: Server },
                { step: "4", title: "Revenue Deposits", desc: "Stripe Connect automatically splits commissions and deposits profit to your bank daily", icon: DollarSign },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-blue-500/30">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-xs text-blue-400 font-bold mb-1">STEP {step}</div>
                  <div className="font-semibold text-white text-sm mb-2">{title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
