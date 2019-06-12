<template>
  <header>
    <div class="header-dropdowns">
      <logo class="header-logo" />
      <h1>Energy</h1>
      <region-dropdown />
    </div>

    <!-- <div class="buttons has-addons">
      <span class="button is-rounded">Image</span>
      <span class="button is-rounded">Data</span>
    </div> -->
  </header>
</template>

<script>
import Logo from '~/components/ui/Logo'
import RegionDropdown from '~/components/ui/RegionDropdown'

export default {
  components: {
    Logo,
    RegionDropdown
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

header {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  padding: $app-padding / 2;

  h1 {
    font-family: $header-font-family;
    font-size: 1.6rem;
    font-weight: 700;
    margin-right: $app-padding;
    padding-right: $app-padding;
    border-right: $border-style;
  }

  .header-logo {
    width: 3rem;
    margin: 0.2rem $app-padding / 2;
    position: relative;
    top: 3px;
  }

  .header-dropdowns {
    display: flex;
    align-items: center;
  }
}
</style>
