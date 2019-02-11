<template>
  <draggable
    v-model="order"
    :options="{ 
      group: group,
      direction: 'horizontal',
      ghostClass: 'drag-placeholder',
      animation: 150
    }"
    class="summary-list"
    @start="drag=true"
    @end="drag=false">
    <div
      v-for="ft in order"
      :key="ft.id"
      class="item"
      @click="handleRowClick(ft.fuelTech)">
      <div
        :style="{ 'background-color': isHidden(ft.fuelTech) ? '#fff' : ft.colour }"
        class="colour-square" />
      <div class="label">{{ ft.label }}</div>
      <div class="value">{{ getSumValue(ft.id) | formatValue }}</div>
      <div class="value">{{ getValue(ft.id) | formatValue }}</div>
    </div>
  </draggable>
</template>

<script>
import includes from 'lodash.includes'
import Draggable from 'vuedraggable'

export default {
  components: {
    Draggable
  },

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
    summary: {
      type: Object,
      default: () => {}
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
    }
  },

  methods: {
    handleRowClick(fuelTech) {
      this.hiddenFuelTechs.push(fuelTech)
    },

    isHidden(fuelTech) {
      return includes(this.hiddenFuelTechs, fuelTech)
    },

    getValue(key) {
      const item = this.pointSummary[key]
      return item ? item.value : ''
    },

    getSumValue(key) {
      return this.summary[key] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-list {
  .item {
    display: flex;
    padding: 3px 4px;
    margin-bottom: 2px;
    background-color: #ddd;
    cursor: move;

    &.drag-placeholder {
      opacity: 0.1;
    }
  }

  .label {
    width: 50%;
    padding-left: 5px;
  }

  .value {
    width: 20%;
    text-align: right;
  }

  .colour-square {
    width: 20px;
    height: 20px;
  }
}
</style>
