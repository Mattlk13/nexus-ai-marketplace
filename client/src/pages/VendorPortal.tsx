import { useState, useEffect, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Store, Package, DollarSign, TrendingUp, BarChart3, Upload, Tag,
  Star, Users, ShoppingBag, Music, Video, BookOpen, Image, FileText,
  Settings, Bell, ChevronRight, Plus, Eye, Zap, Shield, CheckCircle,
  Globe, Lock, Trash2, Loader2
} from "lucide-react";

// ─── Uploaded File Types ──────────────────────────────────────────────────────
interface UploadedFile {
  id: number;
  fileName: string;
  originalName: string;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileCategoryIcon({ cat }: { cat: string }) {
  switch (cat) {
    case "music": return <Music className="w-4 h-4 text-purple-400" />;
    case "video": return <Video className="w-4 h-4 text-blue-400" />;
    case "ebook": return <BookOpen className="w-4 h-4 text-green-400" />;
    case "image": return <Image className="w-4 h-4 text-pink-400" />;
    default: return <FileText className="w-4 h-4 text-yellow-400" />;
  }
}

const VENDOR_STATS = [
  { label: "Total Revenue", value: "$4,847.50", change: "+24%", icon: DollarSign, color: "text-green-400" },
  { label: "Products Listed", value: "127", change: "+12", icon: Package, color: "text-blue-400" },
  { label: "Total Sales", value: "384", change: "+18%", icon: ShoppingBag, color: "text-purple-400" },
  { label: "Followers", value: "2,841", change: "+156", icon: Users, color: "text-yellow-400" },
];

const RECENT_SALES = [
  { item: "Neon Dreamscape EP", type: "Music", buyer: "User_4821", amount: "$4.99", date: "2m ago", status: "completed" },
  { item: "Prompt Engineering Bible", type: "eBook", buyer: "User_7293", amount: "$12.99", date: "18m ago", status: "completed" },
  { item: "AI City Timelapse", type: "Video", buyer: "User_1047", amount: "$9.99", date: "1h ago", status: "completed" },
  { item: "Cosmic Portraits Pack", type: "Art", buyer: "User_5582", amount: "$7.99", date: "3h ago", status: "completed" },
  { item: "Smart LED Desk Lamp", type: "Product", buyer: "User_2219", amount: "$24.99", date: "5h ago", status: "shipped" },
];

const LISTING_TYPES = [
  { icon: Music, label: "Music & Audio", desc: "Songs, beats, podcasts, sound effects", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Video, label: "Videos", desc: "Tutorials, films, animations, clips", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: BookOpen, label: "eBooks & Docs", desc: "Books, guides, papers, courses", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: Image, label: "Art & Photos", desc: "Digital art, photography, graphics", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: FileText, label: "Written Content", desc: "Blog posts, articles, templates", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Package, label: "Physical Products", desc: "Dropship or your own products", color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

const VENDOR_PERKS = [
  "Keep 70–85% of every sale",
  "Automated payment deposits daily",
  "AI-powered marketing for your listings",
  "Featured in Daily Spotlight rotation",
  "Built-in copyright protection",
  "Analytics dashboard & revenue tracking",
  "Direct messaging with buyers",
  "Bulk upload tools",
];

export default function VendorPortal() {
  useEffect(() => { document.title = "Vendor Portal — Sell Your Creations | NEXUS"; }, []);
  const [isVendor] = useState(true); // Demo: show vendor dashboard
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [myFiles, setMyFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchMyFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/upload/my-files", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMyFiles(data.files as UploadedFile[]);
      }
    } catch { /* not logged in */ } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchMyFiles(); }, [isAuthenticated, fetchMyFiles]);

