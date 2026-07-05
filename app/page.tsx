import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import WhySPMAB from "@/components/WhySPMAB";
import Testimonials from "@/components/Testimonials";
import UltimiArticoli from "@/components/UltimiArticoli";
import AnteprimaForum from "@/components/AnteprimaForum";
import CTA from "@/components/CTA";
import Newsletter from "@/components/Newsletter";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Services />
      <About />
      <WhySPMAB />
      <Testimonials />
      <UltimiArticoli />
      <AnteprimaForum />
      <CTA />
      <Newsletter />
      <ContactForm />
      <Footer />
    </main>
  );
}
