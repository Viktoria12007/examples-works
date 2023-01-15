<template lang="pug">
  .d-flex.flex-column.flex-grow-1.overflow-hidden(v-if="selectedObjects.length > 0")
    .d-flex.align-items-center.justify-content-between.p-2.item-info.title(v-if="variantList !== 'outMonitoring'")
      .d-flex.align-items-center
        b-form-checkbox(v-model="allSelectedFoundObjects" :indeterminate="indeterminate" @change="toggleAllSelectedFoundObjects")
        a(href="#", @click="sortingNameObject()" :class="view !== 0 ? 'not-active' : ''")
          .d-inline-block.mr-1.text-body {{$t('monitoring.nameobject')}}
          b-icon(:icon="sortName === null ? 'arrows-expand' : (sortName ? 'caret-down-fill' : 'caret-up-fill')", variant="dark")
      div
        a.mr-2(href="#", @click="sortingStateObject()" :class="view !== 0 ? 'not-active' : ''")
          .d-inline-block.mr-1.text-body {{$t('monitoring.state')}}
          b-icon(:icon="sortState === null ? 'arrows-expand' : (sortState ? 'caret-down-fill' : 'caret-up-fill')", variant="dark")
        b-button.p-0(variant="link", @click="visibleAllObjects")
          b-icon(:icon="allVisible ? 'eye' : 'eye-slash'", variant="dark")
    template(v-if="variantList === 'outMonitoring'")
      b-form-checkbox.ml-1.mb-2(v-if="view === 0" v-model="allSelectedFoundObjects" :indeterminate="indeterminate" @change="toggleAllSelectedFoundObjects") {{$t('tracks.objects')}}
      div.d-flex.align-items-center.justify-content-between.p-1.mb-1(v-if="view !== 0")
        b-form-checkbox(v-model="allSelectedFoundObjects" :indeterminate="indeterminate" @change="toggleAllSelectedFoundObjects") {{$t('tracks.objects')}}
        b-button(:pressed.sync="openStatusGroups", variant="primary", size="sm") {{openStatusGroups ? 'Скрыть все группы' : 'Раскрыть все группы'}}
    q-virtual-scroll(ref="virtualScroll", v-if="rr && currentList.length > 0", @mouseleave="hideTooltip(hoverObject)", @virtual-scroll="scrolled($event)", :items="currentList", separator, virtual-scroll-item-size="34")
      template(v-slot="{ item, index }")
        template(v-if="item.group !== undefined")
          b-button.w-100.border-bottom.group-header(squared, size="sm", :key="item.index", :variant="item.group.Open ? 'white' : 'light'" :active="item.group.Open", @click="item.group.Open = !item.group.Open;")
            .d-flex.w-100.align-items-center
              .pr-2
                b-icon(:icon="item.group.Open ? 'chevron-down' : 'chevron-right'", :variant="item.group.Open ? 'success' : 'dark'")
              b-form-checkbox.checkbox-without-animation(:indeterminate="checkGroupSelectIndeterminate(item.group)",  @change="onCheckedObjectsGroup(item.group, $event)")
              .objects-list--name.w-100.d-flex.pr-2.align-items-center.font-weight-bolder {{ `${item.group.Name} (${filterGroup(item.group.Objects).length})` }}
              b-button.p-0.ml-2(v-if="item.group.Edit && isAdmin && variantList === 'monitoring' && view === 1", variant="link", size="sm", @click.stop="$bvModal.show(`edit-shared-group-obj-${item.group.Id}`)")
                b-icon(icon="pencil", variant="dark")
              b-modal(:id="`edit-shared-group-obj-${item.group.Id}`", :title="$t('monitoring.editsharedgroup')", centered, body-class="objects-modal", @show="nameGroup = item.group.Name", @ok="modalEditGroup(item.group.Id, nameGroup, currentAccountingUnit)")
                b-row
                  b-col(md="12")
                    b-form-input(v-model="nameGroup", required, autofocus, :placeholder="$t('monitoring.enternamegroup')", type="text")
                template(v-slot:modal-footer="{ ok, hide }")
                  .w-100.d-flex.modal-btn
                    b-button.mr-2.float-left(@click="ok()", variant="success", size="sm", :disabled="nameGroup === '' ? 'disabled' : null") {{$t('actionsList.change')}}
                    b-button.float-right(@click="hide()", variant="danger", size="sm") {{$t('actionsList.cancel')}}
              b-button.p-0.ml-2(v-if="item.group.Edit && isAdmin && variantList === 'monitoring' && view === 1", variant="link", size="sm", @click.stop="deleteObjectsGroup(item.group.Id, currentAccountingUnit)")
                b-icon(icon="trash", variant="danger")
              b-button.p-0.ml-2(v-if="item.group.Edit && variantList === 'monitoring' && view === 2", variant="link", size="sm", @click.stop="$bvModal.show(`edit-private-group-obj-${item.group.Id}`)")
                b-icon(icon="pencil", variant="dark")
              b-modal(:id="`edit-private-group-obj-${item.group.Id}`", :title="`Редактрирование приватной группы`", centered, body-class="objects-modal", @show="nameGroup = item.group.Name", @ok="modalEditGroupPrivate(item.group.Id, nameGroup)")
                b-row
                  b-col(md="12")
                    b-form-input(v-model="nameGroup", required, autofocus, :placeholder="$t('monitoring.enternamegroup')", type="text")
                template(v-slot:modal-footer="{ ok, hide }")
                  .w-100.d-flex.modal-btn
                    b-button.mr-2.float-left(@click="ok()", variant="success", size="sm", :disabled="nameGroup === '' ? 'disabled' : null") {{$t('actionsList.change')}}
                    b-button.float-right(@click="hide()", variant="danger", size="sm") {{$t('actionsList.cancel')}}
              b-button.p-0.ml-2(v-if="item.group.Edit && variantList === 'monitoring' && view === 2", variant="link", size="sm", @click.stop="deleteObjectsGroupPrivate(item.group.Id)")
                b-icon(icon="trash", variant="danger")
              b-button.p-0.ml-2(v-if="variantList === 'monitoring'", variant="link", size="sm", @click.stop="visibleObjectGroup(item.group)")
                b-icon(:icon="item.group.Visible ? 'eye' : 'eye-slash'", variant="dark")
        template(v-else)
          b-button.w-100.border-bottom(
            :key="item.index", squared, variant="light", size="sm",
            :target-id="item.value.id",
            :title="item.value.data.Name",
            :pressed="variantList !== 'outMonitoring' ? item.value.id === activeObject : null",
            @mouseenter="variantList !== 'outMonitoring' ? altSetTooltip($event.target, item.value.reactive, item.value.id) : null",
            @click="variantList !== 'outMonitoring' ? setActiveObject(item.value.id, index) : null"
          )
            .d-flex.w-100.align-items-center
              .pr-2(v-if="item.groupId")
                b-icon(icon="blank")
              .pr-0(@click.stop)
                b-form-checkbox.list-groups-checkbox.checkbox-without-animation(v-model="checkedObjects", :value="item.value.id",  @change="onCheckedObject(item.value)", @click.stop)
              .pr-2
                b-avatar(:src="selectedObjectImages[item.value.id]", size="sm", variant="light", :icon="item.value.data.image ? null : 'cursor-fill'")
              .objects-list--name.w-100.d-flex.pr-2.align-items-center
                span.objects-list--name.text-nowrap {{ item.value.data.Name }}
                b-badge.ml-1(v-if="isAdmin") {{item.value.data.AccountingUnit.Name}}
              b-iconstack.mr-2(font-scale=".8775", :title="$t('monitoring.stateobject')" style="margin-bottom: 1px;")
                b-icon(stacked icon="circle-fill", :style="switchStateColor(item.value.reactive.color)")
                b-icon.text-white(stacked, scale=".7", icon="cursor-fill", v-if="item.value.reactive.speed > item.value.data.RideDetectorSettings.MinSpeed && (item.value.reactive.color === 'Green')")
              b-button.p-0(v-if="variantList !== 'outMonitoring'" variant="link", size="sm", @click.stop="visibleObject(item.value.id, !item.value.visible)", :title="$t('monitoring.visibleobjectinmap')")
                b-icon(:icon="item.value.visible ? 'eye' : 'eye-slash'", variant="dark")
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import switchStateColor from '~/mixins/switchStateColor';

