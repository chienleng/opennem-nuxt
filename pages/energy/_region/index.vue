<template>
  <section style="margin-top: 0.5rem;">
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <div
      id="export-container"
      class="vis-table-container">
      <div class="vis-container">
        <!-- <draggable
          :group="'charts'"
          :direction="'horizontal'"
          :ghost-class="'sortable-ghost'"
          :drag-class="'sortable-drag'"
          :animation="150"
          handle=".handle"
          @start="drag=true"
          @end="drag=false">

          <div class="chart">
            <div class="handle">...</div>
            <vis-tooltip
              :left-position="tooltipLeft"
              :hover-value="hoverValue"
              :hover-total="hoverTotal"
              :hover-domain-colour="hoverDomainColour"
            />
            <stacked-area-vis
              v-if="ready"
              :domains="stackedAreaDomains"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :hover-date="hoverDate"
              :range="range"
              :interval="interval"
              :mouse-loc="mouseLoc"
              :curve="energyCurveType"
              :vis-height="stackedAreaHeight"
              @eventChange="handleEventChange"
              @dateOver="handleDateOver"
              @domainOver="handleDomainOver"
            />
          </div>
          
        </draggable> -->

        <div
          v-if="ready"
          :class="{ 'is-hovered': hoverOn }"
          class="chart">
          <div
            v-if="step"
            class="chart-title no-hover">
            <div>
              <strong>Energy</strong>
              <small>GWh/{{ interval }}</small>
            </div>
            <div class="hover-values">
              <span
                v-if="hoverValue"
                class="ft-value">
                <em
                  :style="{ 'background-color': hoverDomainColour }"
                  class="colour-square" />
                {{ hoverDomainLabel }}
                <strong>{{ hoverValue | formatValue }} GWh</strong>
              </span>
              <span class="total-value">
                Total
                <strong>{{ hoverTotal | formatValue }} GWh</strong>
              </span>
            </div>
          </div>
          <div
            v-else
            class="chart-title">
            <div>
              <strong>Generation</strong>
              <small>MW</small>
            </div>
            <div class="hover-values">
              <span
                v-if="hoverValue"
                class="ft-value">
                <em
                  :style="{ 'background-color': hoverDomainColour }"
                  class="colour-square" />
                {{ hoverDomainLabel }}
                <strong>{{ hoverValue | formatValue }} MW</strong>
              </span>
              <span class="total-value">
                Total
                <strong>{{ hoverTotal | formatValue }} MW</strong>
              </span>
            </div>
          </div>
          <stacked-area-vis
            :domains="stackedAreaDomains"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="energyCurveType"
            :y-min="energyMin"
            :y-max="energyMax"
            :vis-height="stackedAreaHeight"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @domainOver="handleDomainOver"
          />
        </div>

        <div
          v-if="ready && hasEmissionData"
          :class="{
            'is-hovered': hoverOn,
            'has-border-bottom': !chartEmissionsVolume
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartEmissionsVolume')">
            <div>
              <i
                :class="{
                  'fa-caret-down': chartEmissionsVolume,
                  'fa-caret-right': !chartEmissionsVolume
                }"
                class="fal fa-fw" />
              <strong>Emissions Volume</strong>
              <small>tCO2e</small>
            </div>
            <div
              v-show="chartEmissionsVolume"
              class="hover-values">
              <span>
                Total
                <strong>{{ hoverEmissionVolumeTotal | formatValue }} tCO2e</strong>
              </span>
            </div>
          </div>
          <stacked-area-vis
            v-if="chartEmissionsVolume"
            :domains="emissionStackedAreaDomains"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'step'"
            :vis-height="200"
            :show-x-axis="false"
            :show-tooltip="false"
            :show-zoom-out="false"
            :y-min="0"
            :y-max="emissionsMax"
            class="emissions-volume-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>

        <div
          v-if="ready && hasEmissionData"
          :class="{
            'is-hovered': hoverOn,
            'has-border-bottom': !chartEmissionsIntensity
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartEmissionsIntensity')">
            <div>
              <i
                :class="{
                  'fa-caret-down': chartEmissionsIntensity,
                  'fa-caret-right': !chartEmissionsIntensity
                }"
                class="fal fa-fw" />
              <strong>Emissions Intensity</strong>
            </div>
            <div
              v-show="chartEmissionsIntensity"
              class="hover-values">
              <span>
                <strong>{{ hoverEmissionsIntensity | formatValue }}</strong>
              </span>
            </div>
          </div>
          <line-vis
            v-if="chartEmissionsIntensity"
            :domain-id="'_emissionsIntensity'"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-x-axis="false"
            :show-tooltip="false"
            :vis-height="120"
            :y-min="emissionsIntensityMin"
            :curve="'smooth'"
            :show-zoom-out="false"
            class="emissions-intensity-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>

        <div
          v-if="ready && hasPriceData"
          :class="{
            'is-hovered': hoverOn,
            'has-border-bottom': !chartPrice
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartPrice')">
            <div>
              <i
                :class="{
                  'fa-caret-down': chartPrice,
                  'fa-caret-right': !chartPrice
                }"
                class="fal fa-fw" />
              <strong>Price</strong>
              <small>$/MWh</small>
            </div>
            <div
              v-show="chartPrice"
              class="hover-values">
              <span>
                <strong>{{ hoverPrice | formatCurrency }}</strong>
              </span>
            </div>
          </div>
          <line-vis
            v-if="chartPrice"
            :domain-id="'price.above300'"
            :domain-colour="lineColour"
            :value-domain-id="priceDomains[0].id"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-tooltip="false"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="true"
            :y-min="300"
            :y-max="20000"
            :show-x-axis="false"
            :vis-height="50"
            :show-zoom-out="false"
            :y-guides="[300, 2000, 6000, 10000, 14000]"
            class="price-pos-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
          <line-vis
            v-if="chartPrice"
            :domain-id="priceDomains[0].id"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-tooltip="false"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="false"
            :y-min="0"
            :y-max="300"
            :show-x-axis="false"
            :vis-height="80"
            :show-zoom-out="false"
            :y-guides="[0, 100, 200, 300]"
            class="price-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
          <line-vis
            v-if="chartPrice"
            :domain-id="'price.below0'"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="true"
            :y-axis-invert="true"
            :y-min="-0.1"
            :y-max="-1100"
            :show-x-axis="false"
            :show-tooltip="false"
            :vis-height="35"
            :show-zoom-out="false"
            :y-guides="[-60, -400]"
            class="price-neg-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>

        <div
          v-if="ready && hasTemperatureData"
          :class="{
            'is-hovered': hoverOn,
            'has-border-bottom': !chartTemperature
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartTemperature')">
            <div>
              <i
                :class="{
                  'fa-caret-down': chartTemperature,
                  'fa-caret-right': !chartTemperature
                }"
                class="fal fa-fw" />
              <strong>Temperature</strong>
              <small>°C</small>
            </div>
            <div
              v-show="chartTemperature"
              class="hover-values">
              <span
                v-if="hoverMinTemperature"
                class="min-temp-value">
                Min
                <strong>{{ hoverMinTemperature | formatValue }}°C</strong>
              </span>
              <span class="mean-temp-value">
                Av
                <strong>{{ hoverMeanTemperature | formatValue }}°C</strong>
              </span>
              <span
                v-if="hoverMaxTemperature"
                class="min-temp-value">
                Max
                <strong>{{ hoverMaxTemperature | formatValue }}°C</strong>
              </span>
            </div>
          </div>
          <line-vis
            v-if="chartTemperature"
            :domain-id="temperatureMeanId"
            :min-domain-id="temperatureMinId"
            :max-domain-id="temperatureMaxId"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'smooth'"
            :y-axis-log="false"
            :y-min="0"
            :show-x-axis="false"
            :show-tooltip="false"
            :vis-height="100"
            :show-zoom-out="false"
            class="temperature-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>
      </div>

      <div class="table-container">
        <summary-table
          v-if="ready"
          id="summary-table"
          :domains="summaryDomains"
          :price-id="priceDomains.length > 0 ? priceDomains[0].id : null"
          :market-value-domains="mvDomains"
          :dataset="filteredDataset"
          :hover-date="hoverDate"
          :hover-on="hoverOn"
          :range="range"
          :interval="interval"
          :is-energy="step"
          @fuelTechsHidden="handleFuelTechsHidden"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { mouse as d3Mouse } from 'd3-selection'
