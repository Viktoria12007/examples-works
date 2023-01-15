<template>
  <grid-layout :layout="layout"
               :col-num="12"
               :row-height="60"
               :is-draggable="draggable"
               :is-resizable="resizable"
               :vertical-compact="true"
               :use-css-transforms="true"
               :margin="[10, 10]"
               @layout-updated="layoutUpdatedEvent"
  >
    <grid-item v-for="(item) in layout"
               :key="item.i"
               :static="item.static"
               :x="item.x"
               :y="item.y"
               :w="item.w"
               :minW="item.minW"
               :h="item.h"
               :minH="item.minH"
               :i="item.i"
               v-if="checkCondition(item)"
               @container-resized="containerResizedEvent"
               @resized="resizedEvent"
               ref="itemsLayout"

    >
      <component v-on:close-unit-dialog="closeUnitDialog" :is="`${item.content}`" :now="now" :height="heightArray ? heightArray[Number(item.i)] : 300" :width="widthArray ? widthArray[Number(item.i)] : 300">
        <template #widget="slotProps">
          <template v-if="item.content === 'OfflineWidget'">
            <q-card-section>
              <div class="row justify-between">
                <div>
                  <div class="custom-dashboard-title">Транспорт не на связи</div>
                  <div style="font-size: 18px" id="checkFontFamily">Всего {{slotProps.data.total}}</div>
                </div>
<!--                <div style="display: flex">-->
                  <q-btn @click="slotProps.update()" icon="autorenew" color="grey-6" flat dense outline :class="{'custom-widget-button': slotProps.data.updating}" style="align-self: flex-start"></q-btn>
<!--                  <i :class="`${slotProps.data.icon}`" style="font-size: 20px; color: #616161; padding-top: 7px"></i>-->
<!--                </div>-->
              </div>
            </q-card-section>
          </template>
          <template v-else-if="item.content !== 'OfflineWidget' && !item.content.includes('Limit')">
            <q-card style="height: 100%;">
              <q-card-section style="height: 100%; display: flex; flex-direction: column; align-items: center;">
                <template v-if="item.content === 'StorageWidget' || item.content === 'TasksWidgetAll'">
                  <div class="row justify-between items-center" style="align-self: stretch">
                    <div class="custom-dashboard-title">{{slotProps.data.name}}</div>
<!--                    <div style="display: flex">-->
                      <q-btn @click="slotProps.update()" icon="autorenew" color="grey-6" flat dense outline :class="{'custom-widget-button': slotProps.data.updating}" style="align-self: flex-start"></q-btn>
<!--                      <i :class="`${slotProps.data.icon}`" style="font-size: 20px; color: #616161; padding-top: 7px"></i>-->
<!--                    </div>-->
                  </div>
                </template>
                <template v-else>
                  <div class="row justify-between" style="align-self: stretch">
                    <div>
                      <div class="custom-dashboard-title">{{slotProps.data.name}}</div>
                      <div style="font-size: 18px">Всего {{slotProps.data.total | numberWithSpaces}}</div>
                    </div>
<!--                    <div style="display: flex">-->
                      <q-btn @click="slotProps.update()" icon="autorenew" color="grey-6" flat dense outline :class="{'custom-widget-button': slotProps.data.updating}" style="align-self: flex-start"></q-btn>
<!--                      <i :class="`${slotProps.data.icon}`" style="font-size: 20px; color: #616161; font-weight: normal; padding-top: 7px"></i>-->
<!--                    </div>-->
                  </div>
                </template>
                <apexchart v-if="item.content !== 'TasksWidgetAll' && slotProps.data.loaded && slotProps.data.updatedProps" :height="`${(slotProps.props.height ? slotProps.props.height : 250) * 0.85}px`" :width="`${(slotProps.props.width ? slotProps.props.width : 250) * 0.9}px`" :series="slotProps.apexChartData" :options="slotProps.apexChartOptions" class="custom-pie-donut"></apexchart>
                <template v-if="item.content === 'TasksWidgetAll'">
                  <div style="display: flex; align-items: flex-start">
                    <apexchart v-if="slotProps.data.loaded && slotProps.data.updatedProps" :height="`${(slotProps.props.height ? slotProps.props.height : 250) * 0.85}px`" :width="`${(slotProps.props.width ? slotProps.props.width : 250) * 0.45}px`" :series="slotProps.apexChartData" :options="slotProps.apexChartOptions" class="custom-pie-donut"></apexchart>
                    <apexchart v-if="slotProps.data.loaded && slotProps.data.updatedProps" :height="`${(slotProps.props.height ? slotProps.props.height : 250) * 0.85}px`" :width="`${(slotProps.props.width ? slotProps.props.width : 250) * 0.45}px`" :series="slotProps.apexChartData2" :options="slotProps.apexChartOptions2" class="custom-pie-donut"></apexchart>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </template>
          <template v-else-if="item.content !== 'OfflineWidget' && item.content.includes('Limit')">
            <div style="height: 100%; position: relative">
              <q-btn @click="slotProps.update()" icon="autorenew" color="grey-6" flat dense outline :class="{'custom-widget-button': slotProps.data.updating}" style="position: absolute; top: 3%; right: 3%; margin-right: 10px"></q-btn>
              <apexchart v-if="slotProps.data.loaded && slotProps.data.updatedProps" :height="`${(slotProps.props.height ? slotProps.props.height : 140) * 0.9}px`" :width="`${(slotProps.props.width ? slotProps.props.width : 140) * 0.9}px`" :series="slotProps.apexChartData" :options="slotProps.apexChartOptions" class="custom-radial-bar_limit"></apexchart>
            </div>
          </template>
        </template>
      </component>
    </grid-item>
  </grid-layout>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import StorageWidget from "./StorageWidget";
