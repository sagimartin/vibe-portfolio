import smellgoBlack from '../assets/smellgo_black.svg'
import smellgoWhite from '../assets/smellgo_white.svg'
import viverteBlack from '../assets/viverte_black.webp'
import viverteWhite from '../assets/viverte_white.png'
import pemdelianBlack from '../assets/pemdelian_black.svg'
import pemdelianWhite from '../assets/pemdelian_white.svg'
import taatiBlack from '../assets/taati_black.svg'
import taatiWhite from '../assets/taati_white.svg'
import mistyMondayBlack from '../assets/mistymonday_black.svg'
import mistyMondayWhite from '../assets/mistymonday_white.svg'
import celeniBlack from '../assets/celeni_black.png'
import celeniWhite from '../assets/celeni_white.png'
import vitezkurtosBlack from '../assets/vitezkurtos_black.svg'
import vitezkurtosWhite from '../assets/vitezkurtos_white.svg'

export const PROJECT_IMAGES = {
  smellgo: { light: smellgoBlack, dark: smellgoWhite },
  viverte: { light: viverteBlack, dark: viverteWhite },
  pemdelian: { light: pemdelianBlack, dark: pemdelianWhite },
  taati: { light: taatiBlack, dark: taatiWhite },
  mistyMonday: { light: mistyMondayBlack, dark: mistyMondayWhite },
  celeni: { light: celeniBlack, dark: celeniWhite },
  vitezkurtos: { light: vitezkurtosBlack, dark: vitezkurtosWhite }
}

// natural aspect ratios (width / height) of the logo files, plus an optical size correction.
// The mobile layout sizes every logo to a similar visual area from these numbers.
export const PROJECT_LOGO_FIT = {
  smellgo: { ratio: 4.03 },
  viverte: { ratio: 1.64 },
  pemdelian: { ratio: 7.01 },
  taati: { ratio: 0.75, scale: 1.6 },
  mistyMonday: { ratio: 11.1 },
  celeni: { ratio: 3.67 },
  vitezkurtos: { ratio: 5.05 }
}
