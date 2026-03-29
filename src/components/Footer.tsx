import logo from "@/assets/logo-iap.png";

const Footer = () => {
  return (
    <footer className="bg-primary py-10">
      <div className="container px-4 text-center">
              <img alt="Igreja Adventista da Promessa" className="h-12 mx-auto mb-4 brightness-0 invert opacity-80 border-0 border-none border-[#bc7b7b]" src={logo} />
        <p className="text-primary-foreground/70 font-body text-sm">
          © {new Date().getFullYear()} Igreja Adventista da Promessa. Todos os direitos reservados.
        </p>
        <p className="text-primary-foreground/50 font-body text-xs mt-2">
          "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." — João 3:16
        </p>
      </div>
    </footer>);

};

export default Footer;