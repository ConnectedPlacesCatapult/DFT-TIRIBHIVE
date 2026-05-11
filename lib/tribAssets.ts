/**
 * Static asset URLs aligned with TRIB-Roadmap `src/Resources/` under `public/images/trib/`.
 * Prefer these over ad-hoc strings so paths stay 1:1 with the source repo layout.
 */
export const TRIB_PUBLIC_ROOT = "/images/trib" as const;
const R = TRIB_PUBLIC_ROOT;

export const tribAssets = {
  /** `Resources/Images/` */
  images: {
    background: `${R}/Images/Background_Image.png`,
    about: `${R}/Images/About_Page.png`,
  },

  /** `Resources/Logos/` (filenames match GitHub repo exactly) */
  logos: {
    dft: `${R}/Logos/DfT_3298_AW (002).png`,
    cpc: `${R}/Logos/CPC_Logo_RGB_green.png`,
    ukri: `${R}/Logos/UKRI-Logo_Horiz-RGB.png`,
    ndtpBlue: `${R}/Logos/NDTP-logo-v3-HM Gov-Blue.jpg`,
    hvmCatapult: `${R}/Logos/HVM_Catapult.jpg`,
    adept: `${R}/Logos/Adept_Master_Logo_RGB_HR.png`,
    hs2: `${R}/Logos/HS2_Logo.png`,
    innovateUk: `${R}/Logos/Innovate_UK.png`,
    epsrc: `${R}/Logos/UKRI_EPSR_Council-Logo_Horiz-RGB.png`,
    dsit: `${R}/Logos/DSIT_Colour_Main.png`,
    rssb: `${R}/Logos/RSSB_MASTER_LOGO_DIGITAL_LR.png`,
    ati: `${R}/Logos/__sitelogo__Hi Res Logo.png`,
    dsitBlack: `${R}/Logos/DSIT_Black_Main.png`,
    ndtpNavy: `${R}/Logos/NDTP-logo-v3-HM Gov-Navy.jpg`,
    networkRail: `${R}/Logos/Network_Rail.png`,
    maritimeCoastguard: `${R}/Logos/Maritime_Coastguard_Agency.png`,
    nationalHighways: `${R}/Logos/National_Highways.png`,
    govOfficeForScience: `${R}/Logos/Government_Office_for_Science.png`,
  },

  /** Root `Resources/*` — icons, contributor PNGs, UI chrome (matches `require(\`../Resources/${name}.png\`)`). */
  root: (filenameWithoutPath: string) => `${R}/${filenameWithoutPath}`,
} as const;
