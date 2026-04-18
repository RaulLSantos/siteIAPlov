import { useState, useEffect, useRef, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
// use sempre o asset local (importado do src/assets)
import logoLocal from "@/assets/logo-iap.jpg";

const navItems = [
    { label: "Home", href: "#home" },
    { label: "Sobre", href: "#sobre" },
    { label: "Ministérios", href: "#ministerios" },
    { label: "Agenda", href: "#agenda" },
    { label: "Contato", href: "#contato" },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    // sempre usar o asset local; remover dependência de recursos remotos
    const [logoSrc, setLogoSrc] = useState<string>(logoLocal);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        // Apenas logs de depuração sobre o elemento de imagem (não altera src)
        const img = imgRef.current;
        if (img) {
            console.log("[Navbar] logo src (initial):", img.src);
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
                const nav = document.querySelector("nav");
                const navHeight = nav ? (nav as HTMLElement).offsetHeight : 0;
                const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top, behavior: "smooth" });

                try {
                    history.replaceState(null, "", `#${id}`);
                } catch {
                    window.location.hash = `#${id}`;
                }
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
                            src={logoSrc}
                            alt="Logotipo"
                            className="h-10 md:h-14 w-auto object-contain"
                            onError={(ev) => {
                                const img = ev.currentTarget as HTMLImageElement;
                                if (img.src !== logoLocal) {
                                    img.onerror = null;
                                    img.src = logoLocal;
                                }
                            }}
                        />
                        <span className="hidden sm:inline-block ml-2 text-sm md:text-base font-medium font-body">
                          Igreja Adventista da Promessa
                        </span>
                    </a>

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

                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden text-foreground p-2"
                        aria-label="Menu"
                    >
                        {open ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

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

            <div className="h-16 md:h-20" aria-hidden="true" />
        </>
    );
};

export default Navbar;
