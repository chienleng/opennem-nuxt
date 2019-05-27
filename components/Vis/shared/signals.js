import { select, mouse } from 'd3-selection'
import { timeMinute, timeDay } from 'd3-time'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, height, x, brush) {
  const hoverLayerClass = CONFIG.HOVER_LAYER_CLASS
  const cursorLineClass = CONFIG.CURSOR_LINE_CLASS
  const cursorLineGroupClass = CONFIG.CURSOR_LINE_GROUP_CLASS

  const hoverLayer = select(`#${id} .${hoverLayerClass}`)
  const cursorLineGroup = select(`#${id} .${cursorLineGroupClass}`)

  hoverLayer.selectAll(`.${CONFIG.BRUSH_CLASS}`).remove()
  cursorLineGroup.selectAll(`.${cursorLineClass}`).remove()

  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)

  // Remove
  cursorLineGroup.append('path').attr('class', cursorLineClass)
  hoverLayer
    .append('g')
    .attr('class', 'brush')
    .call(brush)

  function getEveryTime(date) {
    const period = '30min'
    if (period === '30min') {
      return timeMinute.every(30).round(date)
    } else if (period === 'Daily') {
      return timeDay.every(1).round(date)
    }
    // default 5 mins
    return timeMinute.every(5).round(date)
  }

  function onMouseMove(date) {
    // const m = x(date)
    const rounded = getEveryTime(date)
    console.log(rounded, x(rounded))
    const m = x(rounded)
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

  hoverLayer.on('touchmove mousemove', function(d) {
    const m = mouse(this)
    const date = x.invert(m[0])
    EventBus.$emit('vis.mousemove', date)
  })

  hoverLayer.on('touchover mouseover', d => {
    EventBus.$emit('vis.mouseover')
  })

  hoverLayer.on('mouseout', d => {
    EventBus.$emit('vis.mouseout')
  })
}

function destroySignals() {
  EventBus.$off('vis.mousemove')
  EventBus.$off('vis.mouseover')
  EventBus.$off('vis.mouseout')
}

export { setupSignals, destroySignals }
