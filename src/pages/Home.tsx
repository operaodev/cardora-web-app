import HeroShowcase from "@/components/home/HeroShowcase";
import TopStockTable from "@/components/home/TopStockTable";
import HowItWorks from "@/components/home/HowItWorks";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex-1">
        {/* ROW 1: Hero & Table */}
        <div className="flex flex-col xl:flex-row gap-8 w-full items-stretch">
          {/* Columna Izquierda: Hero Showcase */}
          <div className="w-full xl:w-[70%] shrink-0">
            <HeroShowcase />
          </div>
          
          {/* Columna Derecha: Top Stock Table */}
          <div className="w-full xl:w-[30%] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
            <TopStockTable />
          </div>
        </div>

        {/* ROW 2: How It Works */}
        <HowItWorks />

        {/* ROW 3: FAQ */}
        <FAQ />
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}