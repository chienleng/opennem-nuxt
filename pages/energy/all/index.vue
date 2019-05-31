<template>
  <section>
    <data-options-bar />

    <div class="vis-table-container">
      <div class="vis-container">
        <stacked-area-vis
          v-if="hasData"
          :vis-data="visData"
          :step="false"
          :vis-height="450" />
      </div>
      <div class="table-container">2</div>
    </div>
    
    <!-- <RangePeriodSelectors
      @range="handleRangeChange"
      @period="handlePeriodChange"
    />

    <div
      v-if="mounted"
      style="width: 100%;"
    >
    </div> -->
  </section>
</template>

<script>
import RangePeriodSelectors from '~/components/RangePeriodSelectors.vue'
import DataOptionsBar from '~/components/energy/DataOptionsBar'
import Generation from '~/components/Generation.vue'
import RegionPageMethods from '~/methods/regionPage.js'
import StackedAreaVis from '~/components/Vis/StackedArea2.vue'

export default {
  layout: 'main',

  components: {
    DataOptionsBar,
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
      visData: {},
      data: [],
      flattenData: [],
      url: '',
      fuelTechs: [],
      selectedId: ''
    }
  },

  computed: {
    dataset() {
      return this.visData.dataset
    },
    hasData() {
      return this.dataset && this.dataset.length > 0
    },
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
      this.visData = {
        domains: this.fuelTechs,
        dataset: newData
      }
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
    background: lightgrey;

    @include tablet {
      width: 30%;
    }
  }
}
</style>