export default {
  name: 'ListGroupsObjects',
  mixins: [switchStateColor],
  props: {
    variantList: {
      type: String,
      default: '',
    },
    sharedGroups: {
      type: Array,
      default () {
        return [];
      },
    },
    privateGroups: {
      type: Array,
      default () {
        return [];
      },
    },
    objectToFind: {
      type: String,
      default: '',
    },
    foundObjects: {
      type: Array,
      default () {
        return [];
      },
    },
    activeObject: {
      type: Number,
      default: null,
    },
    selectedObjectImages: {
      type: Object,
      default () {
        return {};
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    rr: {
      type: Boolean,
      default: true,
    },
    hoverObject: {
      type: Object,
      default () {
        return {};
      },
    },
    selectedObjects: {
      type: Array,
      default () {
        return [];
      },
    },
    view: {
      type: Number,
      default: 0,
    },
    currentAccountingUnit: {
      type: Number,
      default: null,
    },
  },
  data () {
    return {
      openStatusGroups: true,
      checkedObjects: [],
      sortName: null,
      sortState: null,
      allVisible: true,
      nameGroup: '',
      lastChecked: null,
      allSelectedFoundObjects: false,
      selectedFoundObjects: [],
      foundObjectsId: [],
      virtualScrollSliceRange: 0,
      clickCheckboxFlag: false,
      brakeSetScrollPosition: false,
    };
  },
  computed: {
    ...mapGetters('listGroupsObjects', ['sort', 'checkedObjectsOutMonitoring', 'scrollPositionMonitoring', 'scrollPositionOutMonitoring']),
    indeterminate () {
      return this.selectedFoundObjects.length > 0 && this.selectedFoundObjects.length < this.foundObjectsId.length;
    },
    currentList () {
      let group = '';
      if (this.view === 1 && this.sharedGroups.length > 0) {
        group = 'sharedGroups';
      } else if (this.view === 2 && this.privateGroups.length > 0) {
        group = 'privateGroups';
      }

      if (group) {
        const selectedGroups = this[group].filter(el => el.Show);

        const newArr = selectedGroups.map((el) => {
          let objectsOfTheGroup = [];
          if (el.Open) {
            objectsOfTheGroup = el.Objects.filter(({ id }) => this.foundObjectsId.includes(id));
          }
          return [
            { group: el, index: `group${group}_id${el.Id}`, Open: el.Open },
            ...objectsOfTheGroup.map(item => ({
              value: item,
              groupId: `group${group}_id${el.Id}`,
              index: `group${group}_id${el.Id}_item${item.id}`,
            })),
          ];
        });
        return newArr.flat();
      }
      return this.callSortObjects(this.foundObjects.map(item => ({
        value: item,
        index: `_${item.id}`,
      })));
    },
  },
  watch: {
    selectedFoundObjects (n, o) {
      if (n.length === 0) {
        this.allSelectedFoundObjects = false;
      } else if (n.length === this.foundObjectsId.length) {
        this.allSelectedFoundObjects = true;
      } else {
        this.allSelectedFoundObjects = false;
      }
    },
    view (n) {
      if (n === 0 && this.variantList === 'outMonitoring') {
        this.setSelectedStateObjects();
      }
    },
    checkedObjects (n, o) {
      this.$emit('change-checked-objects', n);
    },
    foundObjects (n) {
      this.foundObjectsId = n.map(item => item.id);
      this.selectedFoundObjects = this.checkedObjects.filter(item => this.foundObjectsId.includes(item));
    },
    openStatusGroups (n) {
      this.setOpenStatusGroups(n);
    },
  },
  mounted () {
    // console.debug('ListGroupsObjects mounted');
    this.foundObjectsId = this.foundObjects.map(item => item.id);
    if (this.view === 0 && this.variantList === 'outMonitoring') {
      this.checkedObjects = this.checkedObjectsOutMonitoring.filter(id => this.selectedObjects.find(item => item.id === id));
      this.setSelectedStateObjects();
    }
    this.selectedFoundObjects = this.checkedObjects.filter(id => this.foundObjectsId.includes(id));
  },
  updated () {
    // console.debug('ListGroupsObjects updated');
    if (this.$refs.virtualScroll && !this.brakeSetScrollPosition) {
      this.virtualScrollSliceRange = this.$refs.virtualScroll.virtualScrollSliceSizeComputed.total;
      this.setScrollPosition();
    }
    this.brakeSetScrollPosition = false;
  },
  activated () {
    // console.debug('ListGroupsObjects activated');
    if (this.$refs.virtualScroll) {
      this.virtualScrollSliceRange = this.$refs.virtualScroll.virtualScrollSliceSizeComputed.total;
      this.setScrollPosition();
    }
  },
  deactivated () {
    // console.debug('ListGroupsObjects deactivated');
  },
  beforeDestroy () {
    // console.debug('ListGroupsObjects beforeDestroy');
    this.setScrollPositionOutMonitoring(0);
  },
  methods: {
    ...mapMutations('listGroupsObjects', ['setSort', 'setScrollPositionMonitoring', 'setScrollPositionOutMonitoring']),
    setSelectedStateObjects () {
      if (this.checkedObjects.length !== 0) {
        this.currentList.forEach((item) => {
          // eslint-disable-next-line
          item.value.selected = this.checkedObjects.includes(item.value.id);
        });
        this.sortingCheckedObject(this.currentList);
      }
    },
    toggleAllSelectedFoundObjects (checked) {
      this.selectedFoundObjects = checked ? this.foundObjectsId.slice() : [];
      if (checked) {
        this.selectedFoundObjects.forEach((item) => {
          this.checkedObjects.push(item);
        });
      } else {
        this.checkedObjects = this.checkedObjects.filter(item => !this.foundObjectsId.find(_item => _item === item));
      }
      const uniqSet = new Set(this.checkedObjects);
      this.checkedObjects = [...uniqSet];
    },
    setScrollPosition () {
      // console.debug('setScrollPosition');
      if (this.variantList === 'monitoring' && this.foundObjects.length + this.virtualScrollSliceRange >= this.scrollPositionMonitoring && !this.clickCheckboxFlag) {
        this.$refs.virtualScroll.scrollTo(this.scrollPositionMonitoring, 'start-force');
      } else if (this.variantList === 'outMonitoring' && this.foundObjects.length + this.virtualScrollSliceRange >= this.scrollPositionOutMonitoring && !this.clickCheckboxFlag) {
        this.$refs.virtualScroll.scrollTo(this.scrollPositionOutMonitoring, 'start-force');
      }
      this.clickCheckboxFlag = false;
    },
    scrolled (e) {
      // console.debug('scrolled');
      if (this.variantList === 'monitoring' && this.$refs.virtualScroll) {
        this.setScrollPositionMonitoring(e.index);
        this.shiftSelectCheckboxes();
      } else if (this.variantList === 'outMonitoring' && this.$refs.virtualScroll) {
        this.setScrollPositionOutMonitoring(e.index);
        this.shiftSelectCheckboxes();
      }
    },
    shiftSelectCheckboxes () {
      const tabContent = document.querySelector('.list-groups-tabs > .tab-content');
      const pointSearch = tabContent ?? document;
      const checkboxes = Array.from(pointSearch.querySelectorAll('.list-groups-checkbox > .custom-control-input'));
      checkboxes.forEach((item) => {
        item.addEventListener('click', (e) => {
          // console.debug('click');
          this.clickCheckboxFlag = true;
          const currentListWithoutGroups = this.currentList.filter(_item => !_item.group);
          const index = currentListWithoutGroups.findIndex(_item => _item.value.id === Number(e.target.value));
          if (!this.lastChecked) {
            this.lastChecked = {
              object: e.target,
              index,
            };
          }
          if (e.shiftKey) {
            const start = index;
            const end = this.lastChecked.index;
            if (start === end) {
              return;
            }

            const dedicatedCheckboxes = currentListWithoutGroups.map(checkbox => checkbox.value.id).slice(Math.min(start, end), Math.max(start, end) + 1);
            if (e.target.checked) {
              dedicatedCheckboxes.forEach((checkbox) => {
                this.checkedObjects.push(checkbox);
                this.selectedFoundObjects.push(checkbox);
              });
            } else {
              this.checkedObjects = this.checkedObjects.filter(id => !dedicatedCheckboxes.find(checkbox => checkbox === id));
              this.selectedFoundObjects = this.selectedFoundObjects.filter(id => !dedicatedCheckboxes.find(checkbox => checkbox === id));
            }
          }
          this.lastChecked = {
            object: e.target,
            index,
          };
        });
      });
    },
    setOpenStatusGroups (openStatusGroups) {
      this.currentList.forEach((item) => {
        if (item.group !== undefined) {
          if (openStatusGroups) {
            // eslint-disable-next-line
            item.group.Open = true;
          } else {
            // eslint-disable-next-line
            item.group.Open = false;
          }
        }
      });
    },
    callSortObjects (sortArr) {
      if (this.view === 0 && this.variantList !== 'outMonitoring') {
        if (this.sort === 'name') {
          return this.sortObjects(sortArr, this.sortName, true, false);
        }
        if (this.sort === 'state') {
          return this.sortObjects(sortArr, this.sortState, false, true);
        }
      } else if (this.view === 0 && this.variantList === 'outMonitoring') {
        return this.sortObjects(sortArr, false, true, false);
      }
      return sortArr;
    },
    checkGroupSelectIndeterminate (group) {
      const obj = group.Objects.map(v => v.id);
      const selected = obj.filter(id => this.checkedObjects.includes(id));
      return selected.length > 0 && selected.length < obj.length;
    },
    filterGroup (objects) {
      const vm = this.objectToFind;
      return objects.filter(item => item.data.Name.toLowerCase().includes(vm.toLowerCase()) || item.data.Id.toString().includes(vm.toLowerCase()));
    },
    altSetTooltip (target, data, id) {
      if (this.hoverObject.timeoutInit) {
        clearTimeout(this.hoverObject.timeoutInit);
      }

      this.hoverObject.timeoutInit = setTimeout(() => {
        this.setTooltip(target, data, id);
      }, 10);
    },
    setTooltip (target, data, id) {
      this.hoverObject.id = id;
      this.hoverObject.target = target;
      this.hoverObject.show = !!this.selectedObjects.length;

      this.hoverObject.data = data;

      if (this.hoverObject.data.address === null) {
        this.$store.dispatch('objects/updateAddress', { id, lat: data.lat, lon: data.lng });
      }
    },
    setActiveObject (id, position) {
      this.$emit('set-active-object', id, position);
    },
    onCheckedObject (checked) {
      // console.debug('change checked');
      const uniqSet = new Set(this.checkedObjects);
      this.checkedObjects = [...uniqSet];
      this.selectedFoundObjects = this.checkedObjects.filter(item => this.foundObjectsId.includes(item));
      this.$emit('on-checked-object', checked);
    },
    setCheckedObjects (arr) {
      this.checkedObjects = arr;
      this.selectedFoundObjects = arr;
    },
    onCheckedObjectsGroup (group, selected) {
      const obj = group.Objects.map(v => v.id).filter(item => this.foundObjectsId.includes(item));
      if (selected) {
        this.checkedObjects.push(...obj);
        this.checkedObjects = [...new Set(this.checkedObjects)];
        this.selectedFoundObjects.push(...obj);
        this.selectedFoundObjects = [...new Set(this.selectedFoundObjects)];
      } else {
        this.checkedObjects = this.checkedObjects.filter(id => !obj.includes(id));
        this.selectedFoundObjects = this.selectedFoundObjects.filter(id => !obj.includes(id));
      }
      this.$emit('change-checked-objects', this.checkedObjects);
    },
    sortingNameObject () {
      this.sortName = !this.sortName;
      this.setSort('name');
    },
    sortingStateObject () {
      this.sortState = !this.sortState;
      this.setSort('state');
    },
    sortingCheckedObject (sortArr) {
      sortArr.sort((a, b) => {
        if (a.value.selected === b.value.selected) {
          return 0;
        }
        if (a.value.selected) {
          return -1;
        }
        return 1;
      });
    },
    sortObjects (array, asc = true, name = false, state = false) {
      this.brakeSetScrollPosition = true;
      if (name || state) {
        let compareFunction = () => {
        };
        let nextCompareFunction = () => {
        };
        if (name) {
          compareFunction = (_a, _b) => {
            const a = _a.value.data.Name.toLowerCase();
            const b = _b.value.data.Name.toLowerCase();
            let result = null;
            if (asc) {
              result = a < b ? 1 : -1;
              result = a === b ? 0 : result;
            } else {
              result = a < b ? -1 : 1;
              result = a === b ? 0 : result;
            }
            return result;
          };
        } else if (state) {
          const minDifference = 300000;
          compareFunction = (a, b) => {
            const aDate = Math.trunc(new Date(a.value.reactive.lastConnectionTime) / minDifference);
            const bDate = Math.trunc(new Date(b.value.reactive.lastConnectionTime) / minDifference);
            let result = null;
            if (asc) {
              result = a.value.reactive.color < b.value.reactive.color ? 1 : -1;
              result = aDate < bDate ? 1 : -1;
              // result = a.value.reactive.color === b.value.reactive.color ? 0 : result;
              result = aDate === bDate ? 0 : result;
            } else {
              result = a.value.reactive.color < b.value.reactive.color ? -1 : 1;
              result = aDate < bDate ? -1 : 1;
              // result = a.value.reactive.color === b.value.reactive.color ? 0 : result;
              result = aDate === bDate ? 0 : result;
            }
            return result;
          };
          nextCompareFunction = (a, b) => {
            let result = null;
            if (asc) {
              result = a.value.reactive.color < b.value.reactive.color ? 1 : -1;
              result = a.value.reactive.color === b.value.reactive.color ? 0 : result;
            } else {
              result = a.value.reactive.color < b.value.reactive.color ? -1 : 1;
              result = a.value.reactive.color === b.value.reactive.color ? 0 : result;
            }
            return result;
          };
        }
        return array.sort(compareFunction).sort(nextCompareFunction);
      }
      return array;
    },
    visibleAllObjects () {
      this.allVisible = !this.allVisible;
      const objects = this.selectedObjects.map(el => el.id);
      if (this.allVisible) {
        this.$store.dispatch('objects/visibleItems', objects);
      } else {
        this.$store.dispatch('objects/unvisibleItems', objects);
      }
    },
    hideTooltip () {
      if (this.hoverObject) {
        if (this.hoverObject.timeout) {
          clearTimeout(this.hoverObject.timeout);
        }
        this.hoverObject.timeout = setTimeout(() => {
          this.hoverObject.show = false;
        }, 600);
      }
    },
    visibleObject (id, visible) {
      const type = visible ? 'visibleItems' : 'unvisibleItems';
      this.$store.dispatch(`objects/${type}`, [id]);
    },
    visibleObjectGroup (_group) {
      const group = _group;
      group.Visible = !group.Visible;

      const type = group.Visible ? 'visibleItems' : 'unvisibleItems';
      this.$store.dispatch(`objects/${type}`, group.Objects.map(x => x.id));
    },
    modalEditGroup (id, name, accountingUnit) {
      this.$store.dispatch('sharedobj/updatedSharedObjectsGroups', { id, group: { Name: name }, accountingUnit });
    },
    modalEditGroupPrivate (id, name) {
      this.$store.dispatch('privateobj/updatedPrivateObjectsGroups', { id, group: { Name: name } });
    },
    deleteObjectsGroupPrivate (id) {
      this.$store.dispatch('privateobj/deletedPrivateObjectsGroups', { id });
    },
    deleteObjectsGroup (id, accountingUnit) {
      this.$store.dispatch('sharedobj/deletedSharedObjectsGroups', { id, accountingUnit });
    },
  },
};
</script>

<style lang="stylus" scoped>
.group-header
  background-color #eaf3fb !important
</style>

<style lang="stylus" scoped>
//.scroll-height-monitoring {
//  height: calc(100vh - 183px);
//}
//.scroll-height-out-monitoring--small {
//  height: 30vh;
//}
//.scroll-height-out-monitoring--big {
//  height: 50vh;
//}
.checkbox-without-animation > label::before {
  transition: none;
}
.not-active {
  pointer-events: none;
  cursor: default;
  text-decoration: none;
  color: black;
}
.objects-list--name {
  overflow: hidden;
  text-overflow: ellipsis;
}
.list {
  flex: 1;
  overflow-y: auto;
  //max-height: 100%;
  .list-group {
    //height: 100%;
  }

  &-objects {
    overflow-y: auto;
    max-height: 100%;
  }
}
.title {
  color: #444;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 14px;
  display: flex;
  align-items: baseline;
  .image {
    float: left;
    min-width: 20px;
    max-width: 20px;
  }
  .name {
    float: left;
    margin: 0 10px;
    overflow: hidden;
    min-width: 200px;
    max-width: 380px;
    font-size: 16px;
  }
  .title-area {
    margin: 0 10px;
    float: left;
    min-width: 100px;
    max-width: 300px;
    font-size: 14px;
    font-weight: 400;
    line-height: 33px;
  }
  .date {
    float: left;
    margin: 0 10px;
    overflow: hidden;
    min-width: 100px;
  }
  .distance {
    margin: 0 10px;
    overflow: hidden;
    min-width: 120px;
  }
  .color {
    float: left;
    margin: 0 10px;
    overflow: hidden;
    min-width: 80px;
  }
  .bubble {
    width: 14px;
    height: 14px;
    min-width: 14px;
    margin-bottom: -2px;
    border-radius: 50%;
    margin-right: 10px;
    display: inline-block;
  }

  .item-info {
    float: left;
    width: 100%;
    padding: 10px 0;
    font-weight: 400;
    display: flex;
    justify-content: space-between;
  }
  .buttom-check {
    bottom: 0;
    width: 100%;
    background-color: white;
    flex: 1 1 0%;
  }
  .item-block-title {
    color: #444;
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-content: center;
    align-items: center;
    white-space: nowrap;
  }
}
.modal-btn .btn-sm {
  width: 50%;
  font-family: "Roboto", sans-serif;
  font-weight: 700;
  padding: 5px;
  border-radius: 3px;
}
</style>
