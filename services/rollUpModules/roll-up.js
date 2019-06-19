/***
 * TODO: Deprecation notice:
 *  Use JavaScript’s built-in Map, Set and Object classes instead of d3-collection’s corresponding methods.
 *  Use d3-array’s group and rollup instead of d3-collection’s nest.
 */
import { nest as d3Nest } from 'd3-collection'
import { sum as d3Sum, mean as d3Mean } from 'd3-array'

export default function(domains, data) {
  const entries = d3Nest()
    .key(d => d.nestDate)
    .rollup(a => {
      let obj = {}
      domains.forEach(domain => {
        const id = domain.id
        const type = domain.type
        const isEnergyType = type === 'power' || type === 'energy'
        const isTemperatureType = type === 'temperature'
        const isPriceType = type === 'price' || type === 'volume_weighted_price'

        if (isEnergyType) {
          obj[id] = d3Sum(a, d => d[id] || 0)
        } else if (isPriceType || isTemperatureType) {
          obj[id] = d3Mean(a, d => d[id] || 0)
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
      object[k] = e.value[k]
    })
    return object
  })
}
