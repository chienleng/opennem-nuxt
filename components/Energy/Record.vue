<template>
  <tr>
    <th>
      {{ rowLabel }}
      <small>{{ rowUnit }}</small>
    </th>

    <td
      class="has-text-right"
      @mouseenter="handleMouseEnter(minDate)"
      @mouseleave="handleMouseLeave">
      <div v-if="isCurrency">{{ minValue | formatCurrency }}</div>
      <div v-else>{{ minValue | formatValue }}</div>
      <time datetime="minDate">
        {{ minDate | formatDate }}
      </time>
    </td>

    <td
      class="has-text-right"
      @mouseenter="handleMouseEnter(maxDate)"
      @mouseleave="handleMouseLeave">
      <div v-if="isCurrency">{{ maxValue | formatCurrency }}</div>
      <div v-else>{{ maxValue | formatValue }}</div>
      <time datetime="maxDate">
        {{ maxDate | formatDate }}
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
th {
  font-family: $header-font-family;

  small {
    color: #999;
  }
}
</style>
