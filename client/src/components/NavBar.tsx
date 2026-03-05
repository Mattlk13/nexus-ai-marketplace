import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home, Rss, Palette, ShoppingBag, Store, Star, Zap, Menu, X, Bell, Search, MessageCircle
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/studio", label: "Studio", icon: Palette },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/vendor", label: "Vendor", icon: Store },
  { href: "/spotlight", label: "Spotlight", icon: Star },
  { href: "/integrations", label: "AI Stack", icon: Zap },
];

export default function NavBar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gradient-blue" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            NEXUS
          </span>
          <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 hidden sm:flex">BETA</Badge>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1.5 text-sm transition-all ${
                  location === href
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hidden sm:flex"
            onClick={() => toast.info("Search coming soon")}>
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hidden sm:flex relative"
            onClick={() => toast.info("Notifications coming soon")}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full pulse-live" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hidden sm:flex"
            onClick={() => toast.info("Messages coming soon")}>
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 hidden sm:flex"
            onClick={() => toast.success("Sign up launching soon! You'll be first in line.")}
          >
            Join Free
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-white/10 px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                location === href ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </div>
            </Link>
          ))}
          <Button
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            onClick={() => { toast.success("Sign up launching soon!"); setMobileOpen(false); }}
          >
            Join Free
          </Button>
        </div>
      )}
    </nav>
  );
}
