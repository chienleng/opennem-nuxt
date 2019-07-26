<template>
  <section class="legend">
    <div
      v-for="(domain, index) in domains"
      :key="`domain-${index}`"
      class="legend-item">
      <span
        :style="{
          'background-color': domain.colour
        }"
        class="colour-square" />
      {{ domain.label }}
    </div>
  </section>
</template>

<script>
export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.legend {
  display: flex;
  flex-wrap: wrap;
  margin: 0 1rem;
  font-size: 11px;

  .legend-item {
    width: 33%;
    display: flex;
    align-items: center;
    padding: 0.1rem;
  }
}
.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 15px;
  height: 15px;
  margin-right: 0.5rem;
}
</style>
