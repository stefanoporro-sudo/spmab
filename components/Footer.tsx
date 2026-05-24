import { Mail, Linkedin } from "lucide-react";

const footerLinks = [
  { label: "Servizi", href: "#servizi" },
  { label: "Chi Sono", href: "#chi-sono" },
  { label: "Perché SPMAB", href: "#perche-spmab" },
  { label: "Contatti", href: "#contatti" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-700 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white font-display font-bold">S</span>
              </div>
              <span className="font-display font-bold text-xl text-white">SPMAB</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Consulenza professionale per Pizzaioli, Molini e Startup nel settore
              della panificazione e ristorazione artigianale.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-semibold">
              Navigazione
            </div>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-brand-300 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-semibold">
              Contatti diretti
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:stefano@consulenzapizzaiolo.it"
                className="flex items-center gap-3 text-gray-400 hover:text-brand-300 text-sm transition-colors group"
              >
                <Mail size={15} className="text-brand-500 group-hover:text-brand-400" />
                stefano@consulenzapizzaiolo.it
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-gray-400 hover:text-brand-300 text-sm transition-colors group"
              >
                <Linkedin size={15} className="text-brand-500 group-hover:text-brand-400" />
                LinkedIn — Stefano Porro
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-dark-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-600 text-xs">
          <div>© {year} SPMAB — Stefano Porro. Tutti i diritti riservati.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
