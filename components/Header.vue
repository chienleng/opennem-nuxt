<template>
  <header>
    <div class="header-dropdowns">
      <Logo class="header-logo" />
      <h1>All Regions</h1>
      <h2>Energy</h2>
    </div>

    <div class="header-buttons">
      <a class="button">Share</a><a class="button">Get Data</a>
    </div>
  </header>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style lang="scss" scoped>
$header-font-family: 'Playfair Display', Georgia, 'Times New Roman', Times,
  serif;
$right-pad: 1rem;
$right-margin: 1rem;
$border-style: 1px dotted #cdcdcd;
$header-bg: hsla(30, 14%, 91%, 0.9);

header {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);
  background-color: $header-bg;
  position: sticky;
  top: 0;
  z-index: 999;

  h1 {
    font-family: $header-font-family;
    font-size: 1.6rem;
    font-weight: bold;
    margin-right: $right-margin;
    padding-right: $right-pad;
    border-right: $border-style;
  }
  h2 {
    font-family: $header-font-family;
    font-size: 1.6rem;
    font-weight: bold;
    margin-right: $right-margin;
    padding-right: $right-pad;
    border-right: $border-style;
  }

  .header-logo {
    width: 2.2rem;
    margin: 0.2rem $right-margin;
    position: relative;
    top: 3px;
  }

  .header-dropdowns {
    display: flex;
    align-items: center;
  }
}
</style>
