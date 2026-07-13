import { useState } from "react";
import { Icon } from "@iconify-icon/react";

const faqs = [
  {
    question: "¿Es gratis usar Cardora para mi colección?",
    answer: "Sí, registrar y organizar tu colección personal es totalmente gratuito. Nuestro objetivo principal es brindarte la mejor herramienta para mantener el control de tus binders e inventarios sin costos ocultos."
  },
  {
    question: "¿De dónde provienen los datos y las imágenes de las cartas?",
    answer: "Nuestra base de datos (Cardex) se sincroniza continuamente con los principales proveedores globales (como YGOPRODeck para Yu-Gi-Oh!), asegurando que siempre tengas acceso a las expansiones y cartas más recientes en excelente calidad."
  },
  {
    question: "¿Cómo puedo organizar mis cartas dentro de la plataforma?",
    answer: "Puedes crear múltiples carpetas virtuales ('Binders') personalizadas. Esto te permite separar fácilmente tus mazos competitivos de tu colección general, o clasificar tus cartas por rarezas, juegos o sets específicos."
  },
  {
    question: "¿Los precios mostrados están actualizados?",
    answer: "Mostramos valores estimados basados en el mercado actual para que siempre conozcas el valor aproximado de tu inventario. Sin embargo, ten en cuenta que el valor real puede variar dependiendo del mercado local y la condición exacta (NM, LP, etc.) de la carta física."
  },
  {
    question: "¿Se pueden añadir cartas de otros juegos además de Yu-Gi-Oh!?",
    answer: "Actualmente, nuestro catálogo está fuertemente enfocado en Yu-Gi-Oh!. No obstante, nuestra arquitectura está construida para soportar múltiples Trading Card Games, por lo que iremos añadiendo soporte para otros juegos gradualmente."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full mb-24 mt-16">
      <div className="mb-10 text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-title mb-3">
          Preguntas frecuentes
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Todo lo que necesitas saber sobre cómo organizar tu inventario.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className={`border rounded-xl transition-all duration-300 ${
                isOpen 
                  ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] shadow-sm" 
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left outline-none"
              >
                <span className="font-semibold text-title text-base pr-8">{faq.question}</span>
                <Icon 
                  icon="mdi:chevron-down" 
                  className={`text-2xl text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 pt-1 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
