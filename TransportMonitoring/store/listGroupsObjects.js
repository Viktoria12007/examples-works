export const state = () => ({
  view: 0,
  sort: '',
  listShowGroupsObjects: [],
  checkedObjectsOutMonitoring: [],
  scrollPositionMonitoring: 0,
  scrollPositionOutMonitoring: 0,
});

export const mutations = {
  setView (state, view) {
    state.view = view;
  },
  setSort (state, sort) {
    state.sort = sort;
  },
  setListShowGroupsObjects (state, arr) {
    state.listShowGroupsObjects = arr;
  },
  setCheckedObjectsOutMonitoring (state, arr) {
    state.checkedObjectsOutMonitoring = arr;
  },
  setScrollPositionMonitoring (state, index) {
    state.scrollPositionMonitoring = index;
  },
  setScrollPositionOutMonitoring (state, index) {
    state.scrollPositionOutMonitoring = index;
  },
};

export const getters = {
  viewStorage: state => state.view || 0,
  sort: state => state.sort || '',
  listShowGroupsObjects: state => state.listShowGroupsObjects || [],
  checkedObjectsOutMonitoring: state => state.checkedObjectsOutMonitoring || [],
  scrollPositionMonitoring: state => state.scrollPositionMonitoring || 0,
  scrollPositionOutMonitoring: state => state.scrollPositionOutMonitoring || 0,
};
