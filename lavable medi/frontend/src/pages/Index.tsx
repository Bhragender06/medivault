import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Users, ArrowRight, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Shield,
    title: "Proof of Existence",
    description: "Every medical entry is timestamped and anchored to the blockchain, creating a verifiable chronological history.",
  },
  {
    icon: Lock,
    title: "Tamper Detection",
    description: "Any attempt to modify a record triggers an immediate hash mismatch, alerting all stakeholders instantly.",
  },
  {
    icon: FileCheck,
    title: "Complete Audit Trail",
    description: "Permanent logging of every access, modification, and sharing event with full visibility.",
  },
  {
    icon: Users,
    title: "Distributed Trust",
    description: "Records remain available even if specific nodes or servers go offline through decentralization.",
  },
];

const steps = [
  { icon: FileCheck, title: "Patient Uploads Record", description: "Securely upload any medical document. Our system encrypts the file at the edge." },
  { icon: Shield, title: "Blockchain Verification", description: "A unique cryptographic hash is generated and written to the immutable ledger." },
  { icon: Users, title: "Secure Sharing", description: "Grant temporary, audited access to your healthcare providers with a single click." },
];

const testimonials = [
  {
    quote: "MediVault has solved the interoperability crisis for my private practice. My patients finally own their data.",
    author: "Dr. Sarah Chen",
    role: "Chief of Informatics",
    stars: 5,
  },
  {
    quote: "As a patient advocate, seeing blockchain used for medical records is a game-changer. No more lost papers.",
    author: "Elena Rodriguez",
    role: "Patient Advocate",
    stars: 5,
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
              <Shield className="h-4 w-4 text-teal" />
            </div>
            <span className="font-bold text-lg text-primary">MediVault</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/login")}>Verify Record</Button>
            <Button className="gradient-hero text-primary-foreground" onClick={() => navigate("/register")}>
              Get Early Access
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge-verified mb-4 inline-block">
                <CheckCircle className="h-3 w-3" /> Blockchain Verified Protocol
              </span>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Medical Records,{" "}
                <span className="text-accent">Reimagined</span> for the Blockchain Era.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                Secure, immutable, and patient-centric. MediVault leverages distributed ledger technology
                to ensure your health data is tamper-proof and instantly accessible to authorized providers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-hero text-primary-foreground" onClick={() => navigate("/register")}>
                  Claim Your Identity
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Learn How It Works <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Pillars of Immutable Care</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our protocol replaces centralized vulnerability with cryptographic certainty.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-medical group"
              >
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Protocol. Total Security.</h2>
            <p className="text-muted-foreground">Complexity under the hood. For you, it's as simple as 1-2-3.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Trusted by the Forefront of Care</h2>
            <p className="text-muted-foreground">Empowering patients and clinicians with data integrity.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {testimonials.map((t) => (
              <div key={t.author} className="card-medical">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-hero rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Secure Your Medical Future?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
              Join the growing network of providers and patients moving towards a truly decentralized health ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gradient-accent text-accent-foreground font-semibold" onClick={() => navigate("/register")}>
                Claim Your Identity
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/login")}>
                Request Enterprise Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="font-bold text-primary">MediVault</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 MediVault Protocol. HIPAA & GDPR Compliant. Immutable Infrastructure.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
