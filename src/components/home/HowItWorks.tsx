export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Encuentra y Cataloga.",
      description: "Busca cualquier carta en nuestra base de datos sincronizada globalmente y añádela a tu inventario personal al instante."
    },
    {
      number: "02",
      title: "Organiza en Binders.",
      description: "Crea carpetas virtuales para estructurar tus colecciones por juego, expansiones, rarezas o tus mazos favoritos."
    },
    {
      number: "03",
      title: "Controla tu Valor.",
      description: "Mantén un registro detallado del estado y rareza de cada carta para conocer siempre el valor de tu colección."
    }
  ];

  return (
    <section className="w-full mt-16 md:mt-24 mb-16">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
          PROCESO
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-title">
          Cómo funciona.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="block text-indigo-600 dark:text-indigo-500 font-mono text-sm font-bold mb-6">
              {step.number}
            </span>
            <h3 className="text-xl font-bold text-title mb-4">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
