<template>
  <header>
    <div class="header-dropdowns">
      <i
        v-if="ready && widthBreak"
        class="fal fa-ellipsis-v" />
      <div
        class="logo-wrapper"
        @click="toggleDrawer">
        <logo class="header-logo" />
      </div>
      <h1 v-if="ready && widthBreak"> {{ regionLabel }}</h1>
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
      <!-- <span class="button is-rounded">Image</span> -->
      <button class="button is-rounded">
        <download-csv
          :data="exportData"
          :name="`test.csv`"
        >
          <i class="fal fa-fw fa-table" />
          <span class="csv-label">Data</span>
        </download-csv>
      </button>
    </div>
  </header>
</template>

<script>
import _debounce from 'lodash.debounce'
import DownloadCsv from 'vue-json-csv'
import REGIONS from '~/constants/regions.js'
import Logo from '~/components/ui/Logo'
import ViewDropdown from '~/components/ui/ViewDropdown'
import RegionDropdown from '~/components/ui/RegionDropdown'
import AppDrawer from '~/components/layout/Drawer'

export default {
  components: {
    DownloadCsv,
    Logo,
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
  }
}
</style>
