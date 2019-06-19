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
          v-if="ready"
          :domains="energyDomains"
          :dataset="dataset"
          :dynamic-extent="dateFilter"
          :hover-date="hoverDate"
          :mouse-loc="mouseLoc"
          :step="step"
          :vis-height="400"
          @eventChange="handleEventChange"
          @dateOver="handleDateOver"
        />
        <line-vis
          v-if="ready && hasPriceData"
          :domains="priceDomains"
          :domain-id="'price.above300'"
          :domain-colour="'blue'"
          :dataset="dataset"
          :dynamic-extent="dateFilter"
          :hover-date="hoverDate"
          :step="true"
          :y-axis-log="true"
          :y-min="300"
          :y-max="20000"
          :show-x-axis="false"
          :vis-height="50"
          @eventChange="handleEventChange"
          @dateOver="handleDateOver"
        />
        <line-vis
          v-if="ready && hasPriceData"
          :domains="priceDomains"
          :domain-id="priceDomains[0].id"
          :domain-colour="priceDomains[0].colour"
          :dataset="dataset"
          :dynamic-extent="dateFilter"
          :hover-date="hoverDate"
          :step="true"
          :y-axis-log="false"
          :y-min="0"
          :y-max="300"
          :show-x-axis="false"
          :vis-height="150"
          class="price-vis"
          @eventChange="handleEventChange"
          @dateOver="handleDateOver"
        />
        <line-vis
          v-if="ready && hasPriceData"
          :domains="priceDomains"
          :domain-id="'price.below0'"
          :domain-colour="'blue'"
          :dataset="dataset"
          :dynamic-extent="dateFilter"
          :hover-date="hoverDate"
          :step="true"
          :y-axis-log="true"
          :y-axis-invert="true"
          :y-min="-0.1"
          :y-max="-1000"
          :show-x-axis="false"
          :vis-height="50"
          class="price-neg-vis"
          @eventChange="handleEventChange"
          @dateOver="handleDateOver"
        />
        <line-vis
          v-if="ready && hasTemperatureData"
          :domains="temperatureDomains"
          :domain-id="temperatureMeanId"
          :min-domain-id="temperatureMinId"
          :max-domain-id="temperatureMaxId"
          :domain-colour="temperatureDomains[0].colour"
          :dataset="dataset"
          :dynamic-extent="dateFilter"
          :hover-date="hoverDate"
          :step="false"
          :y-axis-log="false"
          :vis-height="200"
          @eventChange="handleEventChange"
          @dateOver="handleDateOver"
        />
      </div>
      <div class="table-container">
        <summary-table
          v-if="ready"
          :domains="energyDomains"
          :dataset="filteredDataset"
          :hover-date="hoverDate"
          :hover-on="hoverOn"
          :interval="interval"
          :is-energy="step"
        />
      </div>
    </div>
  </section>
</template>

<script>
import {
  timeMinute as d3TimeMinute,
  timeDay as d3TimeDay,
  timeMonday as d3TimeMonday,
  timeMonth as d3TimeMonth,
  timeYear as d3TimeYear
} from 'd3-time'
import { mouse as d3Mouse } from 'd3-selection'
import { extent as d3Extent } from 'd3-array'
import _uniqBy from 'lodash.uniqby'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'

import * as FUEL_TECHS from '~/constants/fuelTech.js'
import EventBus from '~/plugins/eventBus.js'
import http from '~/services/HttpService.js'
import DataTransformService from '~/services/DataTransformService.js'

import DataOptionsBar from '~/components/energy/DataOptionsBar'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'
import SummaryTable from '~/components/SummaryTable'

