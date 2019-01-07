import axios from 'axios'

const apiClient = axios.create({
  baseURL: `https://data.opennem.org.au`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export default {
  getEnergyByRegion(region) {
    return apiClient.get(`/testing/${region}/energy/monthly/all.json`)
  },
  getEnergyByRegionYear(region, year) {
    return apiClient.get(`/testing/${region}/energy/daily/${year}.json`)
  },
  getPowerByRegionYearWeek(region, year, weekNum) {
    return apiClient.get(
      `/power/history/5minute/${region}_${year}W${weekNum}.json`
    )
  },
  getPowerByRegion(region) {
    return apiClient.get(`/power/${region}.json`)
  },
  // getPowerByRegion(region) {
  //   return apiClient.get(`/testing/${region}/power/5m/live.json`)
  // },
  getTestData() {
    return axios.get('http://localhost:3000/data/nem.json')
  }
}
