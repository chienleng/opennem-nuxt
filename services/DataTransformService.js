import moment from 'moment'
import sortBy from 'lodash.sortby'
import { nest } from 'd3-collection'
import { mean } from 'd3-array'
import parseInterval from '~/plugins/intervalParser.js'

/**
 *
 * @param {*} data: response data from API
 */
function transformData(data) {
  const dataKeys = data.map(d => d.id)
  const flatData = []

  /**
   *
   * @param {*} id: data id
   * @param {*} fuelTech: fuel tech name
   * @param {*} type: data type
   * @param {*} newHistory: updated history list
   *
   * Flat data array contains a list of dates and data values (fuelTech, type, value)
   */
  function mergeIntoFlatData(id, fuelTech, type, newHistory) {
    newHistory.forEach(r => {
      const findDate = flatData.find(f => f.date === r.date)
      if (!findDate) {
        const newObj = { date: r.date }

        dataKeys.forEach(key => {
          newObj[key] = {
            fuelTech: null,
            type: null,
            value: null
          }
        })

        newObj[id] = {
          fuelTech,
          type,
          value: r.value
        }
        flatData.push(newObj)
      } else {
        findDate[id] = {
          fuelTech,
          type,
          value: r.value
        }
      }
    })
  }

  /**
   *
   * @param {*} id: data id
   * @param {*} fuelTech: fuel tech type
   * @param {*} type: data type
   * @param {*} history: history object
   */
  function parseHistory(id, fuelTech, type, history) {
    const historyData = history.data
    let currentDate = moment(history.start)
    let interval = parseInterval(history.interval)

    function createHistoryObject(hData) {
      return hData.map(h => {
        const newObj = {
          date: moment(currentDate).valueOf(),
          value: h
        }
        currentDate.add(interval.value, interval.key)
        return newObj
      })
    }

    const historyObjs = createHistoryObject(historyData)
    mergeIntoFlatData(id, fuelTech, type, historyObjs)
  }

  data.forEach(d => {
    if (d.history && d.history.start) {
      parseHistory(d.id, d.fuel_tech, d.type, d.history)
    } else {
      console.error(`${d.id} has no history.`)
    }

    if (d.forecast && d.forecast.start) {
      parseHistory(d.id, d.fuel_tech, d.type, d.forecast)
    } else {
      // console.log(`${d.id} has no forecast.`)
    }
  })

  return sortBy(flatData, ['date'])
}

function rollupTo30Mins(ids, data) {
  const coeff = 1000 * 60 * 30
  const entries = nest()
    // .key(d => new Date(Math.round(d.date / coeff) * coeff))
    .key(d => Math.round(d.date / coeff) * coeff)
    .rollup(a => {
      let obj = {}
      ids.forEach(id => {
        obj[id] = {
          fuelTech: a[0][id].fuelTech,
          type: a[0][id].type,
          value: mean(a, d => d[id].value || 0)
        }
      })
      return obj
    })
    .entries(data)

  // return entries

  return entries.map(e => {
    const object = {
      // date: moment(parseInt(e.key)).valueOf()
      date: parseInt(e.key)
    }

    Object.keys(e.value).forEach(k => {
      object[k] = {
        fuelTech: e.value[k].fuelTech,
        type: e.value[k].type,
        value: e.value[k].value
      }
    })
    return object
  })
}

function findInterpolateSeriesTypes(data) {
  const temperatureItem = data.find(d => d.type === 'temperature')
  const priceItem = data.find(d => d.type === 'price')
  const rooftopSolarItem = data.find(d => d['fuel_tech'] === 'rooftop_solar')
  const interpolateSeriesTypes = []

  if (temperatureItem) {
    interpolateSeriesTypes.push({
      key: temperatureItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  if (rooftopSolarItem) {
    interpolateSeriesTypes.push({
      key: rooftopSolarItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  if (priceItem) {
    interpolateSeriesTypes.push({
      key: priceItem.id,
      interpolation: 'step',
      startIndex: -1,
      currentValue: null
    })
  }

  return interpolateSeriesTypes
}

function mutateDataForInterpolation(data, interpolateSeriesTypes) {
  data.forEach((d, i) => {
    interpolateSeriesTypes.forEach(type => {
      if (d[type.key].value !== null) {
        if (type.interpolation === 'linear') {
          if (type.startIndex === -1) {
            type.startIndex = i
          } else {
            const count = i - type.startIndex
            const addValue = (d[type.key].value - type.currentValue) / count
            for (let x = type.startIndex + 1; x <= i; x += 1) {
              data[x][type.key].value = type.currentValue + addValue
              type.currentValue = data[x][type.key].value
            }
            type.startIndex = i
          }
        }
        type.currentValue = d[type.key].value
      } else if (d[type.key].value === null) {
        if (type.interpolation === 'step') {
          d[type.key].value = type.currentValue
        }
      }
    })
  })
}

export default {
  flatten(data) {
    const promise = new Promise(resolve => {
      const ids = data.map(d => d.id)
      let flatData = transformData(data)

      resolve(flatData)
    })

    return promise
  },

  flattenAndInterpolate(data, period) {
    const promise = new Promise(resolve => {
      const ids = data.map(d => d.id)
      const interpolateSeriesTypes = findInterpolateSeriesTypes(data)
      let flatData = transformData(data)
      mutateDataForInterpolation(flatData, interpolateSeriesTypes)
      if (period === '30min') {
        resolve(rollupTo30Mins(ids, flatData))
      } else {
        resolve(flatData)
      }
    })

    return promise
  },

  getColumns(data) {
    const columns = {
      date: 'Date'
    }

    data.forEach(d => {
      const fuelTech = d.fuel_tech || '*'
      columns[d.id] = `${fuelTech} ${d.type}` || d.id
    })

    return columns
  },

  filter(data, startDate, lastDate) {
    return data
  }
}
