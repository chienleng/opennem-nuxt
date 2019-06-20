<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option
        v-for="(g, index) in groups"
        :key="index"
        :value="g">
        {{ g }}
      </option>
    </select>
  </div>
</template>

<script>
const groups = [
  'Default',
  'Simplified',
  'Flexibility',
  'Renewable/Fossil',
  'Solar/Residual'
]

export default {
  data() {
    return {
      groups,
      selected: groups[0]
    }
  },

  computed: {
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    }
  },

  watch: {
    selected(newValue) {
      this.triggerGroupChange()
    },
    fuelTechGroup(group) {
      this.selected = group
    }
  },

  mounted() {
    this.selected = this.fuelTechGroup
  },

  methods: {
    triggerGroupChange() {
      this.$store.dispatch('fuelTechGroup', this.selected)
    }
  }
}
</script>
