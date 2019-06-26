import cloneDeep from 'lodash.clonedeep'
import * as FUEL_TECHS from '~/constants/fuelTech.js'

export const state = () => ({
  nem: [],
  fuelTechMeta: null,
  fuelTechNames: null,
  fuelTechGroup: 'Default',
  fuelTechOrder: cloneDeep(FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER),
  range: '7D',
  interval: '30m'
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
  },
  range(state, data) {
    state.range = data
  },
  interval(state, data) {
    state.interval = data
  }
}

export const getters = {
  nemLength: state => state.nem.length,
  nemData: state => state.nem,
  fuelTechMeta: state => state.fuelTechMeta,
  fuelTechNames: state => state.fuelTechNames,
  fuelTechGroup: state => state.fuelTechGroup,
  fuelTechOrder: state => state.fuelTechOrder,
  range: state => state.range,
  interval: state => state.interval
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
  },
  range({ commit }, data) {
    commit('range', data)
  },
  interval({ commit }, data) {
    commit('interval', data)
  }
}
