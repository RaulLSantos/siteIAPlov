import { FormEvent, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, HeartHandshake, Image, Loader2, Mail, Phone, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_PHOTO_TYPES,
  ACCEPTED_PHOTO_EXTENSIONS,
  createInscricaoPayload,
  formatWhatsapp,
  localWhatsappDigits,
  normalizedBrazilWhatsapp,
  validatePhotoFile,
} from "@/lib/inscricao";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxs87IkI862Lpt3NdcpjQMUqrHoT7g9e0xHVGejs4W5wlu-0AgXZkKRURhvJZ8SZ4C_0A/exec";

interface ScriptResponse {
  status?: "sucesso" | "erro" | "duplicado" | "possivel_duplicado" | string;
  mensagem?: string;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler a foto selecionada."));
    reader.readAsDataURL(file);
  });

const Inscricoes = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "duplicate" | "possibleDuplicate" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pixQrAvailable, setPixQrAvailable] = useState(true);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

    const photoValidation = validatePhotoFile(foto);

    if (!photoValidation.valid) {
      setMessage(photoValidation.message || "Revise a foto selecionada.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const fotoPayload = foto
        ? {
            dataUrl: await fileToDataUrl(foto),
            name: foto.name,
            type: foto.type || "image/jpeg",
          }
        : null;
      const payload = createInscricaoPayload({ nome, email, whatsapp }, fotoPayload);
      const formData = new URLSearchParams();

      Object.entries({
        ...payload,
        whatsappNumeros: whatsappNormalizado,
      }).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.set(key, value);
        }
      });

      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

      const resultado = (await response.json()) as ScriptResponse;
      const mensagem = resultado.mensagem || "Erro ao enviar inscricao.";

      if (resultado.status === "sucesso") {
        setMessage(mensagem);
        setStatus("success");
        setNome("");
        setEmail("");
        setWhatsapp("");
        setFoto(null);
        if (photoInputRef.current) {
          photoInputRef.current.value = "";
        }
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
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel enviar a inscricao. Tente novamente em instantes.");
      setStatus("error");
    }
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
                <form id="form-inscricao" className="space-y-5" onSubmit={handleSubmit}>
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

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto do casal</Label>
                    <div className="relative">
                      <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        ref={photoInputRef}
                        id="foto"
                        name="foto"
                        type="file"
                        accept={[...ACCEPTED_PHOTO_TYPES, ...ACCEPTED_PHOTO_EXTENSIONS].join(",")}
                        className="pl-10"
                        onChange={(event) => {
                          const selectedFile = event.target.files?.[0] || null;
                          const validation = validatePhotoFile(selectedFile);

                          if (!validation.valid) {
                            setFoto(null);
                            event.target.value = "";
                            setMessage(validation.message || "Revise a foto selecionada.");
                            setStatus("error");
                            return;
                          }

                          setFoto(selectedFile);
                          resetFeedback();
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional. Envie JPEG, JPG, PNG ou WEBP com ate 10 MB.
                    </p>
                    {foto && (
                      <p className="text-xs font-medium text-primary">
                        Foto selecionada: {foto.name}
                      </p>
                    )}
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
                    <div className="space-y-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{message}</p>
                      </div>
                      <div className="rounded-md border border-green-200 bg-white p-4">
                        <p className="text-base font-semibold text-foreground">Pagamento via PIX</p>
                        <p className="mt-1 text-muted-foreground">
                          O valor da inscricao e de R$260,00. Use o QR Code ou a chave telefone abaixo.
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
                          {pixQrAvailable ? (
                            <img
                              src="/pix-encontro-casais.png"
                              alt="QR Code PIX para pagamento da inscricao do Encontro de Casais"
                              className="h-40 w-40 rounded-md border border-border bg-white object-contain p-2"
                              onError={() => setPixQrAvailable(false)}
                            />
                          ) : (
                            <div className="rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                              QR Code indisponivel no momento. Use a chave telefone ao lado para realizar o PIX.
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                              Chave PIX telefone
                            </p>
                            <p className="mt-2 text-xl font-bold text-foreground">(45) 99852-3346</p>
                          </div>
                        </div>
                      </div>
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
