import Vue from 'vue'
import moment from 'moment'

Vue.filter('formatDate', time => {
  const formatted = moment(time).format('DD/MM/YYYY, h:mma')
  return formatted === 'Invalid Date' ? '' : formatted
})
