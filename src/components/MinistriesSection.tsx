import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import childrenImg from "@/assets/ministry-children.jpg";
import youthImg from "@/assets/ministry-youth.jpg";
import musicImg from "@/assets/ministry-music.jpg";
import teachingImg from "@/assets/ministry-teaching.jpg";
import womenImg from "@/assets/ministry-women.jpg";
import familyImg from "@/assets/ministry-family.jpg";

const WHATSAPP_URL = "https://wa.me/5545999424023";

const ministries = [
  { name: "Ministério Infantil", desc: "Ensinamos as crianças sobre o amor de Deus com criatividade, carinho e diversão.", img: childrenImg, alt: "Crianças participando do Ministério Infantil da Igreja da Promessa em Cascavel" },
  { name: "Ministério de Jovens", desc: "Um espaço para jovens crescerem na fé, fortalecerem amizades e descobrirem seu propósito.", img: youthImg, alt: "Jovens reunidos no Ministério de Jovens da IAP Cascavel" },
  { name: "Ministério de Música e Artes", desc: "Louvamos a Deus através da música, canto e expressões artísticas que tocam o coração.", img: musicImg, alt: "Ministério de Música e Artes conduzindo louvor em culto evangélico" },
  { name: "Ministério de Ensino", desc: "Aprofundamento bíblico e discipulado para fortalecer a fé e o conhecimento da Palavra.", img: teachingImg, alt: "Ensino bíblico e discipulado na Igreja da Promessa Cascavel" },
  { name: "Ministério de Mulheres", desc: "Comunhão, oração e apoio mútuo entre mulheres que buscam viver segundo os propósitos de Deus.", img: womenImg, alt: "Ministério de Mulheres em comunhão e oração na Igreja da Promessa" },
  { name: "Ministério da Família", desc: "Fortalecendo famílias através do ensino bíblico, aconselhamento e momentos de convivência.", img: familyImg, alt: "Famílias acolhidas pela comunidade cristã da Igreja da Promessa em Cascavel" },
];

const MinistriesSection = () => {
  return (
    <section id="ministerios" className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-body text-sm tracking-[0.2em] uppercase font-semibold mb-3">Ministérios</p>
          <h2 className="text-foreground font-display text-3xl md:text-5xl font-bold mb-6">
            Encontre seu lugar em nossa comunidade
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Temos ministérios para todas as idades e momentos da vida em Cascavel. Cada um é uma oportunidade de servir, crescer e se conectar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((m) => (
            <div key={m.name} className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-border/50">
              <div className="h-48 overflow-hidden">
                <img src={m.img} alt={m.alt} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{m.name}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="whatsapp" size="lg" asChild>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Quero participar de um ministério.")}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2" size={18} /> Quero participar de um ministério
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
