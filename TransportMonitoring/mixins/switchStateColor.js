import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('preferences', { settingsBase: 'settingsAUnit' }),
  },
  methods: {
    switchStateColor (value) {
      let colorScheme;
      if (!this.settingsBase.useAlternativeStateColors) {
        colorScheme = {
          Green: 'color: #28a745;',
          Yellow: 'color: #f2c037;',
          Red: 'color: #dc3545;',
          default: 'color: #6c757d;',
        };
      } else {
        colorScheme = {
          Green: 'color: #349b97;',
          Yellow: 'color: #f2b243;',
          Red: 'color: #f32857;',
          default: 'color: #6c757d;',
        };
      }
      return colorScheme[value] ?? colorScheme.default;
    },
  },
};
