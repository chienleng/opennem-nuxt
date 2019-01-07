export const PUMPS = 'pumps'
export const BATTERY_CHARGING = 'battery_charging'
export const EXPORTS = 'exports'
export const IMPORTS = 'imports'
export const BROWN_COAL = 'brown_coal'
export const BLACK_COAL = 'black_coal'
export const BIOMASS = 'biomass'
export const DISTILLATE = 'distillate'
export const GAS_STEAM = 'gas_steam'
export const GAS_CCGT = 'gas_ccgt'
export const GAS_OCGT = 'gas_ocgt'
export const GAS_RECIP = 'gas_recip'
export const BATTERY_DISCHARGING = 'battery_discharging'
export const HYDRO = 'hydro'
export const WIND = 'wind'
export const SOLAR = 'solar'
export const ROOFTOP_SOLAR = 'rooftop_solar'

// Fuel tech default order
export const DEFAULT_FUEL_TECH_ORDER = [
  PUMPS,
  BATTERY_CHARGING,
  EXPORTS,
  IMPORTS,
  BROWN_COAL,
  BLACK_COAL,
  BIOMASS,
  DISTILLATE,
  GAS_STEAM,
  GAS_CCGT,
  GAS_OCGT,
  GAS_RECIP,
  BATTERY_DISCHARGING,
  HYDRO,
  WIND,
  SOLAR,
  ROOFTOP_SOLAR
]

// Fuel tech colour
export const DEFAULT_FUEL_TECH_COLOUR = {}
DEFAULT_FUEL_TECH_COLOUR[PUMPS] = '#88AFD0'
DEFAULT_FUEL_TECH_COLOUR[BATTERY_CHARGING] = '#B2DAEF'
DEFAULT_FUEL_TECH_COLOUR[EXPORTS] = '#977AB1'
DEFAULT_FUEL_TECH_COLOUR[IMPORTS] = '#44146F'
DEFAULT_FUEL_TECH_COLOUR[BROWN_COAL] = '#8B572A'
DEFAULT_FUEL_TECH_COLOUR[BLACK_COAL] = '#121212'
DEFAULT_FUEL_TECH_COLOUR[BIOMASS] = '#A3886F'
DEFAULT_FUEL_TECH_COLOUR[DISTILLATE] = '#F35020'
DEFAULT_FUEL_TECH_COLOUR[GAS_STEAM] = '#F48E1B'
DEFAULT_FUEL_TECH_COLOUR[GAS_CCGT] = '#FDB462'
DEFAULT_FUEL_TECH_COLOUR[GAS_OCGT] = '#FFCD96'
DEFAULT_FUEL_TECH_COLOUR[GAS_RECIP] = '#F9DCBC'
DEFAULT_FUEL_TECH_COLOUR[BATTERY_DISCHARGING] = '#00A2FA'
DEFAULT_FUEL_TECH_COLOUR[HYDRO] = '#4582B4'
DEFAULT_FUEL_TECH_COLOUR[WIND] = '#417505'
DEFAULT_FUEL_TECH_COLOUR[SOLAR] = '#DFCF00'
DEFAULT_FUEL_TECH_COLOUR[ROOFTOP_SOLAR] = '#F8E71C'

// Fuel tech type
const LOAD = 'load'
const SOURCE = 'source'
export const FUEL_TECH_TYPE = {}
FUEL_TECH_TYPE[PUMPS] = LOAD
FUEL_TECH_TYPE[BATTERY_CHARGING] = LOAD
FUEL_TECH_TYPE[EXPORTS] = LOAD
FUEL_TECH_TYPE[IMPORTS] = SOURCE
FUEL_TECH_TYPE[BROWN_COAL] = SOURCE
FUEL_TECH_TYPE[BLACK_COAL] = SOURCE
FUEL_TECH_TYPE[BIOMASS] = SOURCE
FUEL_TECH_TYPE[DISTILLATE] = SOURCE
FUEL_TECH_TYPE[GAS_STEAM] = SOURCE
FUEL_TECH_TYPE[GAS_CCGT] = SOURCE
FUEL_TECH_TYPE[GAS_OCGT] = SOURCE
FUEL_TECH_TYPE[GAS_RECIP] = SOURCE
FUEL_TECH_TYPE[BATTERY_DISCHARGING] = SOURCE
FUEL_TECH_TYPE[HYDRO] = SOURCE
FUEL_TECH_TYPE[WIND] = SOURCE
FUEL_TECH_TYPE[SOLAR] = SOURCE
FUEL_TECH_TYPE[ROOFTOP_SOLAR] = SOURCE
