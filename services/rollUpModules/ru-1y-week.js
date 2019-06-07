import * as moment from 'moment'
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

function setStartMonday(whichMonday) {
  const d = moment(whichMonday)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let monday = moment(data[0].date).day('Monday')
  let nestDate = setStartMonday(monday)

  data.forEach((d, i) => {
    const q = moment(d.date).day('Monday')
    nestDate = setStartMonday(q)
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
