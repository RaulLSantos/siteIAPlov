import { BookOpen, Eye, Heart } from "lucide-react";

const values = [
    { icon: BookOpen, title: "Missão", text: "Nossa missão é adorar a Deus, proclamar a Jesus Cristo e fazer discípulos no poder do Espírito Santo." },
    { icon: Eye, title: "Visão", text: "Cada promessista sendo missionário no poder do Espírito Santo." },
  { icon: Heart, title: "Valores", text: "Fé, amor, comunhão, serviço ao próximo, ensino bíblico e compromisso com a obra de Deus." },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-20 md:py-28 bg-card">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-body text-sm tracking-[0.2em] uppercase font-semibold mb-3">Sobre nós</p>
          <h2 className="text-foreground font-display text-3xl md:text-5xl font-bold mb-6">
            Conheça a Igreja da Promessa
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            A Igreja da Promessa é uma comunidade cristã evangélica em Cascavel - PR, fundada no Brasil, com raízes na pregação da Palavra de Deus e na busca pelo batismo com o Espírito Santo. Há décadas, temos o privilégio de acolher famílias, jovens e crianças, compartilhando a esperança que encontramos em Jesus Cristo.
          </p>
          <p className="text-muted-foreground font-body text-lg leading-relaxed mt-4">
            Nossos cultos são momentos de adoração genuína, ensino bíblico e comunhão fraterna. Se você procura uma igreja em Cascavel onde possa crescer espiritualmente e encontrar uma família em Cristo, a IAP Cascavel está de braços abertos para recebê-lo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item) => (
            <div
              key={item.title}
              className="text-center p-8 rounded-lg bg-muted/50 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
                <item.icon size={26} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
