import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      nem: []
    }),
    mutations: {
      nem(state, data) {
        state.nem = data
      }
    },
    getters: {
      nemLength: state => state.nem.length,
      nemData: state => state.nem
    }
  })
}

export default createStore
