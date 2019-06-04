<template>
  <!-- <draggable
    v-model="order"
    :options="{ 
      group: group,
      direction: 'horizontal',
      ghostClass: 'drag-placeholder',
      animation: 150
    }"
    class="summary-list"
    @start="drag=true"
    @end="drag=false"> -->
  <div class="summary-list">
    <div
      v-for="ft in order"
      :key="ft.id"
      class="item summary-row"
      @click="handleRowClick(ft.fuelTech)">

      <div class="summary-col-label">
        <div
          :style="{
            'background-color': isHidden(ft.fuelTech) ? 'transparent' : ft.colour,
            'border-color': isHidden(ft.fuelTech) ? '#bbb' : ft.colour,
          }"
          class="colour-square" />

        <div class="label">{{ ft.label }}</div>
      </div>

      <div class="summary-col-energy">
        {{ getValue(ft.id) | formatValue }}
      </div>

      <div
        v-if="showPercentColumn"
        class="summary-col-contribution"
      >
        {{ getContribution(ft.id) | formatValue }}%
      </div>
    </div>
  </div>
    
  <!-- </draggable> -->
</template>

<script>
import _isEmpty from 'lodash.isempty'
import _includes from 'lodash.includes'
// import Draggable from 'vuedraggable'

export default {
  // components: {
  //   Draggable
  // },

  props: {
    originalOrder: {
      type: Array,
      default: () => []
    },
    group: {
      type: String,
      default: () => ''
    },
    pointSummary: {
      type: Object,
      default: () => {}
    },
    pointSummaryTotal: {
      type: Number,
      default: () => 0
    },
    summary: {
      type: Object,
      default: () => {}
    },
    summaryTotal: {
      type: Number,
      default: () => 0
    },
    showPointSummary: {
      type: Boolean,
      default: () => false
    },
    showPercentColumn: {
      type: Boolean,
      default: () => true
    }
  },

  data() {
    return {
      hiddenFuelTechs: []
    }
  },

  computed: {
    order: {
      get() {
        return this.originalOrder
      },
      set(newOrder) {
        this.$emit('update', newOrder)
      }
    },

    hasPointSummary() {
      return !_isEmpty(this.pointSummary)
    }
  },

  methods: {
    handleRowClick(fuelTech) {
      this.hiddenFuelTechs.push(fuelTech)
    },

    isHidden(fuelTech) {
      return _includes(this.hiddenFuelTechs, fuelTech)
    },

    getValue(key) {
      return this.showPointSummary
        ? this.pointSummary[key] || ''
        : this.summary[key] || ''
    },

    getContribution(key) {
      const rowValue = this.showPointSummary
        ? this.pointSummary[key]
        : this.summary[key] || 0
      const total = this.showPointSummary
        ? this.pointSummaryTotal
        : this.summaryTotal

      return (rowValue / total) * 100
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.summary-list {
  .item {
    // cursor: move;
    cursor: pointer;

    &.drag-placeholder {
      opacity: 0.1;
    }

    &:hover {
      background-color: $row-hover;
    }
  }

  .summary-col-label {
    display: flex;
    align-items: center;
    .label {
      padding-left: 5px;
    }
  }

  .colour-square {
    border: 1px solid transparent;
    width: 15px;
    height: 15px;
  }
}
</style>