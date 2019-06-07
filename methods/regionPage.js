import axios from 'axios'
import uniq from 'lodash.uniq'
import includes from 'lodash.includes'
import cloneDeep from 'lodash.clonedeep'
import serviceHelpers from '~/services/helpers.js'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import DataTransformService from '~/services/DataTransformService.js'
import DataService from '~/services/DataService.js'

const methods = {
  fetchData(region, range) {
    const calls = []
    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        calls.push(DataService.getPowerByRegion(region))
        break
      case '30D':
        calls.push(DataService.getEnergyByRegion(region))
        break
      case '1Y':
        calls.push(DataService.getEnergyByRegionYear(region, '2018'))
        calls.push(DataService.getEnergyByRegionYear(region, '2019'))
        break
    }

    return new Promise((resolve, reject) => {
      axios
        .all(calls)
        .then(
          axios.spread((...args) => {
            args.forEach(a => {
              if (a.status !== 200) {
                reject(a.originalError)
              }
            })
            console.log(args)
            resolve(args)
          })
        )
        .catch(e => {
          reject(e)
        })
    })
    // switch (range) {
    //   case '1D':
    //   case '3D':
    //   case '7D':
    //     serviceHelpers.getPowerByRegion(region, cb)
    //     break
    //   case '30D':
    //     serviceHelpers.getEnergyByRegion(region, cb)
    //     break
    //   case '1Y':
    //     serviceHelpers.getEnergyByRegionYear(region, '2019', cb)
    //     break
    // }
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

  getFlattenData(data, interval, fuelTechs) {
    // DataTransformService.flattenAndInterpolate(data, interval).then(res => {
    //   // Calculate total, min, reverse value for imports and load types
    //   res.forEach((d, i) => {
    //     let total = 0
    //     let min = 0

    //     fuelTechs.forEach(ft => {
    //       if (ft.category === 'load' || ft.fuelTech === 'imports') {
    //         const negValue = -d[ft.id].value
    //         d[ft.id].value = negValue
    //       }

    //       total += d[ft.id].value || 0
    //       if (d[ft.id].value < 0) {
    //         min += d[ft.id].value || 0
    //       }
    //     })

    //     res[i]._total = total
    //     res[i]._min = min
    //   })

    //   let dataset = res
    //   if (interval === '5m' || interval === '30m') {
    //     const start = res[0].date
    //     const now = new Date().getTime()
    //     dataset = res.filter(d => d.date >= start && d.date <= now)
    //   }

    //   cb(cloneDeep(dataset))
    // })

    return new Promise(resolve => {
      DataTransformService.flattenAndInterpolate(data, interval).then(res => {
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

        let dataset = res
        if (interval === '5m' || interval === '30m') {
          const start = res[0].date
          const now = new Date().getTime()
          dataset = res.filter(d => d.date >= start && d.date <= now)
        }

        resolve(res)
      })
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
