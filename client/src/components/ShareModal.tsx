import { useState } from 'react';
import { X, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FormState } from '@/types/form';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  buildingAddress: string;
  form: FormState;
}

export function ShareModal({ open, onClose, buildingName, buildingAddress, form }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  const generatePDFBlob = async (): Promise<Blob> => {
    const { jsPDF } = await import('jspdf');
    // Re-use the same PDF generation logic but return as blob instead of downloading
    const { exportToPDFBlob } = await import('@/lib/pdfExport');
    return exportToPDFBlob(form);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await generatePDFBlob();
      const safeName = buildingName.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled';
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `JKR_TakeOff_${safeName}_${dateStr}.pdf`;

      // Try native Web Share API first (works on iPhone, Android, etc.)
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const shareData = { files: [file], title: `JKR Take Off - ${buildingName || 'Roof Inspection'}` };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast({ title: '✓ Shared', description: 'PDF shared successfully.', duration: 3000 });
          onClose();
          return;
        }
      }

      // Fallback: download the PDF directly
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: '✓ PDF Downloaded', description: 'Check your downloads folder to share.', duration: 3000 });
      onClose();
    } catch (err: unknown) {
      // User cancelled the share sheet — that's fine, not an error
      if (err instanceof Error && err.name === 'AbortError') {
        // Do nothing, user just closed the share sheet
        return;
      }
      toast({ title: 'Share Failed', description: String(err), variant: 'destructive', duration: 4000 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ backgroundColor: '#1a1a1a', border: '1.5px solid #2a2a2a', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-[#C9A84C]" />
            <span className="text-[16px] font-bold text-white">Share Take Off</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center text-[#888] hover:text-white transition-colors"
            data-testid="share-modal-close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {buildingName && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#252525] border border-[#333]">
              <span className="text-xs text-[#888] uppercase tracking-wider font-semibold">Project</span>
              <span className="text-white font-semibold">{buildingName}</span>
              {buildingAddress && <span className="text-[#9ca3af] text-sm">{buildingAddress}</span>}
            </div>
          )}

          <p className="text-sm text-[#9ca3af]">
            This will generate a PDF of your take off form and open your phone's share menu so you can send it via text, email, AirDrop, or any other app.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#2a2a2a] flex gap-3"
          style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg bg-[#252525] border border-[#333] text-[#9ca3af] font-semibold hover:border-[#555] transition-colors"
            data-testid="share-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 h-12 rounded-lg font-bold text-[#111] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: '#C9A84C' }}
            data-testid="share-submit"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Share2 size={18} />
                Share PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
