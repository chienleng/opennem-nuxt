<template>
  <section>
    <header>
      All Regions
    </header>

    <RangePeriodSelectors
      @range="handleRangeChange"
      @period="handlePeriodChange"
    />

    <div
      v-if="mounted"
      style="padding: 10px;">
      <div style="display: flex">
        <div style="width: 60%" >
          <StackedAreaVis 
            :data="flattenData"
            :fuel-techs="fuelTechs"
            :step="step"
            :vis-height="350"/>
        </div>
        
        <Summary
          :fuel-techs="fuelTechs"
          :data="flattenData"
          :period="period"
          style="width: 40%" />
      </div>
    </div>  
  </section>
</template>

<script>
import uniq from 'lodash.uniq'
import includes from 'lodash.includes'
import cloneDeep from 'lodash.clonedeep'
import axios from 'axios'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import DataService from '~/services/DataService.js'
import DataTransformService from '~/services/DataTransformService.js'
import Summary from '~/components/Summary'
import RangePeriodSelectors from '~/components/RangePeriodSelectors.vue'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'

export default {
  components: {
    Summary,
    RangePeriodSelectors,
    StackedAreaVis
  },

  data() {
    return {
      mounted: false,
      type: 'power',
      region: 'nem',
      year: '2017',
      range: '',
      period: '',
      data: [],
      flattenData: [],
      columns: {},
      url: '',
      fuelTechs: [],
      selectedId: ''
    }
  },

  // asyncData({ params }) {
  //   return DataService.getEnergyByRegionYear('nem', 2017).then(res => {
  //     return {
  //       data: res.data,
  //       flattenData: DataTransformService.flatten(res.data),
  //       columns: DataTransformService.getColumns(res.data),
  //       url: res.config.url
  //     }
  //   })
  // },

  computed: {
    nemLength() {
      return this.data.length
    },

    availableKeys() {
      const fuelTechOrder = this.$store.getters.fuelTechOrder
      const uniqKeys = uniq(this.data.map(d => d.fuel_tech).filter(d => d))

      const availKeys = []
      fuelTechOrder.forEach(o => {
        if (includes(uniqKeys, o)) {
          availKeys.push(o)
        }
      })

      return availKeys
    },

    selectedItem() {
      return this.data.find(d => d.id === this.selectedId)
    },

    step() {
      return this.type === 'energy'
    }
  },

  watch: {
    availableKeys() {
      this.fuelTechs = this.getFuelTechObjs(this.type, this.region)
    }
  },

  mounted() {
    this.mounted = true
    this.range = this.$route.query.range || '7D'
    this.period = this.$route.query.period || '5min'

    console.log(this.range, this.period)
    this.fetchData(this.region, this.range)
  },

  methods: {
    fetchData(region, range) {
      // this.getPowerByRegion(region)
      // this.getEnergyByRegionYear(region, '2018')

      if (range === '7D') {
        // this.period = '30min'
        this.getPowerByRegion(region)
      } else if (range === '30D') {
        this.getEnergyByRegion(region)
      }
    },
    getEnergyByRegion(region) {
      this.type = 'energy'
      DataService.getEnergyByRegion(region).then(res => {
        this.updateData(res.config.url, res.data)
        this.getFlattenData(res.data)
      })
    },
    getEnergyByRegionYear(region, year) {
      this.type = 'energy'
      DataService.getEnergyByRegionYear(region, year).then(res => {
        this.updateData(res.config.url, res.data)
        this.getFlattenData(res.data)
      })
    },
    getPowerByRegion(region) {
      this.type = 'power'
      DataService.getPowerByRegion(region).then(res => {
        this.updateData(res.config.url, res.data)
        this.getFlattenData(res.data)
      })
    },

    getFuelTechObjs(type, region) {
      const keys = cloneDeep(this.availableKeys)
      return keys.reverse().map(ft => {
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

    updateData(url, data) {
      this.data = data
      this.url = url
      this.fuelTechs = this.getFuelTechObjs(this.type, this.region)
      this.columns = DataTransformService.getColumns(data)
    },

    getFlattenData(data) {
      DataTransformService.flattenAndInterpolate(data, this.period).then(
        res => {
          // Invert values for types: Loads and fuelTech: Import
          res.forEach(d => {
            this.fuelTechs.forEach((ft, i) => {
              if (
                FUEL_TECHS.FUEL_TECH_CATEGORY[ft.fuelTech] === 'load' ||
                ft.fuelTech === 'imports'
              ) {
                const negValue = -d[ft.id].value
                d[ft.id].value = negValue
              }
            })
          })
          this.flattenData = cloneDeep(res)
        }
      )
    },

    itemSelected(id) {
      this.selectedId = id
    },

    handleRangeChange(range) {
      this.range = range
      this.fetchData(this.region, this.range)
    },

    handlePeriodChange(period) {
      this.period = period
      this.getFlattenData(this.data)
    }
  }
}
</script>

<style lang="scss" scoped>
header {
  border-bottom: 1px solid #999;
  background-color: #fff;
  display: flex;
  padding: 10px;

  select {
    padding: 10px;
    margin: 0 5px;
    display: inline-block;

    option {
      font-size: 13px;
    }
  }

  .url {
    margin-left: 10px;
    padding-top: 2px;
    font-size: 12px;
    font-weight: bold;
  }
}
</style>
