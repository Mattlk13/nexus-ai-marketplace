# NEXUS AI Social Marketplace — TODO

## Core Platform
- [x] Full-stack upgrade (tRPC + MySQL + Auth)
- [x] Database schema: 9 tables (users, content_items, vendor_stores, products, auctions, feed_posts, orders, agent_logs, seo_pages)
- [x] Database migration applied successfully
- [x] Dark "Midnight Command Center" design system (Space Grotesk + Inter fonts)
- [x] Animated background and glassmorphism UI

## Pages Built
- [x] Home landing page (hero, features, stats, trending, revenue streams, AI agents, CTA)
- [x] Social Feed page (newsfeed, trending, stories, post creation)
- [x] Creator Studio page (music, video, writing, eBook, upload tools)
- [x] Marketplace page (dropship products, auctions, P2P listings)
- [x] Vendor Portal page (store setup, dashboard, analytics)
- [x] Spotlight page (daily featured content, rising creators, leaderboard)
- [x] Integrations page (all 200+ tools, APIs, MCP servers, GitHub repos)
- [x] NavBar component (responsive, all routes)

## Backend API (tRPC)
- [x] Auth router (me, logout)
- [x] Feed router (list, trending, create post)
- [x] Content router (list, spotlight, create, generateWithAI)
- [x] Marketplace router (products, auctions, placeBid)
- [x] Vendor router (myStore, createStore, topVendors)
- [x] Agent router (logs, stats, runSEO)

## AI Automation
- [x] AI content generation via LLM (writing, ebook, blog)
- [x] SEO agent: generates and publishes blog posts via AI
- [x] Owner notifications on key events (new vendor, new content, SEO post)
- [x] 5 AI agent Google Calendar schedules (CST timezone)
- [x] n8n workflow JSON (order automation + daily scheduler)
- [x] CrewAI agent definitions (5 agents)
- [x] Dynamic pricing engine (Python)

## Testing
- [x] 26/26 vitest tests passing (auth + all marketplace routers)
- [x] TypeScript: 0 errors

## Deployment
- [x] GitHub repository: github.com/Mattlk13/ai-social-marketplace
- [x] Google Drive: all assets uploaded with shareable links
- [x] Gmail deployment notification sent
- [x] Google Calendar: 5 recurring AI agent events (CST)

## Planned Next Steps
- [ ] Stripe Connect integration for vendor payouts
- [ ] File upload to S3 for creator content
- [ ] Real-time chat (Socket.io)
- [ ] Push notifications for bids and sales
- [ ] Mobile app (React Native / Expo)
- [ ] Shopify product sync via CJDropshipping API
- [ ] Google AdSense integration
- [ ] Social media auto-posting (Outfy/Buffer)

## Bug Fixes — Broken Links & Navigation Audit
- [x] Audit App.tsx for missing/incomplete routes
- [x] Audit NavBar for broken href/Link targets
- [x] Audit Home.tsx for dead buttons and links
- [x] Audit Feed.tsx for dead buttons and links
- [x] Audit CreatorStudio.tsx for dead buttons and links
- [x] Audit Marketplace.tsx for dead buttons and links
- [x] Audit VendorPortal.tsx for dead buttons and links
- [x] Audit Spotlight.tsx for dead buttons and links
- [x] Audit Integrations.tsx for dead buttons and links
- [x] Fix all broken routes and missing pages
- [x] Wire all CTA buttons to correct destinations
- [x] Ensure all toast/feedback on non-implemented features

## All Integrations + Full Link Fix
- [x] Fix all footer links to use proper wouter Link routing
- [x] Fix all CTA buttons across all pages to navigate correctly
- [x] Rebuild Integrations page with 200+ real tools, all categories, working external links
- [ ] Add integration tool cards to Creator Studio (Suno, Runway, AudioCraft, FFmpeg, etc.)
- [ ] Add integration tool cards to Marketplace (CJDropshipping, DSers, Spocket, etc.)
- [ ] Add integration tool cards to Vendor Portal (Stripe, PayPal, Printful, etc.)
- [ ] Add integration tool cards to Feed (social platform links)
- [ ] Add MCP server directory section to Integrations page
- [ ] Add GitHub repos section to Integrations page
- [ ] Add AI Agents section to Integrations page
- [ ] Add free APIs section to Integrations page
- [ ] Add automation tools section (n8n, Make, Zapier) to Integrations page
- [x] Wire all "Learn More" and "Connect" buttons to real URLs

## SEO Fixes
- [x] Fix home page title: expanded to 45 chars using document.title

## SEO — Additional Fixes (from conversation)
- [x] Add meta description tag (150-160 chars) to index.html
- [x] Add Open Graph tags (og:title, og:description, og:image) to index.html
- [x] Add Twitter Card meta tags to index.html
- [x] Add per-page document.title to Feed, Studio, Marketplace, Vendor, Spotlight pages
- [x] Add robots.txt to client/public
- [x] Add sitemap.xml to client/public

## Missing Integration Tool Cards (from conversation)
- [x] Add integration tool cards to Creator Studio (Suno, Runway, Udio, AudioCraft, FFmpeg, Kdenlive, Canva, etc.)
- [x] Add integration tool cards to Marketplace (CJDropshipping, DSers, Spocket, Printful, EPROLO, etc.)
- [x] Add integration tool cards to Vendor Portal (Stripe, PayPal, Printful, ShipStation, etc.)
- [x] Add integration tool cards to Feed (Buffer, Hootsuite, Outfy, social platform links)
- [ ] Add MCP server directory section to Integrations page
- [ ] Add GitHub repos section to Integrations page
- [ ] Add AI Agents section (CrewAI, AutoGen, LangChain) to Integrations page
- [ ] Add free APIs section to Integrations page
- [ ] Add automation tools section (n8n, Make, Zapier) to Integrations page

## Missing Platform Features (from conversation)
- [ ] S3 file upload for creator content (music, video, ebook, images)
- [ ] Real-time chat with Socket.io (user-to-user messaging like Facebook)
- [ ] Push notifications for bids, sales, and new follower- [x] Add Google AdSense ad units on Feed and Spotlight pages (passive income) [ ] Social media auto-posting integration (Outfy/Buffer) on Vendor Portal
- [ ] Shopify product sync via CJDropshipping API (auto-import 50 products/day)
- [ ] eBay-style auction countdown timers (live, real-time)
- [ ] User profile pages with avatar, bio, content portfolio
- [ ] Content copyright registration flow for creators
- [ ] Tutorial/onboarding flow for new users and vendors
- [ ] Newsfeed algorithm (trending, following, recommended)
- [ ] Story/reel preview carousel on Feed page
- [ ] Vendor analytics dashboard with real sales charts
- [ ] eBook generator (AI-powered, multi-chapter)
- [ ] Writing workshop with AI co-author assistant
- [ ] AI music mashup tool integration
- [ ] Mobile app scaffold (React Native / Expo)

## Stripe Integration (from conversation)
- [ ] Add Stripe Connect for vendor payouts
- [ ] Add Stripe Checkout for content purchases
- [ ] Add Stripe subscription billing for premium vendor tier
- [ ] Revenue split automation (platform % + vendor %)
