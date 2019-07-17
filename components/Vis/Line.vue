<template>
  <div class="vis line-vis">
    <button
      v-if="showZoomOut"
      class="button is-rounded is-small reset-btn"
      @click="handleReset"
    >
      Zoom Out
    </button>
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="line-chart">
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
          v-show="hasYGuides"
          class="y-axis-guide-group" />
        <g
          v-if="showXAxis"
          :transform="xAxisTransform" 
          :class="xAxisClass" />

        <g
          v-show="showYAxis"
          :class="yAxisClass" />

        <!-- x axis layer to allow zoom in (brush) -->
        <g 
          v-if="showXAxis"
          :transform="xAxisBrushTransform" 
          class="x-axis-brush-group" />
      </g>

      <g 
        :transform="gTransform">
        <!-- where the area path will show -->
        <g class="area-group" />

        <!-- where the line path will show -->
        <g class="line-group" />

        <!-- cursor line and tooltip -->
        <g
          v-show="hoverOn"
          class="cursor-group">
          <g :class="cursorLineGroupClass" />
        </g> 

        <!-- hover layer to read interaction movements -->
        <g :class="hoverLayerClass">
          <rect
            :width="width"
            :height="height"/>
        </g>
      </g>

      <!-- add another yAxis tick text here so it show above the vis -->
      <g
        v-show="showYAxis"
        :transform="gTransform"
        class="axis-text-group">
        <g :class="yAxisTickClass" />
      </g>   
    </svg>
  </div>
</template>

