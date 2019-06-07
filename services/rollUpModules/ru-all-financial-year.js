import * as moment from 'moment'
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

function getQuarterStartMonth(quarter) {
  switch (quarter) {
    case 1:
      return 0
    case 2:
      return 3
    case 3:
      return 6
    case 4:
      return 9
    default:
  }
  return null
}

function setStartFY(date, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let currentQ = moment(data[0].date).quarter()
  let nestDate = setStartFY(data[0].date, getQuarterStartMonth(currentQ))

  data.forEach((d, i) => {
    const q = moment(d.date).quarter()
    if (currentQ === 2 && q === 3) {
      nestDate = setStartFY(d.date, getQuarterStartMonth(q))
    }
    currentQ = q
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
