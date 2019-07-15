<template>
  <section style="margin-top: 0.5rem;">
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <div class="vis-table-container">
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
            class="chart-title">
            <div>
              <strong>Energy</strong>
              <small>GWh/{{ interval }}</small>
            </div>
            <div class="hover-values">
              <span v-if="hoverValue">
                <em
                  :style="{ 'background-color': hoverDomainColour }"
                  class="colour-square" />
                {{ hoverDomainLabel }}:
                <strong>{{ hoverValue | formatValue }}</strong>
                |
              </span>
              <span>
                Total:
                <strong>{{ hoverTotal | formatValue }}</strong>
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
              <span v-if="hoverValue">
                <em
                  :style="{ 'background-color': hoverDomainColour }"
                  class="colour-square" />
                {{ hoverDomainLabel }}:
                <strong>{{ hoverValue | formatValue }}</strong>
                |
              </span>
              <span>
                Total:
                <strong>{{ hoverTotal | formatValue }}</strong>
              </span>
            </div>
          </div>
          <!-- :left-position="tooltipLeft" -->
          <!-- <vis-tooltip
            :hover-value="hoverValue"
            :hover-total="hoverTotal"
            :hover-domain-colour="hoverDomainColour"
          /> -->
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
            :vis-height="stackedAreaHeight"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @domainOver="handleDomainOver"
          />
        </div>

        <div
          v-if="ready && hasEmissionData"
          :class="{ 'is-hovered': hoverOn }"
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
            <div class="hover-values">
              <span>
                Total:
                <strong>{{ hoverEmissionVolumeTotal | formatValue }}</strong>
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
          :class="{ 'is-hovered': hoverOn }"
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
              <!-- <small>-</small> -->
            </div>
            <div class="hover-values">
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
            :vis-height="80"
            :y-min="0"
            :show-zoom-out="false"
            class="emissions-intensity-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>

        <div
          v-if="ready && hasPriceData"
          :class="{ 'is-hovered': hoverOn }"
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
            <div class="hover-values">
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
            :vis-height="30"
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
            :y-max="-1000"
            :show-x-axis="false"
            :vis-height="30"
            :show-zoom-out="false"
            :y-guides="[-50, -800]"
            class="price-neg-vis"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
          />
        </div>

        <div
          v-if="ready && hasTemperatureData"
          :class="{ 'is-hovered': hoverOn }"
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
            <div class="hover-values">
              <span v-if="hoverMinTemperature">
                Min:
                <strong>{{ hoverMinTemperature | formatValue }}</strong>
                | Av:
              </span>
              <span>
                <strong>{{ hoverMeanTemperature | formatValue }}</strong>
              </span>
              <span v-if="hoverMaxTemperature">
                | Max:
                <strong>{{ hoverMaxTemperature | formatValue }}</strong>
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
import {
  timeMinute as d3TimeMinute,
  timeDay as d3TimeDay,
  timeMonday as d3TimeMonday,
  timeMonth as d3TimeMonth,
  timeYear as d3TimeYear
} from 'd3-time'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { mouse as d3Mouse } from 'd3-selection'
import { extent as d3Extent, max as d3Max } from 'd3-array'
import _debounce from 'lodash.debounce'
import _uniqBy from 'lodash.uniqby'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import Draggable from 'vuedraggable'

import * as FUEL_TECHS from '~/constants/fuelTech.js'
import * as SimplifiedGroup from '~/constants/group-simplified.js'
import * as FlexibilityGroup from '~/constants/group-flexibility.js'
import * as RenewableFossilGroup from '~/constants/group-renewable-fossil.js'
import * as SolarResidualGroup from '~/constants/group-solar-residual.js'
import EventBus from '~/plugins/eventBus.js'
import http from '~/services/HttpService.js'
import DataTransformService from '~/services/DataTransformService.js'

import DataOptionsBar from '~/components/ui/DataOptionsBar'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'
import SummaryTable from '~/components/SummaryTable'
import VisTooltip from '~/components/ui/Tooltip'

