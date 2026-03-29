import { useState, useEffect } from "react";
import { Clock, CalendarDays, Star } from "lucide-react";

const regularSchedule = [
  { day: "Quarta-feira", time: "19:30h — Culto", icon: CalendarDays },
  { day: "Sábado", time: "09:30h — Escola Bíblica", icon: CalendarDays },
  { day: "Sábado", time: "10:30h — Culto", icon: CalendarDays },
  { day: "Domingo", time: "19:30h — Culto", icon: CalendarDays },
];

interface SpecialEvent {
  name: string;
  date: string;
  description: string;
}

const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const ScheduleSection = () => {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);

  useEffect(() => {
    const base = (import.meta as any).env?.BASE_URL ?? "/";
    const candidates = [
      `${base}programacoes.json`,
      `${base}public/programacoes.json`,
      `/programacoes.json`,
      `programacoes.json`,
    ];

    // Substitua a função fetchFirstAvailable pelo código abaixo (mantém comportamento atual + logs)
    const fetchFirstAvailable = async () => {
      let data: SpecialEvent[] | null = null;
      for (const url of candidates) {
        try {
          console.log("[Schedule] tentando carregar:", url);
          const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) {
            console.warn(`[Schedule] sem sucesso ${res.status} para ${url}`);
            continue;
          }
          const text = await res.text();
          console.log("[Schedule] resposta bruta de", url, text.slice(0, 400));
          if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
            console.warn("[Schedule] resposta não é JSON:", url);
            continue;
          }
          data = JSON.parse(text) as SpecialEvent[];
          console.log("[Schedule] dados parseados:", data);
          break;
        } catch (err) {
          console.error("[Schedule] erro ao buscar:", url, err);
        }
      }

      // fallback raw (somente teste)
      if (!data) {
        const raw = "https://raw.githubusercontent.com/RaulLSantos/siteIAPlov/main/dist/programacoes.json";
        try {
          console.log("[Schedule] tentando fallback raw:", raw);
          const r = await fetch(raw, { cache: "no-store" });
          if (r.ok) {
            const txt = await r.text();
            console.log("[Schedule] respuesta raw (primeiros 400 chars):", txt.slice(0, 400));
            if (txt.trim().startsWith("[") || txt.trim().startsWith("{")) {
              data = JSON.parse(txt) as SpecialEvent[];
              console.log("[Schedule] dados do fallback:", data);
            } else {
              console.warn("[Schedule] fallback não retornou JSON");
            }
          } else {
            console.warn("[Schedule] fallback falhou:", r.status);
          }
        } catch (err) {
          console.error("[Schedule] erro no fallback:", err);
        }
      }

      if (!data) {
        console.log("[Schedule] sem dados após todas tentativas.");
        setSpecialEvents([]);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log("[Schedule] hoje (midnight):", today.toISOString());

      const withDates = data.map((e) => {
        const d = parseLocalDate(e.date);
        console.log("[Schedule] evento:", e.name, "dateStr:", e.date, "parsed:", d.toISOString(), "ts:", d.getTime());
        return { ...e, _date: d };
      });

      const upcoming = withDates
        .filter((e) => e._date.getTime() >= today.getTime())
        .sort((a, b) => a._date.getTime() - b._date.getTime())
        .slice(0, 3)
        .map(({ _date, ...rest }) => rest);

      console.log("[Schedule] upcoming selecionados:", upcoming);
      setSpecialEvents(upcoming);
    };

    fetchFirstAvailable();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <section id="agenda" className="py-20 md:py-28 bg-card">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-body text-sm tracking-[0.2em] uppercase font-semibold mb-3">Agenda</p>
          <h2 className="text-foreground font-display text-3xl md:text-5xl font-bold mb-6">
            Horários e Programações
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Venha participar dos nossos cultos e eventos. Há sempre um horário esperando por você!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-muted/40 rounded-lg p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Clock size={22} className="text-primary" />
              <h3 className="font-display text-xl font-semibold text-foreground">Cultos Regulares</h3>
            </div>
            <ul className="space-y-4">
              {regularSchedule.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <item.icon size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="font-body font-semibold text-foreground">{item.day}</span>
                    <p className="text-muted-foreground font-body text-sm">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 rounded-lg p-8 border border-primary/10">
            <div className="flex items-center gap-3 mb-6">
              <Star size={22} className="text-accent" />
              <h3 className="font-display text-xl font-semibold text-foreground">Programações Especiais</h3>
            </div>
            {specialEvents.length > 0 ? (
              <ul className="space-y-4">
                {specialEvents.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star size={18} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <span className="font-body font-semibold text-foreground">{item.name}</span>
                      <p className="text-muted-foreground font-body text-sm">{formatDate(item.date)}</p>
                      <p className="text-muted-foreground font-body text-xs">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground font-body text-sm">Nenhuma programação especial próxima.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
