<template>
  <section>
    <div 
      v-for="(d) in nemData"
      :key="d.id"
      :class="{ 
        'selected': d.id === selected
      }"
      class="item"
      @click="handleItemClicked(d.id)">

      <div class="item-title">
        <!-- {{ d.id }} -->
        {{ d.fuel_tech }} {{ d.type }}
      </div>
      
      <!-- <div>
        {{ d.region }} — {{ d.type }} — {{ d.units }} — {{ d.fuel_tech }}   
      </div> -->

      <!-- <div>
        data history: <strong>{{ d.history.data.length }}</strong> points
      </div>

      <div>start: <strong>{{ d.history.start | formatDate }}</strong></div>
      <div>last: <strong>{{ d.history.last | formatDate }}</strong></div>
      <div>interval: <strong>{{ d.history.interval }}</strong></div> -->

    </div>
  </section>
</template>

<script>
export default {
  props: {
    nemData: {
      type: Array,
      default: () => []
    },
    selected: {
      type: String,
      default: () => ''
    }
  },

  methods: {
    handleItemClicked(id) {
      this.$emit('selected', id)
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  margin-top: 10px;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}
.item {
  font-size: 9px;
  padding: 2px 4px;
  border-bottom: 1px solid #ddd;

  &.selected {
    background-color: #ccc;
  }

  &.invalid {
    background-color: red;
  }

  .item-title {
    font-size: 11px;
    font-weight: bold;
  }
}
</style>
