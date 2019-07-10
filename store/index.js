import cloneDeep from 'lodash.clonedeep'
import * as FUEL_TECHS from '~/constants/fuelTech.js'

export const state = () => ({
  currentView: 'energy', // energy, facilities
  nem: [],
  fuelTechMeta: null,
  fuelTechNames: null,
  fuelTechGroup: 'Default',
  fuelTechOrder: cloneDeep(FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER),
  range: '30D',
  interval: 'Day',
  exportData: [],
  responsiveBreakWidth: 769,
  facilitySelectedTechs: []
})

export const mutations = {
  currentView(state, data) {
    state.currentView = data
  },
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
  },
  exportData(state, data) {
    state.exportData = data
  },
  responsiveBreakWidth(state, data) {
    state.responsiveBreakWidth = data
  },
  facilitySelectedTechs(state, data) {
    state.facilitySelectedTechs = data
  }
}

export const getters = {
  currentView: state => state.currentView,
  nemLength: state => state.nem.length,
  nemData: state => state.nem,
  fuelTechMeta: state => state.fuelTechMeta,
  fuelTechNames: state => state.fuelTechNames,
  fuelTechGroup: state => state.fuelTechGroup,
  fuelTechOrder: state => state.fuelTechOrder,
  range: state => state.range,
  interval: state => state.interval,
  exportData: state => state.exportData,
  responsiveBreakWidth: state => state.responsiveBreakWidth,
  facilitySelectedTechs: state => state.facilitySelectedTechs
}

export const actions = {
  currentView({ commit }, data) {
    commit('currentView', data)
  },
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
  },
  exportData({ commit }, data) {
    commit('exportData', data)
  },
  responsiveBreakWidth({ commit }, data) {
    commit('responsiveBreakWidth', data)
  },
  facilitySelectedTechs({ commit }, data) {
    commit('facilitySelectedTechs', data)
  }
}
