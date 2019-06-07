import { select, mouse } from 'd3-selection'
import { format as d3Format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, width, height, x) {
  const timeRectWidth = 70
  const valueRectWidth = 200
  const valueRectHeight = 40
  const valueFormat = d3Format(',.1f')
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
    .attr('opacity', 0)
  const $cursorLineText = $svg
    .select(`.${cursorLineTextClass}`)
    .attr('text-anchor', 'middle')
    .style('fill', 'white')

  const $tooltipRect = $cursorLineGroup
    .append('rect')
    .attr('class', tooltipRectClass)
    .attr('width', valueRectWidth)
    .attr('height', valueRectHeight)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('opacity', 0)
  const $tooltipText = $cursorLineGroup
    .append('text')
    .attr('class', tooltipTextClass)
    .attr('text-anchor', 'middle')
  const $tooltipText2 = $cursorLineGroup
    .append('text')
    .attr('class', tooltipTextClass)
    .attr('text-anchor', 'middle')

  let currentKey = '',
    label = ''

  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)
  EventBus.$on('vis.areaover', onAreaOver)

  function onAreaOver(key) {
    currentKey = key
  }

  function onMouseMove(evt, dataset, date) {
    const layer = select(evt).attr('class')
    const mouseEvt = mouse(evt)
    const xMouse = mouseEvt[0]
    const yMouse = mouseEvt[1]
    const yCutoff = (20 / 100) * height
    const timeRectLeftCutoff = timeRectWidth
    const timeRectRightCutoff = width - timeRectWidth - 2
    const valueRectLeftCutoff = valueRectWidth
    const valueRectRightCutoff = width - valueRectWidth - 2

    const xDate = x(date)
    const time = format(date)
    const millisecs = new Date(date).getTime()
    const find = dataset.find(d => d.date === millisecs)

    let total = 0
    let value = 0

    if (find && currentKey && find[currentKey]) {
      label = find[currentKey].fuelTech
      value = valueFormat(find[currentKey].value)
      // total = valueFormat(find._total)
    }
    if (find) {
      total = valueFormat(find._total)
    }

    // Tooltip text/rect to follow mouse
    $tooltipRect
      .attr('x', xDate - valueRectWidth / 2)
      .attr('y', 0)
      .attr('opacity', 1)
    $tooltipText
      .attr('x', xDate)
      .attr('y', 15)
      .text(`${label}: ${value}`)
    $tooltipText2
      .attr('x', xDate)
      .attr('y', 35)
      .text(`Total: ${total}`)

    // TODO: detect if near the left or right edge
    // Cursor line/rect/text to follow mouse
    $cursorLineRect
      .attr('x', xDate - timeRectWidth / 2)
      .attr('y', -20)
      .attr('opacity', 1)
    $cursorLineText
      .attr('x', xDate)
      .attr('y', -5)
      .text(time)

    $cursorLine.attr('d', () => {
      let d = 'M' + xDate + ',' + height
      d += ' ' + xDate + ',' + 0
      return d
    })

    if (yMouse <= yCutoff && layer !== 'brush') {
      $tooltipRect.attr('y', height - valueRectHeight)
      $tooltipText.attr('y', height - 25)
      $tooltipText2.attr('y', height - 5)
      $cursorLineRect.attr('y', height)
      $cursorLineText.attr('y', height + 15)
    }

    if (xMouse >= valueRectRightCutoff) {
      $tooltipRect.attr('x', valueRectRightCutoff)
      $tooltipText.attr('x', valueRectRightCutoff + valueRectWidth / 2)
      $tooltipText2.attr('x', valueRectRightCutoff + valueRectWidth / 2)
    } else if (xMouse <= valueRectLeftCutoff) {
      $tooltipRect.attr('x', 0)
      $tooltipText.attr('x', valueRectWidth / 2)
      $tooltipText2.attr('x', valueRectWidth / 2)
    }

    if (xMouse >= timeRectRightCutoff) {
      $cursorLineRect.attr('x', timeRectRightCutoff)
      $cursorLineText.attr('x', timeRectRightCutoff + timeRectWidth / 2)
    } else if (xMouse <= timeRectLeftCutoff) {
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
