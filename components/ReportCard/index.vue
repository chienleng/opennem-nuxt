<template>
  <div class="report-card">    
    <header>
      <h1>
        Daily NEM report for 
        <strong>Sunday, 9 Dec 2018</strong>
      </h1>
    </header>

    <section class="total-demand">
      <h2>Renewable contribution to <strong>total demand</strong></h2>
      <div class="value">{{ renewableContributionToTotalDemand }}<span>%</span></div>
    </section>

    <section>
      <h2>Renewable contribution to <strong>regional demand</strong></h2>
      <table>
        <tbody>
          <tr 
            v-for="d in renewableContributionToRegionalDemand"
            :key="d.region">
            <th><abbr :title="d.regionTitle">{{ d.regionAbbr }}</abbr></th>
            <td>{{ d.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="technology">
      <h2>Generation by <strong>technology</strong></h2>
      <table>
        <tbody>
          <tr 
            v-for="d in generationByTechnology"
            :key="d.fuelTech">
            <th>{{ d.fuelTech }}</th>
            <td>{{ d.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
const regions = {
  nsw1: {
    abbr: 'NSW',
    title: 'New South Wales'
  },
  qld1: {
    abbr: 'QLD',
    title: 'Queensland'
  },
  sa1: {
    abbr: 'SA',
    title: 'South Australia'
  },
  tas1: {
    abbr: 'TAS',
    title: 'Tasmania'
  },
  vic1: {
    abbr: 'VIC',
    title: 'Victoria'
  }
}

export default {
  props: {
    reportData: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    renewableContributionToTotalDemand() {
      return this.reportData['energy.region.proportion'].nem
    },

    renewableContributionToRegionalDemand() {
      const allRegions = this.reportData['energy.region.proportion']
      const contributions = []

      Object.keys(allRegions).forEach(d => {
        if (d !== 'nem') {
          contributions.push({
            regionCode: d,
            regionAbbr: regions[d].abbr,
            regionTitle: regions[d].title,
            percentage: allRegions[d]
          })
        }
      })
      return contributions
    },

    generationByTechnology() {
      const allTechnology = this.reportData['energy.technology.proportion']
      const contributions = []

      Object.keys(allTechnology).forEach(d => {
        contributions.push({
          fuelTech: d,
          percentage: allTechnology[d]
        })
      })
      return contributions
    }
  },

  mounted() {
    console.log(this.reportData)
  }
}
</script>

<style lang="scss" scoped>
$card-width: 300px;
$section-left-width: 37%;
$section-right-width: 63%;
$card-padding: 0.3rem;
$cell-padding: 0.1rem;

.report-card {
  max-width: $card-width;
  border: 2px solid #fff;
}

abbr[title],
acronym[title] {
  text-decoration: none;
  border-bottom: 1px dashed #000;
}

header {
  background-color: var(--color-primary);
  padding: $card-padding;

  h1 {
    font-size: 11px;
    text-align: center;
    color: var(--color-contrast-lower);
  }
}

section {
  display: flex;
  margin-bottom: $card-padding;

  &:first-of-type {
    margin-top: $card-padding;
  }

  h2 {
    font-size: 11px;
    width: $section-left-width;
    text-align: right;
    padding: $card-padding;
    border-right: 1px solid #fff;
  }

  .value {
    width: $section-right-width;
    text-align: center;
    padding: 0rem;
    font-size: 48px;
    font-weight: 600;
    position: relative;
    top: -5px;

    span {
      font-size: 24px;
      position: relative;
      top: -16px;
    }
  }

  table {
    width: $section-right-width;
    font-size: 11px;

    th,
    td {
      padding: $cell-padding;
    }
    th {
      text-align: right;
      width: $section-left-width;
    }
  }
}

.technology {
  table th {
    text-transform: capitalize;
  }
}
</style>
