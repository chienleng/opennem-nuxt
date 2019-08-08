import Vue from 'vue'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import DateDisplay from '~/services/DateDisplay.js'

Vue.filter(
  'customFormatDate',
  (
    time,
    {
      range,
      interval,
      isStart = false,
      isEnd = false,
      showYear = false,
      showIntervalRange = false
    }
  ) => {
    return DateDisplay.specialDateFormats(
      time,
      range,
      interval,
      isStart,
      isEnd,
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

Vue.filter('facilityFormatNumber', value => {
  const fString = value < 10 ? ',.1f' : ',.0f'
  const f = d3Format(fString)
  return f(value)
})

Vue.filter('customFormatValue', (value, { formatter = ',.1f' }) => {
  const f = d3Format(formatter)
  return f(value)
})

Vue.filter('formatCurrency', value => {
  const f = d3Format('$,.2f')
  const fValue = f(value)
  return isFinite(value) ? fValue : '–'
})
