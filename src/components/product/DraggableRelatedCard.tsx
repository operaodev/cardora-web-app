import { useDraggable } from "@dnd-kit/core";
import type { RelatedCardDTO } from "@/types/product";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  card: RelatedCardDTO;
  isDraggingOverlay?: boolean;
}

export function DraggableRelatedCard({ card, isDraggingOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id.toString(),
      data: card,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const cardContent = (
    <div
      className={`flex items-center gap-3 bg-surface rounded-lg p-2 border ${
        isDraggingOverlay ? "border-indigo-500 shadow-xl" : "border-transparent"
      } hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-grab active:cursor-grabbing`}
    >
      <div className="w-10 h-14 shrink-0 bg-raised rounded overflow-hidden flex items-center justify-center">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-subtle font-bold">{card.lang}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-title truncate">
          {card.name}
        </h4>
        <div className="text-xs text-subtle truncate">
          {card.code && <span className="mr-1">({card.code})</span>}
          {card.rarity} {card.lang && `(${card.lang})`}
        </div>
      </div>
    </div>
  );

  if (isDraggingOverlay) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {cardContent}
    </div>
  );
}
