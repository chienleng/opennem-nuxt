<template>
  <div>
    <facility-filters
      :selected-techs="selectedTechs"
      :selected-statuses="selectedStatuses"
      class="facility-filters"
      @techsSelect="handleTechsSelected"
      @selectedStatuses="handleStatusesSelected"
      @facilityNameFilter="handleFacilityNameFilter"
    />

    <div class="facility-list-map-container">
      <facility-list
        :filtered-facilities="filteredFacilities"
        :selected-facility="selectedFacility"
        :selected-techs="selectedTechs"
        :sort-by="sortBy"
        :order-by="orderBy"
        :hide-region-column="!isNemRegion"
        class="facility-list"
        @orderChanged="handleOrderChange"
        @facilitySelect="handleFacilitySelect"
        @facilityHover="handleFacilityHover"
        @facilityMouseout="handleFacilityOut"
      />

      <facility-map
        :data="filteredFacilities"
        :selected-facility="selectedFacility"
        :hovered-facility="hoveredFacility"
        :show-zoom-when-selected="shouldZoomWhenSelected"
        class="facility-map"
        @facilitySelect="handleFacilitySelect"
      />
    </div>
  </div>
</template>

<script>
import _includes from 'lodash.includes'
import _orderBy from 'lodash.orderby'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import http from '~/services/HttpService.js'
import FacilityDataTransformService from '~/services/FacilityDataTransformService.js'
import FacilityFilters from '~/components/Facility/Filters.vue'
import FacilityList from '~/components/Facility/List.vue'
import FacilityMap from '~/components/Facility/Map.vue'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

export default {
  layout: 'main',

  components: {
    FacilityFilters,
    FacilityList,
    FacilityMap
  },

  data() {
    return {
      filterString: '',
      facilityData: [],
      filteredFacilities: [],
      selectedFacility: null,
      hoveredFacility: null,
      selectedStatuses: ['Commissioned'],
      selectedTechs: [],
      sortBy: 'displayName',
      orderBy: ASCENDING,
      totalFacilities: 0,
      shouldZoomWhenSelected: false
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    isNemRegion() {
      return this.$route.params.region === 'nem'
    }
  },

  watch: {
    facilityData() {
      this.updateFacilitiesData()
    },
    selectedTechs() {
      this.updateFacilitiesData()
    },
    selectedStatuses() {
      this.updateFacilitiesData()
    },
    sortBy() {
      this.updateFacilitiesData()
    },
    orderBy() {
      this.updateFacilitiesData()
    },
    filterString() {
      this.updateFacilitiesData()
    }
  },

  created() {
    this.$store.dispatch('currentView', 'facilities')
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    fetchData() {
      const urls = ['/facility/facility_registry.json']

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
      const data = responses[0].data
      FacilityDataTransformService.flatten(data).then(res => {
        console.log(res)
        this.facilityData = res
      })
    },

    updateFacilitiesData() {
      const sortedData = _orderBy(
        this.facilityData,
        [
          d => {
            if (this.selectedTechs.length === 0) {
              return d[this.sortBy]
            }
            if (this.sortBy !== 'generatorCap') {
              return d[this.sortBy]
            }
            let totals = 0
            this.selectedTechs.forEach(ft => {
              totals += d.fuelTechRegisteredCap[ft] || 0
            })
            return totals
          }
        ],
        [this.orderBy]
      )

      const filtered =
        this.selectedTechs.length > 0
          ? sortedData.filter(g =>
              g.fuelTechs.some(r => this.selectedTechs.includes(r))
            )
          : sortedData

      const that = this
      async function updateFilter() {
        return filtered.filter(
          g =>
            g.displayName
              .toLowerCase()
              .includes(that.filterString.toLowerCase()) &&
            (that.regionId === 'nem' || g.regionId.includes(that.regionId)) &&
            (that.selectedStatuses.length <= 0 ||
              _includes(that.selectedStatuses, g.status))
        )
      }

      updateFilter().then(facilities => {
        that.filteredFacilities = facilities
        that.totalFacilities = facilities.length

        const exportData = facilities.map((d) => { // eslint-disable-line
          return {
            'Facility Name': d.displayName,
            Status: d.status,
            // Region: getRegionLabelByCode(d.regionId),
            Region: d.regionId,
            Technology: d.fuelTechs.map(ft => FUEL_TECHS.FUEL_TECH_LABEL[ft]),
            'Generator Capacity (MW)': d.generatorCap,
            Latitude: d.location.latitude,
            Longitude: d.location.longitude
          }
        })
        // that.$store.dispatch('facilityExportData', exportData)
      })
    },

    toggleOrder(order) {
      return order === ASCENDING ? DESCENDING : ASCENDING
    },

    setFilterString(string) {
      this.filterString = string
      this.updateFacilitiesData()
    },

    handleFacilityNameFilter(string) {
      this.filterString = string
    },
    handleOrderChange(orderName) {
      if (this.sortBy === orderName) {
        this.orderBy = this.toggleOrder(this.orderBy)
      } else {
        this.orderBy = ASCENDING
      }
      this.sortBy = orderName
    },
    handleFacilitySelect(facility, shouldZoom) {
      this.selectedFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
    },
    handleFacilityHover(facility, shouldZoom) {
      this.hoveredFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
    },
    handleFacilityOut() {
      this.hoveredFacility = null
    },
    handleTechsSelected(techs) {
      this.selectedTechs = techs
    },
    handleStatusesSelected(statuses) {
      this.selectedStatuses = statuses
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.facility-list-map-container {
  @include tablet {
    padding: 1rem;
    display: flex;
  }

  .facility-list {
    @include tablet {
      width: 50%;
      padding: 1rem;
      padding-left: 0;
    }
  }
  .facility-map {
    padding: 1rem;

    @include tablet {
      width: 50%;
      position: fixed;
      right: 0;
      padding: 0 1rem 0 0;
    }
  }
}
</style>
