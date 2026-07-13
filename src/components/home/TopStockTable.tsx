import { Link } from "react-router-dom";

// MOCK DATA: Cartas con mayor stock
const TOP_STOCK_CARDS = [
  {
    id: 1,
    name: "Artifact Lancea",
    game: "YGO",
    gameColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    code: "RA01-EN006",
    condition: "NM",
    rarity: "Super Rare",
    rarityColor: "bg-gray-800 text-white dark:bg-gray-700",
    price: 2.00,
    time: "hace 6min",
    image: "https://images.ygoprodeck.com/images/cards/34230233.jpg",
  },
  {
    id: 2,
    name: "Trap Dustshoot",
    game: "YGO",
    gameColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    code: "RA05-EN077",
    condition: "NM",
    rarity: "Secret Rare",
    rarityColor: "bg-black text-white dark:bg-black",
    price: 7.00,
    time: "hace 11min",
    image: "https://images.ygoprodeck.com/images/cards/64697231.jpg",
  },
  {
    id: 3,
    name: "Trap Dustshoot",
    game: "YGO",
    gameColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    code: "RA05-EN077",
    condition: "NM",
    rarity: "Collector's Rare",
    rarityColor: "bg-black text-yellow-500 border border-yellow-600",
    price: 7.00,
    time: "hace 11min",
    image: "https://images.ygoprodeck.com/images/cards/64697231.jpg",
  },
  {
    id: 4,
    name: "Salvage",
    game: "YGO",
    gameColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    code: "OGN",
    condition: "NM",
    rarity: "uncommon",
    rarityColor: "bg-emerald-900 text-emerald-400 dark:bg-emerald-950",
    price: 10.00,
    time: "hace 42min",
    image: "https://images.ygoprodeck.com/images/cards/96947648.jpg",
  },
  {
    id: 5,
    name: "Discipline",
    game: "YGO",
    gameColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    code: "OGN",
    condition: "NM",
    rarity: "uncommon",
    rarityColor: "bg-emerald-900 text-emerald-400 dark:bg-emerald-950",
    price: 8.00,
    time: "hace 42min",
    image: "https://images.ygoprodeck.com/images/cards/96947648.jpg",
  },
];

export default function TopStockTable() {
  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#0a0a0a] rounded-3xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-title">Mayor Stock</h3>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">Top 5</span>
      </div>

      {/* LIST */}
      <div className="flex flex-col flex-1 gap-2 justify-between">
        {TOP_STOCK_CARDS.map((card, index) => (
          <Link
            key={card.id}
            to={`/marketplace/${card.id}`}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
              index === 0 ? "bg-gray-50 dark:bg-gray-900/50" : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
            }`}
          >
            {/* Rank Number */}
            <span className="w-6 text-center text-lg font-semibold text-gray-400">
              {index + 1}
            </span>

            {/* Card Image */}
            <div className="w-14 h-20 shrink-0 rounded-md overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
            </div>

            {/* Card Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {card.name}
              </h3>
              
              <div className="flex items-center flex-wrap gap-2 mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${card.gameColor}`}>
                  {card.game}
                </span>
                <span className="font-medium">{card.code}</span>
                <span>·</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">{card.condition}</span>
              </div>
              
              <div className="mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-sm ${card.rarityColor}`}>
                  {card.rarity}
                </span>
              </div>
            </div>

            {/* Price and Time */}
            <div className="flex flex-col items-end justify-center shrink-0">
              <div className="font-mono text-base text-emerald-600 dark:text-emerald-400 font-bold">
                S/ {card.price.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 font-mono">
                {card.time}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
