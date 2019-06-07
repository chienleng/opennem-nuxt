import * as moment from 'moment'
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

// Quarters
function getStartMonth(month) {
  switch (month) {
    case 0:
    case 1:
    case 2:
      return 0

    case 3:
    case 4:
    case 5:
      return 3

    case 6:
    case 7:
    case 8:
      return 6

    case 9:
    case 10:
    case 11:
      return 9

    default:
  }
  return null
}

function setStartMonth(date, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartMonth(data[0].date, getStartMonth(currentMonth))

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, getStartMonth(q))
    data[i].nestDate = nestDate.toDate()
  })

  const entries = d3Nest()
    .key(d => d.nestDate)
    .rollup(a => {
      let obj = {}
      ids.forEach(id => {
        obj[id] = {
          fuelTech: a[0][id].fuelTech,
          type: a[0][id].type,
          value: d3Sum(a, d => d[id].value || 0),
          category: a[0][id].category
        }
      })
      return obj
    })
    .entries(data)

  return entries.map(e => {
    const object = {
      date: new Date(e.key).getTime()
    }

    Object.keys(e.value).forEach(k => {
      object[k] = {
        fuelTech: e.value[k].fuelTech,
        type: e.value[k].type,
        value: e.value[k].value,
        category: e.value[k].category
      }
    })
    return object
  })
}
