<template>
  <header>
    <div class="header-dropdowns">
      <div
        class="logo-wrapper"
        @click="toggleDrawer">
        <i
          v-if="ready && widthBreak"
          class="fal fa-ellipsis-v" />
        <app-logo class="header-logo" />
        <h1 v-if="ready && widthBreak"> {{ regionLabel }}</h1>
      </div>
      <view-dropdown
        v-if="!widthBreak"
        class="selection" />
      <region-dropdown
        v-if="!widthBreak"
        class="selection" />
    </div>

    <app-drawer
      v-if="widthBreak"
      :open="openDrawer"
      @close="openDrawer = false"
    />

    <div
      v-if="!widthBreak"
      class="share-buttons buttons has-addons">
      <button
        class="button is-rounded"
        @click="handleExportImage">
        <i class="fal fa-fw fa-chart-bar" />
        <span class="label-image">Image</span>
      </button>
      <button class="button is-rounded">
        <download-csv
          :data="exportData"
          :name="`${filename}.csv`"
        >
          <i class="fal fa-fw fa-table" />
          <span class="label-csv">Data</span>
        </download-csv>
      </button>
    </div>
  </header>
</template>

<script>
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import _debounce from 'lodash.debounce'
import DownloadCsv from 'vue-json-csv'
import REGIONS from '~/constants/regions.js'
import AppLogo from '~/components/ui/Logo'
import ViewDropdown from '~/components/ui/ViewDropdown'
import RegionDropdown from '~/components/ui/RegionDropdown'
import AppDrawer from '~/components/layout/Drawer'

export default {
  components: {
    DownloadCsv,
    AppLogo,
    ViewDropdown,
    RegionDropdown,
    AppDrawer
  },

  data() {
    return {
      ready: false,
      openDrawer: false,
      windowWidth: 0,
      regions: REGIONS
    }
  },

  computed: {
    responsiveBreakWidth() {
      return this.$store.getters.responsiveBreakWidth
    },
    range() {
      return this.$store.getters.range
    },
    interval() {
      return this.$store.getters.interval
    },
    dateFilter() {
      return this.$store.getters.dateFilter
    },
    widthBreak() {
      return this.windowWidth < this.responsiveBreakWidth
    },
    exportData() {
      return this.$store.getters.exportData
    },
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find(d => d.id === this.regionId)
      return region ? region.label : ''
    },
    filename() {
      let date = ''
      let region = this.regionLabel
      if (this.exportData.length > 0) {
        date = d3TimeFormat('%Y%m%d')(this.exportData[0].date)
      }
      if (this.regionId === 'nem') {
        region = 'OpenNEM'
      }
      return `${date} ${region}`
    }
  },

  mounted() {
    this.windowWidth = window.innerWidth
    window.addEventListener(
      'resize',
      _debounce(() => {
        this.windowWidth = window.innerWidth
      }, 200)
    )
    this.ready = true
  },

  methods: {
    toggleDrawer() {
      this.openDrawer = !this.openDrawer
    },
    handleExportImage() {
      const query = {
        range: this.range,
        interval: this.interval
      }
      if (this.dateFilter.length > 0) {
        query.start = new Date(this.dateFilter[0]).getTime()
        query.end = new Date(this.dateFilter[1]).getTime()
      }
      this.$router.push({
        path: `/energy/${this.regionId}/image`,
        query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

header {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $app-padding / 2;
  background-color: $background-alpha;
  position: relative;
  z-index: 9999;

  @include desktop {
    margin-top: $app-padding;
  }

  h1 {
    font-family: $header-font-family;
    font-weight: 700;
    color: #000;
    font-size: 1.2rem;
    position: relative;
    top: 3px;
  }

  .header-logo {
    width: 2.3rem;
    max-height: 2.3rem;
    margin: 0.2rem $app-padding / 2;
    position: relative;
    top: 3px;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
  }

  .fa-ellipsis-v {
    font-size: 2.2rem;
    color: $opennem-link-color;
    position: relative;
    top: 3px;
  }

  .header-dropdowns {
    display: flex;
    align-items: center;

    .selection {
      position: relative;
      top: 3px;
    }
  }

  .share-buttons {
    .button {
      font-size: 0.9rem;
    }

    .label-image {
      margin-left: 3px;
    }
    .fa-chart-bar {
      position: relative;
      top: 1px;
    }
  }
}
</style>