import SnapshotsWidget from "./SnapshotsWidget";
import OfflineWidget from "./OfflineWidget";
import TasksWidgetAll from "./TasksWidgetAll";
import DiskLimitWidget from "./DiskLimitWidget";
import ObjectsLimitWidget from "./ObjectsLimitWidget";
import DevicesLimitWidget from "./DevicesLimitWidget";
import CamerasLimitWidget from "./CamerasLimitWidget";
import VueApexCharts from 'vue-apexcharts';
import {numberWithSpaces} from "../utils";

export default {
  name: 'MyGridLayout',
  components: {
    StorageWidget,
    SnapshotsWidget,
    OfflineWidget,
    TasksWidgetAll,
    DiskLimitWidget,
    ObjectsLimitWidget,
    DevicesLimitWidget,
    CamerasLimitWidget,
    apexchart: VueApexCharts,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  props: {
    layout: {
      required: true,
      type: Array,
    },
    selectedWidgets: {
      required: false,
      type: Array,
    }
  },

  data() {
    return {
      draggable: true,
      resizable: true,
      heightArray: null,
      widthArray: null,
      now: Date.now(),
      timeoutID: null,
      banResizedContainer: false
    }
  },

  filters: {
    numberWithSpaces
  },

  mounted() {
    this.timeoutID = setInterval(this.setNow , 1000)
    // const myEl = document.getElementById('checkFontFamily')
    // console.debug(myEl)
    // const res = window.getComputedStyle(myEl, null)
    // console.debug(res)
  },

  destroyed() {
    clearInterval(this.timeoutID)
  },

  methods: {
    setNow() {
      this.now = Date.now()
    },

    updateHeight() {
      // console.debug(this.$refs.itemsLayout)
        this.heightArray = this.$refs.itemsLayout.map(item => {
          // console.debug(item.$el.clientHeight)
          return item.$el.clientHeight
        })

      console.debug('heights:', this.heightArray)
    },

    updateWidth() {
        this.widthArray = this.$refs.itemsLayout.map(item => {
           return item.$el.clientWidth
        })

      console.debug('widths:', this.widthArray)
    },

    resizedEvent(i, newH, newW, newHPx, newWPx) {
      console.debug("RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
      this.updateSize()
    },

    async updateSize() {
      this.$refs.itemsLayout.sort((a, b) => {
        return Number(a.i) - Number(b.i)
      })
      console.debug(this.$refs.itemsLayout)

      this.updateHeight()
      this.updateWidth()
    },

    checkCondition(item) {
      if (this.selectedWidgets) {
        // console.debug(this.$refs.itemsLayout)
        return this.selectedWidgets.toString().includes(`${item.content}`)
      }
      else {
        // console.debug(this.$refs.itemsLayout)
        return true
      }
    },

    layoutUpdatedEvent(newLayout){
      console.debug("Updated layout: ", newLayout)
        this.$emit('change-layout', newLayout)
        this.updateSize()
    },

    containerResizedEvent: function(i, newH, newW, newHPx, newWPx){
      if (!this.banResizedContainer) {
        console.debug("CONTAINER RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx)
        setTimeout(() => this.updateSize(), 200)
      }
    },

    closeUnitDialog() {
      console.debug('close to parent')
      this.banResizedContainer = true
      setTimeout(() => this.banResizedContainer = false, 200)
    }
  },

  computed: {

  }

}
</script>

<style>
  .custom-radial-bar_limit > .apexcharts-canvas > svg > foreignObject > .apexcharts-legend {
    /*top: 20% !important;*/
    /*vertical-align: center;*/
    /*text-align: center;*/

    display: flex;
    justify-content: center;
  }

  /*.custom-radial-bar_limit > .apexcharts-canvas > svg > foreignObject > .apexcharts-legend > .apexcharts-legend-series {*/
  /*  height: 39px;*/
  /*}*/

  .custom-pie-donut > .apexcharts-canvas > svg > foreignObject > .apexcharts-legend {
    /*top: !important;*/
    /*vertical-align: center;*/
    display: flex;
    justify-content: center;
  }

  .custom-widget-button * .q-icon {
    animation: loading .2s infinite linear;
  }

  @keyframes loading {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>