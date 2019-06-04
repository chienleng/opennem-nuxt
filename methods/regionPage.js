import uniq from 'lodash.uniq'
import includes from 'lodash.includes'
import cloneDeep from 'lodash.clonedeep'
import serviceHelpers from '~/services/helpers.js'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import DataTransformService from '~/services/DataTransformService.js'

const methods = {
  fetchData(region, range, cb) {
    if (range === '7D') {
      serviceHelpers.getPowerByRegion(region, cb)
    } else if (range === '30D') {
      serviceHelpers.getEnergyByRegion(region, cb)
    }
  },

  getFuelTechObjs(type, region, availableKeys) {
    const keys = cloneDeep(availableKeys)
    return keys.reverse().map(ft => {
      return {
        id: `${region}.fuel_tech.${ft}.${type}`,
        fuelTech: ft,
        label: FUEL_TECHS.FUEL_TECH_LABEL[ft],
        colour: FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[ft],
        category: FUEL_TECHS.FUEL_TECH_CATEGORY[ft],
        type
      }
    })
  },

  getFlattenData(data, period, fuelTechs, cb) {
    DataTransformService.flattenAndInterpolate(data, period).then(res => {
      // Calculate total, min, reverse value for imports and load types
      res.forEach((d, i) => {
        let total = 0
        let min = 0

        fuelTechs.forEach(ft => {
          if (ft.category === 'load' || ft.fuelTech === 'imports') {
            const negValue = -d[ft.id].value
            d[ft.id].value = negValue
          }

          total += d[ft.id].value || 0
          if (d[ft.id].value < 0) {
            min += d[ft.id].value || 0
          }
        })

        res[i]._total = total
        res[i]._min = min
      })

      let updated = res
      // filter to no later than current date
      if (period === '30min') {
        const start = res[0].date
        const now = new Date()
        updated = DataTransformService.filter(res, start, now.getTime())
      }

      cb(cloneDeep(updated))
    })
  },

  computedAvailableKeys(fuelTechOrder, data) {
    const uniqKeys = uniq(data.map(d => d.fuel_tech).filter(d => d))
    const availKeys = []
    fuelTechOrder.forEach(o => {
      if (includes(uniqKeys, o)) {
        availKeys.push(o)
      }
    })

    return availKeys
  }
}

export default methods
