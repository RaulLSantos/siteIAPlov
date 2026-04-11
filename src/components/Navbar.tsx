import { useState, useEffect, useRef, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
// fallback de build: import do asset presente no projeto (igual Footer)
import logoLocal from "@/assets/logo-iap.jpg";

// caminho público em docs (fallback remoto)
const remoteLogo = `${import.meta.env.BASE_URL}lovable-uploads/336e7ed0-418d-4f4e-98c8-89cf8a22fa62.png`;

const navItems = [
    { label: "Home", href: "#home" },
    { label: "Sobre", href: "#sobre" },
    { label: "Ministérios", href: "#ministerios" },
    { label: "Agenda", href: "#agenda" },
    { label: "Contato", href: "#contato" },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        // Log de depuração: mostra a src no runtime e estilos computados
        const img = imgRef.current;
        if (img) {
            console.log("[Navbar] logo src:", img.src);
            const cs = getComputedStyle(img);
            console.log(
                "[Navbar] computed styles - display:",
                cs.display,
                "width:",
                cs.width,
                "height:",
                cs.height,
                "opacity:",
                cs.opacity,
                "visibility:",
                cs.visibility,
                "object-fit:",
                cs.objectFit
            );
        } else {
            console.warn("[Navbar] logo img não encontrada no DOM");
        }
    }, []);

    const handleNavigate = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const id = href.startsWith("#") ? href.slice(1) : null;
        if (id) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            } else {
                window.location.hash = href;
            }
        } else {
            window.location.href = href;
        }
        setOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-sm">
                <div className="container flex items-center justify-between h-16 md:h-20">
                    <a
                        href="#home"
                        className="flex items-center gap-2"
                        onClick={(e) => handleNavigate(e, "#home")}
                    >
                        <img
                            ref={imgRef}
                            src={remoteLogo} // tenta publicar a imagem primeiro
                            alt="Logotipo"
                            className="h-10 md:h-14 w-auto object-contain"
                            // borda temporária para visualizar se o elemento está renderizando
                            style={{ border: "2px solid rgba(255,0,0,0.6)" }}
                            onError={(ev) => {
                                const img = ev.currentTarget as HTMLImageElement;
                                if (img.src !== logoLocal) {
                                    img.onerror = null;
                                    img.src = logoLocal;
                                }
                            }}
                        />
                    </a>

                    {/* Desktop */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    onClick={(e) => handleNavigate(e, item.href)}
                                    className="text-foreground/80 hover:text-primary font-medium transition-colors text-sm tracking-wide uppercase font-body"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden text-foreground p-2"
                        aria-label="Menu"
                    >
                        {open ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden bg-card border-t border-border">
                        <ul className="flex flex-col py-4">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        onClick={(e) => handleNavigate(e, item.href)}
                                        className="block px-6 py-3 text-foreground/80 hover:text-primary hover:bg-muted font-medium transition-colors font-body"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>

            {/* Spacer para que conteúdo não fique sob o nav fixo */}
            <div className="h-16 md:h-20" aria-hidden="true" />
        </>
    );
};

export default Navbar;