import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Heart, Droplets } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5545999424023";

const ContactSection = () => {
  return (
    <section id="contato" className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-body text-sm tracking-[0.2em] uppercase font-semibold mb-3">Contato</p>
          <h2 className="text-foreground font-display text-3xl md:text-5xl font-bold mb-6">
            Visite nossa Igreja
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Estamos prontos para receber você. Entre em contato pelo WhatsApp ou visite-nos pessoalmente no Centro de Cascavel.
          </p>
        </div>

        {/* Main WhatsApp CTA */}
        <div className="text-center mb-12">
          <Button variant="whatsapp" size="lg" className="text-base px-10 py-6 h-auto" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre a Igreja da Promessa.")}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2" size={22} /> Fale pelo WhatsApp
            </a>
          </Button>
        </div>

        {/* Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button variant="default" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Quero me batizar.")}`} target="_blank" rel="noopener noreferrer">
              <Droplets className="mr-2" size={18} /> Quero me batizar
            </a>
          </Button>
          <Button variant="default" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Preciso de oração.")}`} target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2" size={18} /> Preciso de oração
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin size={22} className="text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">Endereço</h3>
                <p className="text-muted-foreground font-body">
                  Rua Presidente Bernardes, 2476, Centro<br />
                  Cascavel — Paraná, CEP 85810-130
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock size={22} className="text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">Horários dos Cultos</h3>
                <p className="text-muted-foreground font-body">
                  Quarta-feira: 19:30h — Culto<br />
                  Sábado: 09:30h — Escola Bíblica / 10:30h — Culto<br />
                  Domingo: 19:30h — Culto
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-lg overflow-hidden shadow-md border border-border/50 h-72 md:h-full min-h-[280px]">
            <iframe
              title="Localização da Igreja"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.123!2d-53.4551!3d-24.9578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f3d5a3f1a1a1a1%3A0x1234567890abcdef!2sR.+Pres.+Bernardes%2C+2476+-+Centro%2C+Cascavel+-+PR%2C+85810-130!5e0!3m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
