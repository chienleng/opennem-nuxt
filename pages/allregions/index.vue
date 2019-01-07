<template>
  <section>
    <header>
      All Regions
    </header>

    <div
      v-if="mounted"
      style="padding: 10px;">      
      <StackedAreaVis 
        :data="flattenData"
        :domain-colours="domainColours"
        :ids="ids"/>

      <div style="display: flex">
        <div style="width: 70%" >
          <LineVis 
            :data="priceData"
            :keys="[priceId]"/>

          <LineVis 
            :data="temperatureData"
            :keys="[temperatureId]" />
        </div>
        

        <Summary
          :ids="ids"
          :temperatureId="temperatureId"
          :data="flattenData"
          style="width: 30%" />
      </div>
    </div>  
  </section>
</template>

<script>
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import uniq from 'lodash.uniq'
import includes from 'lodash.includes'
import mapValues from 'lodash.mapvalues'
import cloneDeep from 'lodash.clonedeep'
import axios from 'axios'
import DataService from '~/services/DataService.js'
import DataTransformService from '~/services/DataTransformService.js'
import Summary from '~/components/Summary.vue'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'

export default {
  components: {
    Summary,
    StackedAreaVis,
    LineVis
  },

  data() {
    return {
      mounted: false,
      type: 'power',
      region: 'sa1',
      year: '2017',
      data: [],
      flattenData: [],
      temperatureId: '',
      temperatureData: [],
      priceId: '',
      priceData: [],
      columns: {},
      url: '',
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
      const uniqKeys = uniq(this.data.map(d => d.fuel_tech).filter(d => d))
      console.log(uniqKeys)

      const availKeys = []
      FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER.forEach(o => {
        if (includes(uniqKeys, o)) {
          availKeys.push(o)
        }
      })
      console.log(availKeys)
      return availKeys
    },

    ids() {
      const type = this.type
      const region = this.region
      return this.availableKeys.map(ft => `${region}.fuel_tech.${ft}.${type}`)
    },

    domainColours() {
      return mapValues(
        this.availableKeys,
        key => FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[key]
      )
    },

    selectedItem() {
      return this.data.find(d => d.id === this.selectedId)
    }
  },

  watch: {},

  mounted() {
    this.mounted = true
    this.fetchData(this.region)
  },

  methods: {
    fetchData(region) {
      this.getPowerByRegion(region)
      // this.getEnergyByRegionYear(region, '2018')
    },
    getEnergyByRegion(region) {
      this.type = 'energy'
      DataService.getEnergyByRegion(region).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    getEnergyByRegionYear(region, year) {
      this.type = 'energy'
      DataService.getEnergyByRegionYear(region, year).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    getPowerByRegion(region) {
      this.type = 'power'
      DataService.getPowerByRegion(region).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    updateData(url, data) {
      this.data = data
      this.url = url
      this.columns = DataTransformService.getColumns(data)

      // Temperature
      // if (temperatureOnly) {
      //   DataTransformService.flatten([temperatureOnly]).then(res => {
      //     this.temperatureId = temperatureOnly.id
      //     this.temperatureData = res
      //   })
      // }

      const temperatureItem = data.find(d => d.type === 'temperature')
      const priceItem = data.find(d => d.type === 'price')

      DataTransformService.flattenAndInterpolate(data).then(res => {
        this.flattenData = cloneDeep(res)

        // Invert values for Loads and Import
        this.flattenData.forEach(d => {
          this.ids.forEach((id, i) => {
            if (FUEL_TECHS.FUEL_TECH_TYPE[this.availableKeys[i]] === 'load') {
              d[id].value = -d[id].value
            }
            if (this.availableKeys[i] === 'imports') {
              d[id].value = -d[id].value
            }
          })
        })

        if (temperatureItem) {
          this.temperatureData = cloneDeep(res)
          this.temperatureId = temperatureItem.id
        }
        if (priceItem) {
          console.log(priceItem.id)
          this.priceId = priceItem.id
          this.priceData = cloneDeep(res)
          this.priceData.forEach(d => {
            // console.log(d)
          })
        }
      })
    },
    itemSelected(id) {
      this.selectedId = id
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
