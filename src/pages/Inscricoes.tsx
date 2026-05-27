import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, HeartHandshake, Loader2, Mail, Phone, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz9jiwq1mcWwJFZLdWvK4REBqIQMAmyEnDMsuYNi_-aKBCjzBtbtGWufPgX8GuUKI_wSQ/exec";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const localWhatsappDigits = (value: string) => {
  const digits = digitsOnly(value);

  if (digits.startsWith("55") && digits.length > 11) {
    return digits.slice(2, 13);
  }

  return digits.slice(0, 11);
};

const normalizedBrazilWhatsapp = (value: string) => {
  const localDigits = localWhatsappDigits(value);
  return localDigits.length === 11 ? `55${localDigits}` : localDigits;
};

const formatWhatsapp = (value: string) => {
  const digits = localWhatsappDigits(value);
  const ddd = digits.slice(0, 2);
  const firstPart = digits.slice(2, 7);
  const secondPart = digits.slice(7, 11);

  if (digits.length <= 2) {
    return ddd ? `(${ddd}` : "";
  }

  if (digits.length <= 7) {
    return `(${ddd}) ${firstPart}`;
  }

  return `(${ddd}) ${firstPart}-${secondPart}`;
};

interface ScriptResponse {
  status?: "sucesso" | "erro" | "duplicado" | "possivel_duplicado" | string;
  mensagem?: string;
  source?: string;
}

const Inscricoes = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "duplicate" | "possibleDuplicate" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ScriptResponse>) => {
      const resultado = event.data;

      if (!resultado || resultado.source !== "encontro-casais-inscricao") {
        return;
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const mensagem = resultado.mensagem || "Erro ao enviar inscricao.";

      if (resultado.status === "sucesso") {
        setMessage(mensagem);
        setStatus("success");
        setNome("");
        setEmail("");
        setWhatsapp("");
        return;
      }

      if (resultado.status === "duplicado") {
        setMessage(mensagem);
        setStatus("duplicate");
        return;
      }

      if (resultado.status === "possivel_duplicado") {
        setMessage(mensagem);
        setStatus("possibleDuplicate");
        return;
      }

      setMessage(mensagem);
      setStatus("error");
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetFeedback = () => {
    if (status !== "idle" && status !== "sending") {
      setStatus("idle");
      setMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const whatsappNormalizado = normalizedBrazilWhatsapp(whatsapp);

    if (!nome.trim() || !email.trim() || localWhatsappDigits(whatsapp).length !== 11) {
      setMessage("Preencha nome, e-mail e WhatsApp corretamente.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setMessage("");

    formRef.current?.submit();

    timeoutRef.current = window.setTimeout(() => {
      setMessage("Nao foi possivel enviar a inscricao. Tente novamente em instantes.");
      setStatus("error");
    }, 15000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="bg-background">
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                  Evento
                </p>
                <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                  Encontro de Casais
                </h1>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Faca sua inscricao e deixe seus dados para a organizacao do evento.
                  Os campos nome completo, e-mail e WhatsApp sao obrigatorios.
                </p>
                <div className="mt-8 flex items-center gap-3 text-primary">
                  <HeartHandshake className="h-6 w-6" aria-hidden="true" />
                  <span className="font-body text-sm font-semibold uppercase tracking-[0.16em]">
                    Igreja da Promessa
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-6 shadow-sm md:p-8">
                <iframe className="hidden" name="inscricao-response" title="Resposta da inscricao" />
                <form
                  ref={formRef}
                  id="form-inscricao"
                  className="space-y-5"
                  method="POST"
                  action={SCRIPT_URL}
                  target="inscricao-response"
                  onSubmit={handleSubmit}
                >
                  <input type="hidden" name="whatsappNumeros" value={normalizedBrazilWhatsapp(whatsapp)} />
                  <input type="hidden" name="evento" value="Encontro de Casais" />
                  <input type="hidden" name="origem" value="Site" />
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="nome"
                        name="nome"
                        autoComplete="name"
                        className="pl-10"
                        value={nome}
                        onChange={(event) => {
                          setNome(event.target.value);
                          resetFeedback();
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="pl-10"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          resetFeedback();
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={19}
                        placeholder="(DD) 99999-9999"
                        className="pl-10"
                        value={whatsapp}
                        onChange={(event) => {
                          setWhatsapp(formatWhatsapp(event.target.value));
                          resetFeedback();
                        }}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando inscricao
                      </>
                    ) : (
                      "Enviar inscricao"
                    )}
                  </Button>

                  {status === "success" && (
                    <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{message}</p>
                    </div>
                  )}

                  {(status === "duplicate" || status === "possibleDuplicate") && (
                    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{message}</p>
                    </div>
                  )}

                  {status === "error" && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Inscricoes;
