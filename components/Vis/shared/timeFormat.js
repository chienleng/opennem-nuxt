import moment from 'moment'
import { timeFormat } from 'd3-time-format'
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear
} from 'd3-time'

const formatMillisecond = timeFormat('.%L'),
  formatSecond = timeFormat(':%S'),
  formatMinute = timeFormat('%I:%M'),
  formatHour = timeFormat('%I %p'),
  formatDay = timeFormat('%a %d'),
  formatWeek = timeFormat('%b %d'),
  formatMonth = timeFormat('%B'),
  formatYear = timeFormat('%Y')

export default function(d) {
  const date = moment(d)
    .utcOffset(600)
    .toDate()
  return (timeSecond(date) < date
    ? formatMillisecond
    : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
            ? timeWeek(date) < date
              ? formatDay
              : formatWeek
            : timeYear(date) < date
              ? formatMonth
              : formatYear)(date)
}
