import moment from 'moment'
import _sortBy from 'lodash.sortby'
import parseInterval from '~/plugins/intervalParser.js'
import * as FUEL_TECHS from '~/constants/fuelTech.js'

import rollUp30m from './rollUpModules/ru-30m.js'
import rollUp1YWeek from './rollUpModules/ru-1y-week.js'
import rollUp1YMonth from './rollUpModules/ru-1y-month.js'
import rollUpAllSeason from './rollUpModules/ru-all-season.js'
import rollUpAllQuarter from './rollUpModules/ru-all-quarter.js'
import rollUpAllFinYear from './rollUpModules/ru-all-financial-year.js'
import rollUpAllYear from './rollUpModules/ru-all-year.js'
/**
 *
 * @param {*} data: response data from API
 */
function transformData(data, domains) {
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

        domains.forEach(domain => {
          newObj[domain.id] = {
            fuelTech: domain.fuelTech,
            type: domain.type,
            value: null,
            category: domain.category
          }
        })

        if (!newObj[id]) {
          newObj[id] = {
            value: null
          }
        }
        newObj[id].value = r.value
        flatData.push(newObj)
      } else {
        if (type === 'power' || type === 'energy') {
          findDate[id].value = r.value
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
    // const offsetHrs = moment().utcOffset()
    // let historyDate = moment(history.start).utcOffset(offsetHrs)
    // const year = historyDate.year()
    // const month = historyDate.month() + 1
    // const date = historyDate.date()
    // const hour = historyDate.hour()
    // const minute = historyDate.minute()
    // let currentDate = moment.utc(
    //   `${year}-${month}-${date} ${hour}:${minute}`,
    //   'YYYY-MM-DD HH:mm'
    // )
    let currentDate = moment(history.start)
    let interval = parseInterval(history.interval)

    function createHistoryObject(hData) {
      return hData.map(h => {
        const newObj = {
          date: currentDate.valueOf(),
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

  return _sortBy(flatData, ['date'])
}

function findInterpolateSeriesTypes(data) {
  const rooftopSolarItem = data.find(d => d['fuel_tech'] === 'rooftop_solar')
  // const temperatureItem = data.find(d => d.type === 'temperature')
  // const priceItem = data.find(d => d.type === 'price')
  const interpolateSeriesTypes = []
  if (rooftopSolarItem) {
    interpolateSeriesTypes.push({
      key: rooftopSolarItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  // if (temperatureItem) {
  //   interpolateSeriesTypes.push({
  //     key: temperatureItem.id,
  //     interpolation: 'linear',
  //     startIndex: -1,
  //     currentValue: null
  //   })
  // }
  // if (priceItem) {
  //   interpolateSeriesTypes.push({
  //     key: priceItem.id,
  //     interpolation: 'step',
  //     startIndex: -1,
  //     currentValue: null
  //   })
  // }

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
      let flatData = transformData(data)
      resolve(flatData)
    })

    return promise
  },

  flattenAndInterpolate(data, domains) {
    const promise = new Promise(resolve => {
      const ids = data.map(d => d.id)
      console.log(ids)
      const interpolateSeriesTypes = findInterpolateSeriesTypes(data)
      let flatData = transformData(data, domains)
      console.log(flatData)
      mutateDataForInterpolation(flatData, interpolateSeriesTypes)

      resolve(flatData)
    })

    return promise
  },

  rollUp(data, domains, range, interval) {
    const domainIds = domains.map(d => d.id)
    const promise = new Promise(resolve => {
      if (interval === '30m') {
        resolve(rollUp30m(domainIds, data))
      } else if (range === '1Y' && interval === 'Week') {
        resolve(rollUp1YWeek(domainIds, data))
      } else if (range === '1Y' && interval === 'Month') {
        resolve(rollUp1YMonth(domainIds, data))
      } else if (range === 'ALL' && interval === 'Season') {
        resolve(rollUpAllSeason(domainIds, data))
      } else if (range === 'ALL' && interval === 'Quarter') {
        resolve(rollUpAllQuarter(domainIds, data))
      } else if (range === 'ALL' && interval === 'Fin Year') {
        resolve(rollUpAllFinYear(domainIds, data))
      } else if (range === 'ALL' && interval === 'Year') {
        resolve(rollUpAllYear(domainIds, data))
      }
      resolve(data)
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

  filterDataByStartEndDates(data, startDate, endDate) {
    const startDateTime = new Date(startDate).getTime()
    const endDateTime = new Date(endDate).getTime()

    return data.filter(d => d.date >= startDateTime && d.date <= endDateTime)
  }
}
