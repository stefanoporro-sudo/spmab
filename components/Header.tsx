"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#servizi", label: "Servizi" },
  { href: "/#chi-sono", label: "Chi Sono" },
  { href: "/blog", label: "Blog" },
  { href: "/#contatti", label: "Contatti" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-dark-900/95 backdrop-blur-md border-b border-dark-700 py-3"
          : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-display font-bold text-lg leading-none">S</span>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white tracking-tight leading-none">
              Consulenza Pizzaiolo
            </div>
            <div className="text-brand-400 text-xs font-medium tracking-widest uppercase leading-none mt-0.5">
              Stefano Porro
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-brand-300 font-medium text-sm transition-colors duration-200 tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#contatti"
          className="hidden md:inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/30"
        >
          Consulenza Gratuita
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-6 py-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-200 hover:text-brand-300 font-medium text-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contatti"
            onClick={() => setMenuOpen(false)}
            className="btn-primary self-start text-sm px-6 py-3"
          >
            Consulenza Gratuita
          </a>
        </div>
      )}
    </header>
  );
}
