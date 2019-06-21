<template>
  <div class="summary-table">
    <header>
      <span v-if="!hoverOn">
        <time :datetime="startDateTime">
          {{ startDate | formatDate }}
        </time>
        –
        <time :datetime="endDateTime">
          {{ endDate | formatDate }}
        </time>
      </span>
      
      <time
        v-if="hoverOn" 
        :datetime="hoveredDateTime">
        {{ hoveredDate | formatDate }}
      </time>
    </header>

    <div class="summary-column-headers">
      <div class="summary-row">
        <div
          class="summary-col-label"
          style="padding-top: 3px;">
          <group-selector />
        </div>
        <div
          v-if="!hoverOn || isEnergy"
          class="summary-col-energy">
          Energy <small>GWh</small>
        </div>
        <div
          v-if="hoverOn && !isEnergy"
          class="summary-col-energy">
          Power <small>MW</small>
        </div>
        <div class="summary-col-contribution">Contribution <small>to demand</small></div>
      </div>
      <div class="summary-row">
        <div class="summary-col-label">Sources</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summarySources._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummarySources._total | formatValue }}
        </div>
      </div>
    </div>

    <items
      :group="'ft-sources'"
      :original-order="sourcesOrder"
      :show-point-summary="hoverOn"
      :point-summary="pointSummarySources"
      :point-summary-total="pointSummary._total"
      :summary="summarySources"
      :summary-total="summary._totalEnergy"
      :show-percent-column="true"
      @update="handleSourcesOrderUpdate"
    />
    
    <div class="summary-column-headers">
      <div class="summary-row">
        <div class="summary-col-label">Loads</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summaryLoads._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummaryLoads._total | formatValue }}
        </div>
      </div>
    </div>

    <items
      :group="'ft-loads'"
      :original-order="loadsOrder"
      :show-point-summary="hoverOn"
      :point-summary="pointSummaryLoads"
      :point-summary-total="pointSummary._total"
      :summary="summaryLoads"
      :summary-total="summary._totalEnergy"
      :show-percent-column="true"
      @update="handleLoadsOrderUpdate"
    />

    <div class="summary-column-headers">
      <div class="summary-row last-row">
        <div class="summary-col-label">Net</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summary._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummary._total | formatValue }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import _isEmpty from 'lodash.isempty'
import GroupSelector from '~/components/energy/FuelTechGroupSelector'
import Items from './Items'

