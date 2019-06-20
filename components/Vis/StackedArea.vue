<template>
  <div class="vis stacked-area-vis">
    <button
      v-show="zoomed"
      class="button is-rounded is-small reset-btn"
      @click="handleReset"
    >
      Zoom Out
    </button>
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="stacked-area-chart">
      <defs>
        <!-- where to clip -->
        <clipPath :id="`${id}-clip`">
          <rect
            :width="width"
            :height="height"/>
        </clipPath>
      </defs>

      <g 
        :transform="gTransform"
        class="axis-line-group">
        <!-- x and y axis ticks/lines/text -->
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g :class="yAxisClass" />

        <!-- x axis layer to allow zoom in (brush) -->
        <g 
          :transform="xAxisBrushTransform" 
          class="x-axis-brush-group" />
      </g>

      <g 
        :transform="gTransform">
        <!-- hover layer to read interaction movements -->
        <g :class="hoverLayerClass">
          <rect
            :width="width"
            :height="height"/>
        </g>

        <!-- where the stacked area path will show -->
        <g class="stacked-area-group" />
      </g>

      <!-- yAxis tick text here to show above the area -->
      <g 
        :transform="gTransform"
        class="axis-text-group">
        <g :class="yAxisTickClass" />
      </g>

      <!-- cursor line and tooltip -->
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
import {
  area as d3Area,
  stack,
  curveStep,
  curveLinear,
  curveNatural
} from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format as d3Format } from 'd3-format'
import { select, selectAll, mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import { timeFormat as d3Timeformat } from 'd3-time-format'
import debounce from 'lodash.debounce'

import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './shared/config.js'
import axisTimeFormat from './shared/timeFormat.js'
import axisSecondaryTimeFormat from './shared/secondaryTimeFormat.js'
import axisTimeTicks from './shared/timeTicks.js'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    // !!REQUIRED: domains.colour, domain.id
    domains: {
      type: Array,
      default: () => []
    },
    dynamicExtent: {
      type: Array,
      default: () => []
    },
    mouseLoc: {
      type: Array,
      default: () => null
    },
    hoverDate: {
      type: Date,
      default: () => null
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    },
    // OPTIONAL: what kind of curve
    curve: {
      type: String,
      default: () => 'linear'
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      z: null,
      guides: null,
      xAxis: null,
      xDomainExtent: null,
      yAxis: null,
      area: null,
      colours: schemeCategory10,
      stack: null,
      brushX: null,
      zoomed: false,
      mouseEvt: null,
      currentDomainOver: null,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      $hoverLayer: null,
      $cursorLineGroup: null,
      $tooltipGroup: null,
      $stackedAreaGroup: null,
      // Stacked Area
      stackedAreaPathClass: CONFIG.CHART_STACKED_AREA_PATH_CLASS,
      stackedAreaGroupClass: CONFIG.CHART_STACKED_AREA_GROUP_CLASS,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      xAxisBrushGroupClass: CONFIG.X_AXIS_BRUSH_GROUP_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      // Cursor Line and Tooltip
      timeRectWidth: 70,
      timeRectHeight: 20,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS,
      cursorLineClass: CONFIG.CURSOR_LINE_CLASS,
      cursorLineTextClass: CONFIG.CURSOR_LINE_TEXT_CLASS,
      cursorLineRectClass: CONFIG.CURSOR_LINE_RECT_CLASS,
      tooltipRectWidth: 200,
      tooltipRectHeight: 40,
      tooltipGroupClass: CONFIG.TOOLTIP_GROUP_CLASS,
      tooltipRectClass: CONFIG.TOOLTIP_RECT_CLASS,
      tooltipTextClass: CONFIG.TOOLTIP_TEXT_CLASS
    }
  },

  computed: {
    datasetDateExtent() {
      return extent(this.dataset, d => new Date(d.date))
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
    clipPathUrl() {
      return `url(#${this.id}-clip)`
    },
    gTransform() {
      return `translate(${this.margin.left},${this.margin.top})`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    xAxisBrushTransform() {
      return `translate(0, ${this.height})`
    },
    curveType() {
      switch (this.curve) {
        case 'step':
          return curveStep
        case 'smooth':
          return curveNatural
        case 'linear':
        default:
          return curveLinear
      }
    }
  },

  watch: {
    dataset() {
      this.zoomed = false
      this.update()
      this.resizeRedraw()
    },
    visHeight(newValue) {
      this.svgHeight = newValue
      this.handleResize()
    },
    dynamicExtent(newExtent) {
      if (newExtent && newExtent.length) {
        this.x.domain(newExtent)
        this.zoomed = true
        this.zoomRedraw()
      }
    },
    hoverDate(date) {
      this.updateCursorLineTooltip(date)
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
    this.update()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight - this.margin.top - this.margin.bottom
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = select(`#${this.id}`)

      // Axis
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)
      this.$yAxisTickGroup = $svg.select(`.${this.yAxisTickClass}`)

      // Brush
      this.$xAxisBrushGroup = $svg.select(`.${this.xAxisBrushGroupClass}`)

      // Tooltip and hover listener
      this.$hoverLayer = $svg.select(`.${this.hoverLayerClass}`)
      this.$cursorLineGroup = $svg.select(`.${this.cursorLineGroupClass}`)

      // Define x, y, z scale types
      this.x = scaleTime().range([0, this.width]) // Date axis
      this.y = scaleLinear().range([this.height, 0]) // Value axis
      this.z = scaleOrdinal() // Colour

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat(d => axisTimeFormat(d))
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        // .ticks(10)
        .tickFormat(d => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      // Setup the 'brush' area and event handler
      this.brushX = brushX()
        .extent([[0, 0], [this.width, 40]])
        .on('end', this.brushEnded)

      // X Axis Brush (zoom in/out interaction)
      this.$xAxisBrushGroup
        .append('g')
        .attr('class', 'brush')
        .call(this.brushX)

      // Create hover line and date (rect/text)
      this.$cursorLineGroup.append('path').attr('class', this.cursorLineClass)
      this.$cursorLineGroup
        .append('rect')
        .attr('class', this.cursorLineRectClass)
        .attr('width', this.timeRectWidth)
        .attr('height', this.timeRectHeight)
        .attr('opacity', 0)
      this.$cursorLineGroup
        .append('text')
        .attr('class', this.cursorLineTextClass)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')

      // Create tooltip group
      this.$tooltipGroup = this.$cursorLineGroup
        .append('g')
        .attr('class', this.tooltipGroupClass)
      // Create tooltip rect
      this.$tooltipGroup
        .append('rect')
        .attr('class', this.tooltipRectClass)
        .attr('width', this.tooltipRectWidth)
        .attr('height', this.tooltipRectHeight)
        .attr('opacity', 0)
      // Create tooltip text
      this.$tooltipGroup
        .append('text')
        .attr('class', this.tooltipTextClass)
        .attr('text-anchor', 'middle')

      // This is a stacked area
      this.stack = stack()
      // How to draw the area path
      // - define the area's x value and y0,y1 values
      this.area = d3Area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))

      // Event handling
      // - Control tooltip visibility for mouse entering/leaving svg
      $svg.on('mouseenter', () => {
        // this.$cursorLineGroup.attr('opacity', 1)
        EventBus.$emit('vis.mouseenter')
      })
      $svg.on('mouseleave', () => {
        // this.$cursorLineGroup.attr('opacity', 0)
        this.mouseEvt = null
        EventBus.$emit('vis.mouseleave')
      })

      // - find date when on the hoverLayer or brushLayer or when brushing
      this.$hoverLayer.on('touchmove mousemove', function() {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
        self.currentDomainOver = null
      })
      this.brushX.on('brush', function() {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
        self.currentDomainOver = null
      })
      this.$xAxisBrushGroup
        .selectAll('.brush')
        .on('touchmove mousemove', function() {
          self.$emit('eventChange', this)
          self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
          self.currentDomainOver = null
        })
    },

    update() {
      const self = this
      this.$stackedAreaGroup = select(
        `#${this.id} .${this.stackedAreaGroupClass}`
      )

      // Setup the x/y/z Axis domains
      // - Use dataset date range if there is none being passed into
      const xDomainExtent = this.dynamicExtent.length
        ? this.dynamicExtent
        : this.datasetDateExtent
      this.x.domain(xDomainExtent)
      this.y
        .domain([
          min(this.dataset, d => d._min),
          max(this.dataset, d => d._total)
        ])
        .nice()
      this.z.range(this.domainColours).domain(this.domainIds)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      // Setup the keys in the stack so the area knows how to draw the area
      this.stack.keys(this.domainIds).value((d, key) => (d[key] ? d[key] : 0))
      this.area.curve(this.curveType)

      // Generate Stacked Area
      const stackArea = this.$stackedAreaGroup
        .selectAll(`.${this.stackedAreaPathClass}`)
        .data(this.stack(this.dataset))
      stackArea
        .enter()
        .append('path')
        .attr('id', d => d.key)
        .attr('class', `${this.stackedAreaPathClass}`)
        .attr('d', this.area)
        .style('clip-path', this.clipPathUrl)
        .style('-webkit-clip-path', this.clipPathUrl)
        .style('fill', d => this.z(d.key))

      stackArea.exit().remove()

      // Event handling
      // - find date and domain
      this.$stackedAreaGroup
        .selectAll('path')
        .on('touchmove mousemove', function(d) {
          self.$emit('eventChange', this)
          self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
          self.currentDomainOver = d.key
        })
    },

    updateCursorLineTooltip(date) {
      const xDate = this.x(date)
      const formattedTime = d3Timeformat('%H:%M')(date)
      const valueFormat = d3Format(',.1f')
      const time = new Date(date).getTime()
      const find = this.dataset.find(d => d.date === time)
      let total = null
      let label = ''
      let value = 0

      if (find && this.currentDomainOver && find[this.currentDomainOver]) {
        label = this.currentDomainOver
        value = valueFormat(find[this.currentDomainOver])
      }
      if (find) {
        total = valueFormat(find._total)
      }

      this.positionCursorLine(xDate, formattedTime)
      this.positionTooltip(xDate, label, value, total)
    },

    // Update vis when container is resized
    handleResize() {
      this.setupWidthHeight()
      this.resizeRedraw()
    },

    handleReset() {
      this.zoomed = false
      this.x.domain(this.datasetDateExtent)
      this.zoomRedraw()
      EventBus.$emit('dataset.filter', this.datasetDateExtent)
    },

    resizeRedraw() {
      this.x.range([0, this.width])
      this.y.range([this.height, 0])

      this.xAxis.tickSize(-this.height)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      this.brushX.extent([[0, 0], [this.width, 40]])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brushX)
      this.$stackedAreaGroup.selectAll('path').attr('d', this.area)
    },

    zoomRedraw() {
      // Animate to the selected area by updating the x axis and area path
      const transition = 100
      this.$xAxisGroup.call(this.customXAxis)
      this.$stackedAreaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)
    },

    positionCursorLine(xDate, time) {
      const $cursorLine = this.$cursorLineGroup.select(
        `.${this.cursorLineClass}`
      )
      const $cursorLineRect = this.$cursorLineGroup.select(
        `.${this.cursorLineRectClass}`
      )
      const $cursorLineText = this.$cursorLineGroup.select(
        `.${this.cursorLineTextClass}`
      )

      // Cursor line/rect/text to follow mouse
      $cursorLineRect
        .attr('x', xDate - this.timeRectWidth / 2)
        .attr('y', -20)
        .attr('opacity', 1)
      $cursorLineText
        .attr('x', xDate)
        .attr('y', -5)
        .text(time)
      // Position and draw the line
      $cursorLine.attr('d', () => {
        let d = 'M' + xDate + ',' + this.height
        d += ' ' + xDate + ',' + 0
        return d
      })

      if (this.mouseLoc) {
        const xMouse = this.mouseLoc[0]
        const yMouse = this.mouseLoc[1]
        const topCutoff = (20 / 100) * this.height
        const leftCutoff = this.timeRectWidth / 2
        const rightCutoff = this.width - this.timeRectWidth / 2

        // Adjust the position of the tooltips if cursor is near the top
        if (yMouse <= topCutoff) {
          // $tooltipRect.attr('y', height - valueRectHeight)
          // $tooltipText.attr('y', height - 25)
          // $tooltipText2.attr('y', height - 5)
          $cursorLineRect.attr('y', this.height)
          $cursorLineText.attr('y', this.height + 15)
        }

        // - check for time tooltip
        if (xMouse >= rightCutoff) {
          $cursorLineRect.attr('x', rightCutoff - this.timeRectWidth / 2)
          $cursorLineText.attr('x', rightCutoff)
        } else if (xMouse <= leftCutoff) {
          $cursorLineRect.attr('x', 0)
          $cursorLineText.attr('x', this.timeRectWidth / 2)
        }
      }
    },

    positionTooltip(xDate, label, value, total) {
      const $tooltipRect = this.$tooltipGroup.select(
        `.${this.tooltipRectClass}`
      )
      const $tooltipText = this.$tooltipGroup.select(
        `.${this.tooltipTextClass}`
      )

      $tooltipRect
        .attr('x', xDate - this.tooltipRectWidth / 2)
        .attr('y', 0)
        .attr('opacity', 1)
      $tooltipText
        .attr('x', xDate)
        .attr('y', 15)
        .text(`${label}: ${value}`)
        .append('tspan')
        .attr('x', xDate)
        .attr('dy', 12)
        .text(`${total}`)

      // Tooltips to stick to left or right corners when close to the edge
      // - check for value tooltip
      if (this.mouseLoc) {
        const xMouse = this.mouseLoc[0]
        const yMouse = this.mouseLoc[1]
        const leftCutoff = this.tooltipRectWidth / 2
        const rightCutoff = this.width - this.tooltipRectWidth / 2

        if (xMouse >= rightCutoff) {
          $tooltipRect.attr('x', rightCutoff - this.tooltipRectWidth / 2)
          $tooltipText.attr('x', rightCutoff)
          $tooltipText.select('tspan').attr('x', rightCutoff)
        } else if (xMouse <= leftCutoff) {
          $tooltipRect.attr('x', 0)
          $tooltipText.attr('x', this.tooltipRectWidth / 2)
          $tooltipText.select('tspan').attr('x', this.tooltipRectWidth / 2)
        }
      }
    },

    // handle when selecting the date ranges on the brush area
    brushEnded(d) {
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return

      // Turn off the brush selection
      selectAll('.brush').call(this.brushX.move, null)

      // Get the brush selection (start/end) points -> dates
      const s = event.selection
      const startDate = this.x.invert(s[0])
      const endDate = this.x.invert(s[1])
      const dateRange = [startDate, endDate]

      // Set it to the current X domain
      this.x.domain(dateRange)

      this.zoomed = true
      this.zoomRedraw()
      EventBus.$emit('dataset.filter', dateRange)
    },

    customXAxis(g) {
      const ticks = axisTimeTicks(this.dynamicExtent[1] - this.dynamicExtent[0])
      this.xAxis.ticks(ticks)

      // add secondary x axis tick label here
      const insertSecondaryAxisTick = function(d) {
        const el = select(this)
        const secondaryText = axisSecondaryTimeFormat(d)
        if (secondaryText !== '') {
          el.append('tspan')
            .text(secondaryText)
            .attr('x', 2)
            .attr('dy', 12)
        }
      }

      g.call(this.xAxis)
      g.selectAll('.tick text').each(insertSecondaryAxisTick)
      g.selectAll('.tick text')
        .attr('x', 2)
        .attr('y', 5)
      g.selectAll('.tick line').attr('y1', 20)
    },

    customYAxis(g) {
      g.call(this.yAxis)
      g.selectAll('.tick text')
        .attr('x', 4)
        .attr('dy', -4)
    },

    getXAxisDateByMouse(evt) {
      const m = mouse(evt)
      const date = this.x.invert(m[0])
      return date
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
  right: 1rem;
  top: 2.5rem;
}
</style>
