import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import {
  CalendarDays,
  ShieldCheck,
  FileText,
  Stethoscope,
  Clock3,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Users,
  Database,
  Flower2,
  BadgeCheck,
  FolderOpen,
  ScanLine,
  X,
  Send,
  Loader2,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const features = [
  {
    icon: FileText,
    title: "Historia clínica digital",
    desc: "Centraliza antecedentes, consultas, evolución médica, diagnósticos y observaciones en un solo lugar.",
  },
  {
    icon: CalendarDays,
    title: "Agenda y control de citas",
    desc: "Organiza consultas, reduce ausencias y mantén una gestión clara del día a día del consultorio.",
  },
  {
    icon: FolderOpen,
    title: "Documentos e informes",
    desc: "Adjunta estudios, reportes, recetas, órdenes médicas e historial complementario por paciente.",
  },
  {
    icon: ScanLine,
    title: "Imágenes y archivos clínicos",
    desc: "Guarda fotografías, resultados e imágenes relevantes dentro del expediente del paciente.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad y respaldo",
    desc: "Protege la información médica con acceso controlado, organización por usuarios y respaldo estructurado.",
  },
  {
    icon: BarChart3,
    title: "Mejor control operativo",
    desc: "Visualiza mejor el flujo del consultorio y toma decisiones con información más ordenada y accesible.",
  },
];

const benefits = [
  "Reduce el uso de papel y la pérdida de información.",
  "Acelera el registro clínico y la consulta del expediente.",
  "Mejora la experiencia del médico, asistente y paciente.",
  "Facilita el crecimiento desde un consultorio hasta una clínica.",
  "Permite una operación más moderna, organizada y profesional.",
];

const modules = [
  {
    icon: Stethoscope,
    title: "Consultorios privados",
    desc: "Ideal para médicos que desean ordenar su consulta y proyectar una imagen más moderna.",
  },
  {
    icon: Users,
    title: "Centros médicos",
    desc: "Útil para equipos con recepción, asistentes y varios especialistas trabajando sobre una misma operación.",
  },
  {
    icon: Flower2,
    title: "Especialidades médicas",
    desc: "Adaptable a distintas ramas médicas con formularios y registros según la necesidad del servicio.",
  },
  {
    icon: Smartphone,
    title: "Gestión práctica",
    desc: "Pensado para trabajar con rapidez, claridad visual y acceso simple desde cualquier navegador.",
  },
];

const steps = [
  "Solicitas una demo y analizamos tu tipo de consulta o centro médico.",
  "Configuramos DaliaMed según tu flujo de trabajo y necesidades principales.",
  "Comienzas a registrar pacientes, citas y documentos en una plataforma centralizada.",
];

const faqs = [
  {
    q: "¿DaliaMed sirve solo para un médico o también para equipos?",
    a: "Puede adaptarse tanto a consultorios individuales como a centros médicos con varios usuarios y roles operativos.",
  },
  {
    q: "¿Puedo guardar imágenes y reportes de pacientes?",
    a: "Sí. La plataforma está pensada para integrar documentos, archivos clínicos e imágenes dentro del expediente del paciente.",
  },
  {
    q: "¿Se puede escalar a futuro?",
    a: "Sí. La propuesta está orientada a crecer por módulos, usuarios, almacenamiento y funcionalidades según el avance del proyecto.",
  },
  {
    q: "¿La plataforma puede personalizarse?",
    a: "Sí. DaliaMed puede evolucionar con nuevas funciones, formularios y módulos de acuerdo con el tipo de práctica médica.",
  },
];

// Configuración de EmailJS
// NOTA: Estos son valores de ejemplo. El usuario debe configurar su cuenta en https://www.emailjs.com/
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_daliamed',
  TEMPLATE_ID: 'template_demo_request',
  PUBLIC_KEY: 'your_public_key_here',
};

function SectionTitle({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl space-y-3">
      <Badge className="rounded-full px-4 py-1 text-sm">{badge}</Badge>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-slate-600 md:text-lg">{subtitle}</p>
    </div>
  );
}

