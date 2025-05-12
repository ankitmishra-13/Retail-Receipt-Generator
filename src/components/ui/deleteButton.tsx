import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onClick: () => void;
}

export default function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={onClick}
      className="rounded-full p-2 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors focus:outline-none focus:ring-1 focus:ring-red-300"
      aria-label="Delete item"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}
;
