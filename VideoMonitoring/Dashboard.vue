<template>
  <q-page class="q-pa-md" style="background-color: whitesmoke">
    <q-layout view="hhh LpR ffr" style="min-height: auto">

      <q-drawer
          side="right"
          v-model="drawer"
          show-if-above
          :mini="!drawer || miniState"
          @click.capture="drawerClick"
          :width="300"
          :breakpoint="500"
          class="border-for-right-drawer"
      >
        <q-list style="padding: 90px 10px">
          <q-item>
            <q-item-section avatar>
              <q-icon name="open_in_new" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              Выберите виджеты:
            <div class="q-pa-md">
              <q-option-group
                  :options="groupWidgets"
                  type="checkbox"
                  v-model="selectedWidgets"
              />
            </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-btn color="primary" label="Сброс" @click="cancelStateGridLayout"/>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="q-mini-drawer-hide absolute" style="top: 95px; right: 15px">
          <q-btn
              dense
              round
              unelevated
              icon="close"
              @click="miniState = true"
          />
        </div>
      </q-drawer>

      <q-page-container style="padding-top: 0 !important; padding-bottom: 0px !important;">
        <q-page style="background-color: transparent; background-image: none; min-height: auto">
          <my-grid-layout :key="myGridLayoutKey" :layout="layout" :selectedWidgets="selectedWidgets" v-on:change-layout="changeLayout" />
        </q-page>
      </q-page-container>

    </q-layout>
  </q-page>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import MyGridLayout from "../components/MyGridLayout";
import {GRID_LAYOUT_STANDARD} from "../constants";

const layoutDashboardKey = 'dashboard_layout';
const selectedWidgetsKey = 'selected_widgets';
// const countWidgetsKey = 'count_widgets';

export default {
  name: "Dashboard",
  components: {
      MyGridLayout
  },
  data() {
    return {
      drawer: true,
      miniState: true,
      groupWidgets: [
        { label: 'Диск (лимит)', value: 'DiskLimitWidget' },
        { label: 'Транспорт', value: 'ObjectsLimitWidget' },
        { label: 'Устройства', value: 'DevicesLimitWidget' },
        { label: 'Камеры', value: 'CamerasLimitWidget' },
        { label: 'Диск', value: 'StorageWidget' },
        { label: 'Задания', value: 'TasksWidgetAll' },
        { label: 'Снимки', value: 'SnapshotsWidget' },
        { label: 'Транспорт не на связи', value: 'OfflineWidget' },
      ],
      selectedWidgets: localStorage[selectedWidgetsKey] ? JSON.parse(localStorage[selectedWidgetsKey]) : [
        'DiskLimitWidget',
        'ObjectsLimitWidget',
        'DevicesLimitWidget',
        'CamerasLimitWidget',
        'StorageWidget',
        'TasksWidgetAll',
        'SnapshotsWidget',
        'OfflineWidget'
      ],
      countWidgets: GRID_LAYOUT_STANDARD.length,
      layout: localStorage[layoutDashboardKey] ? JSON.parse(localStorage[layoutDashboardKey]) : GRID_LAYOUT_STANDARD,
      myGridLayoutKey: 0
    }
  },

  mounted() {
    this.setTitle('Дашборд')
    // if (!localStorage[countWidgetsKey] || localStorage[countWidgetsKey] !== this.countWidgets) {
    //   localStorage[countWidgetsKey] = this.countWidgets
    // }

    if (this.countWidgets > this.layout.length) {
      const indexArray = []

      this.layout.forEach((itemL, indexL) => {
        GRID_LAYOUT_STANDARD.forEach((itemS, indexS) => {
          if(itemL.content === itemS.content) {
            // console.debug(indexS)
            indexArray.push(indexS)
          }
        })
      })

      const newWidgetsArray = GRID_LAYOUT_STANDARD.filter((item, index) => !indexArray.includes(index))

      newWidgetsArray.forEach(item => {
        this.layout.push(item)
        this.selectedWidgets.push(item.content)
      })
    }

    // setInterval(() => this.myGridLayoutKey++, 1000)

  },

  watch: {
    selectedWidgets(n) {
      localStorage[selectedWidgetsKey] = JSON.stringify(n)
    }
  },

  methods: {
    ...mapActions({
      'setTitle': 'layout/setToolbarTitle'
    }),

    cancelStateGridLayout() {
      this.layout = GRID_LAYOUT_STANDARD
      this.selectedWidgets = [
        'DiskLimitWidget',
        'ObjectsLimitWidget',
        'DevicesLimitWidget',
        'CamerasLimitWidget',
        'StorageWidget',
        'TasksWidgetAll',
        'SnapshotsWidget',
        'OfflineWidget'
      ]
    },

    changeLayout(newLayout) {
      // console.debug(newLayout)
      this.layout = newLayout
      localStorage[layoutDashboardKey] = JSON.stringify(newLayout)
      // console.debug('layouts', this.layout === GRID_LAYOUT_STANDARD, this.layout, GRID_LAYOUT_STANDARD)
    },

    drawerClick (e) {
      if (this.miniState) {
        this.miniState = false
        e.stopPropagation()
      }
    },
  },

  computed: {
    ...mapGetters({
      'server': "server/instance"
    }),
  }
}
</script>

<style scoped>

</style>