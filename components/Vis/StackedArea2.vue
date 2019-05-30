<template>
  <div class="vis stacked-area-vis">
    <button
      class="reset-btn"
      @click="handleReset"
    >
      reset
    </button>
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
        
        <g 
          :transform="xAxisBrushTransform" 
          class="x-axis-brush-group" />
      </g>

      <g 
        :transform="gTransform">
        <g :class="hoverLayerClass">
          <rect
            :width="width"
            :height="height"/>
        </g>
        <g class="stacked-area-group" />
      </g>

      <!-- <g
        :transform="gTransform"
        :class="hoverLayerClass">
        <rect
          :width="width"
          :height="height"/>
      </g> -->
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
    </svg>
  </div>
</template>

<script>
import { scaleOrdinal, scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisRight } from 'd3-axis'
import { area, stack, curveStep, curveLinear } from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format } from 'd3-format'
import { select, selectAll, mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import { timeDay } from 'd3-time'
import debounce from 'lodash.debounce'

import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './shared/config.js'
import { setupSignals, destroySignals } from './shared/signals.js'
import axisTimeFormat from './shared/timeFormat.js'

export default {
  props: {
    // stacked area data, requires domains.colour, domain.id and data
    visData: {
      type: Object,
      default: () => {
        return {
          domains: [],
          dataset: []
        }
      }
    },
    // TODO: guide data
    guideData: {
      type: Array,
      default: () => [
        {
          start: '2019-01-20T22:00Z',
          end: '2019-01-21T06:00Z'
        }
      ]
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    },
    // OPTIONAL: whether it is a step curve
    step: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      dataset: [],
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
      area: null,
      colours: schemeCategory10,
      stack: null,
      brush: null,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      // guideGroup: null,
      $stackedAreaGroup: null,
      // guideGroupClass: 'guide-group',
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      stackedAreaPathClass: CONFIG.CHART_STACKED_AREA_PATH_CLASS,
      stackedAreaGroupClass: CONFIG.CHART_STACKED_AREA_GROUP_CLASS,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS
    }
  },

  computed: {
    domains() {
      return this.visData.domains
    },
    domainIds() {
      return this.domains.map(d => d.id).reverse()
    },
    domainColours() {
      return this.domains.map(d => d.colour).reverse()
    },
    id() {
      return `stacked-area-${this._uid}`
    },
    gTransform() {
      return `translate(${this.margin.left},${this.margin.top})`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    xAxisBrushTransform() {
      return `translate(0, ${this.height})`
    }
  },

  watch: {
    visData(updated) {
      this.dataset = this.calculateTotalMin(updated.dataset)
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

    this.dataset = this.calculateTotalMin(this.visData.dataset)
    this.update()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    destroySignals()
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight - this.margin.top - this.margin.bottom
    },

    setup() {
      // Define x, y, z scale types
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal()

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height + 10)
        .tickFormat(d => axisTimeFormat(d))
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        .tickArguments([5])
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      // Select the svg groups for this vis instance
      this.$xAxisGroup = select(`#${this.id} .${this.xAxisClass}`)
      this.$xAxisBrushGroup = select(`#${this.id} .x-axis-brush-group`)
      this.$yAxisGroup = select(`#${this.id} .${this.yAxisClass}`)
      this.$yAxisTickGroup = select(`#${this.id} .${this.yAxisTickClass}`)
      // this.guideGroup = select(`#${this.id} .${this.guideGroupClass}`)

      select(`#${this.id}`).on('mouseleave', () => {
        select(`#${this.id} .${this.cursorLineGroupClass}`).attr('opacity', 0)
      })

      select(`#${this.id}`).on('mouseenter', () => {
        select(`#${this.id} .${this.cursorLineGroupClass}`).attr('opacity', 1)
      })

      // Setup the 'brush' area and event handler
      this.brush = brushX()
        .extent([[0, 0], [this.width, 40]])
        .on('end', this.brushEnded)

      // This is a stacked area
      this.stack = stack()

      // Define the area's x value and y0,y1 values
      this.area = area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))

      // Signals
      setupSignals(this.id, this.height, this.x, this.brush)
    },

    update() {
      const self = this
      this.$stackedAreaGroup = select(
        `#${this.id} .${this.stackedAreaGroupClass}`
      )

      // Remove previous stacked area
      this.$stackedAreaGroup.selectAll(`.${this.stackedAreaPathClass}`).remove()
      this.$stackedAreaGroup.selectAll('.guide').remove()

      this.x.domain(extent(this.dataset, d => d.date))
      this.y
        .domain([
          min(this.dataset, d => d._min),
          max(this.dataset, d => d._total)
        ])
        .nice()
      this.z.range(this.domainColours).domain(this.domainIds)

      // Update ticks
      // define the ticks by time gaps -> xAxis.ticks(timeDay.every(1))
      this.xAxis.ticks(5)
      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      if (this.step) {
        this.area.curve(curveStep)
      } else {
        this.area.curve(curveLinear)
      }

      this.stack
        .keys(this.domainIds)
        .value((d, key) => (d[key] ? d[key].value : 0))

      const stackArea = this.$stackedAreaGroup
        .selectAll(`.${this.stackedAreaPathClass}`)
        .data(this.stack(this.dataset))

      // stacked area #clip path is defined in CSS (safari workaround)
      // - look in /assets/scss/vis.scss
      stackArea
        .enter()
        .append('path')
        .attr('id', d => d.key)
        .attr('class', `${this.stackedAreaPathClass}`)
        .attr('d', this.area)
        .style('fill', d => this.z(d.key))
        .on('touchmove mousemove', function(d) {
          console.log('$stackedArea touchmove mousemove')
          const m = mouse(this)
          const date = self.x.invert(m[0])
          EventBus.$emit('vis.techover', d.key)
          EventBus.$emit('vis.mousemove', date)
        })

      this.$xAxisBrushGroup
        .append('g')
        .attr('class', 'brush')
        .on('touchmove mousemove', function() {
          console.log('$xAxisBrushGroup touchmove mousemove')
          const m = mouse(this)
          const date = self.x.invert(m[0])
          EventBus.$emit('vis.mousemove', date)
          console.log('$xAxisBrushGroup done')
        })
        .call(this.brush)

      this.brush.on('brush', function(d) {
        console.log('brush')
        const m = mouse(this)
        const date = self.x.invert(m[0])

        EventBus.$emit('vis.mousemove', date)
      })
    },

    redraw() {
      this.x.range([0, this.width])
      this.y.range([this.height, 0])

      this.xAxis.tickSize(-this.height + 10)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      this.brush.extent([[0, 0], [this.width, 40]])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brush)
      this.$stackedAreaGroup.selectAll('path').attr('d', this.area)
    },

    handleResize() {
      this.setupWidthHeight()
      this.redraw()
    },

    handleReset() {
      const transition = this.$stackedAreaGroup.transition().duration(250)

      this.x.domain(extent(this.dataset, d => d.date))
      this.$xAxisGroup.transition(transition).call(this.xAxis)

      this.$stackedAreaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)

      // const start = this.dataset[100].date
      // const end = this.dataset[200].date
      // this.guideGroup
      //   .selectAll('.guide')
      //   .attr('x', d => this.x(start))
      //   .attr('y', 0)
      //   .attr('width', this.x(end) - this.x(start))
      //   .attr('height', this.height)
      //   .attr('fill', '#ddd')
    },

    brushEnded(d) {
      console.log('ended', event)
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return
      const s = event.selection

      const hoverLayer = select(`#${this.id} .${this.hoverLayerClass}`)
      // get the dates based on x value
      console.log(s, s.map(this.x.invert, this.x))
      // this.x.domain(s.map(this.x.invert, this.x))
      this.x.domain([this.x.invert(s[0]), this.x.invert(s[1])])
      selectAll('.brush').call(this.brush.move, null)
      // this.x.domain([s[0][0], s[1][0]].map(this.x.invert, this.x))

      const transition = this.$stackedAreaGroup.transition().duration(250)
      this.$xAxisGroup.transition(transition).call(this.xAxis)
      this.$stackedAreaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)

      // const start = this.dataset[100].date
      // const end = this.dataset[200].date
      // this.guideGroup
      //   .selectAll('.guide')
      //   .attr('x', d => this.x(start))
      //   .attr('y', 0)
      //   .attr('width', this.x(end) - this.x(start))
      //   .attr('height', this.height)
      //   .attr('fill', '#ddd')
    },

    customXAxis(g) {
      g.call(this.xAxis)
      // break x axis tick label here
      g.selectAll('.tick text').attr('dx', 2)
      g.selectAll('.tick line').attr('y1', 20)
    },

    customYAxis(g) {
      g.call(this.yAxis)
      g.selectAll('.tick text')
        .attr('x', 4)
        .attr('dy', -4)
    },

    calculateTotalMin(dataset) {
      const updated = dataset.slice(0)
      dataset.forEach((d, i) => {
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
        updated[i]._total = total
        updated[i]._min = min
      })
      return updated
    }
  }
}
</script>

<style lang="scss" scoped>
.stacked-area-vis {
  position: relative;
}
.reset-btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
