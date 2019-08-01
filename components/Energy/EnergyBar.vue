<template>
  <section>
    <div
      v-for="(domain, index) in xDomains"
      :key="index"
      class="row">
      <span class="row-label">
        {{ domain.label }}
      </span>

      <div class="row-bar-wrapper">
        <div
          :style="{
            'width': `${getWidth(domain.id)}px`,
            'background-color': domain.colour
          }"
          class="row-bar" />

        <div class="contribution">
          {{ getContribution(domain.id) | formatValue }}%
        </div>
      </div>
      
    </div>
  </section>
</template>

<script>
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'
import { scaleLinear as d3ScaleLinear } from 'd3-scale'
import { max as d3Max } from 'd3-array'
import _debounce from 'lodash.debounce'

export default {
  props: {
    barWidth: {
      type: Number,
      default: () => 200
    },
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Object,
      default: () => null
    }
  },

  data() {
    return {
      x: null,
      xDomains: []
    }
  },

  watch: {
    dataset(d) {
      this.x.domain([0, d._totalEnergy])
      this.xDomains = this.domains.slice(0)
    }
  },

  mounted() {
    // this.elWidth = this.$el.offsetWidth / 2
    this.x = d3ScaleLinear().range([0, this.barWidth])
    window.addEventListener('resize', _debounce(this.handleResize, 250))
  },

  methods: {
    handleResize() {
      // this.elWidth = this.$el.offsetWidth / 2
      // this.x.range([0, this.elWidth])
      // this.xDomains = this.domains.slice(0)
    },
    getWidth(id) {
      const value = this.dataset[id]
      return this.x(value)
    },
    getContribution(id) {
      const rowValue = this.dataset[id]
      const total = this.dataset._totalEnergy

      return (rowValue / total) * 100
    }
  }
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px 0;
  border-bottom: 1px solid #ddd;

  .row-label {
    font-size: 0.7em;
    font-weight: 600;
    text-align: right;
    width: 45%;
  }
  .row-bar-wrapper {
    width: 45%;
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }
  .contribution {
    // width: 10%;
    font-size: 0.7em;
    margin-left: 0.25rem;
  }
  .row-bar {
    width: 1px;
    height: 15px;
    background-color: red;
  }
}
</style>
