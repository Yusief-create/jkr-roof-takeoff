import { AlertTriangle, X } from 'lucide-react';

interface ClearDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearDialog({ open, onClose, onConfirm }: ClearDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl"
        style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #333' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#ef4444]" />
            <span className="text-[16px] font-bold text-white">Clear Form?</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center text-[#888] hover:text-white transition-colors"
            data-testid="clear-dialog-close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-[#9ca3af] text-sm leading-relaxed">
            This will reset <strong className="text-white">all fields</strong>, including photos and notes. This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg bg-[#252525] border border-[#333] text-[#9ca3af] font-semibold hover:border-[#555] transition-colors"
            data-testid="clear-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-lg bg-[#ef4444] text-white font-bold hover:bg-[#dc2626] transition-colors"
            data-testid="clear-confirm"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}
