import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import ListGroupsObjects from '~/components/ListGroupsObjects';
import TrackedObject from '~/entities/TrackedObject';
import imageGenerator from '~/plugins/handlers/imageGenerator';

export default {
  components: {
    ListGroupsObjects,
  },
  data () {
    return {
      variantList: 'outMonitoring',
      showListObjects: true,
      outMonitoringView: 0,
      currentAccountingUnit: localStorage.currentAccountingUnit ? JSON.parse(localStorage.currentAccountingUnit) : this.$store.state.user.data.AccountingUnitId,
      rr: true,
      objectToFind: '',
      activeListObjectsSubTab: 0,
      activeSubTab: 0,
      countTabs: 0,
      countSelected: 0,
      modalSelectedObjects: [],
      checkedObjects: [],
      privateGroups: [],
      sharedGroups: [],
      selectedObjectImages: {},
      leftIsVisible: true,
      scrollSettings: {
        minScrollbarLength: 60,
      },
    };
  },
  computed: {
    ...mapGetters('listGroupsObjects', ['viewStorage', 'listShowGroupsObjects', 'checkedObjectsOutMonitoring']),
    ...mapGetters('sharedobj', { shared: 'shared' }),
    ...mapGetters('privateobj', { private: 'private' }),
    foundObjects () {
      return this.findObjects();
    },
    selectedObjects () {
      if (this.activeReport) {
        let listObjects;
        switch (this.activeReport.name) {
          case 'Отчёт по топливу':
            listObjects = Object.values(this.$store.state.objects.items).filter((object) => {
              if (object.data.Sensors.find(sensor => sensor.Type === 'дут')) {
                return true;
              }
              return false;
            });
            break;
          default:
            listObjects = Object.values(this.$store.state.objects.items);
        }
        return this.getCurrentObjects(listObjects);
      }
      return this.getCurrentObjects(Object.values(this.$store.state.objects.items));
    },
    objectsSelectedCount () {
      return this.checkedObjects.length;
    },
    objectsSelectedModalCount () {
      return this.modalSelectedObjects.length;
    },
    isAdmin () {
      return this.$store.state.user.data ? this.$store.state.user.data.isAdmin : false;
    },
  },
  watch: {
    activeListObjectsSubTab (n, o) {
      // console.debug('activeListObjectsTab');
      // console.debug(n);
      if (n === 0) {
        this.outMonitoringView = 0;
      } else if (this.viewStorage === 1 && n === 1) {
        this.outMonitoringView = 1;
      } else if (this.viewStorage === 2 && n === 1) {
        this.outMonitoringView = 2;
      }
      if (this.viewStorage === 0 && n === 1) {
        this.showListObjects = false;
      } else if (this.viewStorage !== 0 && n === 2) {
        this.showListObjects = false;
      } else {
        this.showListObjects = true;
      }
    },
  },
  // mounted () {
  //   this.getActiveAccountingUnit(this.currentAccountingUnit);
  // },
  methods: {
    ...mapMutations('listGroupsObjects', ['setSort', 'setCheckedObjectsOutMonitoring']),
    onCheckedObject (checked) {
      const select = !checked.selected;
      this.sharedGroups.forEach(group => updateSelected(group, select));
      this.privateGroups.forEach(group => updateSelected(group, select));

      function updateSelected (_group, next) {
        const obj = _group.Objects.find(x => x.id === checked.id);
        if (!obj) {
          return;
        }
        const selectedObj = _group.Objects.find(x => x.selected && x.id !== checked.id);
        const group = _group;
        group.Selected = selectedObj ? true : next;
      }
    },
    getCurrentObjects (objects) {
      return objects.map((_item) => {
        const item = _item;
        item.selected = false;
        item.data.image = null;
        return item;
      });
    },
    getActiveAccountingUnit (accountingUnit) {
      this.$store.dispatch('sharedobj/getSharedObjects', accountingUnit);
    },
    getGroupsObjects (objects, rawGroups) {
      const TEMPLATE_GROUP = {
        Show: true,
        Visible: false,
        Selected: false,
        Open: true,
      };

      const groupping = rawGroups.map(item => ({
        ...TEMPLATE_GROUP,
        Id: item.Id,
        Name: item.Name,
        Edit: true,
        Objects: [],
      }));
      const groupForOutside = {
        ...TEMPLATE_GROUP,
        Id: 0,
        Name: this.$t('monitoring.nogrouping'),
        Edit: false,
        Objects: [],
      };
      groupping.push(groupForOutside);

      const amountGroups = rawGroups.length;

      // eslint-disable-next-line no-plusplus
      for (let i = objects.length - 1; i > -1; --i) {
        const obj = objects[i];
        let isOutside = true;

        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < amountGroups && isOutside; ++j) {
          const group = rawGroups[j];
          const objInGroup = group.Objects.find(x => x.Id === obj.data.Id);
          if (objInGroup) {
            isOutside = false;

            const clearGroup = groupping[j];
            clearGroup.Objects.push(obj);
          }
        }

        isOutside && groupForOutside.Objects.push(obj);
      }

      return groupping;
    },
    changedTabs (currentTabs, previousTabs) {
      // console.debug('changedTabs');
      this.countTabs = currentTabs.length;
    },
    getInfoAboutAllGroups () {
      // this.view = localStorage.view ? JSON.parse(localStorage.view) : 0;
      // await this.getActiveAccountingUnit(this.currentAccountingUnit);
      this.sharedGroups = this.getGroupsObjects(this.selectedObjects, this.shared);
      if (this.listShowGroupsObjects.length !== 0) {
        this.sharedGroups.forEach((item) => {
          const currentItem = this.listShowGroupsObjects.find(child => child.Id === item.Id);
          // console.debug(currentItem);
          if (item.Id === currentItem.Id) {
            // eslint-disable-next-line
            item.Show = currentItem.Show;
          }
        });
      }
      this.privateGroups = this.getGroupsObjects(this.selectedObjects, this.private);
    },
    resolveResetCheckedObjects (listObjects, arr = []) {
      if (this.$refs[listObjects]) {
        this.$refs[listObjects].setCheckedObjects(arr);
      }
    },
    generateObjectImages (objects) {
      const kek = () => {
        objects.forEach(async (obj) => {
          const image = await this.imGen(obj.data.Icon);
          const oldImage = this.selectedObjectImages[obj.id];
          if (oldImage) {
            this.selectedObjectImages[obj.id] = image;
          } else {
            Vue.set(this.selectedObjectImages, obj.id, image);
          }

          // eslint-disable-next-line no-param-reassign
          obj.data.image = image;
        });
      };
      return Promise.resolve(kek());
    },
    findObjects () {
      const prepared = this.objectToFind.toLowerCase();
      const command = TrackedObject.takeCommand(prepared);
      const property = TrackedObject.takeProperty(prepared, command);
      // console.debug('findObjects - property', { command, property, prepared, selectedObj: this.selectedObjects });

      if (property.isValid) {
        return TrackedObject.filterObjectsByProperty(property, this.selectedObjects);
      }
      if (!command) {
        return TrackedObject.filterObjectsByName(prepared, this.selectedObjects);
      }
      return this.selectedObjects;
    },
    async imGen (_icon) {
      const file = `${process.env.API_ADDRESS}/v1/GetIconImage(Id='${_icon.IconFile}')`;
      const image = await imageGenerator({
        file,
        size: _icon.Size,
        offset: [_icon.X, _icon.Y],
      });
      return image;
    },
    clearSelectedAndCheckedObjects (listObjects) {
      this.modalSelectedObjects = [];
      this.checkedObjects = [];
      this.resolveResetCheckedObjects(listObjects);
    },
    closeLeft (ev) {
      if (this.variantList === 'monitoring') {
        this.objectToFind = '';
        this.checkedObjects = [];
      }
      ev.preventDefault();
      this.leftIsVisible = false;
    },
    showLeft (ev) {
      ev.preventDefault();
      this.leftIsVisible = true;
    },
  },
};
