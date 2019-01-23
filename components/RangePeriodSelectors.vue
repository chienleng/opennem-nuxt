<template>
  <div style="padding: 10px;">
    <button
      type="button"
      @click="handleRangeChange('7D')">
      7D
    </button>
    <button
      type="button"
      @click="handleRangeChange('30D')"
    >
      30D
    </button>
    <button
      type="button"
      @click="handleRangeChange('1Y')"
    >
      1Y
    </button>
    |
    <button
      type="button"
      @click="handlePeriodChange('5min')"
    >
      5min
    </button>
    <button
      type="button"
      @click="handlePeriodChange('30min')"
    >
      30min
    </button>
    <button
      type="button"
      @click="handlePeriodChange('Daily')"
    >
      Daily
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    handleRangeChange(range) {
      this.$emit('range', range)
    },
    handlePeriodChange(period) {
      this.$emit('period', period)
    }
  }
}
</script>

<style lang="scss">
</style>
