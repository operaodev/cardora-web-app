export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand & Info */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Cardora Logo" className="w-8 h-8" />
            <span className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
              Cardora
            </span>
          </div>

          {/* Separator (only desktop) */}
          <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

          {/* Short description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            La plataforma definitiva para coleccionistas de Yu-Gi-Oh!
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          © 2026 CARDORA · LATAM
        </p>

      </div>
    </footer>
  );
}
