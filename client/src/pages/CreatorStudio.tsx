import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Music, Video, BookOpen, PenTool, Upload, Download, Copyright,
  Mic, Image, FileText, Sparkles, Play, Pause, SkipForward,
  Volume2, Wand2, Bot, Zap, Star, TrendingUp, DollarSign,
  ChevronRight, Info
} from "lucide-react";

const STUDIO_TOOLS = [
  {
    id: "music", icon: Music, label: "AI Music Studio", color: "text-purple-400", bg: "from-purple-600/20 to-blue-600/20",
    badge: "Suno AI + AudioCraft",
    tools: ["AI Song Generator (Suno AI)", "Beat & Rhythm Creator (AudioCraft)", "AI Song Mashup Tool", "Stem Separator", "Lyrics Writer AI", "Vocal Remover", "Audio Equalizer", "MP3/WAV Export"],
    desc: "Generate full songs, beats, and mashups with AI. Upload your own audio, remix tracks, and publish to the marketplace."
  },
  {
    id: "video", icon: Video, label: "AI Video Studio", color: "text-blue-400", bg: "from-blue-600/20 to-cyan-600/20",
    badge: "Runway ML + FFmpeg",
    tools: ["AI Video Generator (Runway ML)", "Video Editor (FFmpeg)", "AI Subtitle Generator", "Screen Recorder", "Thumbnail Creator", "Video Compressor", "Format Converter", "YouTube/TikTok Export"],
    desc: "Generate stunning AI videos, edit footage, add subtitles, and publish to the marketplace or social platforms."
  },
  {
    id: "writing", icon: PenTool, label: "Writing Workshop", color: "text-cyan-400", bg: "from-cyan-600/20 to-teal-600/20",
    badge: "TipTap + Ghost CMS",
    tools: ["AI Blog Writer", "Short Story Generator", "Academic Paper Assistant", "Forum Post Creator", "SEO Content Optimizer", "Grammar & Style Checker", "Plagiarism Detector", "Markdown Editor"],
    desc: "Write blogs, short stories, academic papers, forum posts, and educational content with AI assistance."
  },
  {
    id: "ebook", icon: BookOpen, label: "eBook Publisher", color: "text-green-400", bg: "from-green-600/20 to-teal-600/20",
    badge: "Calibre + Pandoc",
    tools: ["AI eBook Generator", "Chapter Outline Builder", "Cover Designer", "EPUB/PDF Exporter (Calibre)", "ISBN Generator", "Copyright Registration", "Kindle Direct Publishing Link", "Pricing Calculator"],
    desc: "Generate, design, and publish eBooks. Export to EPUB, PDF, or MOBI. Sell directly on NEXUS or link to Amazon KDP."
  },
  {
    id: "upload", icon: Upload, label: "Content Upload", color: "text-orange-400", bg: "from-orange-600/20 to-yellow-600/20",
    badge: "S3 + CDN",
    tools: ["Photo Upload (JPG/PNG/WebP)", "Video Upload (MP4/MOV)", "Audio Upload (MP3/WAV/FLAC)", "Document Upload (PDF/DOCX)", "ZIP/Archive Upload", "Bulk Upload Tool", "Auto-Watermark", "CDN Distribution"],
    desc: "Upload any file type. Auto-watermarked, CDN-distributed, and ready to sell in minutes."
  },
  {
    id: "copyright", icon: Copyright, label: "Copyright & Legal", color: "text-yellow-400", bg: "from-yellow-600/20 to-amber-600/20",
    badge: "DMCA + CC Licenses",
    tools: ["Auto-Copyright Registration", "Creative Commons Licensing", "DMCA Takedown Tool", "Watermark Generator", "Digital Fingerprinting", "License Agreement Generator", "Royalty Tracker", "Dispute Resolution"],
    desc: "Protect your work automatically. Register copyright, apply licenses, and track royalties on every sale."
  },
];

