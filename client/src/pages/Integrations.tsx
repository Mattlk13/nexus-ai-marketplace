import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Zap, Bot, ShoppingBag, Music, Video, PenTool, DollarSign, Globe,
  Search, ExternalLink, Github, Star, Layers, Shield,
  Share2, BarChart3, Package, Cpu, Megaphone, Server
} from "lucide-react";

type Tool = { name: string; desc: string; url: string; badge: string; free: boolean };
type Category = {
  id: string; label: string; icon: React.ElementType; color: string;
  bg: string; border: string; tools: Tool[];
};

const CATEGORIES: Category[] = [
  {
    id: "ai-agents", label: "AI Agents & Frameworks", icon: Bot,
    color: "text-blue-400", bg: "from-blue-600/20 to-purple-600/20", border: "border-blue-500/20",
    tools: [
      { name: "CrewAI", desc: "Multi-agent orchestration — the core AI crew engine", url: "https://github.com/crewAIInc/crewAI", badge: "Core Engine", free: true },
      { name: "AutoGen (Microsoft)", desc: "Multi-agent conversation framework", url: "https://github.com/microsoft/autogen", badge: "Multi-Agent", free: true },
      { name: "LangChain", desc: "LLM application development framework", url: "https://github.com/langchain-ai/langchain", badge: "LLM Stack", free: true },
      { name: "LlamaIndex", desc: "Data framework for LLM applications & RAG", url: "https://github.com/run-llama/llama_index", badge: "RAG", free: true },
      { name: "Phidata", desc: "Build AI assistants with memory & tools", url: "https://github.com/phidatahq/phidata", badge: "AI Assistants", free: true },
      { name: "Haystack", desc: "Open-source LLM orchestration framework", url: "https://github.com/deepset-ai/haystack", badge: "Orchestration", free: true },
      { name: "Groq (Free API)", desc: "Ultra-fast LLM inference — free tier", url: "https://console.groq.com", badge: "Free LLM", free: true },
      { name: "Ollama", desc: "Run LLMs locally — completely free", url: "https://ollama.ai", badge: "Local LLM", free: true },
      { name: "Llama 3 (Meta)", desc: "Open-source LLM from Meta", url: "https://llama.meta.com", badge: "Open Source", free: true },
      { name: "Gemini (Google)", desc: "Google's multimodal AI — free tier", url: "https://ai.google.dev", badge: "Multimodal", free: true },
      { name: "Hugging Face", desc: "50,000+ free AI models and datasets", url: "https://huggingface.co", badge: "Model Hub", free: true },
      { name: "Mistral AI", desc: "Open-weight LLMs — free to self-host", url: "https://mistral.ai", badge: "Open Weight", free: true },
      { name: "Together AI", desc: "Run open-source models via API", url: "https://together.ai", badge: "API", free: true },
      { name: "Replicate", desc: "Run AI models in the cloud", url: "https://replicate.com", badge: "Cloud AI", free: true },
      { name: "Perplexity AI", desc: "AI-powered search and research", url: "https://www.perplexity.ai", badge: "Search AI", free: true },
      { name: "Flowise", desc: "Low-code LLM app builder", url: "https://github.com/FlowiseAI/Flowise", badge: "No-Code", free: true },
      { name: "AutoGPT", desc: "Autonomous AI task execution", url: "https://github.com/Significant-Gravitas/AutoGPT", badge: "Autonomous", free: true },
      { name: "OpenAI GPT-4", desc: "Most capable AI model for decisions", url: "https://platform.openai.com", badge: "LLM", free: false },
    ]
  },
  {
    id: "mcp-servers", label: "MCP Servers", icon: Server,
    color: "text-purple-400", bg: "from-purple-600/20 to-pink-600/20", border: "border-purple-500/20",
    tools: [
      { name: "Shopify MCP", desc: "Direct Shopify store control via AI agents", url: "https://github.com/GeLi2001/shopify-mcp", badge: "E-commerce", free: true },
      { name: "GitHub MCP", desc: "GitHub repo management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Dev Tools", free: true },
      { name: "Slack MCP", desc: "Slack messaging and channel management", url: "https://github.com/modelcontextprotocol/servers", badge: "Messaging", free: true },
      { name: "Gmail MCP", desc: "Gmail read/send via AI agents", url: "https://github.com/modelcontextprotocol/servers", badge: "Email", free: true },
      { name: "Google Calendar MCP", desc: "Calendar management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Productivity", free: true },
      { name: "Asana MCP", desc: "Project and task management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Project Mgmt", free: true },
      { name: "Stripe MCP", desc: "Payment processing via AI agents", url: "https://github.com/modelcontextprotocol/servers", badge: "Payments", free: true },
      { name: "PostgreSQL MCP", desc: "Database queries via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Database", free: true },
      { name: "Filesystem MCP", desc: "File system operations via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Files", free: true },
      { name: "Brave Search MCP", desc: "Web search via AI agents", url: "https://github.com/modelcontextprotocol/servers", badge: "Search", free: true },
      { name: "Puppeteer MCP", desc: "Browser automation via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Browser", free: true },
      { name: "Twitter/X MCP", desc: "Twitter posting and analytics via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Social", free: true },
      { name: "YouTube MCP", desc: "YouTube data and management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Video", free: true },
      { name: "Reddit MCP", desc: "Reddit posting and monitoring via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Social", free: true },
      { name: "Notion MCP", desc: "Notion workspace via AI agents", url: "https://github.com/modelcontextprotocol/servers", badge: "Productivity", free: true },
      { name: "AWS MCP", desc: "AWS cloud services via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Cloud", free: true },
      { name: "Docker MCP", desc: "Container management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "DevOps", free: true },
      { name: "Sentry MCP", desc: "Error monitoring via AI agents", url: "https://github.com/modelcontextprotocol/servers", badge: "Monitoring", free: true },
      { name: "Jira MCP", desc: "Jira issue tracking via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Dev Tools", free: true },
      { name: "Linear MCP", desc: "Linear project management via AI", url: "https://github.com/modelcontextprotocol/servers", badge: "Project Mgmt", free: true },
    ]
  },
  {
    id: "automation", label: "Automation & Workflows", icon: Zap,
    color: "text-yellow-400", bg: "from-yellow-600/20 to-orange-600/20", border: "border-yellow-500/20",
    tools: [
      { name: "n8n (Self-Hosted)", desc: "2,000+ workflow templates — completely free", url: "https://n8n.io", badge: "Core Automation", free: true },
      { name: "n8n Workflow Templates", desc: "2,053 ready-to-use n8n workflows on GitHub", url: "https://github.com/Danitilahun/n8n-workflow-templates", badge: "GitHub", free: true },
      { name: "Make (Integromat)", desc: "Visual workflow automation — free tier", url: "https://www.make.com", badge: "No-Code", free: true },
      { name: "Zapier", desc: "Connect 6,000+ apps — free tier", url: "https://zapier.com", badge: "Integrations", free: true },
      { name: "Activepieces", desc: "Open-source Zapier alternative", url: "https://github.com/activepieces/activepieces", badge: "Open Source", free: true },
      { name: "Huginn", desc: "Self-hosted automation agents", url: "https://github.com/huginn/huginn", badge: "Self-Hosted", free: true },
      { name: "Node-RED", desc: "Flow-based programming for automation", url: "https://nodered.org", badge: "Visual", free: true },
      { name: "Pipedream", desc: "Serverless integration platform — free tier", url: "https://pipedream.com", badge: "Serverless", free: true },
      { name: "Automatisch", desc: "Open-source business automation", url: "https://github.com/automatisch/automatisch", badge: "Open Source", free: true },
      { name: "Trigger.dev", desc: "Background jobs and scheduled tasks", url: "https://trigger.dev", badge: "Jobs", free: true },
      { name: "Temporal", desc: "Durable workflow execution engine", url: "https://temporal.io", badge: "Workflows", free: true },
      { name: "Apache Airflow", desc: "Platform to programmatically schedule workflows", url: "https://airflow.apache.org", badge: "Scheduling", free: true },
      { name: "Windmill", desc: "Open-source workflow engine", url: "https://windmill.dev", badge: "Open Source", free: true },
      { name: "Prefect", desc: "Modern workflow orchestration", url: "https://www.prefect.io", badge: "Orchestration", free: true },
    ]
  },
  {
    id: "dropshipping", label: "Dropshipping & Products", icon: ShoppingBag,
    color: "text-green-400", bg: "from-green-600/20 to-teal-600/20", border: "border-green-500/20",
    tools: [
      { name: "CJDropshipping", desc: "1M+ products, free to use, auto-fulfillment", url: "https://cjdropshipping.com", badge: "Primary Supplier", free: true },
      { name: "DSers (AliExpress)", desc: "Official AliExpress dropshipping tool", url: "https://www.dsers.com", badge: "AliExpress", free: true },
      { name: "Spocket", desc: "US/EU suppliers, fast shipping", url: "https://www.spocket.co", badge: "US/EU", free: true },
      { name: "EPROLO", desc: "Free dropshipping with branding", url: "https://eprolo.com", badge: "Branding", free: true },
      { name: "Trendsi", desc: "Fashion dropshipping — free", url: "https://trendsi.com", badge: "Fashion", free: true },
      { name: "Printful", desc: "Print-on-demand dropshipping", url: "https://www.printful.com", badge: "Print-on-Demand", free: true },
      { name: "Printify", desc: "Print-on-demand with 800+ products", url: "https://printify.com", badge: "Print-on-Demand", free: true },
      { name: "Modalyst", desc: "Dropshipping marketplace", url: "https://modalyst.co", badge: "Marketplace", free: true },
      { name: "Zendrop", desc: "US-based dropshipping", url: "https://zendrop.com", badge: "US-Based", free: true },
      { name: "Syncee", desc: "B2B dropshipping marketplace", url: "https://syncee.com", badge: "B2B", free: true },
      { name: "Wholesale2B", desc: "1M+ wholesale products", url: "https://www.wholesale2b.com", badge: "Wholesale", free: true },
      { name: "Oberlo (Shopify)", desc: "Shopify's native dropshipping app", url: "https://apps.shopify.com/oberlo", badge: "Shopify", free: true },
      { name: "AutoDS", desc: "Automated dropshipping tool", url: "https://www.autods.com", badge: "Automation", free: false },
      { name: "Inventory Source", desc: "Automated inventory management", url: "https://www.inventorysource.com", badge: "Inventory", free: false },
    ]
  },
  {
    id: "marketing", label: "Marketing & SEO", icon: Megaphone,
    color: "text-pink-400", bg: "from-pink-600/20 to-rose-600/20", border: "border-pink-500/20",
    tools: [
      { name: "Outfy", desc: "Auto-post to 10 social platforms — free", url: "https://outfy.com", badge: "Social Auto-Post", free: true },
      { name: "Buffer", desc: "Social media scheduling — free tier", url: "https://buffer.com", badge: "Scheduling", free: true },
      { name: "Hootsuite", desc: "Social media management — free tier", url: "https://hootsuite.com", badge: "Management", free: true },
      { name: "Brevo (Sendinblue)", desc: "Email marketing — 300 emails/day free", url: "https://www.brevo.com", badge: "Email", free: true },
      { name: "Mailchimp", desc: "Email marketing — 500 contacts free", url: "https://mailchimp.com", badge: "Email", free: true },
      { name: "Google Analytics 4", desc: "Free website analytics", url: "https://analytics.google.com", badge: "Analytics", free: true },
      { name: "Google Search Console", desc: "Free SEO monitoring tool", url: "https://search.google.com/search-console", badge: "SEO", free: true },
      { name: "Ahrefs Webmaster Tools", desc: "Free SEO audit and backlink checker", url: "https://ahrefs.com/webmaster-tools", badge: "SEO Free", free: true },
      { name: "Ubersuggest", desc: "Free SEO keyword research", url: "https://neilpatel.com/ubersuggest", badge: "Keywords", free: true },
      { name: "Google AdSense", desc: "Monetize with display ads — free", url: "https://adsense.google.com", badge: "Ad Revenue", free: true },
      { name: "Meta Ads Manager", desc: "Facebook & Instagram advertising", url: "https://www.facebook.com/adsmanager", badge: "Paid Ads", free: true },
      { name: "TikTok Ads", desc: "TikTok advertising platform", url: "https://ads.tiktok.com", badge: "Paid Ads", free: true },
      { name: "Pinterest Ads", desc: "Pinterest advertising platform", url: "https://ads.pinterest.com", badge: "Paid Ads", free: true },
      { name: "Klaviyo", desc: "E-commerce email & SMS marketing", url: "https://www.klaviyo.com", badge: "E-commerce Email", free: true },
      { name: "Omnisend", desc: "E-commerce marketing automation", url: "https://www.omnisend.com", badge: "Automation", free: true },
      { name: "Semrush", desc: "SEO and content marketing platform", url: "https://www.semrush.com", badge: "SEO", free: false },
    ]
  },
  {
    id: "payments", label: "Payments & Finance", icon: DollarSign,
    color: "text-emerald-400", bg: "from-emerald-600/20 to-green-600/20", border: "border-emerald-500/20",
    tools: [
      { name: "Stripe Connect", desc: "Split payments to vendors automatically", url: "https://stripe.com/connect", badge: "Core Payments", free: true },
      { name: "PayPal", desc: "Global payments — 200+ countries", url: "https://www.paypal.com", badge: "Global", free: true },
      { name: "Stripe Checkout", desc: "Hosted payment pages — no code needed", url: "https://stripe.com/payments/checkout", badge: "Checkout", free: true },
      { name: "Coinbase Commerce", desc: "Accept crypto payments — free", url: "https://commerce.coinbase.com", badge: "Crypto", free: true },
      { name: "Square", desc: "Point of sale and online payments", url: "https://squareup.com", badge: "POS + Online", free: true },
      { name: "Wise (TransferWise)", desc: "International bank transfers", url: "https://wise.com", badge: "International", free: true },
      { name: "Lemon Squeezy", desc: "Sell digital products — free to start", url: "https://www.lemonsqueezy.com", badge: "Digital Products", free: true },
      { name: "Gumroad", desc: "Sell digital products — free tier", url: "https://gumroad.com", badge: "Digital Sales", free: true },
      { name: "Paddle", desc: "Revenue delivery platform", url: "https://www.paddle.com", badge: "Revenue", free: true },
      { name: "Amazon Associates", desc: "Affiliate product links", url: "https://affiliate-program.amazon.com", badge: "Affiliate", free: true },
      { name: "ShareASale", desc: "Affiliate marketing network", url: "https://www.shareasale.com", badge: "Affiliate", free: true },
      { name: "Google AdSense", desc: "Display ad revenue — passive income", url: "https://adsense.google.com", badge: "Ad Revenue", free: true },
    ]
  },
  {
    id: "content-creation", label: "AI Content Creation", icon: Music,
    color: "text-violet-400", bg: "from-violet-600/20 to-purple-600/20", border: "border-violet-500/20",
    tools: [
      { name: "Suno AI", desc: "Generate full songs with AI — free tier", url: "https://suno.com", badge: "AI Music", free: true },
      { name: "Udio", desc: "AI music generation platform", url: "https://udio.com", badge: "AI Music", free: true },
      { name: "AudioCraft (Meta)", desc: "Open-source AI music generation", url: "https://github.com/facebookresearch/audiocraft", badge: "Open Source", free: true },
      { name: "Demucs (Facebook)", desc: "AI stem separation — open source", url: "https://github.com/facebookresearch/demucs", badge: "Audio AI", free: true },
      { name: "Runway ML", desc: "AI video generation and editing", url: "https://runwayml.com", badge: "AI Video", free: true },
      { name: "Pika Labs", desc: "AI video generation from text", url: "https://pika.art", badge: "AI Video", free: true },
      { name: "Stable Diffusion", desc: "Open-source AI image generation", url: "https://stability.ai", badge: "AI Images", free: true },
      { name: "Adobe Firefly", desc: "AI image generation — free tier", url: "https://firefly.adobe.com", badge: "AI Images", free: true },
      { name: "Canva AI", desc: "AI design and image editing — free", url: "https://www.canva.com", badge: "Design", free: true },
      { name: "ElevenLabs", desc: "AI voice cloning and text-to-speech", url: "https://elevenlabs.io", badge: "AI Voice", free: true },
      { name: "Whisper (OpenAI)", desc: "Free speech-to-text transcription", url: "https://github.com/openai/whisper", badge: "Transcription", free: true },
      { name: "NovelAI", desc: "AI writing and story generation", url: "https://novelai.net", badge: "Writing AI", free: true },
      { name: "Copy.ai", desc: "AI marketing copy generator — free tier", url: "https://www.copy.ai", badge: "Copywriting", free: true },
      { name: "Writesonic", desc: "AI content writer — free tier", url: "https://writesonic.com", badge: "Content", free: true },
      { name: "DALL-E 3 (OpenAI)", desc: "High-quality AI image generation", url: "https://openai.com/dall-e-3", badge: "AI Images", free: false },
      { name: "Midjourney", desc: "Premium AI art generation", url: "https://www.midjourney.com", badge: "AI Art", free: false },
    ]
  },
  {
    id: "social-platforms", label: "Social Media Platforms", icon: Share2,
    color: "text-sky-400", bg: "from-sky-600/20 to-blue-600/20", border: "border-sky-500/20",
    tools: [
      { name: "Facebook / Meta", desc: "2.9B users — marketplace, groups, ads", url: "https://www.facebook.com/marketplace", badge: "2.9B Users", free: true },
      { name: "Instagram", desc: "1.4B users — visual content & shopping", url: "https://www.instagram.com", badge: "1.4B Users", free: true },
      { name: "TikTok", desc: "1B users — viral short-form video", url: "https://www.tiktok.com", badge: "1B Users", free: true },
      { name: "YouTube", desc: "2.7B users — video monetization", url: "https://www.youtube.com", badge: "2.7B Users", free: true },
      { name: "Pinterest", desc: "450M users — visual discovery & shopping", url: "https://www.pinterest.com", badge: "450M Users", free: true },
      { name: "Twitter/X", desc: "350M users — real-time engagement", url: "https://twitter.com", badge: "350M Users", free: true },
      { name: "LinkedIn", desc: "900M users — B2B and professional", url: "https://www.linkedin.com", badge: "B2B", free: true },
      { name: "Reddit", desc: "50M daily users — niche communities", url: "https://www.reddit.com", badge: "Communities", free: true },
      { name: "Discord", desc: "Community building and engagement", url: "https://discord.com", badge: "Community", free: true },
      { name: "Telegram", desc: "Channels and bots for marketing", url: "https://telegram.org", badge: "Channels", free: true },
      { name: "Snapchat", desc: "375M users — AR and stories", url: "https://www.snapchat.com", badge: "Stories", free: true },
      { name: "Twitch", desc: "Live streaming and creator monetization", url: "https://www.twitch.tv", badge: "Live Stream", free: true },
    ]
  },
  {
    id: "github-repos", label: "GitHub Repositories", icon: Github,
    color: "text-gray-300", bg: "from-gray-600/20 to-slate-600/20", border: "border-gray-500/20",
    tools: [
      { name: "awesome-shopify", desc: "Curated list of Shopify tools and resources", url: "https://github.com/julionc/awesome-shopify", badge: "Shopify", free: true },
      { name: "n8n-workflow-templates", desc: "2,053 ready-to-use automation workflows", url: "https://github.com/Danitilahun/n8n-workflow-templates", badge: "Automation", free: true },
      { name: "crewAI", desc: "Framework for orchestrating AI agents", url: "https://github.com/crewAIInc/crewAI", badge: "AI Agents", free: true },
      { name: "shopify-mcp", desc: "Shopify MCP server for AI control", url: "https://github.com/GeLi2001/shopify-mcp", badge: "MCP", free: true },
      { name: "MCP Servers (Official)", desc: "Official Model Context Protocol servers", url: "https://github.com/modelcontextprotocol/servers", badge: "MCP", free: true },
      { name: "audiocraft", desc: "Meta's AI audio generation library", url: "https://github.com/facebookresearch/audiocraft", badge: "AI Music", free: true },
      { name: "demucs", desc: "Music source separation by Facebook", url: "https://github.com/facebookresearch/demucs", badge: "Audio AI", free: true },
      { name: "whisper", desc: "OpenAI's speech recognition model", url: "https://github.com/openai/whisper", badge: "Speech AI", free: true },
      { name: "stable-diffusion-webui", desc: "Stable Diffusion web interface", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui", badge: "Image AI", free: true },
      { name: "langchain", desc: "LLM application development framework", url: "https://github.com/langchain-ai/langchain", badge: "LLM", free: true },
      { name: "autogen", desc: "Microsoft's multi-agent conversation framework", url: "https://github.com/microsoft/autogen", badge: "Multi-Agent", free: true },
      { name: "activepieces", desc: "Open-source automation platform", url: "https://github.com/activepieces/activepieces", badge: "Automation", free: true },
      { name: "huginn", desc: "Self-hosted automation agents", url: "https://github.com/huginn/huginn", badge: "Automation", free: true },
      { name: "UVR (Vocal Remover)", desc: "Ultimate vocal remover GUI", url: "https://github.com/Anjok07/ultimatevocalremovergui", badge: "Audio", free: true },
      { name: "phidata", desc: "Build AI assistants with memory", url: "https://github.com/phidatahq/phidata", badge: "AI Assistants", free: true },
      { name: "haystack", desc: "Open-source LLM orchestration", url: "https://github.com/deepset-ai/haystack", badge: "LLM", free: true },
    ]
  },
  {
    id: "ecommerce", label: "E-commerce & Store", icon: Package,
    color: "text-orange-400", bg: "from-orange-600/20 to-amber-600/20", border: "border-orange-500/20",
    tools: [
      { name: "Shopify", desc: "The #1 e-commerce platform", url: "https://www.shopify.com", badge: "Core Platform", free: false },
      { name: "Growave", desc: "Social login, reviews, loyalty — free tier", url: "https://apps.shopify.com/growave", badge: "Social Commerce", free: true },
      { name: "Webkul Multi-Vendor", desc: "Multi-vendor marketplace for Shopify", url: "https://apps.shopify.com/webkul-multivendor-marketplace", badge: "Multi-Vendor", free: false },
      { name: "Bid Online Auction", desc: "eBay-style auctions on Shopify", url: "https://apps.shopify.com/bid-online-auction", badge: "Auctions", free: true },
      { name: "Prisync", desc: "Competitor price monitoring", url: "https://prisync.com", badge: "Pricing", free: true },
      { name: "Judge.me Reviews", desc: "Product reviews — free plan", url: "https://apps.shopify.com/judgeme", badge: "Reviews", free: true },
      { name: "Tidio Live Chat", desc: "AI chatbot and live chat — free", url: "https://apps.shopify.com/tidio-live-chat", badge: "Chat", free: true },
      { name: "ReConvert Upsell", desc: "Post-purchase upsells", url: "https://apps.shopify.com/reconvert-upsell-cross-sell", badge: "Upsell", free: true },
      { name: "Smile.io Loyalty", desc: "Loyalty and rewards program", url: "https://apps.shopify.com/smile-io", badge: "Loyalty", free: true },
      { name: "Yotpo", desc: "Reviews, loyalty, and SMS", url: "https://apps.shopify.com/yotpo-social-reviews", badge: "Reviews", free: true },
      { name: "Shipstation", desc: "Multi-carrier shipping automation", url: "https://www.shipstation.com", badge: "Shipping", free: true },
      { name: "Klaviyo (Shopify)", desc: "E-commerce email marketing", url: "https://apps.shopify.com/klaviyo-email-marketing", badge: "Email", free: true },
    ]
  },
  {
    id: "analytics", label: "Analytics & Monitoring", icon: BarChart3,
    color: "text-cyan-400", bg: "from-cyan-600/20 to-teal-600/20", border: "border-cyan-500/20",
    tools: [
      { name: "Google Analytics 4", desc: "Free website and e-commerce analytics", url: "https://analytics.google.com", badge: "Free", free: true },
      { name: "Hotjar", desc: "Heatmaps and session recordings — free tier", url: "https://www.hotjar.com", badge: "UX Analytics", free: true },
      { name: "Mixpanel", desc: "Product analytics — free tier", url: "https://mixpanel.com", badge: "Product", free: true },
      { name: "PostHog", desc: "Open-source product analytics", url: "https://posthog.com", badge: "Open Source", free: true },
      { name: "Plausible Analytics", desc: "Privacy-friendly analytics — open source", url: "https://plausible.io", badge: "Privacy", free: true },
      { name: "Grafana", desc: "Open-source metrics visualization", url: "https://grafana.com", badge: "Metrics", free: true },
      { name: "Sentry", desc: "Error tracking and performance monitoring", url: "https://sentry.io", badge: "Errors", free: true },
      { name: "Uptime Robot", desc: "Free website uptime monitoring", url: "https://uptimerobot.com", badge: "Uptime", free: true },
      { name: "Crisp Analytics", desc: "Customer analytics and chat", url: "https://crisp.chat", badge: "Customer", free: true },
      { name: "Datadog", desc: "Infrastructure monitoring — free tier", url: "https://www.datadoghq.com", badge: "Infrastructure", free: true },
    ]
  },
  {
    id: "security", label: "Security & Infrastructure", icon: Shield,
    color: "text-red-400", bg: "from-red-600/20 to-orange-600/20", border: "border-red-500/20",
    tools: [
      { name: "Cloudflare", desc: "Free CDN, DDoS protection, and DNS", url: "https://www.cloudflare.com", badge: "CDN + Security", free: true },
      { name: "Let's Encrypt", desc: "Free SSL/TLS certificates", url: "https://letsencrypt.org", badge: "SSL Free", free: true },
      { name: "Auth0", desc: "Identity and authentication — free tier", url: "https://auth0.com", badge: "Auth", free: true },
      { name: "Supabase Auth", desc: "Open-source authentication", url: "https://supabase.com/auth", badge: "Auth", free: true },
      { name: "Vault (HashiCorp)", desc: "Secrets management — open source", url: "https://www.vaultproject.io", badge: "Secrets", free: true },
      { name: "Snyk", desc: "Security vulnerability scanning — free tier", url: "https://snyk.io", badge: "Scanning", free: true },
      { name: "OWASP ZAP", desc: "Free web app security scanner", url: "https://www.zaproxy.org", badge: "Scanner", free: true },
      { name: "Fail2Ban", desc: "Intrusion prevention system", url: "https://www.fail2ban.org", badge: "IPS", free: true },
    ]
  },
];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.tools.length, 0);

export default function Integrations() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t =>
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.badge.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat =>
    (activeCategory === "all" || cat.id === activeCategory) &&
    (search === "" || cat.tools.length > 0)
  );

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border-b border-white/10 py-10">
          <div className="container text-center">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-3 h-3 mr-1" /> Complete Integration Stack
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {TOTAL}+ Integrations
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Every AI agent, MCP server, GitHub repo, API, automation tool, social platform, and service powering NEXUS — all free or open-source where possible.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {[
                { label: `${CATEGORIES.length} Categories`, icon: Layers },
                { label: "200+ Free Tools", icon: Star },
                { label: "24/7 Automated", icon: Zap },
                { label: "AI-Powered", icon: Bot },
              ].map(({ label, icon: Icon }) => (
                <Badge key={label} variant="outline" className="border-white/20 text-gray-300 px-3 py-1.5">
                  <Icon className="w-3 h-3 mr-1.5" />{label}
                </Badge>
              ))}
            </div>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        <div className="container mt-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              size="sm"
              variant={activeCategory === "all" ? "default" : "outline"}
              className={activeCategory === "all" ? "bg-blue-600 text-white border-0" : "border-white/20 text-gray-300 hover:bg-white/5"}
              onClick={() => setActiveCategory("all")}
            >
              All ({TOTAL})
            </Button>
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                size="sm"
                variant={activeCategory === cat.id ? "default" : "outline"}
                className={activeCategory === cat.id ? "bg-blue-600 text-white border-0" : "border-white/20 text-gray-300 hover:bg-white/5"}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label.split(" ")[0]} ({cat.tools.length})
              </Button>
            ))}
          </div>

          {/* Integration Grids */}
          <div className="space-y-10">
            {filtered.map(({ id, label, icon: Icon, color, bg, border, tools }) =>
              tools.length > 0 && (
                <div key={id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 bg-gradient-to-br ${bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</h2>
                      <p className="text-xs text-gray-400">{tools.length} integrations</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {tools.map(tool => (
                      <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
                        <Card className={`glass-card ${border} p-4 hover:bg-white/5 transition-all cursor-pointer group h-full`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors leading-tight">{tool.name}</div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-3">{tool.desc}</p>
                          <div className="flex items-center justify-between">
                            <Badge className="text-xs bg-white/10 text-gray-300 border-0">{tool.badge}</Badge>
                            <Badge className={`text-xs border-0 ${tool.free ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                              {tool.free ? "Free" : "Paid"}
                            </Badge>
                          </div>
                        </Card>
                      </a>
                    ))}
                  </div>
                </div>
              )
            )}

            {filtered.every(cat => cat.tools.length === 0) && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No integrations found for "{search}"</p>
                <Button variant="outline" className="mt-4 border-white/20 text-gray-300" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 glass-card rounded-3xl p-10 text-center neon-border-blue">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Bot className="w-3 h-3 mr-1" /> Fully Automated
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              All Integrations Run Automatically
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              5 AI agents connect and orchestrate all these tools 24/7. Products import, prices update, content posts, and profits deposit — automatically.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/vendor">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  <Zap className="w-4 h-4 mr-2" />
                  Open Your Store
                </Button>
              </Link>
              <Link href="/studio">
                <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5">
                  <Music className="w-4 h-4 mr-2" />
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
