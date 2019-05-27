<template>
  <section>    
    <AppHeader />

    <RangePeriodSelectors
      @range="handleRangeChange"
      @period="handlePeriodChange"
    />

    <!-- <Generation
      v-if="mounted"
      :flatten-data="flattenData"
      :period="period"
      :type="type"
      :domains="fuelTechs"
    />   -->

    <div
      v-if="mounted"
      style="width: 100%;"
    >
      <StackedAreaVis 
        :data="flattenData"
        :domains="fuelTechs"
        :step="false"
        :vis-height="350" />
    </div>
  </section>
</template>

<script>
import AppHeader from '~/components/Header.vue'
import RangePeriodSelectors from '~/components/RangePeriodSelectors.vue'
import Generation from '~/components/Generation.vue'
import RegionPageMethods from '~/methods/regionPage.js'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'

export default {
  components: {
    AppHeader,
    RangePeriodSelectors,
    Generation,
    StackedAreaVis
  },

  data() {
    return {
      mounted: false,
      region: 'nem',
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
    console.log(this.fuelTechNames, this.fuelTechGroup)

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
</style>
