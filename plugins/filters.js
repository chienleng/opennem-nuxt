import Vue from 'vue'
import moment from 'moment'
import { format } from 'd3-format'

Vue.filter('formatDate', time => {
  const formatted = moment(time)
    // .utcOffset(600)
    .format('DD/MM/YYYY, h:mma')
  return formatted === 'Invalid Date' ? '' : formatted
})

Vue.filter('formatValue', value => {
  const f = format('.1f')
  return f(value)
})
