import moment from 'moment'
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

// Australia Seasons
function getStartMonth(month) {
  switch (month) {
    case 11:
    case 0:
    case 1:
      return 11

    case 2:
    case 3:
    case 4:
      return 2

    case 5:
    case 6:
    case 7:
      return 5

    case 8:
    case 9:
    case 10:
      return 8

    default:
  }
  return null
}

function setStartMonth(date, currentMonth, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  if (currentMonth === 0 || currentMonth === 1) {
    d.subtract(1, 'year')
  }
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartMonth(
    data[0].date,
    currentMonth,
    getStartMonth(currentMonth)
  )

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, q, getStartMonth(q))
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
