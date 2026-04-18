import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMemo } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AgendaCompleta from "./pages/AgendaCompleta";

const queryClient = new QueryClient();

const basename = import.meta.env.PROD ? "/siteIAPlov" : "/";

const App = () => {
    // Detecta hash na inicialização (minimiza runtime checks)
    const isHashAgenda = useMemo(() => {
        try {
            return typeof window !== "undefined" && window.location.hash === "#agendacompleta";
        } catch {
            return false;
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {isHashAgenda ? (
                    // Renderiza a página interna diretamente quando o hash é #agendacompleta
                    // Isso garante funcionamento por link direto sem alterar navegação pública
                    <AgendaCompleta />
                ) : (
                    // Fluxo SPA normal
                    <Router basename={basename}>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/agendacompleta" element={<AgendaCompleta />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                )}
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
