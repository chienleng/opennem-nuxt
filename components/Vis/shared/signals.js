import { select } from 'd3-selection'
import { timeFormat } from 'd3-time-format'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, height, x, dataset) {
  const timeRectWidth = 65
  const format = timeFormat('%H:%M')

  const cursorLineClass = CONFIG.CURSOR_LINE_CLASS
  const cursorLineRectClass = CONFIG.CURSOR_LINE_RECT_CLASS
  const cursorLineTextClass = CONFIG.CURSOR_LINE_TEXT_CLASS

  const $svg = select(`#${id}`)
  const $cursorLine = $svg.select(`.${cursorLineClass}`)
  const $cursorLineRect = $svg
    .select(`.${cursorLineRectClass}`)
    .attr('width', timeRectWidth)
    .attr('height', 20)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('y', -20)
    .style('fill', 'red')
  const $cursorLineText = $svg
    .select(`.${cursorLineTextClass}`)
    .attr('text-anchor', 'middle')
    .attr('y', -5)
    .style('fill', 'white')

  let currentKey = ''

  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)
  EventBus.$on('vis.areaover', onAreaOver)

  function onAreaOver(key) {
    console.log(key)
    currentKey = key
  }

  function onMouseMove(date) {
    const m = x(date)
    const time = format(date)

    const millisecs = new Date(date).getTime()
    const find = dataset.find(d => d.date === millisecs)

    console.log(find, date)
    // rect to follow mouse
    // TODO: detect if near the left or right edge
    $cursorLineRect.attr('x', m - timeRectWidth / 2)

    // text to show date and follow mouse
    $cursorLineText.text(time).attr('x', m)

    // line to follow mouse
    $cursorLine.attr('d', () => {
      let d = 'M' + m + ',' + height
      d += ' ' + m + ',' + 0
      return d
    })
  }

  function onMouseOver() {
    // select(`#${id} .${cursorLineGroupClass}`).attr('opacity', 1)
  }

  function onMouseOut() {
    // select(`#${id} .${cursorLineGroupClass}`).attr('opacity', 0)
  }
}

function destroySignals() {
  EventBus.$off('vis.mousemove')
  EventBus.$off('vis.mouseover')
  EventBus.$off('vis.mouseout')
  EventBus.$off('vis.areaover')
}

export { setupSignals, destroySignals }
