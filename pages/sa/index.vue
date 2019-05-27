<template>
  <section>    
    <header>
      South Australia
    </header>

    <RangePeriodSelectors
      @range="handleRangeChange"
      @period="handlePeriodChange"
    />

    <Generation
      v-if="mounted"
      :flatten-data="flattenData"
      :period="period"
      :type="type"
      :domains="fuelTechs"
    />  
  </section>
</template>

<script>
import RegionPageMethods from '~/methods/regionPage.js'
import RangePeriodSelectors from '~/components/RangePeriodSelectors.vue'
import Generation from '~/components/Generation.vue'

export default {
  components: {
    RangePeriodSelectors,
    Generation
  },

  data() {
    return {
      mounted: false,
      region: 'sa1',
      type: '',
      range: '',
      period: '',
      data: [],
      flattenData: [],
      url: '',
      fuelTechs: [],
      selectedId: ''
    }
  },

  computed: {
    fuelTechNames() {
      return this.$store.getters.fuelTechNames
    },
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    },
    availableKeys() {
      return RegionPageMethods.computedAvailableKeys(
        this.$store.getters.fuelTechOrder,
        this.data
      )
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
    this.period = this.$route.query.period || '30min'

    this.fetchData(this.region, this.range)
  },

  methods: {
    fetchData(region, range) {
      RegionPageMethods.fetchData(region, range, this.updateData)
    },

    getFuelTechObjs(type, region) {
      return RegionPageMethods.getFuelTechObjs(type, region, this.availableKeys)
    },

    updateData(type, url, data) {
      this.type = type
      this.data = data
      this.url = url
      this.fuelTechs = this.getFuelTechObjs(this.type, this.region)

      this.getFlattenData(data)
    },

    getFlattenData(data) {
      RegionPageMethods.getFlattenData(
        data,
        this.period,
        this.fuelTechs,
        this.setFlattenData
      )
    },

    setFlattenData(newData) {
      this.flattenData = newData
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
