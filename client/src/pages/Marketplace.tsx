import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ShoppingBag, Gavel, Users, Search, Filter, Star, Heart, ShoppingCart,
  TrendingUp, Clock, Zap, Tag, Package, Truck, Shield, ArrowRight, DollarSign, ExternalLink
} from "lucide-react";

const DROPSHIP_PRODUCTS = [
  { id: 1, name: "Smart LED Desk Lamp", price: "$24.99", original: "$45.00", rating: 4.8, reviews: 2341, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80", badge: "Best Seller", category: "Electronics" },
  { id: 2, name: "Wireless Earbuds Pro", price: "$39.99", original: "$89.00", rating: 4.7, reviews: 1892, img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80", badge: "Hot Deal", category: "Electronics" },
  { id: 3, name: "Yoga Mat Premium", price: "$29.99", original: "$60.00", rating: 4.9, reviews: 3102, img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&q=80", badge: "Top Rated", category: "Fitness" },
  { id: 4, name: "Minimalist Watch", price: "$49.99", original: "$120.00", rating: 4.6, reviews: 892, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80", badge: "Trending", category: "Fashion" },
  { id: 5, name: "Portable Blender", price: "$34.99", original: "$70.00", rating: 4.8, reviews: 1567, img: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&q=80", badge: "New Arrival", category: "Kitchen" },
  { id: 6, name: "Phone Ring Light", price: "$19.99", original: "$40.00", rating: 4.5, reviews: 4201, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80", badge: "Creator Pick", category: "Photography" },
  { id: 7, name: "Bamboo Cutting Board", price: "$22.99", original: "$45.00", rating: 4.9, reviews: 2876, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80", badge: "Eco Choice", category: "Kitchen" },
  { id: 8, name: "Canvas Backpack", price: "$44.99", original: "$95.00", rating: 4.7, reviews: 1234, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80", badge: "Style Pick", category: "Fashion" },
];

const AUCTIONS = [
  { id: 1, title: "Vintage Polaroid Camera", currentBid: "$87.00", bids: 23, timeLeft: "2h 14m", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80", seller: "RetroCollector" },
  { id: 2, title: "Signed Art Print — Limited", currentBid: "$145.00", bids: 41, timeLeft: "45m", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=80", seller: "ArtHouse_X" },
  { id: 3, title: "Gaming PC Bundle", currentBid: "$620.00", bids: 18, timeLeft: "5h 30m", img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80", seller: "TechReseller" },
  { id: 4, title: "Handmade Leather Wallet", currentBid: "$35.00", bids: 12, timeLeft: "1h 05m", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&q=80", seller: "CraftMaster" },
];

const P2P_LISTINGS = [
  { id: 1, title: "iPhone 14 Pro — Excellent", price: "$699", location: "Chicago, IL", img: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=300&q=80", seller: "TechSeller99", condition: "Like New" },
  { id: 2, title: "MacBook Air M2", price: "$999", location: "Austin, TX", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80", seller: "AppleReseller", condition: "Good" },
  { id: 3, title: "Sony A7III Camera", price: "$1,499", location: "NYC, NY", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80", seller: "PhotoPro", condition: "Excellent" },
  { id: 4, title: "Vintage Vinyl Records (50)", price: "$120", location: "Nashville, TN", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300&q=80", seller: "VinylVault", condition: "Good" },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Fitness", "Kitchen", "Photography", "Books", "Art", "Music", "Gaming"];

export default function Marketplace() {
  useEffect(() => { document.title = "Marketplace — Shop, Bid & Discover | NEXUS"; }, []);
  const [activeTab, setActiveTab] = useState("dropship");
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [, navigate] = useLocation();

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    toast.success(wishlist.includes(id) ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <div className="min-h-screen animated-bg">
      <NavBar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-b border-white/10 py-8">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Marketplace</Badge>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Virtual Mall
                </h1>
                <p className="text-gray-400 text-sm">Shop, bid, and sell — 50,000+ products, daily auctions, P2P listings</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="bg-white/10 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 w-48"
                    placeholder="Search products..."
                    readOnly
                  />
                </div>
                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10"
                  onClick={() => toast.info("Use category buttons below to filter!")}>
                  <Filter className="w-4 h-4 mr-1" /> Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Package, label: "Products", value: "50,000+", color: "text-yellow-400" },
              { icon: Gavel, label: "Live Auctions", value: "340", color: "text-red-400" },
              { icon: Users, label: "Active Sellers", value: "1,247", color: "text-blue-400" },
              { icon: Truck, label: "Ships Free", value: "On $35+", color: "text-green-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="glass-card border-white/10 p-3 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <div className="text-sm font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass-card border border-white/10 h-auto p-1 mb-6 bg-transparent">
              <TabsTrigger value="dropship" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                <ShoppingBag className="w-4 h-4" /> Dropshipping
              </TabsTrigger>
              <TabsTrigger value="auction" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                <Gavel className="w-4 h-4" /> Auctions
                <Badge className="text-xs bg-red-500/20 text-red-300 border-0 ml-1">LIVE</Badge>
              </TabsTrigger>
              <TabsTrigger value="p2p" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">
                <Users className="w-4 h-4" /> P2P Listings
              </TabsTrigger>
            </TabsList>

            {/* Dropshipping Tab */}
            <TabsContent value="dropship">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition-all ${
                      activeCategory === cat
                        ? "bg-yellow-600 text-white"
                        : "glass-card border border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DROPSHIP_PRODUCTS.map((product) => (
                  <Card key={product.id} className="glass-card border-white/10 overflow-hidden hover:border-yellow-500/30 transition-all group">
                    <div className="relative">
                      <img src={product.img} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <Badge className="absolute top-2 left-2 text-xs bg-yellow-600/90 text-white border-0">{product.badge}</Badge>
                      <button
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "text-pink-400 fill-pink-400" : "text-white"}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-400 mb-1">{product.category}</div>
                      <div className="font-semibold text-white text-sm mb-2 line-clamp-2">{product.name}</div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-yellow-400">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-white">{product.price}</span>
                        <span className="text-xs text-gray-500 line-through">{product.original}</span>
                        <Badge className="text-xs bg-green-500/20 text-green-300 border-0 ml-auto">
                          {Math.round((1 - parseFloat(product.price.slice(1)) / parseFloat(product.original.slice(1))) * 100)}% off
                        </Badge>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0 text-sm h-8"
                        onClick={() => { toast.success(`Added "${product.name}" to cart!`); }}>
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10"
                  onClick={() => window.open("https://cjdropshipping.com", "_blank")}>
                  Load More Products <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Auctions Tab */}
            <TabsContent value="auction">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 bg-red-400 rounded-full pulse-live" />
                <span className="text-sm text-red-400 font-medium">340 Live Auctions</span>
                <span className="text-xs text-gray-400">— Bids update in real-time</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AUCTIONS.map((item) => (
                  <Card key={item.id} className="glass-card border-white/10 overflow-hidden hover:border-red-500/30 transition-all">
                    <div className="relative">
                      <img src={item.img} alt={item.title} className="w-full h-44 object-cover" />
                      <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.timeLeft}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-gray-400 mb-3">by {item.seller} · {item.bids} bids</div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-gray-400">Current Bid</div>
                          <div className="text-xl font-bold text-white">{item.currentBid}</div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-300 border-0 text-xs">
                          <Zap className="w-3 h-3 mr-1" /> LIVE
                        </Badge>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 text-sm h-8"
                        onClick={() => { toast.success(`Bid placed on "${item.title}"! Check your email for confirmation.`); }}>
                        <Gavel className="w-3.5 h-3.5 mr-1.5" /> Place Bid
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="glass-card border-white/10 p-5 mt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-semibold text-white text-sm">Sell via Auction</div>
                    <div className="text-xs text-gray-400">List your items for auction — NEXUS takes only 5–10% on the winning bid</div>
                  </div>
                  <Button size="sm" className="ml-auto bg-gradient-to-r from-green-600 to-teal-600 text-white border-0 shrink-0"
                    onClick={() => navigate("/vendor")}>
                    List Item
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* P2P Tab */}
            <TabsContent value="p2p">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-400">Buy and sell directly with other users — like Facebook Marketplace</p>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                  onClick={() => navigate("/vendor")}>
                  <Tag className="w-3.5 h-3.5 mr-1.5" /> Post Listing
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {P2P_LISTINGS.map((item) => (
                  <Card key={item.id} className="glass-card border-white/10 overflow-hidden hover:border-blue-500/30 transition-all">
                    <img src={item.img} alt={item.title} className="w-full h-44 object-cover" />
                    <div className="p-4">
                      <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-xs bg-blue-500/20 text-blue-300 border-0">{item.condition}</Badge>
                        <span className="text-xs text-gray-400">{item.location}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">by {item.seller}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{item.price}</span>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs h-7"
                          onClick={() => { toast.success(`Message sent to ${item.seller}! Check your inbox.`); }}>
                          Contact
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="glass-card border-white/10 p-5 mt-6 flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-sm">Buyer Protection</div>
                  <div className="text-xs text-gray-400">All P2P transactions are protected by NEXUS Buyer Guarantee. Disputes resolved within 48 hours.</div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Marketplace Integration Banner */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-lg">⚡</span>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Marketplace Powered By</h2>
              <a href="/integrations" className="ml-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 hover:bg-blue-500/30 transition-colors">View All Integrations</a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: "CJDropshipping", desc: "50K+ Products", url: "https://cjdropshipping.com", color: "text-blue-400" },
                { name: "DSers", desc: "AliExpress Drop", url: "https://www.dsers.com", color: "text-orange-400" },
                { name: "EPROLO", desc: "Free Dropship", url: "https://eprolo.com", color: "text-green-400" },
                { name: "Trendsi", desc: "Fashion Drop", url: "https://www.trendsi.com", color: "text-pink-400" },
                { name: "Stripe", desc: "Payments", url: "https://stripe.com", color: "text-violet-400" },
                { name: "Prisync", desc: "Price Watch", url: "https://prisync.com", color: "text-cyan-400" },
                { name: "Growave", desc: "Reviews", url: "https://growave.io", color: "text-yellow-400" },
                { name: "Webkul", desc: "Multi-Vendor", url: "https://store.webkul.com", color: "text-red-400" },
                { name: "ShipStation", desc: "Shipping", url: "https://www.shipstation.com", color: "text-teal-400" },
                { name: "Klaviyo", desc: "Email Mktg", url: "https://www.klaviyo.com", color: "text-emerald-400" },
                { name: "Outfy", desc: "Social Auto", url: "https://outfy.com", color: "text-indigo-400" },
                { name: "Loox", desc: "Photo Reviews", url: "https://loox.app", color: "text-amber-400" },
                { name: "ReConvert", desc: "Upsell", url: "https://reconvert.io", color: "text-lime-400" },
                { name: "Tidio", desc: "Live Chat", url: "https://www.tidio.com", color: "text-sky-400" },
                { name: "Judge.me", desc: "Reviews", url: "https://judge.me", color: "text-rose-400" },
                { name: "n8n", desc: "Automation", url: "https://n8n.io", color: "text-purple-400" },
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
