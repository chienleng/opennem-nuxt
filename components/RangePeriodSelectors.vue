<template>
  <div class="period-interval-container header-buttons">
    <span>Period</span>
    <div class="period-buttons">
      <button
        class="button"
        type="button"
        @click="handleRangeChange('7D')">
        1D
      </button><button
        class="button"
        type="button"
        @click="handleRangeChange('7D')">
        3D
      </button><button
        class="button"
        type="button"
        @click="handleRangeChange('7D')">
        7D
      </button><button
        class="button"
        type="button"
        @click="handleRangeChange('30D')"
      >30D</button><button
        class="button"
        type="button"
        @click="handleRangeChange('1Y')"
      >
        1Y
      </button><button
        class="button"
        type="button"
        @click="handleRangeChange('7D')">
        ALL
      </button>
    </div>
    
    <span>Interval</span>
    <div class="interval-buttons">
      <button
        class="button"
        type="button"
        @click="handlePeriodChange('5min')"
      >
        5min
      </button><button
        class="button"
        type="button"
        @click="handlePeriodChange('30min')"
      >
        30min
      </button><button
        class="button"
        type="button"
        @click="handlePeriodChange('Daily')"
      >
        Daily
      </button>
    </div>    
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

<style lang="scss" scoped>
$border-style: 1px dotted #cdcdcd;

.period-interval-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: $border-style;
  border-top: $border-style;
  // padding-left: 1rem;

  span {
    margin-right: 1rem;
  }

  .period-buttons,
  .interval-buttons {
    display: flex;
    align-items: center;
    justify-content: center;

    .button {
      width: 60px;
      &:last-child {
        border-right: $border-style;
      }
    }
  }

  .period-buttons {
    margin-right: 2rem;
  }
  .interval-buttons {
    .button {
      width: 80px;
    }
  }
}
</style>
