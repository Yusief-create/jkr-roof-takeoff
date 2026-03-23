import type { PhotoData } from '../components/PhotoUpload';

export interface FormState {
  // Section 1 — PROJECT INFO
  s1BuildingName: string;
  s1BuildingAddress: string;
  s1SectionName: string;
  s1SectionName2: string;
  s1Photos: PhotoData[];

  // Section 2 — SLOPE IN THE DECK
  s2SlopeInDeck: string;
  s2FieldSlope: string;
  s2CricketsCore: string;
  s2HighPointPhotos: PhotoData[];
  s2LowPointPhotos: PhotoData[];
  s2Photos: PhotoData[];

  // Section 3 — SAMPLES: WET OR DRY
  s3Sample1: string;
  s3Sample2: string;
  s3Sample3: string;
  s3Sample4: string;
  s3Sample5: string;
  s3Sample6: string;
  s3Sample7: string;
  s3Sample8: string;
  s3Photos: PhotoData[];

  // Section 4 — EXISTING ROOF
  s4LayersQty: number;
  s4MaterialType: string;
  s4Photos: PhotoData[];

  // Section 5 — DRAINAGE
  s5GuttersQty: number;
  s5ScuppersQty: number;
  s5InternalDrains: number;
  s5GuttersLnft: number;
  s5GuttersQty2: number;
  s5GuttersQty3: number;
  s5DownspoutsLnft: number;
  s5OverflowsQty: number;
  s5Photos: PhotoData[];

  // Section 6 — FLASHING
  s6FlashingHeightsMin8: boolean;
  s6LowFlashingHeights: boolean;
  s6Photos: PhotoData[];

  // Section 7 — CURBS
  s7CurbsDesc: string;
  s7WallHeights: string;
  s7LinearFeet: number;
  s7Photos: PhotoData[];

  // Section 8 — SAFETY
  s8ExistingAnchors: boolean;
  s8AreCertified: boolean;
  s8SafetyNotes: string;
  s8Photos: PhotoData[];

  // Section 9 — TIE-INS & CONDITIONS
  s9TieIn: boolean;
  s9TieInTypes: string;
  s9PondingWater: boolean;
  s9PondingDesc: string;
  s9PondingSqft: string;
  s9PitchPlans: number;
  s9PipeBoots: number;
  s9Photos: PhotoData[];

  // Section 10 — LIGHTNING & SATELLITES
  s10LightningProtection: boolean;
  s10LightningQuote: string;
  s10SatelliteDishes: boolean;
  s10SatelliteQty: number;
  s10Photos: PhotoData[];

  // Section 11 — WALK PADS & GREASE TRAPS
  s11WalkPads: boolean;
  s11WalkPadsLf: number;
  s11WalkPadsQuote: string;
  s11WalkPadsLnftNeeded: string;
  s11GreaseTraps: boolean;
  s11GreaseTrapPrice: string;
  s11Photos: PhotoData[];

  // Section 12 — SKYLIGHTS
  s12SkylightChoice: 'reuse' | 'replace' | 'none' | '';
  s12SkylightDetails: string;
  s12Photos: PhotoData[];

  // Section 13 — ROOF ACCESS
  s13RoofHatch: boolean;
  s13ProvideQuoteNew: boolean;
  s13ExteriorLadder: boolean;
  s13QuoteNew: boolean;
  s13ExtensionLadder: boolean;
  s13LadderSize: string;
  s13Photos: PhotoData[];

  // Section 14 — DISCONTINUED CURBS & MISC
  s14Curb1: string;
  s14Curb2: string;
  s14Curb3: string;
  s14Curb4: string;
  s14Curb5: string;
  s14GasLineLnft: number;
  s14NeedToPaint: boolean;
  s14SupportBlocks: boolean;
  s14WoodSleepersLnft: number;
  s14BadElectricalLnft: number;
  s14Photos: PhotoData[];

  // Section 15 — NOTES
  s15Notes: string;
  s15Photos: PhotoData[];
}

export const initialFormState: FormState = {
  s1BuildingName: '',
  s1BuildingAddress: '',
  s1SectionName: '',
  s1SectionName2: '',
  s1Photos: [],
  s2SlopeInDeck: '',
  s2FieldSlope: '',
  s2CricketsCore: '',
  s2HighPointPhotos: [],
  s2LowPointPhotos: [],
  s2Photos: [],
  s3Sample1: '',
  s3Sample2: '',
  s3Sample3: '',
  s3Sample4: '',
  s3Sample5: '',
  s3Sample6: '',
  s3Sample7: '',
  s3Sample8: '',
  s3Photos: [],
  s4LayersQty: 0,
  s4MaterialType: '',
  s4Photos: [],
  s5GuttersQty: 0,
  s5ScuppersQty: 0,
  s5InternalDrains: 0,
  s5GuttersLnft: 0,
  s5GuttersQty2: 0,
  s5GuttersQty3: 0,
  s5DownspoutsLnft: 0,
  s5OverflowsQty: 0,
  s5Photos: [],
  s6FlashingHeightsMin8: false,
  s6LowFlashingHeights: false,
  s6Photos: [],
  s7CurbsDesc: '',
  s7WallHeights: '',
  s7LinearFeet: 0,
  s7Photos: [],
  s8ExistingAnchors: false,
  s8AreCertified: false,
  s8SafetyNotes: '',
  s8Photos: [],
  s9TieIn: false,
  s9TieInTypes: '',
  s9PondingWater: false,
  s9PondingDesc: '',
  s9PondingSqft: '',
  s9PitchPlans: 0,
  s9PipeBoots: 0,
  s9Photos: [],
  s10LightningProtection: false,
  s10LightningQuote: '',
  s10SatelliteDishes: false,
  s10SatelliteQty: 0,
  s10Photos: [],
  s11WalkPads: false,
  s11WalkPadsLf: 0,
  s11WalkPadsQuote: '',
  s11WalkPadsLnftNeeded: '',
  s11GreaseTraps: false,
  s11GreaseTrapPrice: '',
  s11Photos: [],
  s12SkylightChoice: '',
  s12SkylightDetails: '',
  s12Photos: [],
  s13RoofHatch: false,
  s13ProvideQuoteNew: false,
  s13ExteriorLadder: false,
  s13QuoteNew: false,
  s13ExtensionLadder: false,
  s13LadderSize: '',
  s13Photos: [],
  s14Curb1: '',
  s14Curb2: '',
  s14Curb3: '',
  s14Curb4: '',
  s14Curb5: '',
  s14GasLineLnft: 0,
  s14NeedToPaint: false,
  s14SupportBlocks: false,
  s14WoodSleepersLnft: 0,
  s14BadElectricalLnft: 0,
  s14Photos: [],
  s15Notes: '',
  s15Photos: [],
};
