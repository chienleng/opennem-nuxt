<template>
  <div class="vis">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="stacked-area-chart">
      <g 
        :transform="gTransform"
        class="stacked-area-group" />
      <g 
        :transform="gTransform"
        class="axis-group">
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g :class="yAxisClass" />
      </g>
      <g
        :transform="gTransform"
        class="cursor-group">
        <g :class="cursorLineGroupClass" />
      </g>
      <g
        :transform="gTransform"
        :class="hoverLayerClass">
        <rect
          :width="width"
          :height="height" />
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleOrdinal, scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { area, stack } from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format } from 'd3-format'
import { select, mouse } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import debounce from 'lodash.debounce'

import * as CONFIG from './shared/config.js'
import { setupSignals, destroySignals } from './shared/signals.js'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    ids: {
      type: Array,
      default: () => []
    },
    domainColours: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: CONFIG.DEFAULT_SVG_HEIGHT,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      z: null,
      g: null,
      xAxis: null,
      yAxis: null,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      xAxisGroup: null,
      yAxisGroup: null,
      area: null,
      colours: schemeCategory10,
      stack: null,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS
    }
  },

  computed: {
    updatedData() {
      const updated = this.data.slice(0)
      this.data.forEach((d, i) => {
        let total = 0
        let min = 0
        this.ids.forEach(k => {
          total += d[k].value || 0
          if (d[k].value < 0) {
            min += d[k].value || 0
          }
        })
        updated[i]._totalFuelTech = total
        updated[i]._min = min
      })
      return updated
    },
    id() {
      return `${CONFIG.CHART_STACKED_AREA}-${this._uid}`
    },
    gTransform() {
      return `translate(${this.margin.left},${this.margin.top})`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    }
  },

  watch: {
    data() {
      this.update()
    },

    domainColours(newColours) {
      this.colours = Object.values(newColours)
    }
  },

  mounted() {
    window.addEventListener(
      'resize',
      debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )

    this.setupWidthHeight()
    this.setup()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    destroySignals()
  },

  methods: {
    handleResize() {
      this.redraw()
    },

    redraw() {
      this.setupWidthHeight()
      this.setup()
      this.update()
    },

    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight - this.margin.top - this.margin.bottom
    },

    setup() {
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal()

      this.xAxis = axisBottom(this.x)
      this.yAxis = axisLeft(this.y)
        .ticks(5)
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      this.xAxisGroup = select(`#${this.id} .${this.xAxisClass}`)
      this.yAxisGroup = select(`#${this.id} .${this.yAxisClass}`)

      this.stack = stack()

      this.area = area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))
    },

    update() {
      console.log('vis update')
      const g = select(`#${this.id} .${CONFIG.CHART_STACKED_AREA}-group`)

      // Remove previous stacked
      g.selectAll(`.${CONFIG.CHART_STACKED_AREA}`).remove()

      this.x.domain(extent(this.updatedData, d => d.date))
      this.y
        .domain([
          min(this.updatedData, d => d._min),
          max(this.updatedData, d => d._totalFuelTech)
        ])
        .nice()
      this.z.range(this.colours).domain(this.ids)

      this.xAxisGroup.call(this.xAxis)
      this.yAxisGroup.call(this.yAxis)

      setupSignals(this.id, this.height, this.x)

      this.stack.keys(this.ids).value((d, key) => d[key].value)
      const stackedArea = g
        .selectAll(`.${CONFIG.CHART_STACKED_AREA}`)
        .data(this.stack(this.updatedData))

      stackedArea
        .enter()
        .append('g')
        .attr('class', CONFIG.CHART_STACKED_AREA)
        .append('path')
        .attr('class', 'area-path')
        .style('fill', d => this.z(d.key))
        .attr('d', this.area)
    }
  }
}
</script>

<style lang="scss">
path.line {
  fill: none;
  stroke: #000;
  stroke-width: 1;
}
.cursor-line {
  stroke: red;
  stroke-width: 1px;
}
.hover-layer {
  fill: transparent;
}
.area-path {
  opacity: 0.9;
}
</style>
