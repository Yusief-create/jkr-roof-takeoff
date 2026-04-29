import { useState, useRef } from 'react';
import {
  Save, FileDown, Share2, Trash2, AlertTriangle, Info, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SectionAccordion } from '@/components/SectionAccordion';
import { NumberSpinner } from '@/components/NumberSpinner';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ShareModal } from '@/components/ShareModal';
import { ClearDialog } from '@/components/ClearDialog';
import { exportToPDF } from '@/lib/pdfExport';
import { initialFormState, type FormState } from '@/types/form';
import jkrLogo from '@assets/jkr-logo-white.png';

function JKRInput({
  value, onChange, placeholder, label, id, type = 'text'
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  label?: string; id?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="jkr-input"
        data-testid={id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}

function JKRTextarea({
  value, onChange, placeholder, label, rows = 4
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</span>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="jkr-input resize-none"
        style={{ minHeight: rows * 26 + 'px' }}
      />
    </div>
  );
}

// Helper to get section photos key
function sectionPhotosKey(sNum: number): keyof FormState {
  return `s${sNum}Photos` as keyof FormState;
}

// Helper to check if a section has meaningful data entered
function isSectionStarted(form: FormState, sNum: number): boolean {
  // Check if section has photos
  const photosKey = sectionPhotosKey(sNum);
  const photos = form[photosKey];
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  switch (sNum) {
    case 1: return !!(form.s1BuildingName || form.s1BuildingAddress || form.s1SectionName || form.s1SectionName2 || hasPhotos);
    case 2: return !!(form.s2SlopeInDeck || form.s2FieldSlope || form.s2CricketsCore || form.s2HighPointPhotos.length || form.s2LowPointPhotos.length || hasPhotos);
    case 3: return !!(form.s3Sample1 || form.s3Sample2 || form.s3Sample3 || form.s3Sample4 || form.s3Sample5 || form.s3Sample6 || form.s3Sample7 || form.s3Sample8 || hasPhotos);
    case 4: return !!(form.s4LayersQty > 0 || form.s4MaterialType || hasPhotos);
    case 5: return !!(form.s5GuttersQty > 0 || form.s5ScuppersQty > 0 || form.s5InternalDrains > 0 || form.s5GuttersLnft > 0 || form.s5DownspoutsLnft > 0 || hasPhotos);
    case 6: return !!(form.s6FlashingHeightsMin8 || form.s6LowFlashingHeights || hasPhotos);
    case 7: return !!(form.s7CurbsDesc || form.s7WallHeights || form.s7LinearFeet > 0 || hasPhotos);
    case 8: return !!(form.s8ExistingAnchors || form.s8AreCertified || form.s8SafetyNotes || hasPhotos);
    case 9: return !!(form.s9TieIn || form.s9PondingWater || form.s9PitchPlans > 0 || form.s9PipeBoots > 0 || hasPhotos);
    case 10: return !!(form.s10LightningProtection || form.s10SatelliteDishes || hasPhotos);
    case 11: return !!(form.s11WalkPads || form.s11GreaseTraps || hasPhotos);
    case 12: return !!(form.s12SkylightChoice || hasPhotos);
    case 13: return !!(form.s13RoofHatch || form.s13ExteriorLadder || form.s13ExtensionLadder || hasPhotos);
    case 14: return !!(form.s14Curb1 || form.s14Curb2 || form.s14GasLineLnft > 0 || form.s14NeedToPaint || form.s14SupportBlocks || hasPhotos);
    case 15: return !!(form.s15Notes || form.s15Photos.length > 0);
    default: return false;
  }
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [showShare, setShowShare] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const toggleSection = (num: number) => {
    setOpenSection(prev => prev === num ? null : num);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const startedCount = Array.from({ length: 15 }, (_, i) => i + 1)
    .filter(n => isSectionStarted(form, n)).length;
  const progressPct = Math.round((startedCount / 15) * 100);

  const handleSaveDraft = () => {
    toast({
      title: '✓ Draft Saved',
      description: 'Your form data is held in memory.',
      duration: 3000,
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(form, formRef.current);
      toast({ title: '✓ PDF Exported', description: 'Check your downloads folder.', duration: 3000 });
    } catch (err) {
      toast({ title: 'Export Failed', description: String(err), variant: 'destructive', duration: 4000 });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearForm = () => {
    setForm(initialFormState);
    toast({ title: '✓ Form Cleared', description: 'All fields have been reset.', duration: 3000 });
  };

  // Reference table data for Section 16
  const deckTypeData = [
    { type: 'Steel Deck', insulation: 'Mechanically attached or adhesive', membrane: 'Mechanically attached or adhered' },
    { type: 'Structural Concrete', insulation: 'Adhesive or mechanically attached', membrane: 'Adhered or hot-mopped' },
    { type: 'Lightweight Concrete Over Metal Pan', insulation: 'Adhesive', membrane: 'Adhered or hot-mopped' },
    { type: 'Wood Deck', insulation: 'Mechanically attached or adhesive', membrane: 'Mechanically attached or adhered' },
    { type: 'Existing BUR over Metal/Concrete', insulation: 'Recover board adhesive', membrane: 'Adhered or mechanically attached' },
    { type: 'Existing BUR over Wood', insulation: 'Recover board mechanically attached', membrane: 'Adhered or mechanically attached' },
    { type: 'Cementitious Wood Fiber', insulation: 'Adhesive only', membrane: 'Adhered' },
    { type: 'Precast Concrete Plank', insulation: 'Adhesive', membrane: 'Adhered or hot-mopped' },
    { type: 'Metal Panels', insulation: 'Mechanically attached', membrane: 'Mechanically attached' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111111' }}>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between gap-3 border-b border-[#2a2a2a]"
        style={{ backgroundColor: '#111111', paddingTop: 'calc(12px + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={jkrLogo} alt="JKR Logo" className="h-9 w-auto flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">Field Inspection</div>
            <div className="text-xs font-bold text-white leading-tight whitespace-nowrap">Roof Take Off</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
            title="Save Draft"
            data-testid="btn-save-draft"
          >
            <Save size={18} />
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#C9A84C] hover:border-[#C9A84C] transition-colors disabled:opacity-50"
            title="Export PDF"
            data-testid="btn-export-pdf"
          >
            <FileDown size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#9ca3af] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
            title="Share"
            data-testid="btn-share"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowClear(true)}
            className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#9ca3af] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors"
            title="Clear Form"
            data-testid="btn-clear"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="px-4 py-3 bg-[#111111] border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">Progress</span>
          <span className="text-xs font-bold text-[#C9A84C]">{startedCount} of 15 sections started</span>
        </div>
        <div className="h-2 rounded-full bg-[#252525] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%`, backgroundColor: '#C9A84C' }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-[#555]">{progressPct}% complete</div>
      </div>

      {/* MAIN FORM */}
      <div ref={formRef} className="px-4 pt-4 pb-36" id="jkr-form-content">

        {/* SECTION 1 — PROJECT INFO */}
        <SectionAccordion sectionNum={1} title="PROJECT INFO" isStarted={isSectionStarted(form, 1)} isOpen={openSection === 1} onToggle={() => toggleSection(1)}>
          <div className="flex flex-col gap-4">
            <JKRInput label="Building Name" id="s1-building-name" value={form.s1BuildingName} onChange={v => set('s1BuildingName', v)} placeholder="Enter building name" />
            <JKRInput label="Building Address" id="s1-building-address" value={form.s1BuildingAddress} onChange={v => set('s1BuildingAddress', v)} placeholder="Enter building address" />
            <JKRInput label="Section Name" id="s1-section-name" value={form.s1SectionName} onChange={v => set('s1SectionName', v)} placeholder="Enter section name" />
            <JKRInput label="Section Name 2" id="s1-section-name-2" value={form.s1SectionName2} onChange={v => set('s1SectionName2', v)} placeholder="Enter section name 2" />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s1-photos" photos={form.s1Photos} onChange={v => set('s1Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 2 — SLOPE IN THE DECK */}
        <SectionAccordion sectionNum={2} title="SLOPE IN THE DECK" isStarted={isSectionStarted(form, 2)} isOpen={openSection === 2} onToggle={() => toggleSection(2)}>
          <div className="flex flex-col gap-4">
            <JKRInput label="Slope in the Deck" id="s2-slope" value={form.s2SlopeInDeck} onChange={v => set('s2SlopeInDeck', v)} placeholder="e.g. ¼″ per FT" />

            {/* Only show when slope has a value */}
            {form.s2SlopeInDeck.trim() !== '' && (
              <div className="jkr-gold-alert">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <span>REQUIRES A FULLY TAPERED INSULATION PACKAGE</span>
              </div>
            )}

            <JKRInput label="Field Slope" id="s2-field-slope" value={form.s2FieldSlope} onChange={v => set('s2FieldSlope', v)} placeholder="Field slope value" />
            <JKRInput label="Crickets Core" id="s2-crickets-core" value={form.s2CricketsCore} onChange={v => set('s2CricketsCore', v)} placeholder="Crickets core details" />

            <div className="jkr-warning">
              ⚠️ Requires crickets between the drains — ½″ per FT slope
            </div>

            <div className="h-px bg-[#2a2a2a]" />

            <PhotoUpload
              label="HIGH POINT CORE PICTURE"
              id="high-point-core"
              photos={form.s2HighPointPhotos}
              onChange={v => set('s2HighPointPhotos', v)}
            />

            <div className="h-px bg-[#2a2a2a]" />

            <PhotoUpload
              label="LOW POINT CORE PICTURE"
              id="low-point-core"
              photos={form.s2LowPointPhotos}
              onChange={v => set('s2LowPointPhotos', v)}
            />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Additional Section Photos" id="s2-photos" photos={form.s2Photos} onChange={v => set('s2Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 3 — SAMPLES: WET OR DRY */}
        <SectionAccordion sectionNum={3} title="SAMPLES: WET OR DRY" isStarted={isSectionStarted(form, 3)} isOpen={openSection === 3} onToggle={() => toggleSection(3)}>
          <div className="grid grid-cols-2 gap-3">
            {(['s3Sample1','s3Sample2','s3Sample3','s3Sample4','s3Sample5','s3Sample6','s3Sample7','s3Sample8'] as const).map((key, i) => (
              <JKRInput
                key={key}
                label={`Sample ${i + 1}`}
                id={`s3-sample-${i+1}`}
                value={form[key]}
                onChange={v => set(key, v)}
                placeholder="Wet / Dry"
              />
            ))}
          </div>
          <div className="mt-4">
            <PhotoUpload label="Section Photos" id="s3-photos" photos={form.s3Photos} onChange={v => set('s3Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 4 — EXISTING ROOF */}
        <SectionAccordion sectionNum={4} title="EXISTING ROOF" isStarted={isSectionStarted(form, 4)} isOpen={openSection === 4} onToggle={() => toggleSection(4)}>
          <div className="flex flex-col gap-4">
            <NumberSpinner label="Layers of Existing Roofing - QTY" value={form.s4LayersQty} onChange={v => set('s4LayersQty', v)} />
            <JKRInput label="Material Type" id="s4-material" value={form.s4MaterialType} onChange={v => set('s4MaterialType', v)} placeholder="Make-up / material type" />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s4-photos" photos={form.s4Photos} onChange={v => set('s4Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 5 — DRAINAGE */}
        <SectionAccordion sectionNum={5} title="DRAINAGE" isStarted={isSectionStarted(form, 5)} isOpen={openSection === 5} onToggle={() => toggleSection(5)}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <NumberSpinner label="Gutters QTY" value={form.s5GuttersQty} onChange={v => set('s5GuttersQty', v)} />
              <NumberSpinner label="Scuppers QTY" value={form.s5ScuppersQty} onChange={v => set('s5ScuppersQty', v)} />
              <NumberSpinner label="Int. Drains" value={form.s5InternalDrains} onChange={v => set('s5InternalDrains', v)} />
            </div>
            <div className="rounded-lg border border-[#2a2a2a] p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Gutters Detail</span>
              <div className="grid grid-cols-3 gap-3">
                <NumberSpinner label="LNFT" value={form.s5GuttersLnft} onChange={v => set('s5GuttersLnft', v)} />
                <NumberSpinner label="QTY" value={form.s5GuttersQty2} onChange={v => set('s5GuttersQty2', v)} />
                <NumberSpinner label="QTY" value={form.s5GuttersQty3} onChange={v => set('s5GuttersQty3', v)} />
              </div>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Downspouts</span>
              <div className="grid grid-cols-2 gap-3">
                <NumberSpinner label="LNFT" value={form.s5DownspoutsLnft} onChange={v => set('s5DownspoutsLnft', v)} />
                <NumberSpinner label="Overflows QTY" value={form.s5OverflowsQty} onChange={v => set('s5OverflowsQty', v)} />
              </div>
            </div>
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s5-photos" photos={form.s5Photos} onChange={v => set('s5Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 6 — FLASHING */}
        <SectionAccordion sectionNum={6} title="FLASHING" isStarted={isSectionStarted(form, 6)} isOpen={openSection === 6} onToggle={() => toggleSection(6)}>
          <div className="flex flex-col gap-3">
            <ToggleSwitch label='Flashing Heights min 8″' checked={form.s6FlashingHeightsMin8} onChange={v => set('s6FlashingHeightsMin8', v)} />
            <ToggleSwitch label="Low Flashing Heights" checked={form.s6LowFlashingHeights} onChange={v => set('s6LowFlashingHeights', v)} />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s6-photos" photos={form.s6Photos} onChange={v => set('s6Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 7 — CURBS */}
        <SectionAccordion sectionNum={7} title="CURBS" isStarted={isSectionStarted(form, 7)} isOpen={openSection === 7} onToggle={() => toggleSection(7)}>
          <div className="flex flex-col gap-4">
            <JKRInput label="Curbs Description" id="s7-curbs-desc" value={form.s7CurbsDesc} onChange={v => set('s7CurbsDesc', v)} placeholder="Describe curbs" />
            <JKRInput label="Wall Heights" id="s7-wall-heights" value={form.s7WallHeights} onChange={v => set('s7WallHeights', v)} placeholder="Wall heights" />
            <NumberSpinner label="Linear Feet" value={form.s7LinearFeet} onChange={v => set('s7LinearFeet', v)} />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s7-photos" photos={form.s7Photos} onChange={v => set('s7Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 8 — SAFETY */}
        <SectionAccordion sectionNum={8} title="SAFETY" isStarted={isSectionStarted(form, 8)} isOpen={openSection === 8} onToggle={() => toggleSection(8)}>
          <div className="flex flex-col gap-4">
            <ToggleSwitch label="Existing Safety Anchors?" checked={form.s8ExistingAnchors} onChange={v => set('s8ExistingAnchors', v)} />
            {form.s8ExistingAnchors && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <ToggleSwitch label="Are They Certified?" checked={form.s8AreCertified} onChange={v => set('s8AreCertified', v)} />
              </div>
            )}
            <JKRTextarea label="Safety Needed Based on Conditions" value={form.s8SafetyNotes} onChange={v => set('s8SafetyNotes', v)} placeholder="Describe safety requirements based on site conditions…" rows={3} />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s8-photos" photos={form.s8Photos} onChange={v => set('s8Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 9 — TIE-INS & CONDITIONS */}
        <SectionAccordion sectionNum={9} title="TIE-INS & CONDITIONS" isStarted={isSectionStarted(form, 9)} isOpen={openSection === 9} onToggle={() => toggleSection(9)}>
          <div className="flex flex-col gap-4">
            <ToggleSwitch label="Tie-in to Existing Roofs" checked={form.s9TieIn} onChange={v => set('s9TieIn', v)} />
            {form.s9TieIn && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <JKRInput label="Types of Tie-In" id="s9-tiein-types" value={form.s9TieInTypes} onChange={v => set('s9TieInTypes', v)} placeholder="Describe tie-in types" />
              </div>
            )}
            <ToggleSwitch label="Ponding Water" checked={form.s9PondingWater} onChange={v => set('s9PondingWater', v)} />
            {form.s9PondingWater && (
              <div className="pl-4 border-l-2 border-[#C9A84C] flex flex-col gap-3">
                <JKRInput label='More Than ½″ Thick — Description' id="s9-ponding-desc" value={form.s9PondingDesc} onChange={v => set('s9PondingDesc', v)} placeholder="Describe ponding water situation" />
                <JKRInput label="SQFT" id="s9-ponding-sqft" value={form.s9PondingSqft} onChange={v => set('s9PondingSqft', v)} placeholder="Square footage" />
              </div>
            )}
            <NumberSpinner label="# of Pitch Plans" value={form.s9PitchPlans} onChange={v => set('s9PitchPlans', v)} />
            <NumberSpinner label="Pipe Boots" value={form.s9PipeBoots} onChange={v => set('s9PipeBoots', v)} />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s9-photos" photos={form.s9Photos} onChange={v => set('s9Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 10 — LIGHTNING & SATELLITES */}
        <SectionAccordion sectionNum={10} title="LIGHTNING & SATELLITES" isStarted={isSectionStarted(form, 10)} isOpen={openSection === 10} onToggle={() => toggleSection(10)}>
          <div className="flex flex-col gap-4">
            <ToggleSwitch label="Lightning Protection in Place" checked={form.s10LightningProtection} onChange={v => set('s10LightningProtection', v)} />
            {form.s10LightningProtection && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <JKRInput label="Provide Quote or Recertification?" id="s10-lightning-quote" value={form.s10LightningQuote} onChange={v => set('s10LightningQuote', v)} placeholder="Quote / recertification details" />
              </div>
            )}
            <ToggleSwitch label="Satellite Dishes" checked={form.s10SatelliteDishes} onChange={v => set('s10SatelliteDishes', v)} />
            {form.s10SatelliteDishes && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <NumberSpinner label="QTY" value={form.s10SatelliteQty} onChange={v => set('s10SatelliteQty', v)} />
              </div>
            )}
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s10-photos" photos={form.s10Photos} onChange={v => set('s10Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 11 — WALK PADS & GREASE TRAPS */}
        <SectionAccordion sectionNum={11} title="WALK PADS & GREASE TRAPS" isStarted={isSectionStarted(form, 11)} isOpen={openSection === 11} onToggle={() => toggleSection(11)}>
          <div className="flex flex-col gap-4">
            <ToggleSwitch label="Walk Pads Existing" checked={form.s11WalkPads} onChange={v => set('s11WalkPads', v)} />
            {form.s11WalkPads && (
              <div className="pl-4 border-l-2 border-[#C9A84C] flex flex-col gap-3">
                <NumberSpinner label="Lineal Footage (LF)" value={form.s11WalkPadsLf} onChange={v => set('s11WalkPadsLf', v)} />
                <JKRInput label="Quote $" id="s11-walkpads-quote" value={form.s11WalkPadsQuote} onChange={v => set('s11WalkPadsQuote', v)} placeholder="$0.00" />
                <JKRInput label="LN FT Needed" id="s11-walkpads-lnft" value={form.s11WalkPadsLnftNeeded} onChange={v => set('s11WalkPadsLnftNeeded', v)} placeholder="Linear feet needed" />
              </div>
            )}
            <ToggleSwitch label="Grease Traps" checked={form.s11GreaseTraps} onChange={v => set('s11GreaseTraps', v)} />
            {form.s11GreaseTraps && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <JKRInput label="Line Item Price $" id="s11-grease-price" value={form.s11GreaseTrapPrice} onChange={v => set('s11GreaseTrapPrice', v)} placeholder="$0.00" />
              </div>
            )}
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s11-photos" photos={form.s11Photos} onChange={v => set('s11Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 12 — SKYLIGHTS */}
        <SectionAccordion sectionNum={12} title="SKYLIGHTS" isStarted={isSectionStarted(form, 12)} isOpen={openSection === 12} onToggle={() => toggleSection(12)}>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-3">Skylights</span>
              <div className="flex gap-2">
                {(['reuse', 'replace', 'none'] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('s12SkylightChoice', opt)}
                    className={`skylight-btn ${form.s12SkylightChoice === opt ? 'active' : ''}`}
                    data-testid={`skylight-${opt}`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <JKRInput label="Additional Details" id="s12-skylight-details" value={form.s12SkylightDetails} onChange={v => set('s12SkylightDetails', v)} placeholder="Skylight details" />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s12-photos" photos={form.s12Photos} onChange={v => set('s12Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 13 — ROOF ACCESS */}
        <SectionAccordion sectionNum={13} title="ROOF ACCESS" isStarted={isSectionStarted(form, 13)} isOpen={openSection === 13} onToggle={() => toggleSection(13)}>
          <div className="flex flex-col gap-3">
            <ToggleSwitch label="Roof Hatch" checked={form.s13RoofHatch} onChange={v => set('s13RoofHatch', v)} />
            <ToggleSwitch label="Provide Quote for New" checked={form.s13ProvideQuoteNew} onChange={v => set('s13ProvideQuoteNew', v)} />
            <div className="h-px bg-[#2a2a2a]" />
            <ToggleSwitch label="Exterior Mounted Safety Ladder" checked={form.s13ExteriorLadder} onChange={v => set('s13ExteriorLadder', v)} />
            <ToggleSwitch label="Quote New" checked={form.s13QuoteNew} onChange={v => set('s13QuoteNew', v)} />
            <div className="h-px bg-[#2a2a2a]" />
            <ToggleSwitch label="Extension Ladder" checked={form.s13ExtensionLadder} onChange={v => set('s13ExtensionLadder', v)} />
            {form.s13ExtensionLadder && (
              <div className="pl-4 border-l-2 border-[#C9A84C]">
                <JKRInput label="What Size" id="s13-ladder-size" value={form.s13LadderSize} onChange={v => set('s13LadderSize', v)} placeholder="Ladder size" />
              </div>
            )}
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s13-photos" photos={form.s13Photos} onChange={v => set('s13Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 14 — DISCONTINUED CURBS & MISC */}
        <SectionAccordion sectionNum={14} title="DISCONTINUED CURBS & MISC" isStarted={isSectionStarted(form, 14)} isOpen={openSection === 14} onToggle={() => toggleSection(14)}>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">Curbs</span>
            <div className="flex flex-col gap-3">
              {(['s14Curb1','s14Curb2','s14Curb3','s14Curb4','s14Curb5'] as const).map((key, i) => (
                <JKRInput key={key} label={`Curb ${i+1}`} id={`s14-curb-${i+1}`} value={form[key]} onChange={v => set(key, v)} placeholder="Curb description" />
              ))}
            </div>
            <div className="h-px bg-[#2a2a2a]" />
            <NumberSpinner label="Gas Line LNFT" value={form.s14GasLineLnft} onChange={v => set('s14GasLineLnft', v)} />
            <ToggleSwitch label="Need to Paint" checked={form.s14NeedToPaint} onChange={v => set('s14NeedToPaint', v)} />
            <ToggleSwitch label="Support Blocks Replacement" checked={form.s14SupportBlocks} onChange={v => set('s14SupportBlocks', v)} />
            <NumberSpinner label="Wood Sleepers Supports LNFT" value={form.s14WoodSleepersLnft} onChange={v => set('s14WoodSleepersLnft', v)} />
            <NumberSpinner label="Bad Electrical Conduit LNFT" value={form.s14BadElectricalLnft} onChange={v => set('s14BadElectricalLnft', v)} />
            <div className="h-px bg-[#2a2a2a] mt-2" />
            <PhotoUpload label="Section Photos" id="s14-photos" photos={form.s14Photos} onChange={v => set('s14Photos', v)} />
          </div>
        </SectionAccordion>

        {/* SECTION 15 — NOTES */}
        <SectionAccordion sectionNum={15} title="NOTES" isStarted={isSectionStarted(form, 15)} isOpen={openSection === 15} onToggle={() => toggleSection(15)}>
          <div className="flex flex-col gap-4">
            <JKRTextarea label="General Notes" value={form.s15Notes} onChange={v => set('s15Notes', v)} placeholder="Enter general notes, observations, and site conditions…" rows={5} />
            <PhotoUpload
              label="PHOTOS"
              id="notes-photos"
              photos={form.s15Photos}
              onChange={v => set('s15Photos', v)}
            />
          </div>
        </SectionAccordion>

        {/* SECTION 16 — REFERENCE (READ-ONLY) */}
        <SectionAccordion sectionNum={16} title="ROOF DECK TYPES" isStarted={false} isOpen={openSection === 16} onToggle={() => toggleSection(16)}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#252525] border border-[#333]">
              <Info size={15} className="text-[#666] flex-shrink-0" />
              <span className="text-xs text-[#666]">Read-only reference — not part of form submission</span>
            </div>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-[#252525]">
                    <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-[#333]">Roof Deck Type</th>
                    <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-[#333]">Insulation Attachment</th>
                    <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#C9A84C] border-b border-[#333]">Membrane Attachment</th>
                  </tr>
                </thead>
                <tbody>
                  {deckTypeData.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-[#1e1e1e]'}>
                      <td className="p-3 text-white font-medium border-b border-[#222] text-sm">{row.type}</td>
                      <td className="p-3 text-[#9ca3af] border-b border-[#222] text-sm">{row.insulation}</td>
                      <td className="p-3 text-[#9ca3af] border-b border-[#222] text-sm">{row.membrane}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionAccordion>

     
      {/* BOTTOM ACTION BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a2a2a] bottom-bar-safe"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="grid grid-cols-4 gap-2 px-3 pt-3 pb-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex flex-col items-center justify-center gap-1 h-14 rounded-lg font-semibold text-xs transition-colors"
            style={{ backgroundColor: 'rgba(201,168,76,0.15)', border: '1.5px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
            data-testid="btn-save-draft-bottom"
          >
            <Save size={20} />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex flex-col items-center justify-center gap-1 h-14 rounded-lg font-semibold text-xs transition-colors text-[#9ca3af] bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#C9A84C] hover:text-[#C9A84C]"
            data-testid="btn-share-bottom"
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex flex-col items-center justify-center gap-1 h-14 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#C9A84C', color: '#111111' }}
            data-testid="btn-export-pdf-bottom"
          >
            <FileDown size={20} />
            <span>{isExporting ? '…' : 'Export PDF'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowClear(true)}
            className="flex flex-col items-center justify-center gap-1 h-14 rounded-lg font-semibold text-xs text-[#9ca3af] bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors"
            data-testid="btn-clear-bottom"
          >
            <Trash2 size={20} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* MODALS */}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        buildingName={form.s1BuildingName}
        buildingAddress={form.s1BuildingAddress}
        form={form}
      />
      <ClearDialog
        open={showClear}
        onClose={() => setShowClear(false)}
        onConfirm={handleClearForm}
      />
    </div>
  );
}
