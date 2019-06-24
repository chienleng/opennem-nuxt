import Vue from 'vue'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import dateDisplayService from '~/services/DateDisplayService.js'

Vue.filter(
  'customFormatDate',
  (time, { range, interval, showYear = false, showIntervalRange = false }) => {
    return dateDisplayService(
      time,
      range,
      interval,
      showYear,
      showIntervalRange
    )
  }
)

Vue.filter('formatDate', time => {
  const f = d3TimeFormat('%d/%m/%Y, %-I:%M %p')
  return f(time)
})

Vue.filter('formatValue', value => {
  const f = d3Format(',.1f')
  return f(value)
})

Vue.filter('formatCurrency', value => {
  const f = d3Format('$,.2f')
  return f(value)
})
