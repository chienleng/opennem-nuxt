<template>
  <header>
    <section>
      <h1>Export as Image (PNG)</h1>
      <div>
        <button
          class="cancel-button button is-rounded is-primary is-inverted"
          @click="handleCancelClick">Cancel</button>
        <button
          class="button is-rounded is-primary"
          @click="handleExportClick">Download</button>
      </div>
    </section>
    <section>
      <div>
        <a
          v-for="chart in charts"
          :key="chart.name"
          :class="{ 'is-primary': isEnabled(chart.name) }"
          class="tag is-rounded"
          @click="handleWidgetToggle(chart.name)">
          {{ chart.label }}
        </a>
        <hr>
        <a
          v-for="table in tables"
          :key="table.name"
          :class="{ 'is-primary': isEnabled(table.name) }"
          class="tag is-rounded"
          @click="handleWidgetToggle(table.name)">
          {{ table.label }}
        </a>
      </div>
    </section>
  </header>
</template>

<script>
export default {
  props: {
    charts: {
      type: Array,
      default: () => []
    },
    tables: {
      type: Array,
      default: () => []
    },
    chartEnergy: {
      type: Boolean,
      default: () => false
    },
    chartEmissionsVolume: {
      type: Boolean,
      default: () => false
    },
    chartEmissionsIntensity: {
      type: Boolean,
      default: () => false
    },
    chartPrice: {
      type: Boolean,
      default: () => false
    },
    chartTemperature: {
      type: Boolean,
      default: () => false
    },
    summary: {
      type: Boolean,
      default: () => false
    },
    legend: {
      type: Boolean,
      default: () => false
    }
  },

  methods: {
    isEnabled(widgetName) {
      return this[widgetName]
    },

    handleCancelClick() {
      this.$emit('exportCancel')
    },

    handleExportClick() {
      this.$emit('exportClick')
    },

    handleWidgetToggle(widgetName) {
      this.$emit('widgetToggle', widgetName)
    }
  }
}
</script>

<style lang="scss" scoped>
header {
  section:first-child {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
hr {
  margin: 0.3rem 0;
  border-bottom: 1px solid #ddd;
}
.cancel-button {
  margin-right: 1rem;
}
</style>
