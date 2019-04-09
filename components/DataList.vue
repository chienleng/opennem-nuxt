<template>
  <nav class="panel">
    <p class="panel-heading has-background-dark has-text-white">
      properties
    </p>
    <!-- <div class="panel-block">
      <p class="control has-icons-left">
        <input
          class="input is-small"
          type="text"
          placeholder="search">
        <span class="icon is-small is-left">
          <i
            class="fas fa-search"
            aria-hidden="true" />
        </span>
      </p>
    </div>
    <p class="panel-tabs">
      <a class="is-active">all</a>
      <a>public</a>
      <a>private</a>
      <a>sources</a>
      <a>forks</a>
    </p> -->
    <div
      :style="{
        'max-height': `${height}px`
      }"
      class="panel-scrollbody"
    >
      <a
        v-for="(d) in nemData"
        :key="d.id"
        :class="{ 
          'is-active': d.id === selected
        }"
        class="panel-block"
        @click="handleItemClicked(d.id)">
        <strong>{{ d.fuel_tech }}</strong>: {{ d.type }}
      </a>
    </div>
    
    <!-- <label class="panel-block">
      <input type="checkbox">
      remember me
    </label> -->
    <div 
      class="panel-block"
      style="border-top: 1px solid #000;">
      length: {{ nemDataLength }}
      <!-- <button class="button is-link is-outlined is-fullwidth">
        reset all filters
      </button> -->
    </div>
  </nav>
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

  data() {
    return {
      height: 0
    }
  },

  computed: {
    nemDataLength() {
      return this.nemData.length
    }
  },

  mounted() {
    this.height = window.innerHeight - 150
  },

  methods: {
    handleItemClicked(id) {
      this.$emit('selected', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel {
  font-size: 80%;
  padding: 1rem;

  .panel-heading {
    box-shadow: 0 2px 4px rgba(100, 100, 100, 0.1);
  }

  .panel-scrollbody {
    overflow-y: auto;
  }
}
</style>
