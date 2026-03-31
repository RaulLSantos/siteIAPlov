import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-iap.png";

const navItems = [
{ label: "Home", href: "#home" },
{ label: "Sobre", href: "#sobre" },
{ label: "Ministérios", href: "#ministerios" },
{ label: "Agenda", href: "#agenda" },
{ label: "Contato", href: "#contato" }];


const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#home" className="flex items-center gap-2">
          <img alt="Logotipo IAP" className="h-10 md:h-14 w-auto" src={logo} />
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
          <li key={item.href}>
              <a
              href={item.href}
              className="text-foreground/80 hover:text-primary font-medium transition-colors text-sm tracking-wide uppercase font-body">
              
                {item.label}
              </a>
            </li>
          )}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground p-2"
          aria-label="Menu">
          
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open &&
      <div className="md:hidden bg-card border-t border-border">
          <ul className="flex flex-col py-4">
            {navItems.map((item) =>
          <li key={item.href}>
                <a
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-foreground/80 hover:text-primary hover:bg-muted font-medium transition-colors font-body">
              
                  {item.label}
                </a>
              </li>
          )}
          </ul>
        </div>
      }
    </nav>);

};

export default Navbar;