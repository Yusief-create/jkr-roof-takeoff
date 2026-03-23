import { useRef } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

interface SectionAccordionProps {
  sectionNum: number;
  title: string;
  isStarted?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function SectionAccordion({
  sectionNum,
  title,
  isStarted = false,
  isOpen,
  onToggle,
  children,
}: SectionAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-3">
      <button
        type="button"
        className={`jkr-section-header w-full text-left ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid={`section-toggle-${sectionNum}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: sectionNum === 16 ? '#252525' : isStarted ? 'rgba(201,168,76,0.2)' : '#252525',
              color: sectionNum === 16 ? '#666' : isStarted ? '#C9A84C' : '#666',
              border: `1.5px solid ${sectionNum === 16 ? '#333' : isStarted ? '#C9A84C' : '#333'}`,
            }}
          >
            {sectionNum}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#666]">
              {sectionNum === 16 ? 'REFERENCE' : `Section ${sectionNum}`}
            </span>
            <span className="text-[15px] font-bold text-white truncate">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isStarted && sectionNum !== 16 && (
            <CheckCircle2 size={18} className="text-[#C9A84C]" />
          )}
          <ChevronDown
            size={20}
            className="text-[#666] transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {isOpen && (
        <div
          ref={contentRef}
          className="jkr-section-body"
          data-testid={`section-body-${sectionNum}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
