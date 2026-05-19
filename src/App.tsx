import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AgendaCompleta from "./pages/AgendaCompleta";

const queryClient = new QueryClient();

// Use BASE_URL gerado pelo Vite (garante que coincide com `base` do vite.config)
const basename = import.meta.env.BASE_URL || "/";

const isAgendaHash = () => {
    try {
        return typeof window !== "undefined" && window.location.hash === "#agendacompleta";
    } catch {
        return false;
    }
};

const App = () => {
    console.log("[app] render start", { basename });

    // Mantem a rota por hash reativa para links como /#agendacompleta.
    const [isHashAgenda, setIsHashAgenda] = useState(isAgendaHash);

    useEffect(() => {
        const updateHashRoute = () => setIsHashAgenda(isAgendaHash());

        updateHashRoute();
        window.addEventListener("hashchange", updateHashRoute);
        return () => window.removeEventListener("hashchange", updateHashRoute);
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