export default {
  layout: 'main',

  components: {
    DataOptionsBar,
    StackedAreaVis,
    LineVis,
    SummaryTable
  },

  data() {
    return {
      mounted: false,
      ready: false,
      type: 'power', // power, energy
      range: '7D',
      interval: '30m',
      dataset: [],
      energyDomains: [],
      domainIds: [],
      temperatureDomains: [],
      temperatureMeanId: '',
      temperatureMinId: '',
      temperatureMaxId: '',
      priceDomains: [],
      responses: [],
      dateFilter: [],
      hoverDate: null,
      mouseLoc: null,
      filteredDataset: [],
      visHeight: 0,
      hoverOn: false
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    hasTemperatureData() {
      return this.temperatureDomains.length > 0
    },
    hasPriceData() {
      return this.priceDomains.length > 0
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
    EventBus.$on('dataset.filter', this.handleDatasetFilter)
    EventBus.$on('vis.mousemove', this.handleVisMouseMove)
    EventBus.$on('vis.mouseenter', this.handleVisEnter)
    EventBus.$on('vis.mouseleave', this.handleVisLeave)

    this.visHeight = window.innerWidth > 768 ? 578 : 350
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.visHeight = window.innerWidth > 768 ? 578 : 350
      })
    })

    this.fetchData(this.regionId, this.range)
    this.mounted = true
  },

  beforeDestroy() {
    EventBus.$off('dataset.filter')
    EventBus.$off('vis.mousemove')
    EventBus.$off('vis.mouseenter')
    EventBus.$off('vis.mouseleave')
  },

  methods: {
    fetchData(region, range) {
      const urls = []
      switch (range) {
        case '1D':
        case '3D':
        case '7D':
          this.type = 'power'
          // https://data.opennem.org.au/power/history/5minute/sa1_2019W23.json
          // urls.push(`/power/${region}.json`)
          urls.push(`/power/history/5minute/${region}_2019W23.json`)
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
          if (thisFullYear !== lastFullYear) {
            urls.push(`/testing/${region}/energy/daily/${lastFullYear}.json`)
          }
          urls.push(`/testing/${region}/energy/daily/${thisFullYear}.json`)
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
      this.mergeResponses(
        responses,
        this.energyDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.range,
        this.interval
      ).then(dataset => {
        this.dataset = dataset
        this.updatedFilteredDataset(dataset)
        this.dateFilter = d3Extent(this.dataset, d => d.date)
        this.ready = true
      })
    },

    mergeResponses(
      res,
      energyDomains,
      temperatureDomains,
      priceDomains,
      range,
      interval
    ) {
      return new Promise(resolve => {
        let data = []
        const promises = []

        // flatten data for vis and summary
        res.forEach(r => {
          promises.push(
            this.flatten(
              r.data,
              energyDomains,
              temperatureDomains,
              priceDomains,
              range,
              interval
            )
          )
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
          DataTransformService.rollUp(
            data,
            energyDomains,
            temperatureDomains,
            priceDomains,
            range,
            interval
          ).then(rolledUpData => {
            // Then calculate min and total for each point for the chart
            resolve(this.calculateMinTotal(rolledUpData, energyDomains))
          })
        })
      })
    },

    updateDomains(res) {
      // Find out about available domains first before flattening data
      this.updateEnergyDomains(res)
      this.updateTemperatureDomains(res)
      this.updatePriceDomains(res)
    },

    updateEnergyDomains(res) {
      let fuelTechEnergy = []
      res.forEach(r => {
        const energyObjs = r.data
          .filter(d => d.type === 'power' || d.type === 'energy')
          .map(d => {
            return { id: d.id, fuelTech: d.fuel_tech, type: d.type }
          })
        fuelTechEnergy = [...fuelTechEnergy, ...energyObjs]
      })
      this.getDomainIdsInOrder(fuelTechEnergy)
      this.energyDomains = this.getFuelTechObjs()
    },

    updateTemperatureDomains(res) {
      function isTemperatureType(type) {
        return (
          type === 'temperature' ||
          type === 'temperature_min' ||
          type === 'temperature_mean' ||
          type === 'temperature_max'
        )
      }

      function isTemperatureMeanType(type) {
        return type === 'temperature' || type === 'temperature_mean'
      }
      function isTemperatureMinType(type) {
        return type === 'temperature_min'
      }
      function isTemperatureMaxType(type) {
        return type === 'temperature_max'
      }

      // reset temperature Ids
      this.temperatureMeanId = ''
      this.temperatureMinId = ''
      this.temperatureMaxId = ''

      let domains = []
      res.forEach(r => {
        const objs = r.data.filter(d => isTemperatureType(d.type)).map(d => {
          if (isTemperatureMeanType(d.type)) this.temperatureMeanId = d.id
          if (isTemperatureMinType(d.type)) this.temperatureMinId = d.id
          if (isTemperatureMaxType(d.type)) this.temperatureMaxId = d.id
          return { id: d.id, type: d.type, colour: 'red' }
        })
        domains = [...domains, ...objs]
      })

      this.temperatureDomains = domains
    },

    updatePriceDomains(res) {
      const PRICE_ABOVE_300 = 'price.above300'
      const PRICE_BELOW_0 = 'price.below0'
      const PRICE_COLOUR = 'blue'

      let domains = []
      res.forEach(r => {
        const objs = r.data
          .filter(d => d.type === 'price' || d.type === 'volume_weighted_price')
          .map(d => {
            return { id: d.id, type: d.type, colour: PRICE_COLOUR }
          })
        domains = [...domains, ...objs]
      })

      if (domains.length > 0) {
        domains.push({
          id: PRICE_ABOVE_300,
          type: 'price',
          colour: PRICE_COLOUR
        })
        domains.push({
          id: PRICE_BELOW_0,
          type: 'price',
          colour: PRICE_COLOUR
        })
      }
      this.priceDomains = domains
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter.length > 0) {
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
          this.dateFilter = []
          break
        case '3D':
        case '7D':
          this.interval = '30m'
          this.dateFilter = []
          break
        case '30D':
          this.interval = 'Day'
          this.dateFilter = []
          break
        case '1Y':
          this.interval = 'Week'
          this.dateFilter = []
          break
        case 'ALL':
          this.interval = 'Month'
          this.dateFilter = []
          break
        default:
          console.log('nothing yet')
      }

      this.fetchData(this.regionId, this.range)
    },

    handleIntervalChange(interval) {
      this.interval = interval
      this.mergeResponses(
        this.responses,
        this.energyDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.range,
        this.interval
      ).then(dataset => {
        this.dataset = dataset
        this.updatedFilteredDataset(dataset)
        this.ready = true
      })
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        const startTime = this.snapToClosestInterval(dateRange[0])
        const endTime = this.snapToClosestInterval(dateRange[1])
        this.filteredDataset = DataTransformService.filterDataByStartEndDates(
          this.dataset,
          startTime,
          endTime
        )
        this.dateFilter = [startTime, endTime]
      } else {
        this.filteredDataset = this.dataset
      }
    },

    handleEventChange(evt) {
      this.mouseLoc = d3Mouse(evt)
    },

    handleDateOver(evt, date) {
      EventBus.$emit(
        'vis.mousemove',
        evt,
        this.dataset,
        this.snapToClosestInterval(date)
      )
    },

    handleVisMouseMove(evt, dataset, date) {
      this.hoverDate = date
    },

    handleVisEnter() {
      this.hoverOn = true
    },

    handleVisLeave() {
      this.hoverOn = false
    },

    flatten(
      data,
      energyDomains,
      temperatureDomains,
      priceDomains,
      range,
      interval
    ) {
      return new Promise(resolve => {
        DataTransformService.flattenAndInterpolate(
          data,
          energyDomains,
          temperatureDomains,
          priceDomains
        ).then(res => {
          if (interval === '5m' || interval === '30m') {
            const start = res[0].date
            const now = new Date().getTime()
            resolve(res.filter(d => d.date >= start && d.date <= now))
          }
          if (range === '1Y') {
            const now = new Date().getTime()
            const aYearAgo = now - 31557600000
            resolve(res.filter(d => d.date >= aYearAgo && d.date <= now))
          }
          resolve(res)
        })
      })
    },

    calculateMinTotal(dataset, energyDomains) {
      // Calculate total, min, reverse value for imports and load types
      dataset.forEach((d, i) => {
        let total = 0
        let min = 0
        energyDomains.forEach(domain => {
          const id = domain.id

          if (domain.category === 'load' || domain.fuelTech === 'imports') {
            const negValue = -d[id]
            d[id] = negValue
          }
          total += d[id] || 0
          if (d[id] < 0) {
            min += d[id] || 0
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
      const region = this.regionId
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
    },

    snapToClosestInterval(date) {
      switch (this.interval) {
        case '5m':
          return d3TimeMinute.every(5).round(date)
        case '30m':
          return d3TimeMinute.every(30).round(date)
        case 'Day':
          return d3TimeDay.every(1).round(date)
        case 'Week':
          return d3TimeMonday.every(1).round(date)
        case 'Month':
          return d3TimeMonth.every(1).round(date)
        case 'Season':
          const quarter = d3TimeMonth.every(3).round(date)
          return d3TimeMonth.offset(quarter, -1)
        case 'Quarter':
          return d3TimeMonth.every(3).round(date)
        case 'Fin Year':
          const year = d3TimeYear.every(1).round(date)
          return d3TimeMonth.offset(year, -6)
        case 'Year':
          return d3TimeYear.every(1).round(date)
        default:
          return date
      }
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

.price-vis {
  position: relative;
  top: -7px;
}
.price-neg-vis {
  position: relative;
  top: -14px;
}
</style>
