import moment from 'moment'
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

function setStartMonth(date, currentMonth) {
  const d = moment(date)
  d.set('month', currentMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartMonth(data[0].date, currentMonth)

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, q)
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
