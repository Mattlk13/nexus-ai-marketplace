import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Music, Video, BookOpen, PenTool, Upload, Download, Copyright,
  Image, Sparkles, Play, Pause, SkipForward,
  Volume2, Wand2, Bot, Zap, Star, TrendingUp, DollarSign,
  ChevronRight, Info, Trash2, Eye, Globe, Lock, FileText,
  CheckCircle, AlertCircle, Loader2, X, Plus
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedFile {
  id: number;
  fileName: string;
  originalName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  fileCategory: "music" | "video" | "ebook" | "image" | "document" | "other";
  title: string | null;
  description: string | null;
  isPublished: boolean;
  price: string;
  isFree: boolean;
  downloadCount: number;
  createdAt: string;
}

interface UploadState {
  file: File | null;
  title: string;
  description: string;
  price: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg: string;
  previewUrl: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED: Record<string, string> = {
  music: "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/aac,audio/x-m4a",
  video: "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo",
  ebook: "application/pdf,application/epub+zip",
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  document: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
};

const MAX_SIZES: Record<string, number> = {
  music: 200 * 1024 * 1024,   // 200 MB
  video: 500 * 1024 * 1024,   // 500 MB
  ebook: 50 * 1024 * 1024,    // 50 MB
  image: 20 * 1024 * 1024,    // 20 MB
  document: 50 * 1024 * 1024, // 50 MB
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "music": return <Music className="w-4 h-4 text-purple-400" />;
    case "video": return <Video className="w-4 h-4 text-blue-400" />;
    case "ebook": return <BookOpen className="w-4 h-4 text-green-400" />;
    case "image": return <Image className="w-4 h-4 text-pink-400" />;
    case "document": return <FileText className="w-4 h-4 text-yellow-400" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
}

// ─── Upload Panel Component ───────────────────────────────────────────────────
function UploadPanel({ category }: { category: string }) {
  const [state, setState] = useState<UploadState>({
    file: null, title: "", description: "", price: "0",
    progress: 0, status: "idle", errorMsg: "", previewUrl: null,
  });
  const [myFiles, setMyFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchMyFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/upload/my-files", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.files as UploadedFile[]).filter(f => f.fileCategory === category || category === "upload");
        setMyFiles(filtered);
      }
    } catch {
      // silently fail — user may not be logged in
    } finally {
      setLoadingFiles(false);
    }
  }, [category]);

  useEffect(() => { fetchMyFiles(); }, [fetchMyFiles]);

  const handleFileDrop = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const maxSize = MAX_SIZES[category] ?? 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max size for ${category}: ${formatBytes(maxSize)}`);
      return;
    }
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setState(s => ({
      ...s, file, previewUrl,
      title: s.title || file.name.replace(/\.[^.]+$/, ""),
      status: "idle", errorMsg: "",
    }));
  };

  const handleUpload = async () => {
    if (!state.file) return;
    setState(s => ({ ...s, status: "uploading", progress: 0, errorMsg: "" }));

    const formData = new FormData();
    formData.append("file", state.file);
    formData.append("title", state.title || state.file.name);
    formData.append("description", state.description);
    formData.append("price", state.price || "0");

    try {
      // Simulate progress using a timer (XHR would give real progress)
      const progressInterval = setInterval(() => {
        setState(s => ({ ...s, progress: Math.min(s.progress + 10, 85) }));
      }, 300);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }

      setState(s => ({ ...s, progress: 100, status: "success" }));
      toast.success(`"${state.title || state.file!.name}" uploaded successfully!`);
      await fetchMyFiles();

      // Reset form after short delay
      setTimeout(() => {
        setState({ file: null, title: "", description: "", price: "0", progress: 0, status: "idle", errorMsg: "", previewUrl: null });
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setState(s => ({ ...s, status: "error", errorMsg: msg, progress: 0 }));
      toast.error(msg);
    }
  };

  const handleTogglePublish = async (fileId: number) => {
    try {
      const res = await fetch(`/api/upload/${fileId}/publish`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchMyFiles();
      toast.success("Visibility updated!");
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/upload/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMyFiles(f => f.filter(x => x.id !== fileId));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const accepted = ACCEPTED[category] ?? "*/*";

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <Card
        className={`glass-card border-2 border-dashed transition-all cursor-pointer ${
          dragOver ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-blue-500/50"
        } p-8 text-center`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileDrop(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accepted}
          onChange={e => handleFileDrop(e.target.files)}
        />
        {state.file ? (
          <div className="flex flex-col items-center gap-3">
            {state.previewUrl ? (
              <img src={state.previewUrl} alt="preview" className="w-24 h-24 object-cover rounded-xl" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                {getCategoryIcon(category)}
              </div>
            )}
            <div>
              <div className="text-white font-medium text-sm">{state.file.name}</div>
              <div className="text-gray-400 text-xs">{formatBytes(state.file.size)}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 text-xs"
              onClick={e => { e.stopPropagation(); setState(s => ({ ...s, file: null, previewUrl: null, status: "idle" })); }}
            >
              <X className="w-3 h-3 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <Upload className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold">Drop your file here</div>
              <div className="text-gray-400 text-sm mt-1">or click to browse</div>
              <div className="text-gray-500 text-xs mt-2">
                {category === "music" && "MP3, WAV, FLAC, OGG — up to 200 MB"}
                {category === "video" && "MP4, WebM, MOV — up to 500 MB"}
                {category === "ebook" && "PDF, EPUB — up to 50 MB"}
                {category === "image" && "JPG, PNG, WebP, GIF — up to 20 MB"}
                {category === "document" && "PDF, DOCX, TXT — up to 50 MB"}
                {!["music","video","ebook","image","document"].includes(category) && "Any supported file type"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Metadata Form */}
      {state.file && (
        <Card className="glass-card border-white/10 p-5 space-y-4">
          <div className="text-sm font-semibold text-white">File Details</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Title *</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                placeholder="Enter a title..."
                value={state.title}
                onChange={e => setState(s => ({ ...s, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Price (USD) — 0 = Free</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                placeholder="0.00"
                value={state.price}
                onChange={e => setState(s => ({ ...s, price: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Description (optional)</Label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
              placeholder="Describe your content..."
              rows={3}
              value={state.description}
              onChange={e => setState(s => ({ ...s, description: e.target.value }))}
            />
          </div>

          {/* Progress Bar */}
          {state.status === "uploading" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Uploading to secure storage...</span>
                <span>{state.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
          )}

          {state.status === "success" && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Upload complete! Your file is now in your library.
            </div>
          )}

          {state.status === "error" && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {state.errorMsg}
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            onClick={handleUpload}
            disabled={state.status === "uploading" || !state.title.trim()}
          >
            {state.status === "uploading" ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Upload to NEXUS</>
            )}
          </Button>
        </Card>
      )}

      {/* My Files Library */}
      <Card className="glass-card border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white text-sm">My {category.charAt(0).toUpperCase() + category.slice(1)} Files</span>
            <Badge className="text-xs bg-white/10 text-gray-300 border-0">{myFiles.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs" onClick={fetchMyFiles}>
            {loadingFiles ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {loadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : myFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No files uploaded yet. Upload your first file above!
          </div>
        ) : (
          <div className="space-y-3">
            {myFiles.map(file => (
              <div key={file.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/8 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center shrink-0">
                  {getCategoryIcon(file.fileCategory)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{file.title || file.originalName}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(file.fileSize)}</span>
                    <span>·</span>
                    <span>{file.isFree ? "Free" : `$${parseFloat(file.price).toFixed(2)}`}</span>
                    <span>·</span>
                    <span>{file.downloadCount} downloads</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-400 hover:text-blue-400">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-7 h-7 ${file.isPublished ? "text-green-400 hover:text-yellow-400" : "text-gray-500 hover:text-green-400"}`}
                    title={file.isPublished ? "Published — click to unpublish" : "Unpublished — click to publish"}
                    onClick={() => handleTogglePublish(file.id)}
                  >
                    {file.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-gray-500 hover:text-red-400"
                    onClick={() => handleDelete(file.id, file.title || file.originalName)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-card border-white/10 p-4 border-l-2 border-l-blue-500">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-gray-400 leading-relaxed">
            Files are stored securely on CDN-backed S3 storage. After uploading, click the <Globe className="w-3 h-3 inline text-green-400 mx-0.5" /> icon to publish to the marketplace. Buyers pay through Stripe — you receive <span className="text-green-400 font-semibold">85% of every sale</span>.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Studio Tool Definitions ──────────────────────────────────────────────────
const STUDIO_TOOLS = [
  {
    id: "music", icon: Music, label: "AI Music Studio", color: "text-purple-400", bg: "from-purple-600/20 to-blue-600/20",
    badge: "Suno AI + AudioCraft",
    tools: [
      { name: "AI Song Generator (Suno AI)", url: "https://suno.com" },
      { name: "Beat & Rhythm Creator (AudioCraft)", url: "https://github.com/facebookresearch/audiocraft" },
      { name: "AI Song Mashup Tool", url: "https://github.com/archinetai/audio-diffusion-pytorch" },
      { name: "Stem Separator (Demucs)", url: "https://github.com/facebookresearch/demucs" },
      { name: "Lyrics Writer AI", url: "https://suno.com" },
      { name: "Vocal Remover (UVR)", url: "https://github.com/Anjok07/ultimatevocalremovergui" },
      { name: "Audio Equalizer (Audacity)", url: "https://www.audacityteam.org" },
      { name: "MP3/WAV Export (FFmpeg)", url: "https://ffmpeg.org" },
    ],
    desc: "Generate full songs, beats, and mashups with AI. Upload your own audio, remix tracks, and publish to the marketplace.",
    uploadCategory: "music",
  },
  {
    id: "video", icon: Video, label: "AI Video Studio", color: "text-blue-400", bg: "from-blue-600/20 to-cyan-600/20",
    badge: "Runway ML + FFmpeg",
    tools: [
      { name: "AI Video Generator (Runway ML)", url: "https://runwayml.com" },
      { name: "Video Editor (Kdenlive)", url: "https://kdenlive.org" },
      { name: "AI Subtitle Generator (Whisper)", url: "https://github.com/openai/whisper" },
      { name: "Screen Recorder (OBS Studio)", url: "https://obsproject.com" },
      { name: "Thumbnail Creator (Canva)", url: "https://www.canva.com" },
      { name: "Video Compressor (Handbrake)", url: "https://handbrake.fr" },
      { name: "Format Converter (FFmpeg)", url: "https://ffmpeg.org" },
      { name: "YouTube/TikTok Export", url: "https://studio.youtube.com" },
    ],
    desc: "Generate stunning AI videos, edit footage, add subtitles, and publish to the marketplace or social platforms.",
    uploadCategory: "video",
  },
  {
    id: "writing", icon: PenTool, label: "Writing Workshop", color: "text-cyan-400", bg: "from-cyan-600/20 to-teal-600/20",
    badge: "TipTap + Ghost CMS",
    tools: [
      { name: "AI Blog Writer (ChatGPT)", url: "https://chat.openai.com" },
      { name: "Short Story Generator", url: "https://novelai.net" },
      { name: "Academic Paper Assistant", url: "https://www.perplexity.ai" },
      { name: "Forum Post Creator", url: "https://www.discourse.org" },
      { name: "SEO Content Optimizer", url: "https://www.semrush.com" },
      { name: "Grammar & Style Checker (Grammarly)", url: "https://www.grammarly.com" },
      { name: "Plagiarism Detector (Copyscape)", url: "https://www.copyscape.com" },
      { name: "Markdown Editor (Typora)", url: "https://typora.io" },
    ],
    desc: "Write blogs, short stories, academic papers, forum posts, and educational content with AI assistance.",
    uploadCategory: "document",
  },
  {
    id: "ebook", icon: BookOpen, label: "eBook Publisher", color: "text-green-400", bg: "from-green-600/20 to-teal-600/20",
    badge: "Calibre + Pandoc",
    tools: [
      { name: "AI eBook Generator", url: "https://chat.openai.com" },
      { name: "Chapter Outline Builder", url: "https://www.notion.so" },
      { name: "Cover Designer (Canva)", url: "https://www.canva.com" },
      { name: "EPUB/PDF Exporter (Calibre)", url: "https://calibre-ebook.com" },
      { name: "Format Converter (Pandoc)", url: "https://pandoc.org" },
      { name: "Copyright Registration (US)", url: "https://www.copyright.gov" },
      { name: "Kindle Direct Publishing", url: "https://kdp.amazon.com" },
      { name: "Pricing Calculator", url: "https://kdp.amazon.com/en_US/help/topic/G201834330" },
    ],
    desc: "Generate, design, and publish eBooks. Export to EPUB, PDF, or MOBI. Sell directly on NEXUS or link to Amazon KDP.",
    uploadCategory: "ebook",
  },
  {
    id: "upload", icon: Upload, label: "Content Upload", color: "text-orange-400", bg: "from-orange-600/20 to-yellow-600/20",
    badge: "S3 + CDN",
    tools: [],
    desc: "Upload any file type directly to NEXUS. Auto-watermarked, CDN-distributed, and ready to sell in minutes.",
    uploadCategory: "image",
  },
  {
    id: "copyright", icon: Copyright, label: "Copyright & Legal", color: "text-yellow-400", bg: "from-yellow-600/20 to-amber-600/20",
    badge: "DMCA + CC Licenses",
    tools: [
      { name: "Copyright Registration (US)", url: "https://www.copyright.gov/registration" },
      { name: "Creative Commons Licensing", url: "https://creativecommons.org/choose" },
      { name: "DMCA Takedown Tool", url: "https://www.dmca.com" },
      { name: "Watermark Generator", url: "https://watermarkly.com" },
      { name: "Digital Fingerprinting (Digimarc)", url: "https://www.digimarc.com" },
      { name: "License Agreement Generator", url: "https://www.termsfeed.com" },
      { name: "Royalty Tracker (DistroKid)", url: "https://distrokid.com" },
      { name: "Dispute Resolution (WIPO)", url: "https://www.wipo.int/amc/en" },
    ],
    desc: "Protect your work automatically. Register copyright, apply licenses, and track royalties on every sale.",
    uploadCategory: null,
  },
];

const FEATURED_CREATORS = [
  { name: "SynthWave_AI", type: "Music", earnings: "$2,847", badge: "Top Seller" },
  { name: "VisualForge", type: "Video", earnings: "$1,923", badge: "Rising Star" },
  { name: "AIAuthor", type: "eBooks", earnings: "$4,102", badge: "Best Writer" },
  { name: "PixelMage", type: "Art", earnings: "$987", badge: "New Creator" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreatorStudio() {
  useEffect(() => { document.title = "Creator Studio — Make Music, Video & eBooks | NEXUS"; }, []);
  const [activeTab, setActiveTab] = useState("music");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

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
                <p className="text-gray-400 text-sm">All free tools. Create, upload, and sell your content.</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gradient-gold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>85%</div>
                  <div className="text-xs text-gray-400">Your Revenue Split</div>
                </div>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0"
                  onClick={() => { setActiveTab("upload"); setShowUpload(true); }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Link href="/vendor">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Sell Your Work
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-6">
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Main Studio */}
            <div>
              <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setShowUpload(false); }}>
                <TabsList className="glass-card border border-white/10 h-auto p-1 flex flex-wrap gap-1 mb-6 bg-transparent">
                  {STUDIO_TOOLS.map(({ id, icon: Icon, label, color }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="hidden sm:inline">{label.split(" ")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {STUDIO_TOOLS.map(({ id, icon: Icon, label, color, bg, badge, tools, desc, uploadCategory }) => (
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
                          <div className="flex flex-wrap gap-2">
                            {tools.length > 0 && (
                              <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                                onClick={() => toast.success(`Opening ${label}! All tools are free.`)}
                              >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Launch {label.split(" ")[0]} Studio
                              </Button>
                            )}
                            {uploadCategory && (
                              <Button
                                variant="outline"
                                className="border-orange-500/40 text-orange-300 hover:bg-orange-500/10"
                                onClick={() => setShowUpload(v => !v)}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {showUpload ? "Hide Upload" : "Upload Files"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Upload Panel — shown inline when toggled */}
                    {uploadCategory && showUpload && (
                      <UploadPanel category={uploadCategory} />
                    )}

                    {/* Tools Grid */}
                    {tools.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {tools.map((tool) => (
                          <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer">
                            <Card className="glass-card border-white/10 p-4 hover:border-blue-500/30 transition-all cursor-pointer group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 bg-gradient-to-br ${bg} rounded-lg flex items-center justify-center`}>
                                    <Sparkles className={`w-4 h-4 ${color}`} />
                                  </div>
                                  <span className="text-sm text-gray-200">{tool.name}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                              </div>
                            </Card>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Music Player Demo */}
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
              {/* Quick Upload CTA */}
              <Card className="glass-card border-orange-500/20 p-4 bg-gradient-to-br from-orange-600/10 to-yellow-600/10">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-orange-400" />
                  <span className="font-semibold text-white text-sm">Upload & Sell</span>
                  <Badge className="text-xs bg-orange-500/20 text-orange-300 border-0 ml-auto">LIVE</Badge>
                </div>
                <p className="text-xs text-gray-400 mb-3">Upload music, videos, eBooks, images, and documents. Start earning today.</p>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 text-sm"
                  onClick={() => { setActiveTab("upload"); setShowUpload(true); }}
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  Upload Your First File
                </Button>
              </Card>

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
                  onClick={() => toast.success("AI Assistant is active! Ask me anything about creating content.")}>
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
                    { label: "Music Track @ $4.99", sales: "100 sales", earn: "$424" },
                    { label: "eBook @ $12.99", sales: "50 sales", earn: "$552" },
                    { label: "Video @ $9.99", sales: "75 sales", earn: "$637" },
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
                <div className="text-xs text-gray-500 text-center">You keep 85% of every sale</div>
              </Card>
            </div>
          </div>

          {/* Integration Tools Banner */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Powered By These Free Tools</h2>
              <Link href="/integrations"><Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-blue-500/30">View All 200+ Integrations</Badge></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: "Suno AI", desc: "Music Gen", url: "https://suno.com", color: "text-purple-400" },
                { name: "Runway ML", desc: "Video Gen", url: "https://runwayml.com", color: "text-blue-400" },
                { name: "AudioCraft", desc: "Beat Gen", url: "https://github.com/facebookresearch/audiocraft", color: "text-pink-400" },
                { name: "Demucs", desc: "Stem Split", url: "https://github.com/facebookresearch/demucs", color: "text-cyan-400" },
                { name: "Whisper", desc: "Subtitles", url: "https://github.com/openai/whisper", color: "text-green-400" },
                { name: "Kdenlive", desc: "Video Edit", url: "https://kdenlive.org", color: "text-yellow-400" },
                { name: "Calibre", desc: "eBook Export", url: "https://calibre-ebook.com", color: "text-orange-400" },
                { name: "FFmpeg", desc: "Convert", url: "https://ffmpeg.org", color: "text-red-400" },
                { name: "Canva", desc: "Design", url: "https://www.canva.com", color: "text-pink-300" },
                { name: "OBS Studio", desc: "Record", url: "https://obsproject.com", color: "text-indigo-400" },
                { name: "Audacity", desc: "Audio Edit", url: "https://www.audacityteam.org", color: "text-teal-400" },
                { name: "Pandoc", desc: "Doc Convert", url: "https://pandoc.org", color: "text-lime-400" },
                { name: "DMCA.com", desc: "Copyright", url: "https://www.dmca.com", color: "text-amber-400" },
                { name: "DistroKid", desc: "Royalties", url: "https://distrokid.com", color: "text-violet-400" },
                { name: "NovelAI", desc: "Story Gen", url: "https://novelai.net", color: "text-sky-400" },
                { name: "Grammarly", desc: "Writing", url: "https://www.grammarly.com", color: "text-emerald-400" },
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
