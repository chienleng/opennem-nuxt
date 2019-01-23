<template>
  <div>
    <header>
      <div>{{ dateRange }}</div>
      <div>{{ hoveredDate | formatDate }}</div>
    </header>

    <items
      :original-order="sourcesOrder"
      :group="'ft'"
      :point-summary="hoveredObject"
      :summary="summary"
      @update="handleSourcesOrderUpdate"
    />
    <hr>
    <items
      :original-order="loadsOrder"
      :group="'ft'"
      :point-summary="hoveredObject"
      :summary="summary"
      @update="handleLoadsOrderUpdate"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { timeMinute, timeDay } from 'd3-time'
import EventBus from '~/plugins/eventBus.js'
import Items from './Items.vue'

export default {
  components: {
    Items
  },

  props: {
    fuelTechs: {
      type: Array,
      default: () => []
    },
    temperatureId: {
      type: String,
      default: () => ''
    },
    data: {
      type: Array,
      default: () => []
    },
    period: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      summary: {},
      hiddenFuelTechs: [],
      hoveredObject: {},
      hoveredTemperature: 0
    }
  },

  computed: {
    sourcesOrder() {
      return this.fuelTechs.filter(d => d.category === 'source')
    },

    loadsOrder() {
      return this.fuelTechs.filter(d => d.category === 'load')
    },

    hoveredDate() {
      const item = this.hoveredObject
      return item ? item.date : ''
    },

    intervalMins() {
      const period = this.period
      if (period === '30min') {
        return 30
      } else if (period === 'Daily') {
        return 60 * 24
      }
      // default 5 mins
      return 5
    },

    dateRange() {
      const dataLength = this.data.length
      const formatDate = this.$options.filters.formatDate
      const startDate = dataLength > 0 ? formatDate(this.data[0].date) : ''
      const endDate =
        dataLength > 0 ? formatDate(this.data[dataLength - 1].date) : ''
      return `${startDate} - ${endDate}`
    }
  },

  watch: {
    data(updated) {
      this.calculateSummary(updated)
    }
  },

  mounted() {
    EventBus.$on('vis.mousemove', this.handleVisCursor)
  },

  beforeDestroy() {
    EventBus.$off('vis.mousemove')
  },

  methods: {
    calculateSummary(data) {
      this.summary = {}
      this.fuelTechs.forEach(ft => {
        const dataEnergy = data.map(d => {
          const energy = {}
          // calculate energy (GWh) += power * interval/60/100
          energy[ft.id] = (d[ft.id].value * this.intervalMins) / 60 / 1000
          return energy
        })
        this.summary[ft.id] = dataEnergy.reduce(
          (prev, cur) => prev + cur[ft.id],
          0
        )
      })
    },

    getEveryTime(date) {
      const period = this.period
      if (period === '30min') {
        return timeMinute.every(30).round(date)
      } else if (period === 'Daily') {
        return timeDay.every(1).round(date)
      }
      // default 5 mins
      return timeMinute.every(5).round(date)
    },

    handleVisCursor(date) {
      const rounded = this.getEveryTime(date)
      console.log(date, rounded)
      const find = this.data.find(d => {
        // console.log(
        //   this.period,
        //   moment(date).format('DD/MM/YYYY, h:mma'),
        //   moment(d.date).format('DD/MM/YYYY, h:mma'),
        //   moment(rounded).format('DD/MM/YYYY, h:mma')
        // )
        return d.date === moment(rounded).valueOf()
      })
      this.hoveredTemperature =
        find && find[this.temperatureId] ? find[this.temperatureId].value : ''
      this.hoveredObject = find || {}
    },

    handleSourcesOrderUpdate(newSourceOrder) {
      this.setFuelTechOrder(newSourceOrder, this.loadsOrder)
    },

    handleLoadsOrderUpdate(newLoadsOrder) {
      this.setFuelTechOrder(this.sourcesOrder, newLoadsOrder)
    },

    setFuelTechOrder(sources, loads) {
      const loadsOrder = loads.map(d => d.fuelTech)
      const sourcesOrder = sources.map(d => d.fuelTech)
      const order = [...sourcesOrder, ...loadsOrder]
      this.$store.dispatch('fuelTechOrder', order.reverse())
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
