import { select, mouse } from 'd3-selection'
import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './config.js'

function setupSignals(id, height, x) {
  const hoverLayerClass = CONFIG.HOVER_LAYER_CLASS
  const cursorLineClass = CONFIG.CURSOR_LINE_CLASS
  const cursorLineGroupClass = CONFIG.CURSOR_LINE_GROUP_CLASS

  const hoverLayer = select(`#${id} .${hoverLayerClass}`)
  const cursorLineGroup = select(`#${id} .${cursorLineGroupClass}`)
  cursorLineGroup.append('path').attr('class', cursorLineClass)

  EventBus.$on('vis.mousemove', onMouseMove)
  EventBus.$on('vis.mouseover', onMouseOver)
  EventBus.$on('vis.mouseout', onMouseOut)

  function onMouseMove(date) {
    const m = x(date)
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

  hoverLayer
  hoverLayer.on('mousemove', function(d) {
    const m = mouse(this)
    const date = x.invert(m[0])
    EventBus.$emit('vis.mousemove', date)
  })
  hoverLayer.on('mouseover', d => {
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
