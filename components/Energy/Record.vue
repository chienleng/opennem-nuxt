<template>
  <tr :class="{ 'divider': divider }">
    <th>
      {{ rowLabel }}
      <small>{{ rowUnit }}</small>
    </th>

    <td
      class="has-text-right"
      @mouseenter="handleMouseEnter(minDate)"
      @mouseleave="handleMouseLeave">
      <div v-if="isCurrency">{{ minValue | formatCurrency }}</div>
      <div v-else>{{ minValue | formatValue }}{{ rowUnit }}</div>
      <time datetime="minDate">
        {{ minDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
      </time>
    </td>

    <td
      class="has-text-right"
      @mouseenter="handleMouseEnter(maxDate)"
      @mouseleave="handleMouseLeave">
      <div v-if="isCurrency">{{ maxValue | formatCurrency }}</div>
      <div v-else>{{ maxValue | formatValue }}{{ rowUnit }}</div>
      <time datetime="maxDate">
        {{ maxDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
      </time>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    rowLabel: {
      type: String,
      default: () => ''
    },
    rowUnit: {
      type: String,
      default: () => ''
    },
    minDate: {
      type: Number,
      default: () => 0
    },
    minValue: {
      type: Number,
      default: () => 0
    },
    maxDate: {
      type: Number,
      default: () => 0
    },
    maxValue: {
      type: Number,
      default: () => 0
    },
    isCurrency: {
      type: Boolean,
      default: () => false
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    divider: {
      type: Boolean,
      default: () => false
    }
  },

  methods: {
    handleMouseEnter(date) {
      this.$emit('recordMouseEnter', date)
    },

    handleMouseLeave() {
      this.$emit('recordMouseLeave')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
tr.divider {
  th,
  td {
    border-bottom-color: #666;
  }
}
th {
  font-family: $header-font-family;

  small {
    color: #888;
  }
}

td {
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}

time {
  color: #888;
  font-size: 0.9em;
}
</style>
