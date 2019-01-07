<template>
  <table>
    <caption>summary — {{ hoveredDate | formatDate }}</caption>
    <!-- <thead></thead> -->
    <tbody>
      <tr
        v-for="k in ids"
        :key="k">
        <td>{{ k }}</td>
        <td>{{ getValue(k) }}</td>
      </tr>
      <tr>
        <td>temperature</td>
        <td>{{ hoveredTemperature }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment'
import { timeMinute, timeDay } from 'd3-time'
import EventBus from '~/plugins/eventBus.js'

export default {
  props: {
    ids: {
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
    }
  },

  data() {
    return {
      hoveredObject: {},
      hoveredTemperature: 0
    }
  },

  computed: {
    hoveredDate() {
      const item = this.hoveredObject
      return item ? item.date : ''
    }
  },

  watch: {
    // TODO: remove this
    data(k) {
      // console.log(k)
    }
  },

  mounted() {
    EventBus.$on('vis.mousemove', this.handleVisCursor)
  },

  beforeDestroy() {
    EventBus.$off('vis.mousemove')
  },

  methods: {
    handleVisCursor(date) {
      // TODO: round to 5 min, 30 min, 1/7 day
      const round5Min = timeMinute.every(5).round(date)
      const round30Min = timeMinute.every(30).round(date)
      const find5Min = this.data.find(
        d => d.date === moment(round5Min).valueOf()
      )
      const find30Min = this.data.find(
        d => d.date === moment(round30Min).valueOf()
      )

      this.hoveredTemperature =
        find30Min && find30Min[this.temperatureId]
          ? find30Min[this.temperatureId].value
          : ''
      this.hoveredObject = find5Min || {}
    },

    getValue(key) {
      const item = this.hoveredObject[key]
      return item ? item.value : ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
