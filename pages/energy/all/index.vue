<template>
  <section>
    <data-options-bar />

    <div class="vis-table-container">
      <div class="vis-container">
        <stacked-area-vis
          v-if="hasData"
          :vis-data="visData"
          :step="false"
          :vis-height="550" />
      </div>
      <div class="table-container">
        <summary-table
          v-if="hasData"
          :domains="domains"
          :dataset="filteredDataset"
          :period="period"
        />
      </div>
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
import EventBus from '~/plugins/eventBus.js'
import RangePeriodSelectors from '~/components/RangePeriodSelectors.vue'
import DataOptionsBar from '~/components/energy/DataOptionsBar'
import Generation from '~/components/Generation.vue'
import RegionPageMethods from '~/methods/regionPage.js'
import StackedAreaVis from '~/components/Vis/StackedArea2.vue'
import SummaryTable from '~/components/SummaryTable'

export default {
  layout: 'main',

  components: {
    DataOptionsBar,
    RangePeriodSelectors,
    Generation,
    StackedAreaVis,
    SummaryTable
  },

  data() {
    return {
      mounted: false,
      region: 'nem',
      type: '',
      range: '',
      period: '',
      visData: {},
      dataset: [],
      domains: [],
      data: [],
      url: '',
      selectedId: '',
      dateFilter: null,
      filteredDataset: []
    }
  },

  computed: {
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
    availableKeys(keys) {
      this.domains = this.getFuelTechObjs(this.type, this.region)
    }
  },

  mounted() {
    EventBus.$on('dataset.filter', this.handleDatasetFilter)

    this.mounted = true
    this.range = this.$route.query.range || '7D'
    this.period = this.$route.query.period || '30min'
    console.log(this.fuelTechNames, this.fuelTechGroup)

    this.fetchData(this.region, this.range)
  },

  beforeDestroy() {
    EventBus.$off('dataset.filter')
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
      this.domains = this.getFuelTechObjs(this.type, this.region)

      this.getFlattenData(data)
    },

    updateFilteredData(startDate, endDate) {
      const startDateTime = new Date(startDate).getTime()
      const endDateTime = new Date(endDate).getTime()

      const filtered = this.dataset.filter(
        d => d.date >= startDateTime && d.date <= endDateTime
      )
      console.log(filtered)
      this.filteredDataset = filtered
    },

    getFlattenData(data) {
      RegionPageMethods.getFlattenData(
        data,
        this.period,
        this.domains,
        this.setFlattenData
      )
    },

    setFlattenData(newData) {
      this.visData = {
        domains: this.domains,
        dataset: newData
      }
      this.flattenData = newData
      this.dataset = newData

      if (this.dateFilter) {
        this.updateFilteredData(this.dateFilter[0], this.dateFilter[1])
      } else {
        this.filteredDataset = newData
      }
    },

    handleRangeChange(range) {
      this.range = range
      this.fetchData(this.region, this.range)
    },

    handlePeriodChange(period) {
      this.period = period
      this.getFlattenData(this.data)
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        this.dateFilter = dateRange
        this.updateFilteredData(dateRange[0], dateRange[1])
      } else {
        this.filteredDataset = this.dataset
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
</style>