import { extent as d3Extent, max as d3Max } from 'd3-array'
import _debounce from 'lodash.debounce'
import _includes from 'lodash.includes'
import Draggable from 'vuedraggable'
import { saveAs } from 'file-saver'

import EventBus from '~/plugins/eventBus.js'
import Http from '~/services/Http.js'
import DateDisplay from '~/services/DateDisplay.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'

import DataOptionsBar from '~/components/ui/DataOptionsBar'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
// import StackedColumnVis from '~/components/Vis/StackedColumn.vue'
import LineVis from '~/components/Vis/Line.vue'
import SummaryTable from '~/components/SummaryTable'
import VisTooltip from '~/components/ui/Tooltip'

export default {
  layout: 'main',

  components: {
    Draggable,
    DataOptionsBar,
    StackedAreaVis,
    // StackedColumnVis,
    LineVis,
    SummaryTable,
    VisTooltip
  },

  data() {
    return {
      mounted: false,
      ready: false,
      dataset: [],
      energyDomains: [],
      fuelTechEnergyOrder: [],
      hiddenFuelTechs: [],
      emissionsOrder: [],
      marketValueDomains: [],
      temperatureDomains: [],
      temperatureMeanId: '',
      temperatureMinId: '',
      temperatureMaxId: '',
      priceDomains: [],
      emissionDomains: [],
      responses: [],
      dateFilter: [],
      hoverDate: null,
      hoverDomain: null,
      mouseLoc: null,
      tooltipLeft: 0,
      filteredDataset: [],
      visHeight: 0,
      hoverOn: false,
      lineColour: '#e34a33',
      windowWidth: 0,
      energyMin: 0,
      energyMax: 1000,
      emissionsIntensityMin: 0
    }
  },

  computed: {
    type() {
      return this.$store.getters.energyChartType
    },
    chartEmissionsVolume() {
      return this.$store.getters.chartEmissionsVolume
    },
    chartEmissionsIntensity() {
      return this.$store.getters.chartEmissionsIntensity
    },
    chartPrice() {
      return this.$store.getters.chartPrice
    },
    chartTemperature() {
      return this.$store.getters.chartTemperature
    },
    responsiveBreakWidth() {
      return this.$store.getters.responsiveBreakWidth
    },
    widthBreak() {
      return this.windowWidth < 1024
    },
    regionId() {
      return this.$route.params.region
    },
    range() {
      return this.$store.getters.range
    },
    interval() {
      return this.$store.getters.interval
    },
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    },
    groupDomains() {
      const dict = this.fuelTechGroup
      const domains = this.energyDomains
      return Domain.parseDomains(domains, dict, 'energy')
    },
    groupMarketValueDomains() {
      const dict = this.fuelTechGroup
      const domains = this.marketValueDomains
      return Domain.parseDomains(domains, dict, 'market_value')
    },

    groupEmissionDomains() {
      const dict = this.fuelTechGroup
      const domains = this.emissionDomains
      return Domain.parseDomains(domains, dict, 'emissions')
    },

    hasTemperatureData() {
      return this.temperatureDomains.length > 0
    },
    hasPriceData() {
      return this.priceDomains.length > 0
    },
    hasEmissionData() {
      return this.emissionDomains.length > 0
    },
    energyCurveType() {
      return this.$store.getters.energyCurveType
    },
    step() {
      return this.$store.getters.step
    },
    mvDomains() {
      return this.groupMarketValueDomains.length > 0
        ? this.groupMarketValueDomains
        : this.marketValueDomains
    },
    stackedAreaDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    summaryDomains() {
      return this.groupDomains.length > 0
        ? this.groupDomains
        : this.energyDomains
    },
    emissionStackedAreaDomains() {
      return this.groupEmissionDomains.length > 0
        ? this.groupEmissionDomains
        : this.emissionDomains
    },
    stackedAreaHeight() {
      let height = 330
      if (this.regionId === 'nem' && !this.widthBreak) {
        height = 528
      }
      return height
    },
    emissionsMax() {
      return d3Max(this.dataset, d => d._totalEmissionsVol)
    },
    hoverData() {
      const time = new Date(this.hoverDate).getTime()
      return this.dataset.find(d => d.date === time)
    },
    hoverDomainLabel() {
      const find = this.summaryDomains.find(d => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDomainColour() {
      const find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      if (find) return find.colour
      return null
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.stackedAreaDomains.forEach(d => {
          total += this.hoverData[d.id]
        })
      }
      return total
    },
    hoverEmissionVolumeTotal() {
      if (this.hoverData) return this.hoverData._totalEmissionsVol
      return 0
    },
    hoverEmissionsIntensity() {
      if (this.hoverData) return this.hoverData._emissionsIntensity
      return 0
    },
    hoverPrice() {
      if (this.hoverData && this.priceDomains.length > 0) {
        return this.hoverData[this.priceDomains[0].id]
      }
      return 0
    },
    hoverMeanTemperature() {
      if (this.hoverData && this.temperatureDomains.length > 0) {
        return this.hoverData[this.temperatureMeanId]
      }
      return 0
    },
    hoverMinTemperature() {
      if (this.hoverData && this.temperatureDomains.length > 0) {
        return this.hoverData[this.temperatureMinId]
      }
      return 0
    },
    hoverMaxTemperature() {
      if (this.hoverData && this.temperatureDomains.length > 0) {
        return this.hoverData[this.temperatureMaxId]
      }
      return 0
    }
  },

  watch: {
    groupDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupMarketValueDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupEmissionDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    filteredDataset(updated) {
      this.$store.dispatch('exportData', updated)
    },
    hiddenFuelTechs() {
      this.updateEnergyMinMax()
    }
  },

  created() {
    this.$store.dispatch('currentView', 'energy')
  },

  mounted() {
    EventBus.$on('dataset.filter', this.handleDatasetFilter)
    EventBus.$on('vis.mousemove', this.handleVisMouseMove)
    EventBus.$on('vis.mouseenter', this.handleVisEnter)
    EventBus.$on('vis.mouseleave', this.handleVisLeave)

    this.windowWidth = window.innerWidth
    this.visHeight = this.widthBreak ? 578 : 350
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.windowWidth = window.innerWidth
          this.visHeight = this.widthBreak ? 578 : 350
        }, 200)
      )
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
      const urls = Data.getEnergyUrls(region, range)

      if (urls.length > 0) {
        Http(urls)
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
      // !!! Removing Vol weighted Price after requesting ALL data
      // - due to incorrect data
      if (this.range === 'ALL') {
        responses.forEach(r => {
          const findIndex = r.data.findIndex(
            d => d.type === 'volume_weighted_price'
          )
          if (findIndex) {
            r.data.splice(findIndex, 1)
          }
        })
      }

      this.responses = responses
      this.updateDomains(responses)
      EnergyDataTransform.mergeResponses(
        responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        this.interval
      ).then(dataset => {
        this.dataset = dataset
        this.dateFilter = d3Extent(this.dataset, d => d.date)
        if (this.groupDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupDomains)
        }
        if (this.groupMarketValueDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupMarketValueDomains)
        }
        if (this.groupEmissionDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupEmissionDomains)
        }
        this.updatedFilteredDataset(dataset)
        this.updateEnergyMinMax()
        this.ready = true
      })
    },

    updateDatasetGroups(dataset, groupDomains) {
      this.dataset = dataset.map(d => {
        // create new group domains (if not already there)
        groupDomains.forEach(g => {
          let groupValue = 0
          g.domainIds.forEach(dId => {
            groupValue += d[dId]
          })
          d[g.id] = groupValue
        })
        return d
      })
    },

    updateDomains(res) {
      // Find out about available domains first before flattening data
      this.updateEnergyDomains(res)
      this.updateEmissionDomains(res)
      this.updateMarketValueDomains(res)
      this.updateTemperatureDomains(res)
      this.updatePriceDomains(res)
    },

    updateEnergyDomains(res) {
      const energyDomains = Domain.getEnergyDomains(res)
      this.fuelTechEnergyOrder = Domain.getDomainObjsOrder(
        energyDomains,
        this.fuelTechOrder
      )
      this.energyDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        this.type
      )
    },

    updateMarketValueDomains(res) {
      this.marketValueDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        'market_value'
      )
    },

    updateEmissionDomains(res) {
      const emissionDomains = Domain.getEmissionsDomains(res)
      this.emissionsOrder = Domain.getDomainObjsOrder(
        emissionDomains,
        this.fuelTechOrder
      )
      this.emissionDomains = Domain.getDomainObjs(
        this.regionId,
        this.emissionsOrder,
        'emissions'
      )
    },

    updateTemperatureDomains(res) {
      const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds(res)

      this.temperatureDomains = temperatureDomainsAndIds.domains
      this.temperatureMeanId = temperatureDomainsAndIds.meanId
      this.temperatureMinId = temperatureDomainsAndIds.minId
      this.temperatureMaxId = temperatureDomainsAndIds.maxId
    },

    updatePriceDomains(res) {
      this.priceDomains = Domain.getPriceDomains(res)
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter.length > 0) {
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          dataset,
          this.dateFilter[0],
          this.dateFilter[1]
        )
      } else {
        this.filteredDataset = dataset
      }
    },

    updateEnergyMinMax() {
      let energyMinAll = 0,
        energyMaxAll = 0
      this.dataset.forEach((d, i) => {
        let energyMin = 0,
          energyMax = 0

        this.stackedAreaDomains.forEach(domain => {
          const id = domain.id
          energyMax += d[id] || 0
          if (d[id] < 0) {
            energyMin += d[id] || 0
          }
        })

        if (energyMax > energyMaxAll) {
          energyMaxAll = energyMax
        }
        if (energyMin < energyMinAll) {
          energyMinAll = energyMin
        }
      })
      this.energyMin = energyMinAll
      this.energyMax = energyMaxAll
    },

    handleRangeChange(range) {
      let interval = ''
      switch (range) {
        case '1D':
          interval = '5m'
          this.dateFilter = []
          break
        case '3D':
        case '7D':
          interval = '30m'
          this.dateFilter = []
          break
        case '30D':
          interval = 'Day'
          this.dateFilter = []
          break
        case '1Y':
          interval = 'Week'
          this.dateFilter = []
          break
        case 'ALL':
          interval = 'Month'
          this.dateFilter = []
          break
        default:
          console.log('nothing yet')
      }

      this.$store.dispatch('interval', interval)
      this.$store.dispatch('range', range)
      this.fetchData(this.regionId, range)
    },

    handleIntervalChange(interval) {
      this.$store.dispatch('interval', interval)
      EnergyDataTransform.mergeResponses(
        this.responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        interval
      ).then(dataset => {
        this.dataset = dataset
        this.dateFilter = d3Extent(this.dataset, d => d.date)
        if (this.groupDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupDomains)
        }
        if (this.groupMarketValueDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupMarketValueDomains)
        }
        if (this.groupEmissionDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupEmissionDomains)
        }
        this.updatedFilteredDataset(dataset)
        this.updateEnergyMinMax()
        this.ready = true
      })
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        const startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        // const endTime = DateDisplay.snapToClosestInterval(this.interval, dateRange[1])
        const endTime = dateRange[1]
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
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
      this.tooltipLeft = this.mouseLoc[0]
    },

    handleDateOver(evt, date) {
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      EventBus.$emit('vis.mousemove', evt, this.dataset, closestDate)
    },

    handleDomainOver(domain) {
      this.hoverDomain = domain
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

    toggleChart(chartName) {
      this.$store.dispatch(chartName, !this[chartName])
    },

    handleFuelTechsHidden(hidden) {
      this.hiddenFuelTechs = hidden
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
  margin-top: 1rem;

  .vis-container {
    width: 100%;
    padding: 1rem;

    @include desktop {
      width: 70%;
    }
  }
  .table-container {
    width: 100%;
    padding: 1rem;

    @include desktop {
      width: 30%;
      padding: 0 1rem 0 0;
    }
  }
  .chart {
    position: relative;

    .chart-title {
      font-size: 0.8em;
      padding: 0.2rem 1rem 0.2rem 1rem;
      cursor: pointer;
      user-select: none;
      display: flex;
      justify-content: space-between;

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }

      .hover-values {
        opacity: 0;
        padding: 3px 1.5rem 2px;
        border-radius: 4px;
        white-space: nowrap;
        font-size: 0.8em;

        .ft-value {
          margin-right: 1rem;
        }
        .mean-temp-value {
          margin: 0 1rem;
        }
        strong {
          font-size: 1.3em;
        }
      }

      .colour-square {
        display: inline-block;
        border: 1px solid transparent;
        width: 11px;
        height: 11px;
        border-radius: 1px;
        position: relative;
        top: 1px;
      }

      &.no-hover {
        cursor: auto;
        &:hover {
          background-color: transparent;
        }
      }
    }

    &.is-hovered .hover-values {
      opacity: 1;
      background: rgba(255, 255, 255, 0.5);
      transition: all 0.2s ease-in-out;
    }
    &.has-border-bottom {
      border-bottom: 1px dashed #ccc;
    }
  }
}

// Chart style adjustments
.price-vis {
  position: relative;
  top: -7px;
}
.price-neg-vis {
  position: relative;
  top: -14px;
}
::v-deep .price-vis .y-axis-guide-group .domain,
::v-deep .temperature-vis .y-axis .domain {
  fill: rgba(255, 255, 255, 0.1);
}
::v-deep .temperature-vis .y-axis .tick:last-of-type text,
::v-deep .temperature-vis .y-axis-tick .tick:last-of-type text,
::v-deep .price-pos-vis .y-axis-guide-group .tick:not(:first-of-type) text,
::v-deep .price-neg-vis .y-axis-guide-group .tick text {
  display: none;
}
::v-deep .price-neg-vis .line-group path,
::v-deep .price-pos-vis .line-group path {
  stroke-dasharray: 1;
}
</style>
