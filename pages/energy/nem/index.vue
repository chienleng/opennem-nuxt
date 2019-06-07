<template>
  <section>
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <div class="vis-table-container">
      <div class="vis-container">
        <stacked-area-vis
          v-if="mounted"
          :domains="domains"
          :dataset="dataset"
          :interval="interval"
          :step="step"
          :vis-height="visHeight" />
      </div>
      <div class="table-container">
        <summary-table
          v-if="mounted"
          :domains="domains"
          :dataset="filteredDataset"
          :interval="interval"
          :is-energy="step"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { timeMinute as d3TimeMinute } from 'd3-time'
import _uniqBy from 'lodash.uniqby'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'

import * as FUEL_TECHS from '~/constants/fuelTech.js'
import EventBus from '~/plugins/eventBus.js'
import http from '~/services/HttpService.js'
import DataTransformService from '~/services/DataTransformService.js'

import DataOptionsBar from '~/components/energy/DataOptionsBar'
import StackedAreaVis from '~/components/Vis/StackedArea2.vue'
import SummaryTable from '~/components/SummaryTable'

export default {
  layout: 'main',

  components: {
    DataOptionsBar,
    StackedAreaVis,
    SummaryTable
  },

  data() {
    return {
      mounted: false,
      region: 'nem',
      type: 'power', // power, energy
      range: '7D',
      interval: '30m',
      dataset: [],
      domains: [],
      domainIds: [],
      responses: [],
      dateFilter: null,
      filteredDataset: [],
      visHeight: 0
    }
  },

  computed: {
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    step() {
      switch (this.range) {
        case '1D':
        case '3D':
        case '7D':
          return false
        default:
          return true
      }
    }
  },

  mounted() {
    this.visHeight = window.innerWidth > 768 ? 578 : 350
    EventBus.$on('dataset.filter', this.handleDatasetFilter)
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.visHeight = window.innerWidth > 768 ? 578 : 350
      })
    })

    this.fetchData(this.region, this.range)
    this.mounted = true
  },

  beforeDestroy() {
    EventBus.$off('dataset.filter')
  },

  methods: {
    fetchData(region, range) {
      const urls = []
      console.log(range)
      switch (range) {
        case '1D':
        case '3D':
        case '7D':
          this.type = 'power'
          urls.push(`/power/${region}.json`)
          break
        case '30D':
          this.type = 'energy'
          urls.push(`/energy/history/daily/${region}.json`)
          break
        case '1Y':
          this.type = 'energy'
          const now = new Date().getTime()
          const aYearAgo = now - 31557600000
          const thisFullYear = new Date().getFullYear()
          const lastFullYear = new Date(aYearAgo).getFullYear()
          urls.push(`/testing/${region}/energy/daily/${lastFullYear}.json`)
          urls.push(`/testing/${region}/energy/daily/${thisFullYear}.json`)
          // TODO: FILTER to a year
          break
        case 'ALL':
          this.type = 'energy'
          urls.push(`/testing/${region}/energy/monthly/all.json`)
          break
        default:
          this.type = 'energy'
      }

      if (urls.length > 0) {
        http(urls)
          .then(responses => {
            this.handleResponses(responses)
          })
          .catch(e => {
            console.error(e)
          })
      } else {
        console.warn('fetchData', 'No urls provided')
      }
    },

    handleResponses(responses) {
      this.responses = responses
      this.updateDomains(responses)
      this.updateDataset(responses, this.domains, this.range, this.interval)
    },

    updateDataset(res, domains, range, interval) {
      let data = []
      const promises = []

      // flatten data for vis and summary
      res.forEach(r => {
        promises.push(this.flatten(r.data, domains, range, interval))
      })

      // return flatten data and merge
      Promise.all(promises).then(values => {
        values.forEach(v => {
          data = [...data, ...v]
        })

        // If 1D or 3D, use 7D data and filter the data here, so the chart takes doesn't zoom
        if (range === '1D' || range === '3D') {
          const now = new Date().getTime()
          const roundedEndDate =
            interval === '5m'
              ? d3TimeMinute.every(5).round(now)
              : d3TimeMinute.every(30).round(now)
          const diff = range === '1D' ? 86400000 : 259200000
          data = DataTransformService.filterDataByStartEndDates(
            data,
            roundedEndDate - diff,
            roundedEndDate
          )
        }

        // Roll up based on interval
        DataTransformService.rollUp(data, domains, range, interval).then(
          rolledUpData => {
            // Then calculate min and total for each point for the chart
            this.dataset = this.calculateMinTotal(rolledUpData, domains)
            this.updatedFilteredDataset(this.dataset)
          }
        )
      })
    },

    updateDomains(res) {
      // Find out about available domains first before flattening data
      let fuelTechEnergy = []
      res.forEach(r => {
        const energyObjs = r.data
          .filter(d => d.type === 'power' || d.type === 'energy')
          .map(d => {
            return { id: d.id, fuelTech: d.fuel_tech }
          })
        fuelTechEnergy = [...fuelTechEnergy, ...energyObjs]
      })
      this.getDomainIdsInOrder(fuelTechEnergy)
      this.domains = this.getFuelTechObjs()
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter) {
        this.filteredDataset = DataTransformService.filterDataByStartEndDates(
          dataset,
          this.dateFilter[0],
          this.dateFilter[1]
        )
      } else {
        this.filteredDataset = dataset
      }
    },

    handleRangeChange(range) {
      this.range = range
      switch (this.range) {
        case '1D':
          this.interval = '5m'
          this.dateFilter = null
          break
        case '3D':
        case '7D':
          this.interval = '30m'
          this.dateFilter = null
          break
        case '30D':
          this.interval = 'Day'
          this.dateFilter = null
          break
        case '1Y':
          this.interval = 'Week'
          this.dateFilter = null
          break
        case 'ALL':
          this.interval = 'Month'
          this.dateFilter = null
          break
        default:
          console.log('nothing yet')
      }

      this.fetchData(this.region, this.range)
    },

    handleIntervalChange(interval) {
      this.interval = interval
      this.updateDataset(
        this.responses,
        this.domains,
        this.range,
        this.interval
      )
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        this.dateFilter = dateRange
        this.filteredDataset = DataTransformService.filterDataByStartEndDates(
          this.dataset,
          dateRange[0],
          dateRange[1]
        )
      } else {
        this.filteredDataset = this.dataset
      }
    },

    flatten(data, domains, range, interval) {
      return new Promise(resolve => {
        DataTransformService.flattenAndInterpolate(
          data,
          domains,
          range,
          interval
        ).then(res => {
          if (interval === '5m' || interval === '30m') {
            const start = res[0].date
            const now = new Date().getTime()
            resolve(res.filter(d => d.date >= start && d.date <= now))
          }
          resolve(res)
        })
      })
    },

    calculateMinTotal(dataset, domains) {
      // Calculate total, min, reverse value for imports and load types
      dataset.forEach((d, i) => {
        let total = 0
        let min = 0
        domains.forEach(domain => {
          const id = domain.id

          if (domain.category === 'load' || domain.fuelTech === 'imports') {
            const negValue = -d[id].value
            d[id].value = negValue
          }
          total += d[id].value || 0
          if (d[id].value < 0) {
            min += d[id].value || 0
          }
        })
        dataset[i]._total = total
        dataset[i]._min = min
      })
      return dataset
    },

    getFuelTechObjs() {
      // create ft Objects that has the right id and meta data
      const type = this.type
      const region = this.region
      const domainIds = this.domainIds
      // clone so the original doesn't get reverse.
      return _cloneDeep(domainIds)
        .reverse()
        .map(ft => {
          return {
            id: `${region}.fuel_tech.${ft}.${type}`,
            fuelTech: ft,
            label: FUEL_TECHS.FUEL_TECH_LABEL[ft],
            colour: FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[ft],
            category: FUEL_TECHS.FUEL_TECH_CATEGORY[ft],
            type
          }
        })
    },

    getDomainIdsInOrder(fuelTechEnergy) {
      // get the unique domains in the right order
      const order = this.fuelTechOrder
      const uniqDomains = _uniqBy(fuelTechEnergy, 'fuelTech').map(
        d => d.fuelTech
      )
      const domainIds = []
      order.forEach(o => {
        if (_includes(uniqDomains, o)) {
          domainIds.push(o)
        }
      })
      this.domainIds = domainIds
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.vis-table-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;

  .vis-container {
    width: 100%;

    @include tablet {
      width: 70%;
    }
  }
  .table-container {
    width: 100%;
    height: 700px;

    @include tablet {
      width: 30%;
    }
  }
}
</style>
