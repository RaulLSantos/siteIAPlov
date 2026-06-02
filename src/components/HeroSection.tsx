import { MessageCircle, Heart, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-worship.jpg";

const WHATSAPP_URL = "https://wa.me/5545999424023";

const HeroSection = () => {
  return (
    // Ajuste responsivo: altura menor em mobile/tablet para melhorar corte da imagem
    <section id="home" className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Culto de adoração na Igreja da Promessa em Cascavel, PR" className="w-full h-full object-cover object-center" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-4 pt-20 pb-12">
        <p className="text-gold-light font-body text-sm md:text-base tracking-[0.25em] uppercase mb-4 animate-fade-in-up">
          IAP Cascavel
        </p>
        <h1 className="text-primary-foreground font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          Igreja da Promessa em Cascavel, PR
        </h1>
        <p className="text-primary-foreground/85 font-body text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          Uma igreja para encontrar fé, esperança, ensino bíblico e comunhão. Venha como você está - Deus tem um plano para sua vida.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <Button variant="hero" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Quero conhecer a Igreja da Promessa.")}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2" size={18} /> Quero conhecer a igreja
            </a>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Quero me batizar.")}`} target="_blank" rel="noopener noreferrer">
              <Droplets className="mr-2" size={18} /> Quero me batizar
            </a>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Preciso de oração.")}`} target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2" size={18} /> Preciso de oração
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
