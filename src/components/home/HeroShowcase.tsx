import { Icon } from "@iconify-icon/react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/useUserStore";
import { useState, useEffect } from "react";

const BG_CARDS = [
  "https://images.ygoprodeck.com/images/cards/89631139.jpg",
  "https://images.ygoprodeck.com/images/cards/46986414.jpg",
  "https://images.ygoprodeck.com/images/cards/74677422.jpg",
  "https://images.ygoprodeck.com/images/cards/83764718.jpg",
  "https://images.ygoprodeck.com/images/cards/5318639.jpg",
  "https://images.ygoprodeck.com/images/cards/24094653.jpg",
  "https://images.ygoprodeck.com/images/cards/55144522.jpg",
  "https://images.ygoprodeck.com/images/cards/53129443.jpg",
];

const HERO_SLIDES = [
  {
    tag: "Nuevo · Gestión de Inventario",
    title: (
      <>Organiza tus colecciones de <span className="text-indigo-600 dark:text-indigo-400">Cartas y Binders</span></>
    ),
    description: "Lleva un registro detallado de todo tu catálogo en un solo lugar. Crea, administra y descubre inventarios de forma segura.",
    cards: [
      "https://images.ygoprodeck.com/images/cards/89631139.jpg",
      "https://images.ygoprodeck.com/images/cards/46986414.jpg",
      "https://images.ygoprodeck.com/images/cards/74677422.jpg",
    ]
  },
  {
    tag: "Seguimiento en Tiempo Real",
    title: (
      <>Conoce el valor de tu <span className="text-emerald-500 dark:text-emerald-400">Colección</span></>
    ),
    description: "Mantente al día con los precios del mercado. Sincronizamos la información con bases de datos globales para que siempre sepas cuánto vale tu inventario.",
    cards: [
      "https://images.ygoprodeck.com/images/cards/23995346.jpg", // Blue-Eyes White Dragon
      "https://images.ygoprodeck.com/images/cards/83764718.jpg", // Monster Reborn
      "https://images.ygoprodeck.com/images/cards/5318639.jpg",  // Mystical Space Typhoon
    ]
  },
  {
    tag: "Herramientas Avanzadas",
    title: (
      <>Visualiza y Comparte tus <span className="text-purple-600 dark:text-purple-400">Binders</span></>
    ),
    description: "Explora catálogos, gestiona carpetas personalizadas (binders) por rarezas, juegos o sets, e interactúa con otros coleccionistas.",
    cards: [
      "https://images.ygoprodeck.com/images/cards/14558127.jpg", // Ash Blossom
      "https://images.ygoprodeck.com/images/cards/24094653.jpg", // Polymerization
      "https://images.ygoprodeck.com/images/cards/55144522.jpg", // Pot of Greed
    ]
  }
];

export default function HeroShowcase() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleInventoryClick = () => {
    if (isAuthenticated) {
      navigate("/inventory/me");
    } else {
      navigate("/login?redirect=/inventory/me");
    }
  };

  const handleExploreClick = () => {
    navigate("/marketplace");
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-full min-h-[650px] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex items-center justify-center">
      
      {/* --- BACKGROUND MARQUEES --- */}
      {/* Top Faded Marquee */}
      <div className="absolute top-0 left-0 w-full h-32 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 mask-v-fade-top">
        <div className="flex gap-4 w-[200%] animate-marquee">
          {BG_CARDS.map((img, i) => (
            <img key={`top-${i}`} src={img} className="h-full w-auto object-cover rounded-md shadow-sm" alt="" />
          ))}
        </div>
      </div>

      {/* Bottom Faded Marquee */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 mask-v-fade-bottom">
        <div className="flex gap-4 w-[200%] animate-marquee-reverse">
          {BG_CARDS.map((img, i) => (
            <img key={`bot-${i}`} src={img} className="h-full w-auto object-cover rounded-md shadow-sm" alt="" />
          ))}
        </div>
      </div>

      {/* --- CONTENT SLIDES --- */}
      {HERO_SLIDES.map((slide, i) => {
        const isActive = currentSlide === i;
        
        return (
          <div 
            key={i}
            className={`absolute inset-0 flex flex-col lg:flex-row p-8 md:p-12 lg:p-16 items-center transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Left Text Column */}
            <div 
              className={`flex-1 space-y-8 lg:pr-12 text-center lg:text-left transition-all duration-700 transform ${
                isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <p className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">
                {slide.tag}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight text-balance">
                {slide.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-2xl text-balance">
                {slide.description}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={handleInventoryClick}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg shadow-indigo-600/30 text-lg"
                >
                  Inventario <Icon icon="mdi:arrow-right" className="text-xl" />
                </button>
                <button 
                  onClick={handleExploreClick}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
                >
                  Explorar Binders
                </button>
              </div>
            </div>

            {/* Right 3D Cards Column (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative h-[500px] w-full items-center justify-center perspective-[1200px]">
              
              {/* Card 1 (Left) */}
              <div 
                className={`absolute w-44 md:w-60 aspect-[475/696] rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 ease-out hover:-translate-y-4 hover:rotate-[-5deg] hover:z-30 ${
                  isActive ? "-translate-x-[45%] -rotate-[12deg] scale-[0.85]" : "translate-x-0 rotate-0 scale-[0.5]"
                }`}
                style={{ zIndex: 10 }}
              >
                <img src={slide.cards[0]} className="w-full h-full object-cover" alt="Card Left" />
                <div className="absolute inset-0 bg-black/10 rounded-xl" />
              </div>

              {/* Card 3 (Right) */}
              <div 
                className={`absolute w-44 md:w-60 aspect-[475/696] rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 ease-out hover:-translate-y-4 hover:rotate-[5deg] hover:z-30 ${
                  isActive ? "translate-x-[45%] rotate-[12deg] scale-[0.85]" : "translate-x-0 rotate-0 scale-[0.5]"
                }`}
                style={{ zIndex: 15 }}
              >
                <img src={slide.cards[2]} className="w-full h-full object-cover" alt="Card Right" />
                <div className="absolute inset-0 bg-black/10 rounded-xl" />
              </div>

              {/* Card 2 (Center) */}
              <div 
                className={`absolute w-52 md:w-72 aspect-[475/696] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out hover:-translate-y-6 hover:scale-[1.15] ${
                  isActive ? "translate-x-0 rotate-[2deg] scale-[1.05]" : "translate-x-0 -rotate-[10deg] scale-[0.5]"
                }`}
                style={{ zIndex: 20 }}
              >
                <img src={slide.cards[1]} className="w-full h-full object-cover" alt="Card Center" />
                {/* Holographic foil overlay on center card */}
                <div 
                  className="absolute inset-0 opacity-30 mix-blend-color-dodge pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(115deg, transparent 20%, #e280ff 30%, #80c5ff 40%, transparent 50%, #e280ff 60%, #80c5ff 70%, transparent 80%)',
                    backgroundSize: '200% 200%',
                    animation: 'holo-shift 4s ease infinite'
                  }} 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none" />
              </div>
              
            </div>
          </div>
        );
      })}

      {/* Pagination Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-800">
        {HERO_SLIDES.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === i ? "w-8 bg-indigo-600" : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`} 
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Embedded CSS for animations and masks */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        .mask-v-fade-top {
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }
        .mask-v-fade-bottom {
          mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }
        @keyframes holo-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