// Modal de Solicitar Demo
function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Verificar que EmailJS esté configurado
      if (EMAILJS_CONFIG.PUBLIC_KEY === 'your_public_key_here') {
        // Simulación de envío para desarrollo
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Demo request simulated:', {
          to_email: 'jose.brito.soporte@gmail.com',
          form_data: new FormData(formRef.current!),
        });
      } else {
        // Envío real con EmailJS
        await emailjs.sendForm(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          formRef.current!,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        formRef.current?.reset();
      }, 3000);
    } catch (err) {
      setError('Hubo un error al enviar el formulario. Por favor intente nuevamente.');
      console.error('EmailJS error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Solicitar Demo</DialogTitle>
            <DialogDescription className="text-white/90">
              Complete el formulario y nos pondremos en contacto con usted.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-fuchsia-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">¡Solicitud Enviada!</h3>
                <p className="text-slate-600">
                  Gracias por su interés. Nos pondremos en contacto con usted pronto.
                </p>
              </motion.div>
            ) : (
              <motion.form
                ref={formRef}
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <input type="hidden" name="to_email" value="jose.brito.soporte@gmail.com" />
                
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Dr. Juan Pérez"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@ejemplo.com"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    placeholder="+58 412-1234567"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje</Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="Cuéntenos sobre sus necesidades..."
                    rows={2}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Al enviar, acepta que nos contactemos con usted vía email o teléfono.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-fuchsia-50 via-violet-50 to-white" />

      {/* Header con botón de Iniciar Sesión */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white shadow-sm">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">DaliaMed</div>
              <div className="text-xs text-slate-500">Software médico inteligente</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollToSection('funciones')} className="text-sm text-slate-600 transition hover:text-slate-900">Funciones</button>
            <button onClick={() => scrollToSection('beneficios')} className="text-sm text-slate-600 transition hover:text-slate-900">Beneficios</button>
            <button onClick={() => scrollToSection('como-funciona')} className="text-sm text-slate-600 transition hover:text-slate-900">Cómo funciona</button>
            <button onClick={() => scrollToSection('faq')} className="text-sm text-slate-600 transition hover:text-slate-900">Preguntas</button>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-900"
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Button>
            <Button 
              className="rounded-full px-5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
              onClick={() => navigate('/register')}
            >
              Comenzar gratis
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
            <motion.div className="space-y-8" {...fadeUp}>
              <Badge className="rounded-full px-4 py-1 text-sm">SaaS médico para consultorios y centros de salud</Badge>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                  Gestiona tu consulta médica con más orden, rapidez y confianza.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-600">
                  DaliaMed digitaliza la historia clínica, organiza citas, centraliza documentos e impulsa una atención más eficiente para médicos, especialistas y centros médicos.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button 
                  size="lg" 
                  className="rounded-full px-7 text-base bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
                  onClick={() => navigate('/register')}
                >
                  Comenzar gratis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-7 text-base"
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  Solicitar demo
                </Button>
              </div>

              <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ["+Orden", "Expedientes centralizados"],
                  ["+Control", "Citas y operación diaria"],
                  ["+Profesionalismo", "Experiencia moderna"],
                ].map(([title, desc]) => (
                  <Card key={title} className="rounded-2xl border-slate-200/70 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-sm font-semibold text-slate-900">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">{desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div className="relative" {...fadeUp}>
              <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-fuchsia-200/50 blur-3xl" />
              <div className="absolute -right-6 bottom-0 h-52 w-52 rounded-full bg-violet-200/50 blur-3xl" />

              <Card className="relative overflow-hidden rounded-[28px] border-white/70 shadow-2xl shadow-slate-200/80">
                <CardContent className="p-0">
                  <div className="border-b bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                    </div>
                  </div>

                  <div className="grid gap-5 bg-white p-5 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm text-slate-500">Paciente</div>
                            <div className="font-semibold">María González</div>
                          </div>
                          <Badge variant="secondary" className="rounded-full">Consulta activa</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                          <div className="rounded-xl bg-white p-3">
                            <div className="text-slate-500">Edad</div>
                            <div className="font-medium text-slate-900">42 años</div>
                          </div>
                          <div className="rounded-xl bg-white p-3">
                            <div className="text-slate-500">Última cita</div>
                            <div className="font-medium text-slate-900">15/04/2026</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <FileText className="h-4 w-4" />
                          Evolución clínica
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full rounded-full bg-slate-100" />
                          <div className="h-3 w-11/12 rounded-full bg-slate-100" />
                          <div className="h-3 w-10/12 rounded-full bg-slate-100" />
                          <div className="h-3 w-7/12 rounded-full bg-slate-100" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-2xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <CalendarDays className="h-4 w-4" />
                          Agenda del día
                        </div>
                        <div className="space-y-3">
                          {[
                            "08:00 - Consulta general",
                            "10:30 - Control postoperatorio",
                            "13:00 - Evaluación diagnóstica",
                          ].map((item) => (
                            <div key={item} className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-gradient-to-br from-fuchsia-600 to-violet-600 p-4 text-white">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ShieldCheck className="h-4 w-4" />
                          Información organizada y protegida
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/90">
                          Acceso estructurado, mejor control operativo y una experiencia moderna para tu práctica médica.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-8 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 rounded-[30px] border border-slate-200 bg-slate-50 p-6 md:grid-cols-4">
            {[
              { icon: Clock3, title: "Menos tiempo", desc: "en tareas repetitivas" },
              { icon: Database, title: "Más control", desc: "sobre expedientes y archivos" },
              { icon: BadgeCheck, title: "Más confianza", desc: "en el proceso clínico" },
              { icon: Users, title: "Más capacidad", desc: "para crecer con tu equipo" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl bg-white p-5 shadow-sm">
                  <Icon className="mb-3 h-5 w-5" />
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section id="funciones" className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <motion.div {...fadeUp}>
              <SectionTitle
                badge="Funciones clave"
                title="Todo lo esencial para digitalizar tu consulta en una sola plataforma"
                subtitle="DaliaMed está diseñado para ayudarte a trabajar con más claridad, orden y continuidad en cada atención médica."
              />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.04 }}>
                    <Card className="h-full rounded-3xl border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="bg-slate-950 px-6 py-20 text-white lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div className="space-y-8" {...fadeUp}>
              <Badge className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white hover:bg-white/10">
                Beneficios reales
              </Badge>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Menos desorden administrativo. Más tiempo para atender mejor.
                </h2>
                <p className="max-w-xl text-lg leading-8 text-white/75">
                  La digitalización clínica no solo mejora el registro médico: también fortalece la operación, la imagen profesional y la continuidad de la atención.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-white/90">{benefit}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp}>
              <Card className="overflow-hidden rounded-[32px] border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-7">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-sm text-white/60">Expedientes</div>
                      <div className="mt-2 text-3xl font-semibold">Centralizados</div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm text-white/60">Citas</div>
                        <div className="mt-2 text-2xl font-semibold">Organizadas</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm text-white/60">Archivos clínicos</div>
                        <div className="mt-2 text-2xl font-semibold">Disponibles</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 p-5">
                      <div className="text-sm text-white/70">Resultado</div>
                      <div className="mt-2 text-2xl font-semibold">Una operación médica más moderna y escalable</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <motion.div {...fadeUp}>
              <SectionTitle
                badge="Pensado para crecer"
                title="Una solución adaptable a distintos tipos de práctica médica"
                subtitle="Desde consultas privadas hasta equipos de trabajo más amplios, DaliaMed puede evolucionar junto a tu operación."
              />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <motion.div key={module.title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.05 }}>
                    <Card className="h-full rounded-3xl border-slate-200 shadow-sm">
                      <CardContent className="p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold">{module.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{module.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="como-funciona" className="bg-slate-50 px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <motion.div {...fadeUp}>
              <SectionTitle
                badge="Cómo funciona"
                title="Empieza de forma simple y avanza a tu ritmo"
                subtitle="La propuesta de DaliaMed está diseñada para implementarse de manera práctica, sin complicar la operación médica diaria."
              />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div key={step} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.05 }}>
                  <Card className="h-full rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-7 text-slate-700">{step}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-12">
            <motion.div {...fadeUp}>
              <SectionTitle
                badge="Preguntas frecuentes"
                title="Lo que un médico o centro de salud quiere saber antes de comenzar"
                subtitle="Estas respuestas pueden ayudarte a usar la landing como pieza comercial para presentar DaliaMed a potenciales clientes."
              />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <motion.div key={faq.q} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.04 }}>
                  <Card className="h-full rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              {...fadeUp}
              className="overflow-hidden rounded-[36px] bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 p-8 text-white md:p-12"
            >
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-4">
                  <Badge className="rounded-full border border-white/25 bg-white/10 px-4 py-1 text-white hover:bg-white/10">
                    DaliaMed
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                    Moderniza tu práctica médica con una plataforma pensada para crecer contigo.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-white/90 md:text-lg">
                    Presenta DaliaMed como una solución profesional, moderna y escalable para médicos que desean dejar atrás el desorden y llevar su consulta a un nuevo nivel.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="rounded-full px-8 text-base text-slate-900"
                    onClick={() => navigate('/register')}
                  >
                    Comenzar gratis — 14 días
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full border-white/30 bg-white/10 px-8 text-base text-white hover:bg-white/20 hover:text-white"
                    onClick={() => navigate('/login')}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">DaliaMed</div>
            <div className="text-sm text-slate-500">
              Plataforma SaaS para la gestión clínica moderna.
            </div>
          </div>
          <div className="text-sm text-slate-500">© 2026 DaliaMed. Todos los derechos reservados.</div>
        </div>
      </footer>

      {/* Modal de Demo */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}
