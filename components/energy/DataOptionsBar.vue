<template>
  <div class="data-options-bar">
    <div class="range-buttons buttons has-addons">
      <span
        v-for="(r, i) in ranges"
        :key="i"
        :class="{ 'is-selected': r.range === selectedRange }"
        class="button is-rounded"
        @click="handleRangeChange(r.range)">
        {{ r.range }}
      </span>
    </div>

    <div class="buttons has-addons">
      <span
        v-for="(interval, i) in selectedRangeIntervals"
        :key="i"
        :class="{ 'is-selected': interval === selectedInterval }"
        class="button is-rounded"
        @click="handleIntervalChange(interval)">
        {{ interval }}
      </span>
    </div>
  </div>
</template>

<script>
import RANGE_INTERVAL from '~/constants/rangeInterval.js'

export default {
  props: {
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      ranges: RANGE_INTERVAL,
      selectedRange: '7D',
      selectedInterval: '30m'
    }
  },

  computed: {
    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      return range.intervals
    }
  },

  watch: {
    range(updated) {
      this.selectedRange = updated
    },
    interval(updated) {
      this.selectedInterval = updated
    }
  },

  methods: {
    handleRangeChange(range) {
      this.$emit('onRangeChange', range)
    },
    handleIntervalChange(interval) {
      this.$emit('onIntervalChange', interval)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.data-options-bar {
  padding: $app-padding;

  .button {
    font-size: 11px;
  }

  @include tablet {
    display: flex;
    align-items: center;
  }
}
.range-buttons {
  margin-right: $app-padding;
  margin-bottom: $app-padding / 2;

  @include tablet {
    margin-bottom: 0;
  }
}
</style>
