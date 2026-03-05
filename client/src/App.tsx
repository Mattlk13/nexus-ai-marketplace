import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import CreatorStudio from "./pages/CreatorStudio";
import Marketplace from "./pages/Marketplace";
import VendorPortal from "./pages/VendorPortal";
import Spotlight from "./pages/Spotlight";
import Integrations from "./pages/Integrations";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/feed" component={Feed} />
      <Route path="/studio" component={CreatorStudio} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/vendor" component={VendorPortal} />
      <Route path="/spotlight" component={Spotlight} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
