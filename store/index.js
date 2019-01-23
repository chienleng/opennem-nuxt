import Vuex from 'vuex'
import * as FUEL_TECHS from '~/constants/fuelTech.js'

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      nem: [],
      fuelTechOrder: FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER
    }),
    mutations: {
      nem(state, data) {
        state.nem = data
      },
      fuelTechOrder(state, data) {
        state.fuelTechOrder = data
      }
    },
    getters: {
      nemLength: state => state.nem.length,
      nemData: state => state.nem,
      fuelTechOrder: state => state.fuelTechOrder
    },
    actions: {
      fuelTechOrder({ commit }, data) {
        commit('fuelTechOrder', data)
      }
    }
  })
}

export default createStore
