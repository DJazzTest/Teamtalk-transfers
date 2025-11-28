import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Website from "./pages/Website";
import Admin from "./pages/Admin";
import Cms from "./pages/Cms";
import ChatterBoxPage from "./pages/ChatterBoxPage";
import NotFound from "./pages/NotFound";
import { ClubBioProvider } from "@/context/ClubBioContext";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ClubBioProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Website />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/cms" element={<Cms />} />
                <Route path="/chatter-box" element={<ChatterBoxPage />} />
                {/* Keep the old Index route temporarily for backward compatibility */}
                <Route path="/old" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ClubBioProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
