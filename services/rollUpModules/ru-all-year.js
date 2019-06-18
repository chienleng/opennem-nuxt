import moment from 'moment'
import rollUp from './roll-up'

function setStartYear(date) {
  const d = moment(date)
  d.set('month', 0)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let nestDate = setStartYear(data[0].date)

  data.forEach((d, i) => {
    nestDate = setStartYear(d.date)
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