const FEATURED_CREATORS = [
  { name: "SynthWave_AI", type: "Music", earnings: "$2,847", badge: "Top Seller" },
  { name: "VisualForge", type: "Video", earnings: "$1,923", badge: "Rising Star" },
  { name: "AIAuthor", type: "eBooks", earnings: "$4,102", badge: "Best Writer" },
  { name: "PixelMage", type: "Art", earnings: "$987", badge: "New Creator" },
];

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState("music");
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTool = STUDIO_TOOLS.find(t => t.id === activeTab) || STUDIO_TOOLS[0];

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className={`bg-gradient-to-r ${activeTool.bg} border-b border-white/10 py-8`}>
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30">Creator Studio</Badge>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your Creative Workspace
                </h1>
                <p className="text-gray-400 text-sm">All free tools. Create, publish, and sell your content.</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gradient-gold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>$847</div>
                  <div className="text-xs text-gray-400">Your Earnings</div>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
                  onClick={() => toast.success("Opening Vendor Portal to list your content!")}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell Your Work
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-6">
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Main Studio */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="glass-card border border-white/10 h-auto p-1 flex flex-wrap gap-1 mb-6 bg-transparent">
                  {STUDIO_TOOLS.map(({ id, icon: Icon, label, color }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="hidden sm:inline">{label.split(" ")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {STUDIO_TOOLS.map(({ id, icon: Icon, label, color, bg, badge, tools, desc }) => (
                  <TabsContent key={id} value={id} className="space-y-4">
                    {/* Tool Header */}
                    <Card className="glass-card border-white/10 p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                          <Icon className={`w-7 h-7 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</h2>
                            <Badge className="text-xs bg-white/10 text-gray-300 border-0">{badge}</Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">{desc}</p>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                            onClick={() => toast.success(`Opening ${label}! All tools are free.`)}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Launch {label.split(" ")[0]} Studio
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Tools Grid */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {tools.map((tool) => (
                        <Card key={tool} className="glass-card border-white/10 p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
                          onClick={() => toast.info(`${tool} — Free tool, launching soon!`)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 bg-gradient-to-br ${bg} rounded-lg flex items-center justify-center`}>
                                <Sparkles className={`w-4 h-4 ${color}`} />
                              </div>
                              <span className="text-sm text-gray-200">{tool}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-gray-500 group-hover:${color} group-hover:translate-x-1 transition-all`} />
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Music Player Demo (only for music tab) */}
                    {id === "music" && (
                      <Card className="glass-card border-white/10 p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-semibold text-white">AI Generated Preview</span>
                          <Badge className="text-xs bg-green-500/20 text-green-300 border-0">Demo Track</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Neon Dreamscape — Track 1</div>
                            <div className="text-xs text-gray-400">Generated in 12 seconds · 3:47</div>
                            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-1/3" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white w-8 h-8"
                              onClick={() => toast.info("Previous track")}>
                              <SkipForward className="w-4 h-4 rotate-180" />
                            </Button>
                            <Button size="icon" className="bg-purple-600 hover:bg-purple-500 text-white w-10 h-10 rounded-full"
                              onClick={() => { setIsPlaying(!isPlaying); toast.info(isPlaying ? "Paused" : "Playing AI track!"); }}>
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white w-8 h-8"
                              onClick={() => toast.info("Next track")}>
                              <SkipForward className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white w-8 h-8"
                              onClick={() => toast.info("Volume control")}>
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Tutorial */}
                    <Card className="glass-card border-white/10 p-4 border-l-2 border-l-blue-500">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-white mb-1">Quick Tutorial</div>
                          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                            <li>Choose your tool from the options above</li>
                            <li>Create or upload your content</li>
                            <li>Apply AI enhancements and effects</li>
                            <li>Set your price and publish to the marketplace</li>
                            <li>Earn on every sale — automatically deposited to your account</li>
                          </ol>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* AI Assistant */}
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white text-sm">AI Studio Assistant</span>
                  <span className="w-2 h-2 bg-green-400 rounded-full pulse-live ml-auto" />
                </div>
                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    "I can help you create music, write content, generate videos, and publish your work.
                    What would you like to create today?"
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-sm"
                  onClick={() => toast.info("AI Assistant — Launching soon!")}>
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  Ask AI Assistant
                </Button>
              </Card>

              {/* Top Creators */}
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-white text-sm">Top Earning Creators</span>
                </div>
                <div className="space-y-3">
                  {FEATURED_CREATORS.map(({ name, type, earnings, badge }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {name[0]}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{name}</div>
                          <div className="text-xs text-gray-400">{type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gradient-gold">{earnings}</div>
                        <Badge className="text-xs bg-white/10 text-gray-300 border-0">{badge}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Revenue Calculator */}
              <Card className="glass-card border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-white text-sm">Revenue Potential</span>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Music Track @ $4.99", sales: "100 sales", earn: "$349" },
                    { label: "eBook @ $12.99", sales: "50 sales", earn: "$552" },
                    { label: "Video @ $9.99", sales: "75 sales", earn: "$599" },
                  ].map(({ label, sales, earn }) => (
                    <div key={label} className="bg-white/5 rounded-lg p-2.5">
                      <div className="text-xs text-gray-300 mb-1">{label}</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{sales}</span>
                        <span className="text-green-400 font-bold">{earn} to you</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:bg-white/10 text-sm"
                  onClick={() => toast.info("Full revenue calculator — Coming soon!")}>
                  Calculate Your Earnings
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
