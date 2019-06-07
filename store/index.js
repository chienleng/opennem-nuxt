import cloneDeep from 'lodash.clonedeep'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import * as FUEL_TECH_GROUPS from '~/constants/fuelTechDefaultGroup.js'

export const state = () => ({
  nem: [],
  fuelTechMeta: null,
  fuelTechNames: null,
  fuelTechGroup: null,
  fuelTechOrder: cloneDeep(FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER)
})

export const mutations = {
  nem(state, data) {
    state.nem = data
  },
  fuelTechMeta(state, data) {
    state.fuelTechMeta = cloneDeep(data)
  },
  fuelTechNames(state, data) {
    state.fuelTechNames = cloneDeep(data)
  },
  fuelTechGroup(state, data) {
    state.fuelTechGroup = cloneDeep(data)
  },
  fuelTechOrder(state, data) {
    state.fuelTechOrder = data
  }
}

export const getters = {
  nemLength: state => state.nem.length,
  nemData: state => state.nem,
  fuelTechMeta: state => state.fuelTechMeta,
  fuelTechNames: state => state.fuelTechNames,
  fuelTechGroup: state => state.fuelTechGroup,
  fuelTechOrder: state => state.fuelTechOrder
}

export const actions = {
  fuelTechMeta({ commit }, data) {
    commit('fuelTechMeta', data)
  },
  fuelTechNames({ commit }, data) {
    commit('fuelTechNames', data)
  },
  fuelTechGroup({ commit }, data) {
    commit('fuelTechGroup', data)
  },
  fuelTechOrder({ commit }, data) {
    commit('fuelTechOrder', data)
  }
}
