<template>
  <section>
    <table class="table is-fullwidth">
      <caption>Records</caption>
      <thead>
        <tr>
          <th />
          <th class="has-text-right">Min.</th>
          <th class="has-text-right">Max.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Demand
            <small>MW</small>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(minDemandDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ minDemand | formatValue }}</div>
            <time datetime="minDemandDate">
              {{ minDemandDate | formatDate }}
            </time>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(maxDemandDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ maxDemand | formatValue }}</div>
            <time datetime="maxDemandDate">
              {{ maxDemandDate | formatDate }}
            </time>
          </td>
        </tr>

        <tr>
          <td>
            Demand Renewables
            <small>%</small>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(minDemandRenewablesDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ minDemandRenewables | formatValue }}</div>
            <time datetime="minDemandRenewablesDate">
              {{ minDemandRenewablesDate | formatDate }}
            </time>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(maxDemandRenewablesDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ maxDemandRenewables | formatValue }}</div>
            <time datetime="maxDemandRenewablesDate">
              {{ maxDemandRenewablesDate | formatDate }}
            </time>
          </td>
        </tr>

        <tr>
          <td>
            Generation
            <small>MW</small>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(minGenerationDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ minGeneration | formatValue }}</div>
            <time datetime="minGenerationDate">
              {{ minGenerationDate | formatDate }}
            </time>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(maxGenerationDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ maxGeneration | formatValue }}</div>
            <time datetime="maxGenerationDate">
              {{ maxGenerationDate | formatDate }}
            </time>
          </td>
        </tr>

        <tr>
          <td>
            Generation Renewables
            <small>%</small>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(minGenerationRenewablesDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ minGenerationRenewables | formatValue }}</div>
            <time datetime="minGenerationRenewablesDate">
              {{ minGenerationRenewablesDate | formatDate }}
            </time>
          </td>

          <td
            class="has-text-right"
            @mouseenter="handleMouseEnter(maxGenerationRenewablesDate)"
            @mouseleave="handleMouseLeave">
            <div>{{ maxGenerationRenewables | formatValue }}</div>
            <time datetime="maxGenerationRenewablesDate">
              {{ maxGenerationRenewablesDate | formatDate }}
            </time>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      minDemand: null,
      minDemandDate: null,
      maxDemand: null,
      maxDemandDate: null,
      minDemandRenewables: null,
      minDemandRenewablesDate: null,
      maxDemandRenewables: null,
      maxDemandRenewablesDate: null,

      minGeneration: null,
      minGenerationDate: null,
      maxGeneration: null,
      maxGenerationDate: null,
      minGenerationRenewables: null,
      minGenerationRenewablesDate: null,
      maxGenerationRenewables: null,
      maxGenerationRenewablesDate: null
    }
  },

  computed: {},

  watch: {
    dataset(d) {
      this.updateMinMax(d)
    }
  },

  mounted() {
    this.updateMinMax(this.dataset)
  },

  methods: {
    updateMinMax(dataset) {
      let minDemand = 0,
        minDemandDate = null,
        maxDemand = 0,
        maxDemandDate = null,
        minDemandRenewables = 0,
        minDemandRenewablesDate = null,
        maxDemandRenewables = 0,
        maxDemandRenewablesDate = null,
        minGeneration = 0,
        minGenerationDate = null,
        maxGeneration = 0,
        maxGenerationDate = null,
        minGenerationRenewables = 0,
        minGenerationRenewablesDate = null,
        maxGenerationRenewables = 0,
        maxGenerationRenewablesDate = null

      dataset.every(d => {
        if (d._total) {
          minDemand = d._total
          minDemandDate = d.date
          maxDemand = d._total
          maxDemandDate = d.date
          minDemandRenewables = d._totalDemandRenewables
          minDemandRenewablesDate = d.date
          maxDemandRenewables = d._totalDemandRenewables
          maxDemandRenewablesDate = d.date

          minGeneration = d._totalGeneration
          minGenerationDate = d.date
          maxGeneration = d._totalGeneration
          maxGenerationDate = d.date
          minGenerationRenewables = d._totalGenerationRenewables
          minGenerationRenewablesDate = d.date
          maxGenerationRenewables = d._totalGenerationRenewables
          maxGenerationRenewablesDate = d.date
          return false
        }
        return true
      })

      dataset.forEach(d => {
        if (d._total !== null && d._total < minDemand) {
          minDemand = d._total
          minDemandDate = d.date
        }
        if (d._total !== null && d._total > maxDemand) {
          maxDemand = d._total
          maxDemandDate = d.date
        }
        if (
          d._totalDemandRenewables !== null &&
          d._totalDemandRenewables < minDemandRenewables
        ) {
          minDemandRenewables = d._totalDemandRenewables
          minDemandRenewablesDate = d.date
        }
        if (
          d._totalDemandRenewables !== null &&
          d._totalDemandRenewables > maxDemandRenewables
        ) {
          maxDemandRenewables = d._totalDemandRenewables
          maxDemandRenewablesDate = d.date
        }

        if (d._totalGeneration !== null && d._totalGeneration < minGeneration) {
          minGeneration = d._totalGeneration
          minGenerationDate = d.date
        }
        if (d._totalGeneration !== null && d._totalGeneration > maxGeneration) {
          maxGeneration = d._totalGeneration
          maxGenerationDate = d.date
        }
        if (
          d._totalGenerationRenewables !== null &&
          d._totalGenerationRenewables < minGenerationRenewables
        ) {
          minGenerationRenewables = d._totalGenerationRenewables
          minGenerationRenewablesDate = d.date
        }
        if (
          d._totalGenerationRenewables !== null &&
          d._totalGenerationRenewables > maxGenerationRenewables
        ) {
          maxGenerationRenewables = d._totalGenerationRenewables
          maxGenerationRenewablesDate = d.date
        }
      })

      this.minDemand = minDemand
      this.minDemandDate = minDemandDate
      this.maxDemand = maxDemand
      this.maxDemandDate = maxDemandDate
      this.minDemandRenewables = minDemandRenewables
      this.minDemandRenewablesDate = minDemandRenewablesDate
      this.maxDemandRenewables = maxDemandRenewables
      this.maxDemandRenewablesDate = maxDemandRenewablesDate

      this.minGeneration = minGeneration
      this.minGenerationDate = minGenerationDate
      this.maxGeneration = maxGeneration
      this.maxGenerationDate = maxGenerationDate
      this.minGenerationRenewables = minGenerationRenewables
      this.minGenerationRenewablesDate = minGenerationRenewablesDate
      this.maxGenerationRenewables = maxGenerationRenewables
      this.maxGenerationRenewablesDate = maxGenerationRenewablesDate
    },

    handleMouseEnter(date) {
      this.$emit('recordMouseEnter', date)
    },

    handleMouseLeave() {
      this.$emit('recordMouseLeave')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