<script>
import { scaleOrdinal, scaleLinear, scaleTime, scaleLog } from 'd3-scale'
import { axisBottom, axisRight } from 'd3-axis'
import {
  area as d3Area,
  line,
  curveStep,
  curveLinear,
  curveMonotoneX
} from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format as d3Format } from 'd3-format'
import { select, selectAll, mouse as d3Mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import debounce from 'lodash.debounce'

import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './shared/config.js'
import axisTimeFormat from './shared/timeFormat.js'
import axisSecondaryTimeFormat from './shared/secondaryTimeFormat.js'
import axisTimeTicks from './shared/timeTicks.js'
import DateDisplay from '~/services/DateDisplay.js'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    domainId: {
      type: String,
      default: () => ''
    },
    minDomainId: {
      type: String,
      default: () => ''
    },
    maxDomainId: {
      type: String,
      default: () => ''
    },
    valueDomainId: {
      type: String,
      default: () => ''
    },
    domainColour: {
      type: String,
      default: () => '#999'
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
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
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
    },
    // OPTIONAL: whether it is a log yAxis
    yAxisLog: {
      type: Boolean,
      default: () => false
    },
    // OPTIONAL: whether to flp the log chart
    yAxisInvert: {
      type: Boolean,
      default: () => false
    },
    // OPTIONAL: specify minimum yaxis value
    yMin: {
      type: Number,
      default: () => null
    },
    // OPTIONAL: specify maximum yaxis value
    yMax: {
      type: Number,
      default: () => null
    },
    // OPTIONAL: whether to show xAxis
    showXAxis: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show zoom out button
    showZoomOut: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show y axis
    showYAxis: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show value tooltip
    showTooltip: {
      type: Boolean,
      default: () => true
    },
    yGuides: {
      type: Array,
      default: () => []
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
      yRange: null,
      xAxis: null,
      yAxis: null,
      line: null,
      area: null,
      colours: schemeCategory10,
      brushX: null,
      zoomed: false,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      $yAxisGuideGroup: null,
      $hoverLayer: null,
      $cursorLineGroup: null,
      $tooltipGroup: null,
      $lineGroup: null,
      $areaGroup: null,
      linePathClass: 'line-path',
      lineGroupClass: 'line-group',
      areaPathClass: 'area-path',
      areaGroupClass: 'area-group',
      yAxisGuideGroupClass: 'y-axis-guide-group',
      xAxisClass: CONFIG.X_AXIS_CLASS,
      xAxisBrushGroupClass: CONFIG.X_AXIS_BRUSH_GROUP_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      // Tooltip CSS classes
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS,
      cursorLineClass: CONFIG.CURSOR_LINE_CLASS,
      cursorLineTextClass: CONFIG.CURSOR_LINE_TEXT_CLASS,
      cursorLineRectClass: CONFIG.CURSOR_LINE_RECT_CLASS,
      tooltipRectHeight: 20,
      tooltipGroupClass: CONFIG.TOOLTIP_GROUP_CLASS,
      tooltipRectClass: CONFIG.TOOLTIP_RECT_CLASS,
      tooltipTextClass: CONFIG.TOOLTIP_TEXT_CLASS
    }
  },

  computed: {
    datasetDateExtent() {
      return extent(this.dataset, d => new Date(d.date))
    },
    hasMinMax() {
      return this.minDomainId !== '' && this.maxDomainId !== ''
    },
    hasYGuides() {
      return this.yGuides.length > 0
    },
    id() {
      return `line-${this._uid}`
    },
    clipPathUrl() {
      return `url(#${this.id}-clip)`
    },
    gTransform() {
      return `translate(${this.margin.left},0)`
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
          return curveMonotoneX
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
      const height = this.showXAxis
        ? this.svgHeight - this.margin.top - this.margin.bottom
        : this.svgHeight
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = height
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = select(`#${this.id}`)

      // Axis
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)
      this.$yAxisTickGroup = $svg.select(`.${this.yAxisTickClass}`)
      this.$yAxisGuideGroup = $svg.select(`.${this.yAxisGuideGroupClass}`)

      // Brush
      this.$xAxisBrushGroup = $svg.select(`.${this.xAxisBrushGroupClass}`)

      // Tooltip and hover listener
      this.$hoverLayer = $svg.select(`.${this.hoverLayerClass}`)
      this.$cursorLineGroup = $svg.select(`.${this.cursorLineGroupClass}`)

      // Define x, y, z scale types
      this.yRange = this.yAxisInvert ? [0, this.height] : [this.height, 0]
      this.x = scaleTime().range([0, this.width]) // Date axis
      this.y = this.yAxisLog // Value axis
        ? scaleLog().range(this.yRange)
        : scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal() // Colour

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat(d => axisTimeFormat(d))
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        .ticks(5)
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

      // Create hover line and date
      this.$cursorLineGroup.append('path').attr('class', this.cursorLineClass)
      this.$cursorLineGroup
        .append('rect')
        .attr('class', this.cursorLineRectClass)
      this.$cursorLineGroup
        .append('text')
        .attr('class', this.cursorLineTextClass)

      // Create tooltip group
      this.$tooltipGroup = this.$cursorLineGroup
        .append('g')
        .attr('class', this.tooltipGroupClass)
      // Create tooltip rect
      this.$tooltipGroup
        .append('rect')
        .attr('class', this.tooltipRectClass)
        .attr('height', this.tooltipRectHeight)
        .attr('opacity', 0)
      // Create tooltip text
      this.$tooltipGroup
        .append('text')
        .attr('class', this.tooltipTextClass)
        .attr('text-anchor', 'middle')

      // How to draw the line
      this.line = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d[this.domainId]))
        .curve(this.curveType)

      // How to draw the area path
      this.area = d3Area()
        .x(d => this.x(d.date))
        .y0(d => this.y(d[this.minDomainId]))
        .y1(d => this.y(d[this.maxDomainId]))
        .curve(this.curveType)

      // Event handling
      // - Control tooltip visibility for mouse entering/leaving svg
      $svg.on('mouseenter', () => {
        // this.$cursorLineGroup.attr('opacity', 1)
        EventBus.$emit('vis.mouseenter')
      })
      $svg.on('mouseleave', () => {
        // this.$cursorLineGroup.attr('opacity', 0)
        EventBus.$emit('vis.mouseleave')
      })

      // - find date when on the hoverLayer or brushLayer or when brushing
      this.$hoverLayer.on('touchmove mousemove', function() {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
      this.brushX.on('brush', function() {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
      this.$xAxisBrushGroup
        .selectAll('.brush')
        .on('touchmove mousemove', function() {
          self.$emit('eventChange', this)
          self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
        })
    },

    update() {
      const self = this
      this.$lineGroup = select(`#${this.id} .${this.lineGroupClass}`)
      this.$areaGroup = select(`#${this.id} .${this.areaGroupClass}`)

      // Setup the x/y/z Axis domains
      // - Use dataset date range if there is none being passed into
      const xDomainExtent = this.dynamicExtent.length
        ? this.dynamicExtent
        : this.datasetDateExtent
      const minDomain = this.hasMinMax ? this.minDomainId : this.domainId
      const maxDomain = this.hasMinMax ? this.maxDomainId : this.domainId
      const yMin =
        this.yMin || this.yMin === 0
          ? this.yMin
          : min(this.dataset, d => d[minDomain])
      const yMax = this.yMax || max(this.dataset, d => d[maxDomain]) + 5

      this.x.domain(xDomainExtent)
      this.y.domain([yMin, yMax])
      this.z.range([this.domainColour]).domain([this.domainId])

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)
      this.$yAxisGuideGroup.call(this.guideYAxis)

      // Remove existing Line and Area
      this.$lineGroup.selectAll('path').remove()
      this.$areaGroup.selectAll('path').remove()

      this.$lineGroup
        .append('path')
        .datum(this.dataset)
        .attr('class', `${this.linePathClass}`)
        .attr('d', this.line)
        .style('stroke', d => this.z(this.domainId))
        .style('clip-path', this.clipPathUrl)
        .style('-webkit-clip-path', this.clipPathUrl)

      // Generate area
      if (this.hasMinMax) {
        this.$areaGroup
          .append('path')
          .datum(this.dataset)
          .attr('class', `${this.areaPathClass}`)
          .attr('d', this.area)
          .style('fill', 'red')
          .style('fill-opacity', 0.1)
          .style('clip-path', this.clipPathUrl)
          .style('-webkit-clip-path', this.clipPathUrl)
      }

      // Event handling
      // - find date and domain
      this.$lineGroup.selectAll('path').on('touchmove mousemove', function() {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
    },

    updateCursorLineTooltip(date) {
      const xDate = this.x(date)
      const fTime = DateDisplay.specialDateFormats(
        new Date(date).getTime(),
        this.range,
        this.interval,
        false,
        false,
        false,
        true
      )

      const valueFormat = d3Format(',.1f')
      const time = new Date(date).getTime()
      const find = this.dataset.find(d => d.date === time)
      let value = 0
      let minValue = null
      let maxValue = null

      if (find) {
        const dId = this.valueDomainId || this.domainId
        value = valueFormat(find[dId])
        minValue = this.minDomainId ? valueFormat(find[this.minDomainId]) : null
        maxValue = this.maxDomainId ? valueFormat(find[this.maxDomainId]) : null
      }

      if (this.showTooltip) {
        this.positionTooltip(xDate, fTime)
      }

      const $cursorLine = this.$cursorLineGroup.select(
        `.${this.cursorLineClass}`
      )
      // Position and draw the line
      $cursorLine.attr('d', () => {
        let d = 'M' + xDate + ',' + this.height
        d += ' ' + xDate + ',' + 0
        return d
      })
    },

    positionTooltip(xDate, time) {
      const rectWidth = time.length * 5 + 15
      const $tooltipRect = this.$tooltipGroup.select(
        `.${this.tooltipRectClass}`
      )
      const $tooltipText = this.$tooltipGroup.select(
        `.${this.tooltipTextClass}`
      )

      $tooltipRect
        .attr('x', xDate - rectWidth / 2)
        .attr('y', this.height - this.tooltipRectHeight)
        .attr('width', rectWidth)
        .attr('opacity', 1)
      $tooltipText
        .attr('x', xDate)
        .attr('y', this.height - this.tooltipRectHeight + 14)
        .text(time)

      // Tooltips to stick to left or right corners when close to the edge
      // - check for value tooltip
      if (this.mouseLoc) {
        const xMouse = this.mouseLoc[0]
        const yMouse = this.mouseLoc[1]
        const leftCutoff = rectWidth / 2
        const rightCutoff = this.width - rectWidth / 2

        if (xMouse >= rightCutoff) {
          $tooltipRect.attr('x', rightCutoff - rectWidth / 2)
          $tooltipText.attr('x', rightCutoff)
          $tooltipText.select('tspan').attr('x', rightCutoff)
        } else if (xMouse <= leftCutoff) {
          $tooltipRect.attr('x', 0)
          $tooltipText.attr('x', rectWidth / 2)
          $tooltipText.select('tspan').attr('x', rectWidth / 2)
        }
      }
    },

    // positionTooltip(xDate, value, minValue, maxValue) {
    //   let text = `${value}`
    //   if (minValue && maxValue) {
    //     text = `min: ${minValue} | av: ${value} | max: ${maxValue}`
    //   }
    //   const rectWidth = text.length * 6 + 15
    //   const $tooltipRect = this.$tooltipGroup.select(
    //     `.${this.tooltipRectClass}`
    //   )
    //   const $tooltipText = this.$tooltipGroup.select(
    //     `.${this.tooltipTextClass}`
    //   )

    //   $tooltipRect
    //     .attr('x', xDate - rectWidth / 2)
    //     .attr('y', 0)
    //     .attr('width', rectWidth)
    //     .attr('opacity', 1)
    //   $tooltipText
    //     .attr('x', xDate)
    //     .attr('y', 15)
    //     .text(text)

    //   // Tooltips to stick to left or right corners when close to the edge
    //   // - check for value tooltip
    //   if (this.mouseLoc) {
    //     const xMouse = this.mouseLoc[0]
    //     const yMouse = this.mouseLoc[1]
    //     const leftCutoff = rectWidth / 2
    //     const rightCutoff = this.width - rectWidth / 2

    //     if (xMouse >= rightCutoff) {
    //       $tooltipRect.attr('x', rightCutoff - rectWidth / 2)
    //       $tooltipText.attr('x', rightCutoff)
    //       $tooltipText.select('tspan').attr('x', rightCutoff)
    //     } else if (xMouse <= leftCutoff) {
    //       $tooltipRect.attr('x', 0)
    //       $tooltipText.attr('x', rectWidth / 2)
    //       $tooltipText.select('tspan').attr('x', rectWidth / 2)
    //     }
    //   }
    // },

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
      this.y.range(this.yRange)

      this.xAxis.tickSize(-this.height)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)
      this.$yAxisGuideGroup.call(this.guideYAxis)

      this.brushX.extent([[0, 0], [this.width, 40]])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brushX)
      this.$lineGroup.selectAll('path').attr('d', this.line)
      this.$areaGroup.selectAll('path').attr('d', this.area)
    },

    zoomRedraw() {
      // Animate to the selected area by updating the x axis and line path
      const transition = 100
      this.$xAxisGroup.call(this.customXAxis)
      this.$lineGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.line)
      this.$areaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)
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

    guideYAxis(g) {
      const yAxis = axisRight(this.y)
        .tickSize(this.width)
        .tickValues(this.yGuides)
        .tickFormat(d => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      g.call(yAxis)

      g.selectAll('.tick line')
        .style('stroke-dasharray', '4.8')
        .style('stroke', 'rgba(0, 0, 0, 0.1)')
      g.selectAll('.tick text')
        .attr('x', 4)
        .attr('dy', -4)
        .style('color', '#444')
    },

    getXAxisDateByMouse(evt) {
      const m = d3Mouse(evt)
      const date = this.x.invert(m[0])
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
.line-vis {
  position: relative;
}
.reset-btn {
  position: absolute;
  right: 1rem;
  top: 2.5rem;
}
</style>