export default {
  components: {
    GroupSelector,
    Items
  },

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
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: Date,
      default: () => null
    },
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    temperatureId: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    isEnergy: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      summary: {},
      summarySources: {},
      summaryLoads: {},
      pointSummary: {},
      pointSummarySources: {},
      pointSummaryLoads: {},
      hiddenFuelTechs: [],
      hoveredTemperature: 0
    }
  },

  computed: {
    sourcesOrder() {
      return this.domains.filter(d => d.category === 'source')
    },

    loadsOrder() {
      return this.domains.filter(d => d.category === 'load')
    },

    totalGeneration() {
      const reducer = (accumulator, currentValue) =>
        accumulator + currentValue._total
      return this.dataset.reduce(reducer, 0)
    },

    totalEnergy() {
      return this.summary._totalEnergy
    },

    intervalMins() {
      const interval = this.interval
      if (interval === '30m') {
        return 30
      } else if (interval === 'Day') {
        return 60 * 24
      }
      // default 5 mins
      return 5
    },

    hoveredDate() {
      const item = this.pointSummary
      return item ? item.date : null
    },

    hoveredDateTime() {
      const item = this.pointSummary
      const date = item ? item.date : null
      return date ? new Date(date).toISOString() : ''
    },

    startDate() {
      const dataLength = this.dataset.length
      const startDate = dataLength > 0 ? this.dataset[0].date : null
      return startDate
    },

    startDateTime() {
      const dataLength = this.dataset.length
      const startDate = dataLength > 0 ? this.dataset[0].date : null
      return startDate ? new Date(startDate).toISOString() : ''
    },

    endDate() {
      const dataLength = this.dataset.length
      const endDate = dataLength > 0 ? this.dataset[dataLength - 1].date : null
      return endDate
    },

    endDateTime() {
      const dataLength = this.dataset.length
      const endDate = dataLength > 0 ? this.dataset[dataLength - 1].date : null
      return endDate ? new Date(endDate).toISOString() : ''
    }
  },

  watch: {
    dataset(updated) {
      this.calculateSummary(updated)
    },
    domains(updated) {
      this.calculateSummary(this.dataset)
    },
    hoverDate(date) {
      this.updatePointSummary(date)
    }
  },

  mounted() {
    this.calculateSummary(this.dataset)
  },

  methods: {
    calculateSummary(data) {
      let total = 0
      let totalSources = 0
      let totalLoads = 0
      this.summary = {}
      this.summarySources = {}
      this.summaryLoads = {}

      this.domains.forEach(ft => {
        const category = ft.category
        const dataEnergy = data.map(d => {
          const energy = {}

          if (this.isEnergy) {
            energy[ft.id] = d[ft.id]
          } else {
            // calculate energy (GWh) += power * 5mins/60/100
            const mins = this.interval === '30m' ? 30 : 5
            energy[ft.id] = (d[ft.id] * mins) / 60 / 1000
          }

          return energy
        })
        const dataEnergySum = dataEnergy.reduce(
          (prev, cur) => prev + cur[ft.id],
          0
        )
        this.summary[ft.id] = dataEnergySum
        total += dataEnergySum

        if (category === 'source') {
          this.summarySources[ft.id] = dataEnergySum
          totalSources += dataEnergySum
        } else if (category === 'load') {
          this.summaryLoads[ft.id] = dataEnergySum
          totalLoads += dataEnergySum
        }
      })

      this.summary._totalEnergy = total
      this.summarySources._totalEnergy = totalSources
      this.summaryLoads._totalEnergy = totalLoads
    },

    calculatePointSummary(data) {
      let totalSources = 0
      let totalLoads = 0
      this.pointSummary = data || {} // pointSummary._total is already calculated
      this.pointSummarySources = {}
      this.pointSummaryLoads = {}

      if (!_isEmpty(this.pointSummary)) {
        this.domains.forEach(ft => {
          const category = ft.category
          const value = this.pointSummary[ft.id]

          if (category === 'source') {
            this.pointSummarySources[ft.id] = value
            totalSources += value
          } else if (category === 'load') {
            this.pointSummaryLoads[ft.id] = value
            totalLoads += value
          }
        })
      }
      this.pointSummarySources._total = totalSources
      this.pointSummaryLoads._total = totalLoads
    },

    updatePointSummary(date) {
      const dataFound = this.dataset.find(d => {
        const fDate = moment(d.date)
        const rDate = moment(date)
        if (this.interval === 'Day') {
          fDate.hour(0)
          fDate.minute(0)
          fDate.second(0)

          return fDate.valueOf() === rDate.valueOf()
        } else {
          return d.date === rDate.valueOf()
        }
      })

      this.hoveredTemperature =
        dataFound && dataFound[this.temperatureId]
          ? dataFound[this.temperatureId]
          : ''
      this.calculatePointSummary(dataFound)
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
@import '~/assets/scss/variables.scss';

.summary-table {
  margin-right: $app-padding;
  font-size: 13px;
  color: #333;

  header {
    text-align: right;
    font-size: 16px;
    font-weight: 300;
    color: #000;
    padding-bottom: $app-padding / 5;
    border-bottom: 1px solid #000;
  }

  .cell-value {
    font-family: $family-primary;
  }
}

::v-deep .summary-column-headers {
  .summary-row {
    font-family: $header-font-family;
    font-weight: 700;
  }
}

::v-deep .summary-row {
  display: flex;
  font-size: 1em;
  padding: 3px 4px;
  border-bottom: 1px solid #ddd;

  &.last-row {
    border-bottom-color: #000;
  }

  .summary-col-label {
    width: 50%;
  }
  .summary-col-energy,
  .summary-col-contribution {
    width: 25%;
    text-align: right;
  }

  small {
    display: block;
    color: #999;
  }
}
</style>