export default {
  layout: 'main',

  components: {
    Draggable,
    DataOptionsBar,
    StackedAreaVis,
    LineVis,
    SummaryTable,
    VisTooltip
  },

  data() {
    return {
      mounted: false,
      ready: false,
      type: 'power', // power, energy
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
      windowWidth: 0
    }
  },

  computed: {
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
      const fuelTechGroup = this.$store.getters.fuelTechGroup
      let group = null
      switch (fuelTechGroup) {
        case 'Simplified':
          group = SimplifiedGroup
          break
        case 'Flexibility':
          group = FlexibilityGroup
          break
        case 'Renewable/Fossil':
          group = RenewableFossilGroup
          break
        case 'Solar/Residual':
          group = SolarResidualGroup
          break
        default:
      }
      return group
    },
    groupDomains() {
      const groupDomains = []
      const group = this.fuelTechGroup
      if (group) {
        const energyDomains = this.energyDomains
        const groupOrder = group.FUEL_TECH_ORDER

        groupOrder.forEach(groupId => {
          const grouping = group.FUEL_TECH_GROUP[groupId]
          const find = energyDomains.find(d => _includes(grouping, d.fuelTech))

          if (find) {
            const domainIds = []
            grouping.forEach(g => {
              const domain = energyDomains.find(d => d.fuelTech === g)
              if (domain) domainIds.push(domain.id)
            })
            groupDomains.push({
              id: `${groupId}.energy`,
              label: group.FUEL_TECH_LABEL[groupId],
              colour: group.FUEL_TECH_GROUP_COLOUR[groupId],
              category: group.FUEL_TECH_CATEGORY[groupId],
              type: find.type,
              domainIds
            })
          }
        })
      }

      return groupDomains.reverse()
    },
    groupMarketValueDomains() {
      const groupDomains = []
      const group = this.fuelTechGroup
      if (group) {
        const marketValueDomains = this.marketValueDomains
        const groupOrder = group.FUEL_TECH_ORDER

        groupOrder.forEach(groupId => {
          const grouping = group.FUEL_TECH_GROUP[groupId]
          const find = marketValueDomains.find(d =>
            _includes(grouping, d.fuelTech)
          )

          if (find) {
            const domainIds = []
            grouping.forEach(g => {
              const domain = marketValueDomains.find(d => d.fuelTech === g)
              if (domain) domainIds.push(domain.id)
            })
            groupDomains.push({
              id: `${groupId}.market_value`,
              label: group.FUEL_TECH_LABEL[groupId],
              colour: group.FUEL_TECH_GROUP_COLOUR[groupId],
              category: group.FUEL_TECH_CATEGORY[groupId],
              type: find.type,
              domainIds
            })
          }
        })
      }

      return groupDomains.reverse()
    },

    groupEmissionDomains() {
      const groupDomains = []
      const group = this.fuelTechGroup
      if (group) {
        const emissionDomains = this.emissionDomains
        const groupOrder = group.FUEL_TECH_ORDER

        groupOrder.forEach(groupId => {
          const grouping = group.FUEL_TECH_GROUP[groupId]
          const find = emissionDomains.find(d =>
            _includes(grouping, d.fuelTech)
          )

          if (find) {
            const domainIds = []
            grouping.forEach(g => {
              const domain = emissionDomains.find(d => d.fuelTech === g)
              if (domain) domainIds.push(domain.id)
            })
            groupDomains.push({
              id: `${groupId}.emissions`,
              label: group.FUEL_TECH_LABEL[groupId],
              colour: group.FUEL_TECH_GROUP_COLOUR[groupId],
              category: group.FUEL_TECH_CATEGORY[groupId],
              type: find.type,
              domainIds
            })
          }
        })
      }

      return groupDomains.reverse()
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
      switch (this.range) {
        case '1D':
        case '3D':
        case '7D':
          return 'linear'
        default:
          return 'step'
      }
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
      const urls = []
      switch (range) {
        case '1D':
        case '3D':
        case '7D':
          this.type = 'power'
          urls.push(`/power/${region}.json`)
          // urls.push(`/power/history/5minute/${region}_2019W23.json`)
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
      this.mergeResponses(
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
        // this.dateFilter = d3Extent(this.dataset, d => d.date)
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
        this.ready = true
      })
    },

    mergeResponses(
      res,
      energyDomains,
      marketValueDomains,
      temperatureDomains,
      priceDomains,
      emissionDomains,
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
              marketValueDomains,
              temperatureDomains,
              priceDomains,
              emissionDomains,
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
            marketValueDomains,
            temperatureDomains,
            priceDomains,
            emissionDomains,
            range,
            interval
          ).then(rolledUpData => {
            // Then calculate min and total for each point for the chart
            resolve(this.calculateMinTotal(rolledUpData, energyDomains))
          })
        })
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
      let fuelTechEnergy = []
      res.forEach(r => {
        const energyObjs = r.data
          .filter(d => d.type === 'power' || d.type === 'energy')
          .map(d => {
            return { id: d.id, fuelTech: d.fuel_tech, type: d.type }
          })
        fuelTechEnergy = [...fuelTechEnergy, ...energyObjs]
      })
      this.fuelTechEnergyOrder = this.getFuelTechOrder(fuelTechEnergy)
      this.energyDomains = this.getFuelTechObjs(
        this.fuelTechEnergyOrder,
        this.type
      )
    },

    updateMarketValueDomains(res) {
      let fuelTechMarketValue = []
      res.forEach(r => {
        const objs = r.data.filter(d => d.type === 'market_value').map(d => {
          return { id: d.id, fuelTech: d.fuel_tech, type: d.type }
        })
        fuelTechMarketValue = [...fuelTechMarketValue, ...objs]
      })

      this.marketValueDomains = this.getFuelTechObjs(
        this.fuelTechEnergyOrder,
        'market_value'
      )
    },

    updateEmissionDomains(res) {
      let emissionDomains = []

      res.forEach(r => {
        const objs = r.data.filter(d => d.type === 'emissions').map(d => {
          return { id: d.id, fuelTech: d.fuel_tech, type: d.type }
        })
        emissionDomains = [...emissionDomains, ...objs]
      })

      this.emissionsOrder = this.getFuelTechOrder(emissionDomains)
      this.emissionDomains = this.getFuelTechObjs(
        this.emissionsOrder,
        'emissions'
      )
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
      this.mergeResponses(
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
        this.ready = true
      })
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        const startTime = this.snapToClosestInterval(dateRange[0])
        // const endTime = this.snapToClosestInterval(dateRange[1])
        const endTime = dateRange[1]
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
      this.tooltipLeft = this.mouseLoc[0]
    },

    handleDateOver(evt, date) {
      const closestDate = this.snapToClosestInterval(date)
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

    flatten(
      data,
      energyDomains,
      marketValueDomains,
      temperatureDomains,
      priceDomains,
      emissionDomains,
      range,
      interval
    ) {
      return new Promise(resolve => {
        DataTransformService.flattenAndInterpolate(
          data,
          energyDomains,
          marketValueDomains,
          temperatureDomains,
          priceDomains,
          emissionDomains
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
        let total = 0,
          min = 0,
          totalEmissionsVol = 0
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

        this.emissionDomains.forEach(domain => {
          totalEmissionsVol += d[domain.id] || 0
        })
        dataset[i]._total = total
        dataset[i]._min = min
        dataset[i]._totalEmissionsVol = totalEmissionsVol
        dataset[i]._emissionsIntensity = totalEmissionsVol / total || 0
      })
      return dataset
    },

    getFuelTechObjs(domainIds, type) {
      // create ft Objects that has the right id and meta data
      const region = this.regionId
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

    getFuelTechOrder(fuelTechObjs) {
      // get the unique domains in the right order
      const order = this.fuelTechOrder
      const uniq = _uniqBy(fuelTechObjs, 'fuelTech').map(d => d.fuelTech)
      const fuelTechOrder = []
      order.forEach(o => {
        if (_includes(uniq, o)) {
          fuelTechOrder.push(o)
        }
      })
      return fuelTechOrder
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

    @include desktop {
      width: 30%;
    }
  }
  .chart {
    position: relative;

    &:not(:first-child) {
      border-bottom: 1px solid #666;
    }

    .chart-title {
      font-size: 0.8em;
      padding: 0.2rem 1rem 0.2rem 1rem;
      cursor: pointer;
      user-select: none;
      display: flex;
      justify-content: space-between;

      &:hover {
        background-color: rgba(255, 255, 255, 0.5);
      }

      .hover-values {
        opacity: 0;
        padding: 2px 1rem 1px;
        border-radius: 4px;
        white-space: nowrap;
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
    }

    &.is-hovered .hover-values {
      opacity: 1;
      background: rgba(255, 255, 255, 0.5);
      transition: all 0.2s ease-in-out;
    }
  }
}

// Chart style adjustments
.price-vis {
  position: relative;
  top: -6px;
}
.price-neg-vis {
  position: relative;
  top: -12px;
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
</style>
