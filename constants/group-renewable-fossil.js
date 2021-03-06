import * as FT from './fuelTech.js'

export const GROUP_NAME = 'group.renewable-fossil'

export const PUMPS = `${GROUP_NAME}.pumps`
export const BATTERY_CHARGING = `${GROUP_NAME}.battery_charging`
export const EXPORTS = `${GROUP_NAME}.exports`
export const IMPORTS = `${GROUP_NAME}.imports`

export const RENEWABLES = `${GROUP_NAME}.renewables`
export const FOSSILS = `${GROUP_NAME}.fossils`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[PUMPS] = [FT.PUMPS]
FUEL_TECH_GROUP[BATTERY_CHARGING] = [FT.BATTERY_CHARGING]
FUEL_TECH_GROUP[EXPORTS] = [FT.EXPORTS]
FUEL_TECH_GROUP[IMPORTS] = [FT.IMPORTS]
FUEL_TECH_GROUP[RENEWABLES] = [
  FT.SOLAR,
  FT.ROOFTOP_SOLAR,
  FT.WIND,
  FT.HYDRO,
  FT.BIOMASS
]
FUEL_TECH_GROUP[FOSSILS] = [
  FT.BATTERY_DISCHARGING,
  FT.GAS_RECIP,
  FT.GAS_OCGT,
  FT.GAS_CCGT,
  FT.GAS_STEAM,
  FT.GAS_LFG,
  FT.GAS_WCMG,
  FT.DISTILLATE,
  FT.BLACK_COAL,
  FT.BROWN_COAL
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  BATTERY_CHARGING,
  PUMPS,
  EXPORTS,
  IMPORTS,
  FOSSILS,
  RENEWABLES
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[PUMPS] = '#88AFD0'
FUEL_TECH_GROUP_COLOUR[BATTERY_CHARGING] = '#B2DAEF'
FUEL_TECH_GROUP_COLOUR[EXPORTS] = '#977AB1'
FUEL_TECH_GROUP_COLOUR[IMPORTS] = '#44146F'
FUEL_TECH_GROUP_COLOUR[RENEWABLES] = '#52BCA3'
FUEL_TECH_GROUP_COLOUR[FOSSILS] = '#444'

// Fuel tech type
const LOAD = 'load'
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = LOAD
FUEL_TECH_CATEGORY[BATTERY_CHARGING] = LOAD
FUEL_TECH_CATEGORY[EXPORTS] = LOAD
FUEL_TECH_CATEGORY[IMPORTS] = SOURCE
FUEL_TECH_CATEGORY[RENEWABLES] = SOURCE
FUEL_TECH_CATEGORY[FOSSILS] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[PUMPS] = 'Pumps'
FUEL_TECH_LABEL[BATTERY_CHARGING] = 'Battery (Charging)'
FUEL_TECH_LABEL[EXPORTS] = 'Exports'
FUEL_TECH_LABEL[IMPORTS] = 'Imports'
FUEL_TECH_LABEL[RENEWABLES] = 'Renewables'
FUEL_TECH_LABEL[FOSSILS] = 'Fossils'
