import Vue from 'vue'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'

function getFormatStringDay(showYear) {
  return showYear ? '%-d %b %Y' : '%-d %b'
}

function getSeasonLabel(month) {
  switch (month) {
    case '3':
      return 'Autumn'
    case '6':
      return 'Winter'
    case '9':
      return 'Spring'
    case '12':
      return 'Summer'
  }
}

function getQuarterLabel(month) {
  switch (month) {
    case '1':
      return 'Q1'
    case '4':
      return 'Q2'
    case '7':
      return 'Q3'
    case '10':
      return 'Q4'
  }
}

Vue.filter(
  'customFormatDate',
  (time, { range, interval, showYear = false, showIntervalRange = false }) => {
    const now = Date.now()
    const today = d3TimeFormat('%d/%m/%Y')(now)
    const fDate = d3TimeFormat('%d/%m/%Y')(time)
    const thisYear = d3TimeFormat('%Y')(now)
    const fYear = d3TimeFormat('%Y')(time)
    const sYear = showYear || thisYear !== fYear

    let display = ''
    let formatString = ''

    switch (range) {
      case '30D':
        formatString = getFormatStringDay(sYear)
        display = d3TimeFormat(formatString)(time)
        break
      case '1Y':
        if (interval === 'Day') {
          formatString = getFormatStringDay(sYear)
          display = d3TimeFormat(formatString)(time)
        } else if (interval === 'Week' && showIntervalRange) {
          const sixDayslater = time + 518400000
          formatString = getFormatStringDay(true)
          display = `${d3TimeFormat('%-d')(time)} – ${d3TimeFormat(
            formatString
          )(sixDayslater)}`
        } else {
          display = d3TimeFormat('%b %Y')(time)
        }
        break
      case 'ALL':
        if (interval === 'Month') {
          display = d3TimeFormat('%b %Y')(time)
        } else if (interval === 'Season') {
          display = `${getSeasonLabel(
            d3TimeFormat('%-m')(time)
          )} ${d3TimeFormat('%Y')(time)}`
        } else if (interval === 'Quarter') {
          display = `${getQuarterLabel(
            d3TimeFormat('%-m')(time)
          )} ${d3TimeFormat('%Y')(time)}`
        } else if (interval === 'Fin Year') {
          let finYearMonth = d3TimeFormat('%-m')(time)
          let finYear = d3TimeFormat('%y')(time)
          if (finYearMonth > 6) {
            finYear = d3TimeFormat('%y')(time + 31557600000)
          }
          display = `FY${finYear}`
        } else if (interval === 'Year') {
          display = d3TimeFormat('%Y')(time)
        } else {
          display = d3TimeFormat('%b %Y')(time)
        }
        break
      default:
        if (today === fDate) {
          formatString = 'Today at %-I:%M %p'
        } else if (thisYear === fYear) {
          formatString = '%d %b, %-I:%M %p'
        } else {
          formatString = '%d %b %Y, %-I:%M %p'
        }
        display = d3TimeFormat(formatString)(time)
    }

    return display
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
