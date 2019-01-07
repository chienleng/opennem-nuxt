<template>
  <section>
    <header>
      <select v-model="type">
        <option value="energy">energy</option>
        <option value="power">power</option>
      </select>

      <select v-model="region">
        <option value="nem">nem</option>
        <option value="nsw1">nsw</option>
        <option value="qld1">qld</option>
        <option value="sa1">sa</option>
        <option value="tas1">tas</option>
        <option value="vic1">vic</option>
      </select>

      <select
        v-if="type === 'energy'"
        v-model="year">
        <option value="all">All</option>
        <option value="2017">2017</option>
        <option value="2018">2018</option>
      </select>

      <div class="url">{{ url }}</div>
    </header>

    <div style="display: flex;">
      <div style="width: 20%;">
        <div>items: {{ nemLength }}</div>
        <DataList
          :nemData="data"
          :selected="selectedId"
          @selected="itemSelected"/>
      </div>

      <div
        v-if="mounted && selectedItem"
        style="width: 80%;">

        <div>data history: <strong>{{ selectedItem.history.data.length }}</strong> points</div>
        <div>start: <strong>{{ selectedItem.history.start | formatDate }}</strong></div>
        <div>last: <strong>{{ selectedItem.history.last | formatDate }}</strong></div>
        <div>interval: <strong>{{ selectedItem.history.interval }}</strong></div>
        
        <LineVis 
          :data="flattenData"
          :keys="[selectedId]"/>
        
        <div style="width: 50%">
          <LineVis 
            :data="flattenData"
            :keys="[selectedId]"/>
        </div>
        
        <DataTable 
          :data="flattenData"
          :columns="columns" />
      </div>
    </div>    
  </section>
</template>

<script>
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import uniq from 'lodash.uniq'
import axios from 'axios'
import DataService from '~/services/DataService.js'
import DataTransformService from '~/services/DataTransformService.js'
import DataList from '~/components/DataList.vue'
import DataTable from '~/components/DataTable.vue'
import LineVis from '~/components/Vis/Line.vue'

export default {
  components: {
    DataList,
    DataTable,
    LineVis
  },

  data() {
    return {
      mounted: false,
      type: 'energy',
      region: 'nem',
      year: '2017',
      data: [],
      flattenData: [],
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
      return uniq(this.data.map(d => d.fuel_tech).filter(d => d))
    },

    keys() {
      const type = this.type
      const region = this.region
      return this.availableKeys.map(ft => `${region}.fuel_tech.${ft}.${type}`)
    },

    selectedItem() {
      return this.data.find(d => d.id === this.selectedId)
    }
  },

  watch: {
    selectedId(id) {
      const find = this.data.find(d => d.id === id)
      if (find) {
        this.columns = DataTransformService.getColumns([find])
        DataTransformService.flattenAndInterpolate([find]).then(res => {
          this.flattenData = res
        })
      }
    },

    type(selected) {
      this.fetchData(selected, this.region, this.year)
    },

    region(selected) {
      this.fetchData(this.type, selected, this.year)
    },

    year(selected) {
      this.fetchData(this.type, this.region, selected)
    }
  },

  mounted() {
    this.mounted = true
    this.fetchData(this.type, this.region, this.year)
    // this.$store.commit('nem', this.data)
  },

  methods: {
    fetchData(type, region, year) {
      if (type === 'power') {
        this.getPowerByRegion(region)
      } else {
        if (year === 'all') {
          this.getEnergyByRegion(region)
        } else {
          this.getEnergyByRegionYear(region, year)
        }
      }
    },
    getEnergyByRegion(region) {
      DataService.getEnergyByRegion(region).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    getEnergyByRegionYear(region, year) {
      DataService.getEnergyByRegionYear(region, year).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    getPowerByRegion(region) {
      DataService.getPowerByRegion(region).then(res =>
        this.updateData(res.config.url, res.data)
      )
    },
    updateData(url, data) {
      this.data = data
      this.url = url
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
