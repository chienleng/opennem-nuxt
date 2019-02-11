import DataService from './DataService.js'

const helpers = {
  getEnergyByRegion(region, cb) {
    DataService.getEnergyByRegion(region).then(res => {
      cb('energy', res.config.url, res.data)
    })
  },

  getEnergyByRegionYear(region, year, cb) {
    DataService.getEnergyByRegionYear(region, year).then(res => {
      cb('energy', res.config.url, res.data)
    })
  },

  getPowerByRegion(region, cb) {
    DataService.getPowerByRegion(region).then(res => {
      cb('power', res.config.url, res.data)
    })
  }
}

export default helpers
