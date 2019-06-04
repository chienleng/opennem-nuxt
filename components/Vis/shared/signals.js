import { select, mouse } from 'd3-selection'
import { timeFormat } from 'd3-time-format'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, width, height, x, dataset) {
  const timeRectWidth = 70
  const format = timeFormat('%H:%M')

  const cursorLineGroupClass = CONFIG.CURSOR_LINE_GROUP_CLASS
  const cursorLineClass = CONFIG.CURSOR_LINE_CLASS
  const cursorLineRectClass = CONFIG.CURSOR_LINE_RECT_CLASS
  const cursorLineTextClass = CONFIG.CURSOR_LINE_TEXT_CLASS
  const tooltipRectClass = CONFIG.TOOLTIP_RECT_CLASS
  const tooltipTextClass = CONFIG.TOOLTIP_TEXT_CLASS

  const $svg = select(`#${id}`)
  const $cursorLineGroup = $svg.select(`.${cursorLineGroupClass}`)
  const $cursorLine = $svg.select(`.${cursorLineClass}`)
  const $cursorLineRect = $svg
    .select(`.${cursorLineRectClass}`)
    .attr('width', timeRectWidth)
    .attr('height', 20)
    .attr('rx', 2)
    .attr('ry', 2)
  const $cursorLineText = $svg
    .select(`.${cursorLineTextClass}`)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')

  const $tooltipRect = $cursorLineGroup
    .append('rect')
    .attr('class', tooltipRectClass)
    .attr('width', 300)
    .attr('height', 20)
    .attr('rx', 2)
    .attr('ry', 2)
  const $tooltipText = $cursorLineGroup
    .append('text')
    .attr('class', tooltipTextClass)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')

  let currentKey = '',
    label = ''

  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)
  EventBus.$on('vis.areaover', onAreaOver)

  function onAreaOver(key) {
    currentKey = key
  }

  function onMouseMove(evt, date) {
    const layer = select(evt).attr('class')
    const mouseEvt = mouse(evt)
    const xMouse = mouseEvt[0]
    const yMouse = mouseEvt[1]
    const yCutoff = (20 / 100) * height
    const leftCutoff = timeRectWidth
    const rightCutoff = width - timeRectWidth - 2
    const xDate = x(date)
    const time = format(date)
    const millisecs = new Date(date).getTime()
    const find = dataset.find(d => d.date === millisecs)
    let value = ''

    // console.log(label, value, date)
    if (find && currentKey) {
      label = find[currentKey].fuelTech
      value = find[currentKey].value
    }

    // Tooltip text/rect to follow mouse
    $tooltipRect.attr('x', xDate - 300 / 2).attr('y', 0)
    $tooltipText
      .text(`${label}: ${value}`)
      .attr('x', xDate)
      .attr('y', 15)

    // TODO: detect if near the left or right edge
    // Cursor line/rect/text to follow mouse
    $cursorLineRect.attr('x', xDate - timeRectWidth / 2).attr('y', -20)
    $cursorLineText
      .text(time)
      .attr('x', xDate)
      .attr('y', -5)
    $cursorLine.attr('d', () => {
      let d = 'M' + xDate + ',' + height
      d += ' ' + xDate + ',' + 0
      return d
    })

    if (yMouse <= yCutoff && layer !== 'brush') {
      $tooltipRect.attr('y', height - 20)
      $tooltipText.attr('y', height - 10)
      $cursorLineRect.attr('y', height)
      $cursorLineText.attr('y', height + 15)
    }
    if (xMouse >= rightCutoff) {
      $cursorLineRect.attr('x', rightCutoff)
      $cursorLineText.attr('x', rightCutoff + timeRectWidth / 2)
    } else if (xMouse <= leftCutoff) {
      $cursorLineRect.attr('x', 0)
      $cursorLineText.attr('x', timeRectWidth / 2)
    }
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
