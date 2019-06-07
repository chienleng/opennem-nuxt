import { nest as d3Nest } from 'd3-collection'
import { mean as d3Mean } from 'd3-array'

export default function(ids, data) {
  const coeff = 1000 * 60 * 30

  const entries = d3Nest()
    .key(d => Math.round(d.date / coeff) * coeff)
    .rollup(a => {
      let obj = {}
      ids.forEach(id => {
        obj[id] = {
          fuelTech: a[0][id].fuelTech,
          type: a[0][id].type,
          value: d3Mean(a, d => d[id].value || 0),
          category: a[0][id].category
        }
      })
      return obj
    })
    .entries(data)

  return entries.map(e => {
    const object = {
      date: parseInt(e.key)
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
