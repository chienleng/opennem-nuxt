import { select, mouse } from 'd3-selection'
import { timeMinute, timeDay } from 'd3-time'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, height, x, brush) {
  const hoverLayerClass = CONFIG.HOVER_LAYER_CLASS
  const cursorLineGroupClass = CONFIG.CURSOR_LINE_GROUP_CLASS
  const cursorLineClass = CONFIG.CURSOR_LINE_CLASS
  const cursorLineRectClass = CONFIG.CURSOR_LINE_RECT_CLASS
  const cursorLineTextClass = CONFIG.CURSOR_LINE_TEXT_CLASS

  const hoverLayer = select(`#${id} .${hoverLayerClass}`)
  const cursorLineGroup = select(`#${id} .${cursorLineGroupClass}`)

  let currentTech = ''

  hoverLayer.selectAll(`.${CONFIG.BRUSH_CLASS}`).remove()
  cursorLineGroup.selectAll(`.${cursorLineClass}`).remove()

  EventBus.$on('vis.techover', onTechOver)
  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)

  // Create hover line and date
  cursorLineGroup.append('path').attr('class', cursorLineClass)
  cursorLineGroup
    .append('rect')
    .attr('class', cursorLineRectClass)
    .attr('width', 40)
    .attr('height', 15)
    .style('fill', 'red')
  cursorLineGroup.append('text').attr('class', cursorLineTextClass)

  // hoverLayer
  //   .append('g')
  //   .attr('class', 'brush')
  //   .call(brush)

  function getEveryTime(date) {
    // TODO: Period should be passed in.
    const period = '30min'
    if (period === '30min') {
      return timeMinute.every(30).round(date)
    } else if (period === 'Daily') {
      return timeDay.every(1).round(date)
    }
    // default 5 mins
    return timeMinute.every(5).round(date)
  }

  function onTechOver(tech) {
    console.log(tech)
    currentTech = tech
  }

  function onMouseMove(date) {
    // Use this to snap to closest time period
    const rounded = getEveryTime(date)
    const m = x(rounded)

    // rect to follow mouse
    select(`#${id} .${cursorLineRectClass}`).attr('x', m)

    // text to show date and follow mouse
    select(`#${id} .${cursorLineTextClass}`)
      .text(currentTech)
      .attr('x', m)

    // line to follow mouse
    select(`#${id} .${cursorLineClass}`).attr('d', () => {
      let d = 'M' + m + ',' + height
      d += ' ' + m + ',' + 0
      return d
    })
  }

  function onMouseOver() {
    select(`#${id} .${cursorLineGroupClass}`).attr('opacity', 1)
  }

  function onMouseOut() {
    select(`#${id} .${cursorLineGroupClass}`).attr('opacity', 0)
  }

  // brush.on('brush', function(d) {
  //   const m = mouse(this)
  //   const date = x.invert(m[0])

  //   EventBus.$emit('vis.mousemove', date)
  // })

  hoverLayer.on('touchmove mousemove', function(d) {
    console.log('move')
    const m = mouse(this)
    const date = x.invert(m[0])
    EventBus.$emit('vis.mousemove', date)
  })

  hoverLayer.on('touchover mouseover', d => {
    console.log('over')
    EventBus.$emit('vis.mouseover')
  })

  hoverLayer.on('mouseout', d => {
    console.log('out')
    EventBus.$emit('vis.mouseout')
  })
}

function destroySignals() {
  EventBus.$off('vis.mousemove')
  EventBus.$off('vis.mouseover')
  EventBus.$off('vis.mouseout')
}

export { setupSignals, destroySignals }