  const handleTogglePublish = async (fileId: number) => {
    try {
      const res = await fetch(`/api/upload/${fileId}/publish`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      await fetchMyFiles();
      toast.success("Visibility updated!");
    } catch { toast.error("Failed to update visibility"); }
  };

  const handleDeleteFile = async (fileId: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/upload/${fileId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setMyFiles(f => f.filter(x => x.id !== fileId));
      toast.success("File deleted");
    } catch { toast.error("Failed to delete file"); }
  };
  const [stripeLoading, setStripeLoading] = useState(false);

  const { data: connectStatus } = trpc.stripe.connectStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const connectOnboard = trpc.stripe.connectOnboard.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("Opening Stripe onboarding — complete it to start receiving payouts!");
    },
    onError: (err) => {
      toast.error(`Stripe error: ${err.message}`);
      setStripeLoading(false);
    },
  });
  const { data: vendorEarnings } = trpc.stripe.vendorEarnings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleStripeConnect = () => {
    if (!isAuthenticated) { navigate("/"); return; }
    setStripeLoading(true);
    connectOnboard.mutate({ origin: window.location.origin });
  };

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/10 to-yellow-600/10 border-b border-white/10 py-8">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 bg-orange-500/20 text-orange-300 border-orange-500/30">Vendor Portal</Badge>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your Vendor Dashboard
                </h1>
                <p className="text-gray-400 text-sm">Manage listings, track sales, and grow your store</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10"
                  onClick={() => toast.info("Settings panel — use the tabs below to configure your store")}>
                  <Settings className="w-4 h-4 mr-1" /> Settings
                </Button>
                <Button className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white border-0"
                  onClick={() => navigate("/studio")}>
                  <Plus className="w-4 h-4 mr-2" /> New Listing
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-6">
          {isVendor ? (
            // Vendor Dashboard View
            <div className="space-y-6">
              {/* Stripe Connect Banner */}
              {!connectStatus?.chargesEnabled && (
                <Card className="glass-card border-yellow-500/30 p-5 bg-gradient-to-r from-yellow-600/10 to-orange-600/10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {connectStatus ? "Complete Stripe Setup" : "Connect Stripe to Receive Payouts"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {connectStatus?.detailsSubmitted
                            ? "Your account is under review — payouts will activate shortly."
                            : "Set up your Stripe account to receive daily profit deposits directly to your bank."}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold border-0 shrink-0"
                      onClick={handleStripeConnect}
                      disabled={stripeLoading || connectOnboard.isPending}
                    >
                      {stripeLoading || connectOnboard.isPending ? "Opening..." : connectStatus ? "Continue Setup" : "Connect Stripe"}
                    </Button>
                  </div>
                </Card>
              )}
              {connectStatus?.chargesEnabled && (
                <Card className="glass-card border-green-500/30 p-5 bg-gradient-to-r from-green-600/10 to-emerald-600/10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Stripe Payouts Active</div>
                        <div className="text-sm text-gray-400">Total earned: <span className="text-green-400 font-semibold">${vendorEarnings?.totalEarnings ?? "0.00"}</span> across {vendorEarnings?.orderCount ?? 0} sales</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-sm px-3 py-1">✓ Connected</Badge>
                  </div>
                </Card>
              )}

              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VENDOR_STATS.map(({ label, value, change, icon: Icon, color }) => (
                  <Card key={label} className="glass-card border-white/10 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${color.replace("text-", "bg-").replace("400", "500/10")} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <Badge className="text-xs bg-green-500/20 text-green-300 border-0">{change}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-5">
                  <Tabs defaultValue="listings">
                    <TabsList className="glass-card border border-white/10 h-auto p-1 bg-transparent">
                      <TabsTrigger value="listings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 text-sm">My Listings</TabsTrigger>
                      <TabsTrigger value="files" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 text-sm">
                        <Upload className="w-3.5 h-3.5 mr-1" />My Files
                        {myFiles.length > 0 && <Badge className="ml-1 text-xs bg-orange-500/20 text-orange-300 border-0 px-1.5">{myFiles.length}</Badge>}
                      </TabsTrigger>
                      <TabsTrigger value="sales" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 text-sm">Recent Sales</TabsTrigger>
                      <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 text-sm">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="listings" className="mt-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {LISTING_TYPES.map(({ icon: Icon, label, desc, color, bg }) => (
                          <Card key={label} className="glass-card border-white/10 p-4 hover:border-orange-500/30 transition-all cursor-pointer group"
                            onClick={() => navigate("/studio")}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-4.5 h-4.5 ${color}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{label}</div>
                                <div className="text-xs text-gray-400">{desc}</div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full border-white/20 text-gray-300 hover:bg-white/10 text-xs h-7 group-hover:border-orange-500/40">
                              <Plus className="w-3 h-3 mr-1" /> Add {label.split(" ")[0]} Listing
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="mt-4">
                      <Card className="glass-card border-white/10 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-orange-400" />
                            <span className="font-semibold text-white text-sm">Uploaded Files</span>
                            <Badge className="text-xs bg-white/10 text-gray-300 border-0">{myFiles.length}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs" onClick={fetchMyFiles}>
                              {loadingFiles ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 text-xs" onClick={() => navigate("/studio")}>
                              <Plus className="w-3 h-3 mr-1" /> Upload New
                            </Button>
                          </div>
                        </div>

                        {loadingFiles ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                          </div>
                        ) : myFiles.length === 0 ? (
                          <div className="text-center py-10">
                            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                            <div className="text-gray-400 text-sm mb-3">No files uploaded yet.</div>
                            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0" onClick={() => navigate("/studio")}>
                              Go to Creator Studio
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myFiles.map(file => (
                              <div key={file.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/8 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600/30 to-yellow-600/30 flex items-center justify-center shrink-0">
                                  <FileCategoryIcon cat={file.fileCategory} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">{file.title || file.originalName}</div>
                                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                    <span>{formatBytes(file.fileSize)}</span>
                                    <span>·</span>
                                    <span className="capitalize">{file.fileCategory}</span>
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
                                    variant="ghost" size="icon"
                                    className={`w-7 h-7 ${file.isPublished ? "text-green-400 hover:text-yellow-400" : "text-gray-500 hover:text-green-400"}`}
                                    title={file.isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
                                    onClick={() => handleTogglePublish(file.id)}
                                  >
                                    {file.isPublished ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon"
                                    className="w-7 h-7 text-gray-500 hover:text-red-400"
                                    onClick={() => handleDeleteFile(file.id, file.title || file.originalName)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </TabsContent>

                    <TabsContent value="sales" className="mt-4">
                      <Card className="glass-card border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                          <div className="font-semibold text-white text-sm">Recent Sales</div>
                        </div>
                        <div className="divide-y divide-white/5">
                          {RECENT_SALES.map((sale, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                  {sale.type[0]}
                                </div>
                                <div>
                                  <div className="text-sm text-white font-medium">{sale.item}</div>
                                  <div className="text-xs text-gray-400">{sale.buyer} · {sale.date}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-green-400">{sale.amount}</div>
                                <Badge className={`text-xs border-0 ${sale.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                                  {sale.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                      <Card className="glass-card border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold text-white">Revenue This Week</span>
                        </div>
                        <div className="flex items-end gap-2 h-32 mb-4">
                          {[40, 65, 45, 80, 60, 95, 75].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                style={{ height: `${h}%` }}
                                onClick={() => toast.info(`Day ${i + 1}: $${(h * 5).toFixed(2)} revenue`)}
                              />
                              <div className="text-xs text-gray-500">{["M","T","W","T","F","S","S"][i]}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[["Views", "12,847"], ["Clicks", "2,341"], ["Conversions", "8.4%"]].map(([label, val]) => (
                            <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-white">{val}</div>
                              <div className="text-xs text-gray-400">{label}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                  <Card className="glass-card border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-white text-sm">AI Marketing Agent</span>
                      <span className="w-2 h-2 bg-green-400 rounded-full pulse-live ml-auto" />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Your AI agent is actively promoting your listings on 5 social platforms and running SEO optimization.</p>
                    <div className="space-y-2">
                      {["Posted to Instagram · 2h ago", "SEO optimized 12 listings", "Email campaign sent · 847 opens", "TikTok post scheduled · 6PM"].map(activity => (
                        <div key={activity} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="glass-card border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white text-sm">Notifications</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { msg: "New sale: Neon Dreamscape EP", time: "2m ago", color: "text-green-400" },
                        { msg: "You were featured in Spotlight!", time: "1h ago", color: "text-yellow-400" },
                        { msg: "New follower: BeatMaster_X", time: "3h ago", color: "text-blue-400" },
                        { msg: "Review received: ⭐⭐⭐⭐⭐", time: "5h ago", color: "text-purple-400" },
                      ].map(({ msg, time, color }) => (
                        <div key={msg} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                          onClick={() => toast.info(msg, { duration: 3000 })}>
                          <div className={`w-1.5 h-1.5 rounded-full ${color.replace("text-", "bg-")} mt-1.5 shrink-0`} />
                          <div>
                            <div className="text-xs text-gray-200">{msg}</div>
                            <div className="text-xs text-gray-500">{time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="glass-card border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-white text-sm">Vendor Benefits</span>
                    </div>
                    <div className="space-y-2">
                      {VENDOR_PERKS.map(perk => (
                        <div key={perk} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            // Sign Up CTA
            <div className="max-w-2xl mx-auto text-center py-16">
              <Store className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Open Your Store in 60 Seconds</h2>
              <p className="text-gray-400 mb-8">Join 1,200+ vendors selling on NEXUS. Keep 70–85% of every sale.</p>
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white border-0"
                onClick={() => { toast.success("Welcome to NEXUS Vendors! Setting up your store..."); setTimeout(() => navigate("/studio"), 1500); }}>
                Become a Vendor — Free
              </Button>
            </div>
          )}
        </div>

        {/* Vendor Integration Banner */}
        <div className="container mt-10 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 text-lg">⚡</span>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Vendor Tools Powered By</h2>
            <a href="/integrations" className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 hover:bg-blue-500/30 transition-colors">View All Integrations</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: "Stripe Connect", desc: "Payouts", url: "https://stripe.com/connect", color: "text-violet-400" },
              { name: "Printful", desc: "Print-on-Demand", url: "https://www.printful.com", color: "text-blue-400" },
              { name: "Printify", desc: "Custom Products", url: "https://printify.com", color: "text-green-400" },
              { name: "Canva", desc: "Design", url: "https://www.canva.com", color: "text-pink-400" },
              { name: "Cloudflare", desc: "CDN", url: "https://www.cloudflare.com", color: "text-orange-400" },
              { name: "Watermarkly", desc: "Watermark", url: "https://watermarkly.com", color: "text-cyan-400" },
              { name: "DistroKid", desc: "Music Dist.", url: "https://distrokid.com", color: "text-purple-400" },
              { name: "KDP Amazon", desc: "eBook Pub.", url: "https://kdp.amazon.com", color: "text-yellow-400" },
              { name: "CreativeCommons", desc: "Licensing", url: "https://creativecommons.org", color: "text-teal-400" },
              { name: "DMCA.com", desc: "Protection", url: "https://www.dmca.com", color: "text-red-400" },
              { name: "Digimarc", desc: "Fingerprint", url: "https://www.digimarc.com", color: "text-amber-400" },
              { name: "Klaviyo", desc: "Email Mktg", url: "https://www.klaviyo.com", color: "text-emerald-400" },
              { name: "Judge.me", desc: "Reviews", url: "https://judge.me", color: "text-rose-400" },
              { name: "Tidio", desc: "Live Chat", url: "https://www.tidio.com", color: "text-sky-400" },
              { name: "Loox", desc: "Photo Reviews", url: "https://loox.app", color: "text-indigo-400" },
              { name: "ShipStation", desc: "Shipping", url: "https://www.shipstation.com", color: "text-lime-400" },
            ].map(({ name, desc, url, color }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                className="glass-card border-white/10 rounded-xl p-3 text-center hover:border-orange-500/30 transition-all group cursor-pointer block">
                <div className={`text-sm font-bold ${color} group-hover:scale-105 transition-transform`}>{name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
