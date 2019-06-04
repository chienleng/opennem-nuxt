<template>
  <div class="data-options-bar">
    <div class="buttons has-addons">
      <span class="button is-rounded">1D</span>
      <span class="button is-rounded">3D</span>
      <span class="button is-rounded is-selected">7D</span>
      <span class="button is-rounded">30D</span>
      <span class="button is-rounded">1Y</span>
      <span class="button is-rounded">ALL</span>
    </div>

    <div class="buttons has-addons">
      <span class="button is-rounded">5m</span>
      <span class="button is-rounded is-selected">30m</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.data-options-bar {
  display: flex;
  align-items: center;
  padding: $app-padding;
}
</style>
