import { useEffect, useState } from "react";

/**
 * Página interna: Agenda Completa
 * - Busca programacoes.json
 * - Ordena por data
 * - Agrupa por mês/ano
 * - Rota: /agendacompleta (acessível por hash #agendacompleta via redirect)
 */

interface Programacao {
    name: string;
    date: string; // formato esperado: YYYY-MM-DD (ou similar)
    description?: string;
    [key: string]: any;
}

const parseLocalDate = (dateStr: string): Date => {
    // tenta formato YYYY-MM-DD
    if (!dateStr) return new Date(NaN);
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        const y = Number(isoMatch[1]);
        const m = Number(isoMatch[2]);
        const d = Number(isoMatch[3]);
        return new Date(y, m - 1, d);
    }
    // fallback: Date.parse (cuidado com fuso horário, mas é fallback)
    const t = Date.parse(dateStr);
    return isNaN(t) ? new Date(NaN) : new Date(t);
};

const AgendaCompleta = () => {
    const [events, setEvents] = useState<Programacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const base = (import.meta as any).env?.BASE_URL ?? "/";
        const candidates = [
            `${base}programacoes.json`,
            `${base}public/programacoes.json`,
            `/programacoes.json`,
            `programacoes.json`,
            // se precisar, outros caminhos podem ser adicionados
        ];

        const fetchFirstAvailable = async () => {
            let data: Programacao[] | null = null;
            for (const url of candidates) {
                try {
                    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
                    if (!res.ok) continue;
                    const txt = await res.text();
                    if (!txt.trim().startsWith("[") && !txt.trim().startsWith("{")) continue;
                    data = JSON.parse(txt) as Programacao[];
                    break;
                } catch {
                    // tentar próximo
                }
            }

            // fallback remoto (opcional)
            if (!data) {
                try {
                    const raw = "https://raw.githubusercontent.com/RaulLSantos/siteIAPlov/main/dist/programacoes.json";
                    const r = await fetch(raw, { cache: "no-store" });
                    if (r.ok) {
                        const txt = await r.text();
                        if (txt.trim().startsWith("[") || txt.trim().startsWith("{")) {
                            data = JSON.parse(txt) as Programacao[];
                        }
                    }
                } catch {
                    // ignora
                }
            }

            if (!data) {
                setError("Não foi possível carregar as programações.");
                setLoading(false);
                return;
            }

            // Normalizar e ordenar por data real
            const withDates = data
                .map((e) => ({ ...e, _date: parseLocalDate(e.date) }))
                .filter((e) => !isNaN((e as any)._date?.getTime()))
                .sort((a, b) => (a as any)._date.getTime() - (b as any)._date.getTime());

            setEvents(withDates);
            setLoading(false);
        };

        fetchFirstAvailable();
    }, []);

    // Agrupa por mês/ano
    const grouped = (() => {
        const map = new Map<string, Programacao[]>();
        for (const ev of events) {
            const d: Date = (ev as any)._date;
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-11
            const key = `${year}-${String(month + 1).padStart(2, "0")}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(ev);
        }
        // garantir ordem por chave cronológica
        return Array.from(map.entries()).sort((a, b) => {
            const [ay, am] = a[0].split("-").map(Number);
            const [by, bm] = b[0].split("-").map(Number);
            return ay !== by ? ay - by : am - bm;
        });
    })();

    const formatMonthHeader = (key: string) => {
        const [y, m] = key.split("-").map(Number);
        const dt = new Date(y, m - 1, 1);
        return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    };

    const formatDate = (d: Date) =>
        d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container px-4">
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Agenda Completa</h1>
                    <p className="text-muted-foreground mt-2">
                        Todas as programações carregadas do arquivo interno. Acesso restrito por link direto.
                    </p>
                </div>

                {loading && <p className="text-center text-muted-foreground">Carregando programações...</p>}
                {error && <p className="text-center text-destructive">{error}</p>}

                {!loading && !error && grouped.length === 0 && (
                    <p className="text-center text-muted-foreground">Sem programações disponíveis.</p>
                )}

                {!loading && !error && grouped.length > 0 && (
                    <div className="space-y-8">
                        {grouped.map(([key, items]) => (
                            <section key={key}>
                                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                                    {formatMonthHeader(key)}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {items.map((ev, idx) => {
                                        const d: Date = (ev as any)._date;
                                        return (
                                            <article
                                                key={idx}
                                                className="p-4 rounded-lg border border-border/60 bg-muted/30"
                                            >
                                                <h3 className="font-semibold text-foreground mb-1">{ev.name}</h3>
                                                <time className="text-xs text-muted-foreground block mb-2">
                                                    {formatDate(d)}
                                                </time>
                                                {ev.description && (
                                                    <p className="text-sm text-muted-foreground">{ev.description}</p>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default AgendaCompleta;
