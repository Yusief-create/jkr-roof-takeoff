import type { FormState } from '@/types/form';
import type { PhotoData } from '@/components/PhotoUpload';

export async function exportToPDF(form: FormState, _formEl: HTMLElement | null): Promise<void> {
  // Dynamically import jsPDF to avoid blocking initial load
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Colors
  const GOLD = [201, 168, 76] as [number, number, number];
  const BLACK = [17, 17, 17] as [number, number, number];
  const DARK_GRAY = [26, 26, 26] as [number, number, number];
  const MID_GRAY = [80, 80, 80] as [number, number, number];
  const LIGHT_GRAY = [200, 200, 200] as [number, number, number];

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin + 4;
    }
  };

  const drawHeaderBand = () => {
    doc.setFillColor(...BLACK);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, 28, pageW, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('JKR ROOF TAKE OFF', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GOLD);
    doc.text('JAMES KING ROOFING — FIELD INSPECTION FORM', margin, 19);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.setTextColor(180, 180, 180);
    doc.text(dateStr, pageW - margin, 12, { align: 'right' });
  };

  drawHeaderBand();
  y = 36;

  const sectionHeader = (num: number, title: string) => {
    ensureSpace(14);
    doc.setFillColor(...DARK_GRAY);
    doc.rect(margin, y, contentW, 10, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, 2, 10, 'F');
    doc.setTextColor(...GOLD);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${num < 10 ? '0' + num : num}  ${title}`, margin + 5, y + 6.5);
    y += 13;
  };

  const field = (label: string, value: string | number, note?: string) => {
    if (!value && value !== 0) return;
    ensureSpace(12);
    doc.setTextColor(...MID_GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), margin + 2, y);
    y += 4;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value), contentW - 4);
    for (const line of lines) {
      ensureSpace(6);
      doc.text(line, margin + 2, y);
      y += 5;
    }
    if (note) {
      doc.setTextColor(...MID_GRAY);
      doc.setFontSize(7.5);
      doc.text(note, margin + 2, y);
      y += 4;
    }
    y += 2;
  };

  const boolField = (label: string, value: boolean) => {
    if (!value) return;
    ensureSpace(8);
    doc.setFillColor(...GOLD);
    doc.circle(margin + 3, y - 1, 1.5, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 7, y);
    y += 7;
  };

  const divider = () => {
    ensureSpace(6);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const insertPhotos = async (photos: PhotoData[], caption: string) => {
    if (photos.length === 0) return;
    ensureSpace(10);
    doc.setTextColor(...MID_GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(caption.toUpperCase(), margin + 2, y);
    y += 5;

    const imgW = (contentW - 6) / 3;
    const imgH = imgW * 0.75;
    let col = 0;
    const rowStartY = y;

    for (const photo of photos) {
      try {
        const format = photo.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        const x = margin + col * (imgW + 3);
        ensureSpace(col === 0 ? imgH + 4 : 0);
        doc.addImage(photo.dataUrl, format, x, y, imgW, imgH);
        col++;
        if (col === 3) {
          col = 0;
          y += imgH + 3;
        }
      } catch {
        // skip invalid photos
      }
    }
    if (col > 0) y += imgH + 3;
    y += 3;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1
  sectionHeader(1, 'PROJECT INFO');
  field('Building Name', form.s1BuildingName);
  field('Building Address', form.s1BuildingAddress);
  field('Section Name', form.s1SectionName);
  field('Section Name 2', form.s1SectionName2);
  await insertPhotos(form.s1Photos, 'Section Photos');
  await insertPhotos(form.s1Photos, 'Section Photos');

  // SECTION 2
  sectionHeader(2, 'SLOPE IN THE DECK');
  field('Slope in the Deck', form.s2SlopeInDeck, form.s2SlopeInDeck ? '⚠ REQUIRES A FULLY TAPERED INSULATION PACKAGE' : undefined);
  field('Field Slope', form.s2FieldSlope);
  field('Crickets Core', form.s2CricketsCore);
  await insertPhotos(form.s2HighPointPhotos, 'High Point Core Pictures');
  await insertPhotos(form.s2LowPointPhotos, 'Low Point Core Pictures');
  await insertPhotos(form.s2Photos, 'Additional Section Photos');

  // SECTION 3
  sectionHeader(3, 'SAMPLES: WET OR DRY');
  const samples: Array<[string, string]> = [
    ['Sample 1', form.s3Sample1], ['Sample 2', form.s3Sample2],
    ['Sample 3', form.s3Sample3], ['Sample 4', form.s3Sample4],
    ['Sample 5', form.s3Sample5], ['Sample 6', form.s3Sample6],
    ['Sample 7', form.s3Sample7], ['Sample 8', form.s3Sample8],
  ];
  for (const [l, v] of samples) field(l, v);
  await insertPhotos(form.s3Photos, 'Section Photos');

  // SECTION 4
  sectionHeader(4, 'EXISTING ROOF');
  if (form.s4LayersQty > 0) field('Layers of Existing Roofing', form.s4LayersQty);
  field('Material Type', form.s4MaterialType);
  await insertPhotos(form.s4Photos, 'Section Photos');

  // SECTION 5
  sectionHeader(5, 'DRAINAGE');
  if (form.s5GuttersQty > 0) field('Gutters QTY', form.s5GuttersQty);
  if (form.s5ScuppersQty > 0) field('Scuppers QTY', form.s5ScuppersQty);
  if (form.s5InternalDrains > 0) field('Internal Drains', form.s5InternalDrains);
  if (form.s5GuttersLnft > 0) field('Gutters LNFT', form.s5GuttersLnft);
  if (form.s5DownspoutsLnft > 0) field('Downspouts LNFT', form.s5DownspoutsLnft);
  if (form.s5OverflowsQty > 0) field('Overflows QTY', form.s5OverflowsQty);
  await insertPhotos(form.s5Photos, 'Section Photos');

  // SECTION 6
  sectionHeader(6, 'FLASHING');
  boolField('Flashing Heights min 8″', form.s6FlashingHeightsMin8);
  boolField('Low Flashing Heights', form.s6LowFlashingHeights);
  await insertPhotos(form.s6Photos, 'Section Photos');

  // SECTION 7
  sectionHeader(7, 'CURBS');
  field('Description', form.s7CurbsDesc);
  field('Wall Heights', form.s7WallHeights);
  if (form.s7LinearFeet > 0) field('Linear Feet', form.s7LinearFeet);
  await insertPhotos(form.s7Photos, 'Section Photos');

  // SECTION 8
  sectionHeader(8, 'SAFETY');
  boolField('Existing Safety Anchors', form.s8ExistingAnchors);
  if (form.s8ExistingAnchors) boolField('Are They Certified?', form.s8AreCertified);
  field('Safety Notes', form.s8SafetyNotes);
  await insertPhotos(form.s8Photos, 'Section Photos');

  // SECTION 9
  sectionHeader(9, 'TIE-INS & CONDITIONS');
  boolField('Tie-in to Existing Roofs', form.s9TieIn);
  if (form.s9TieIn) field('Types of Tie-In', form.s9TieInTypes);
  boolField('Ponding Water', form.s9PondingWater);
  if (form.s9PondingWater) {
    field('Ponding Description', form.s9PondingDesc);
    field('Ponding SQFT', form.s9PondingSqft);
  }
  if (form.s9PitchPlans > 0) field('# of Pitch Plans', form.s9PitchPlans);
  if (form.s9PipeBoots > 0) field('Pipe Boots', form.s9PipeBoots);
  await insertPhotos(form.s9Photos, 'Section Photos');

  // SECTION 10
  sectionHeader(10, 'LIGHTNING & SATELLITES');
  boolField('Lightning Protection in Place', form.s10LightningProtection);
  if (form.s10LightningProtection) field('Lightning Quote / Recertification', form.s10LightningQuote);
  boolField('Satellite Dishes', form.s10SatelliteDishes);
  if (form.s10SatelliteDishes && form.s10SatelliteQty > 0) field('Satellite QTY', form.s10SatelliteQty);
  await insertPhotos(form.s10Photos, 'Section Photos');

  // SECTION 11
  sectionHeader(11, 'WALK PADS & GREASE TRAPS');
  boolField('Walk Pads Existing', form.s11WalkPads);
  if (form.s11WalkPads) {
    if (form.s11WalkPadsLf > 0) field('Walk Pads LF', form.s11WalkPadsLf);
    field('Walk Pads Quote $', form.s11WalkPadsQuote);
    field('LN FT Needed', form.s11WalkPadsLnftNeeded);
  }
  boolField('Grease Traps', form.s11GreaseTraps);
  if (form.s11GreaseTraps) field('Grease Trap Price $', form.s11GreaseTrapPrice);
  await insertPhotos(form.s11Photos, 'Section Photos');

  // SECTION 12
  sectionHeader(12, 'SKYLIGHTS');
  if (form.s12SkylightChoice) field('Skylights', form.s12SkylightChoice.charAt(0).toUpperCase() + form.s12SkylightChoice.slice(1));
  field('Additional Details', form.s12SkylightDetails);
  await insertPhotos(form.s12Photos, 'Section Photos');

  // SECTION 13
  sectionHeader(13, 'ROOF ACCESS');
  boolField('Roof Hatch', form.s13RoofHatch);
  boolField('Provide Quote for New', form.s13ProvideQuoteNew);
  boolField('Exterior Mounted Safety Ladder', form.s13ExteriorLadder);
  boolField('Quote New', form.s13QuoteNew);
  boolField('Extension Ladder', form.s13ExtensionLadder);
  if (form.s13ExtensionLadder) field('Ladder Size', form.s13LadderSize);
  await insertPhotos(form.s13Photos, 'Section Photos');

  // SECTION 14
  sectionHeader(14, 'DISCONTINUED CURBS & MISC');
  if (form.s14Curb1) field('Curb 1', form.s14Curb1);
  if (form.s14Curb2) field('Curb 2', form.s14Curb2);
  if (form.s14Curb3) field('Curb 3', form.s14Curb3);
  if (form.s14Curb4) field('Curb 4', form.s14Curb4);
  if (form.s14Curb5) field('Curb 5', form.s14Curb5);
  if (form.s14GasLineLnft > 0) field('Gas Line LNFT', form.s14GasLineLnft);
  boolField('Need to Paint', form.s14NeedToPaint);
  boolField('Support Blocks Replacement', form.s14SupportBlocks);
  if (form.s14WoodSleepersLnft > 0) field('Wood Sleepers Supports LNFT', form.s14WoodSleepersLnft);
  if (form.s14BadElectricalLnft > 0) field('Bad Electrical Conduit LNFT', form.s14BadElectricalLnft);
  await insertPhotos(form.s14Photos, 'Section Photos');

  // SECTION 15
  sectionHeader(15, 'NOTES');
  field('General Notes', form.s15Notes);
  await insertPhotos(form.s15Photos, 'General Photos');

  // FOOTER on last page
  divider();
  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('James King Roofing — Confidential Field Inspection Document', margin, y);
  doc.text('Generated with Perplexity Computer', pageW - margin, y, { align: 'right' });

  // Save
  const buildingName = form.s1BuildingName.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled';
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`JKR_TakeOff_${buildingName}_${dateStr}.pdf`);
}

// Returns the PDF as a Blob for sharing via Web Share API
export async function exportToPDFBlob(form: FormState): Promise<Blob> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  const GOLD = [201, 168, 76] as [number, number, number];
  const BLACK = [17, 17, 17] as [number, number, number];
  const DARK_GRAY = [26, 26, 26] as [number, number, number];
  const MID_GRAY = [80, 80, 80] as [number, number, number];
  const LIGHT_GRAY = [200, 200, 200] as [number, number, number];

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin + 4;
    }
  };

  // Header
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 28, pageW, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JKR ROOF TAKE OFF', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GOLD);
  doc.text('JAMES KING ROOFING — FIELD INSPECTION FORM', margin, 19);
  const headerDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.setTextColor(180, 180, 180);
  doc.text(headerDate, pageW - margin, 12, { align: 'right' });
  y = 36;

  const sectionHeader = (num: number, title: string) => {
    ensureSpace(14);
    doc.setFillColor(...DARK_GRAY);
    doc.rect(margin, y, contentW, 10, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, 2, 10, 'F');
    doc.setTextColor(...GOLD);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${num < 10 ? '0' + num : num}  ${title}`, margin + 5, y + 6.5);
    y += 13;
  };

  const field = (label: string, value: string | number, note?: string) => {
    if (!value && value !== 0) return;
    ensureSpace(12);
    doc.setTextColor(...MID_GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), margin + 2, y);
    y += 4;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value), contentW - 4);
    for (const line of lines) {
      ensureSpace(6);
      doc.text(line, margin + 2, y);
      y += 5;
    }
    if (note) {
      doc.setTextColor(...MID_GRAY);
      doc.setFontSize(7.5);
      doc.text(note, margin + 2, y);
      y += 4;
    }
    y += 2;
  };

  const boolField = (label: string, value: boolean) => {
    if (!value) return;
    ensureSpace(8);
    doc.setFillColor(...GOLD);
    doc.circle(margin + 3, y - 1, 1.5, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 7, y);
    y += 7;
  };

  const insertPhotos = async (photos: PhotoData[], caption: string) => {
    if (photos.length === 0) return;
    ensureSpace(10);
    doc.setTextColor(...MID_GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(caption.toUpperCase(), margin + 2, y);
    y += 5;
    const imgW = (contentW - 6) / 3;
    const imgH = imgW * 0.75;
    let col = 0;
    for (const photo of photos) {
      try {
        const format = photo.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        const x = margin + col * (imgW + 3);
        ensureSpace(col === 0 ? imgH + 4 : 0);
        doc.addImage(photo.dataUrl, format, x, y, imgW, imgH);
        col++;
        if (col === 3) { col = 0; y += imgH + 3; }
      } catch { /* skip */ }
    }
    if (col > 0) y += imgH + 3;
    y += 3;
  };

  // All sections (same as exportToPDF)
  sectionHeader(1, 'PROJECT INFO');
  field('Building Name', form.s1BuildingName);
  field('Building Address', form.s1BuildingAddress);
  field('Section Name', form.s1SectionName);
  field('Section Name 2', form.s1SectionName2);
  await insertPhotos(form.s1Photos, 'Section Photos');

  sectionHeader(2, 'SLOPE IN THE DECK');
  field('Slope in the Deck', form.s2SlopeInDeck, form.s2SlopeInDeck ? '⚠ REQUIRES A FULLY TAPERED INSULATION PACKAGE' : undefined);
  field('Field Slope', form.s2FieldSlope);
  field('Crickets Core', form.s2CricketsCore);
  await insertPhotos(form.s2HighPointPhotos, 'High Point Core Pictures');
  await insertPhotos(form.s2LowPointPhotos, 'Low Point Core Pictures');
  await insertPhotos(form.s2Photos, 'Additional Section Photos');

  sectionHeader(3, 'SAMPLES: WET OR DRY');
  for (const [l, v] of [
    ['Sample 1', form.s3Sample1], ['Sample 2', form.s3Sample2],
    ['Sample 3', form.s3Sample3], ['Sample 4', form.s3Sample4],
    ['Sample 5', form.s3Sample5], ['Sample 6', form.s3Sample6],
    ['Sample 7', form.s3Sample7], ['Sample 8', form.s3Sample8],
  ] as Array<[string, string]>) field(l, v);
  await insertPhotos(form.s3Photos, 'Section Photos');

  sectionHeader(4, 'EXISTING ROOF');
  if (form.s4LayersQty > 0) field('Layers of Existing Roofing', form.s4LayersQty);
  field('Material Type', form.s4MaterialType);
  await insertPhotos(form.s4Photos, 'Section Photos');

  sectionHeader(5, 'DRAINAGE');
  if (form.s5GuttersQty > 0) field('Gutters QTY', form.s5GuttersQty);
  if (form.s5ScuppersQty > 0) field('Scuppers QTY', form.s5ScuppersQty);
  if (form.s5InternalDrains > 0) field('Internal Drains', form.s5InternalDrains);
  if (form.s5GuttersLnft > 0) field('Gutters LNFT', form.s5GuttersLnft);
  if (form.s5DownspoutsLnft > 0) field('Downspouts LNFT', form.s5DownspoutsLnft);
  if (form.s5OverflowsQty > 0) field('Overflows QTY', form.s5OverflowsQty);
  await insertPhotos(form.s5Photos, 'Section Photos');

  sectionHeader(6, 'FLASHING');
  boolField('Flashing Heights min 8″', form.s6FlashingHeightsMin8);
  boolField('Low Flashing Heights', form.s6LowFlashingHeights);
  await insertPhotos(form.s6Photos, 'Section Photos');

  sectionHeader(7, 'CURBS');
  field('Description', form.s7CurbsDesc);
  field('Wall Heights', form.s7WallHeights);
  if (form.s7LinearFeet > 0) field('Linear Feet', form.s7LinearFeet);
  await insertPhotos(form.s7Photos, 'Section Photos');

  sectionHeader(8, 'SAFETY');
  boolField('Existing Safety Anchors', form.s8ExistingAnchors);
  if (form.s8ExistingAnchors) boolField('Are They Certified?', form.s8AreCertified);
  field('Safety Notes', form.s8SafetyNotes);
  await insertPhotos(form.s8Photos, 'Section Photos');

  sectionHeader(9, 'TIE-INS & CONDITIONS');
  boolField('Tie-in to Existing Roofs', form.s9TieIn);
  if (form.s9TieIn) field('Types of Tie-In', form.s9TieInTypes);
  boolField('Ponding Water', form.s9PondingWater);
  if (form.s9PondingWater) { field('Ponding Description', form.s9PondingDesc); field('Ponding SQFT', form.s9PondingSqft); }
  if (form.s9PitchPlans > 0) field('# of Pitch Plans', form.s9PitchPlans);
  if (form.s9PipeBoots > 0) field('Pipe Boots', form.s9PipeBoots);
  await insertPhotos(form.s9Photos, 'Section Photos');

  sectionHeader(10, 'LIGHTNING & SATELLITES');
  boolField('Lightning Protection in Place', form.s10LightningProtection);
  if (form.s10LightningProtection) field('Lightning Quote / Recertification', form.s10LightningQuote);
  boolField('Satellite Dishes', form.s10SatelliteDishes);
  if (form.s10SatelliteDishes && form.s10SatelliteQty > 0) field('Satellite QTY', form.s10SatelliteQty);
  await insertPhotos(form.s10Photos, 'Section Photos');

  sectionHeader(11, 'WALK PADS & GREASE TRAPS');
  boolField('Walk Pads Existing', form.s11WalkPads);
  if (form.s11WalkPads) {
    if (form.s11WalkPadsLf > 0) field('Walk Pads LF', form.s11WalkPadsLf);
    field('Walk Pads Quote $', form.s11WalkPadsQuote);
    field('LN FT Needed', form.s11WalkPadsLnftNeeded);
  }
  boolField('Grease Traps', form.s11GreaseTraps);
  if (form.s11GreaseTraps) field('Grease Trap Price $', form.s11GreaseTrapPrice);
  await insertPhotos(form.s11Photos, 'Section Photos');

  sectionHeader(12, 'SKYLIGHTS');
  if (form.s12SkylightChoice) field('Skylights', form.s12SkylightChoice.charAt(0).toUpperCase() + form.s12SkylightChoice.slice(1));
  field('Additional Details', form.s12SkylightDetails);
  await insertPhotos(form.s12Photos, 'Section Photos');

  sectionHeader(13, 'ROOF ACCESS');
  boolField('Roof Hatch', form.s13RoofHatch);
  boolField('Provide Quote for New', form.s13ProvideQuoteNew);
  boolField('Exterior Mounted Safety Ladder', form.s13ExteriorLadder);
  boolField('Quote New', form.s13QuoteNew);
  boolField('Extension Ladder', form.s13ExtensionLadder);
  if (form.s13ExtensionLadder) field('Ladder Size', form.s13LadderSize);
  await insertPhotos(form.s13Photos, 'Section Photos');

  sectionHeader(14, 'DISCONTINUED CURBS & MISC');
  if (form.s14Curb1) field('Curb 1', form.s14Curb1);
  if (form.s14Curb2) field('Curb 2', form.s14Curb2);
  if (form.s14Curb3) field('Curb 3', form.s14Curb3);
  if (form.s14Curb4) field('Curb 4', form.s14Curb4);
  if (form.s14Curb5) field('Curb 5', form.s14Curb5);
  if (form.s14GasLineLnft > 0) field('Gas Line LNFT', form.s14GasLineLnft);
  boolField('Need to Paint', form.s14NeedToPaint);
  boolField('Support Blocks Replacement', form.s14SupportBlocks);
  if (form.s14WoodSleepersLnft > 0) field('Wood Sleepers Supports LNFT', form.s14WoodSleepersLnft);
  if (form.s14BadElectricalLnft > 0) field('Bad Electrical Conduit LNFT', form.s14BadElectricalLnft);
  await insertPhotos(form.s14Photos, 'Section Photos');

  sectionHeader(15, 'NOTES');
  field('General Notes', form.s15Notes);
  await insertPhotos(form.s15Photos, 'General Photos');

  // Footer
  ensureSpace(10);
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 4;
  doc.setTextColor(...MID_GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('James King Roofing — Confidential Field Inspection Document', margin, y);
  doc.text('Generated with Perplexity Computer', pageW - margin, y, { align: 'right' });

  return doc.output('blob');
}
