import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum } from 'd3-array'

export default function(ids, data) {
  const entries = d3Nest()
    .key(d => d.nestDate)
    .rollup(a => {
      let obj = {}
      ids.forEach(id => {
        obj[id] = d3Sum(a, d => d[id] || 0)
      })
      return obj
    })
    .entries(data)

  return entries.map(e => {
    const object = {
      date: new Date(e.key).getTime()
    }

    Object.keys(e.value).forEach(k => {
      object[k] = e.value[k]
    })
    return object
  })
}
