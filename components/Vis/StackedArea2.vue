<template>
  <div class="vis">
    <button @click="handleChartReset">reset</button>
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="stacked-area-chart">
      <defs>
        <clipPath id="clip">
          <rect
            :width="width"
            :height="height"/>
        </clipPath>
      </defs>
      <g 
        :transform="gTransform"
        class="guide-group" />

      <g 
        :transform="gTransform"
        class="axis-line-group">
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g :class="yAxisClass" />
      </g>

      <g 
        :transform="gTransform"
        class="stacked-area-group" />

      <g 
        :transform="gTransform"
        class="axis-text-group">
        <g :class="yAxisTickClass" />
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
          :height="height"/>
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleOrdinal, scaleLinear, scaleTime, scaleUtc } from 'd3-scale'
import { axisBottom, axisRight } from 'd3-axis'
import { area, stack, curveStep, curveLinear } from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import { select, mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import { timeDay } from 'd3-time'
import debounce from 'lodash.debounce'
import moment from 'moment'

import * as CONFIG from './shared/config.js'
import { setupSignals, destroySignals } from './shared/signals.js'
import axisTimeFormat from './shared/timeFormat.js'

export default {
  props: {
    visData: {
      type: Object,
      default: () => {
        return {
          domains: [],
          data: []
        }
      }
    },
    guideData: {
      type: Array,
      default: () => [
        {
          start: '2019-01-20T22:00Z',
          end: '2019-01-21T06:00Z'
        }
      ]
    },
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    },
    step: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      updatedData: [],
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      z: null,
      g: null,
      guides: null,
      xAxis: null,
      yAxis: null,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      guideGroupClass: 'guide-group',
      xAxisGroup: null,
      yAxisGroup: null,
      yAxisTickGroup: null,
      guideGroup: null,
      area: null,
      stackedArea: null,
      colours: schemeCategory10,
      stack: null,
      brush: null,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS
    }
  },

  computed: {
    // updatedData() {
    //   const updated = this.data.slice(0)
    //   this.data.forEach((d, i) => {
    //     let total = 0
    //     let min = 0
    //     this.domainIds.forEach(k => {
    //       if (d[k]) {
    //         total += d[k].value || 0
    //         if (d[k].value < 0) {
    //           min += d[k].value || 0
    //         }
    //       }
    //     })
    //     updated[i]._totalFuelTech = total
    //     updated[i]._min = min
    //   })
    //   return updated
    // },
    domains() {
      return this.visData.domains
    },
    domainIds() {
      return this.visData.domains.map(d => d.id).reverse()
    },
    domainColours() {
      return this.visData.domains.map(d => d.colour).reverse()
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
    // data(newData) {
    //   const updated = newData.slice(0)
    //   newData.forEach((d, i) => {
    //     let total = 0
    //     let min = 0
    //     this.domainIds.forEach(k => {
    //       if (d[k]) {
    //         total += d[k].value || 0
    //         if (d[k].value < 0) {
    //           min += d[k].value || 0
    //         }
    //       }
    //     })
    //     updated[i]._totalFuelTech = total
    //     updated[i]._min = min
    //   })
    //   this.updatedData = updated

    //   console.log(newData, updated)
    //   this.update()
    // },

    // domains() {
    //   this.update()
    // },

    visData(updatedVisData) {
      console.log(updatedVisData)

      const newData = updatedVisData.data
      const updated = newData.slice(0)
      newData.forEach((d, i) => {
        let total = 0
        let min = 0
        this.domainIds.forEach(k => {
          if (d[k]) {
            total += d[k].value || 0
            if (d[k].value < 0) {
              min += d[k].value || 0
            }
          }
        })
        updated[i]._totalFuelTech = total
        updated[i]._min = min
      })
      this.updatedData = updated
      this.update()
    }
  },

  created() {
    this.svgHeight = this.visHeight
  },

  mounted() {
    window.addEventListener(
      'resize',
      debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )

    this.setupWidthHeight()
    this.setup()

    const newData = this.visData.data
    const updated = newData.slice(0)
    newData.forEach((d, i) => {
      let total = 0
      let min = 0
      this.domainIds.forEach(k => {
        if (d[k]) {
          total += d[k].value || 0
          if (d[k].value < 0) {
            min += d[k].value || 0
          }
        }
      })
      updated[i]._totalFuelTech = total
      updated[i]._min = min
    })
    this.updatedData = updated
    this.update()
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

    handleChartReset() {
      const g = select(`#${this.id} .${CONFIG.CHART_STACKED_AREA}-group`)
      const transition = g.transition().duration(250)

      this.x.domain(extent(this.updatedData, d => d.date))
      this.xAxisGroup.transition(transition).call(this.xAxis)

      g.selectAll('path')
        .transition(transition)
        .attr('d', this.area)

      const start = this.updatedData[100].date
      const end = this.updatedData[200].date
      this.guideGroup
        .selectAll('.guide')
        .attr('x', d => this.x(start))
        .attr('y', 0)
        .attr('width', this.x(end) - this.x(start))
        .attr('height', this.height)
        .attr('fill', '#ddd')
    },

    brushEnded(d) {
      console.log('ended', event)
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return
      const s = event.selection

      const hoverLayer = select(`#${this.id} .${CONFIG.HOVER_LAYER_CLASS}`)
      // get the dates based on x value
      console.log(s.map(this.x.invert, this.x))
      // this.x.domain(s.map(this.x.invert, this.x))
      this.x.domain([this.x.invert(s[0]), this.x.invert(s[1])])
      select('.brush').call(this.brush.move, null)
      // this.x.domain([s[0][0], s[1][0]].map(this.x.invert, this.x))

      const g = select(`#${this.id} .${CONFIG.CHART_STACKED_AREA}-group`)
      const transition = g.transition().duration(250)
      this.xAxisGroup.transition(transition).call(this.xAxis)
      g.selectAll('path')
        .transition(transition)
        .attr('d', this.area)

      const start = this.updatedData[100].date
      const end = this.updatedData[200].date
      this.guideGroup
        .selectAll('.guide')
        .attr('x', d => this.x(start))
        .attr('y', 0)
        .attr('width', this.x(end) - this.x(start))
        .attr('height', this.height)
        .attr('fill', '#ddd')
    },

    setup() {
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal()

      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat(d => axisTimeFormat(d))
      // this.xAxis = axisBottom(this.x)
      //   .ticks(5)
      //   .tickFormat(d => {
      //     return moment(d)
      //       .utcOffset(600)
      //       .format('DD/MM/YY h:mma')
      //   })

      // this.xAxis = axisBottom(this.x)
      //   .ticks(timeDay.every(1))
      //   .tickFormat(d =>
      //     moment
      //       .utc(d)
      //       .utcOffset(600)
      //       .format('DD/MM/YY h:mma')
      //   )
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        .tickArguments([5])
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      this.xAxisGroup = select(`#${this.id} .${this.xAxisClass}`)
      this.yAxisGroup = select(`#${this.id} .${this.yAxisClass}`)
      this.yAxisTickGroup = select(`#${this.id} .${this.yAxisTickClass}`)
      this.guideGroup = select(`#${this.id} .${this.guideGroupClass}`)

      this.stack = stack()
      this.brush = brushX()
        .extent([[0, 0], [this.width, this.height]])
        .on('end', this.brushEnded)

      this.area = area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))

      // Hover signals
      setupSignals(this.id, this.height, this.x, this.brush)
    },

    update() {
      console.log('vis update', this.step)
      const g = select(`#${this.id} .${CONFIG.CHART_STACKED_AREA}-group`)

      // Remove previous stacked area
      g.selectAll(`.${CONFIG.CHART_STACKED_AREA}`).remove()
      g.selectAll('.guide').remove()

      g.on('dblclick', this.handleChartDoubleClicked)

      this.x.domain(extent(this.updatedData, d => d.date))
      this.y
        .domain([
          min(this.updatedData, d => d._min),
          max(this.updatedData, d => d._totalFuelTech)
        ])
        .nice()
      this.z.range(this.domainColours).domain(this.domainIds)

      const yAxis = this.yAxis
      this.yAxisGroup.call(customYAxis)
      this.yAxisTickGroup.call(customYAxis)
      function customYAxis(g) {
        g.call(yAxis)
        g.selectAll('.tick text')
          .attr('x', 4)
          .attr('dy', -4)
      }

      const xAxis = this.xAxis
      this.xAxisGroup.call(customXAxis)
      function customXAxis(g) {
        g.call(xAxis)
        g.selectAll('.tick text').attr('dx', 2)
        g.selectAll('.tick line').attr('y1', 20)
      }

      if (this.step) {
        this.area.curve(curveStep)
      } else {
        this.area.curve(curveLinear)
      }

      // const dd = this.updatedData[100] ? this.updatedData[100].date : null
      // if (dd) {
      //   console.log(this.x(this.updatedData[100].date))
      //   const start = this.updatedData[100].date
      //   const end = this.updatedData[200].date
      //   this.guides = this.guideGroup
      //     .selectAll('.guide')
      //     .data(this.guideData)
      //     .enter()
      //     .append('rect')
      //     .attr('class', 'guide')
      //     .attr('clip-path', 'url(#clip)')
      //     .attr('x', d => this.x(start))
      //     .attr('y', 0)
      //     .attr('width', this.x(end) - this.x(start))
      //     .attr('height', this.height)
      //     .attr('fill', '#ddd')
      // }

      this.stack
        .keys(this.domainIds)
        .value((d, key) => (d[key] ? d[key].value : 0))
      this.stackedArea = g
        .selectAll(`.${CONFIG.CHART_STACKED_AREA}`)
        .data(this.stack(this.updatedData))

      this.stackedArea
        .enter()
        .append('path')
        // .attr('clip-path', 'url(#clip)')
        .attr('class', `${CONFIG.CHART_STACKED_AREA}`)
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
.stacked-area {
  opacity: 0.9;
  clip-path: url(#clip);
}

// axis
.domain {
  stroke: none;
}
.axis-line-group {
  .x-axis .tick text {
    text-anchor: start;
  }
  .x-axis .tick line {
    stroke-dasharray: 3.8;
    stroke: rgba(0, 0, 0, 0.2);
  }
  .y-axis .tick:not(:first-of-type) line {
    stroke-dasharray: 3.8;
    stroke: rgba(0, 0, 0, 0.2);
  }
}
.axis-text-group {
  .x-axis-tick .tick line {
    stroke: none;
  }
  .y-axis-tick .tick:not(:first-of-type) line {
    stroke: none;
  }
}
</style>
