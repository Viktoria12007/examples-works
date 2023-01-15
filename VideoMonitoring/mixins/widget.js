import {mapGetters} from "vuex";

export const widget = {
    props: {
        height:{
            required: false,
            type: Number
        },

        width:{
            required: false,
            type: Number
        },

        now: {
            required: false,
            type: Number
        }
    },
    data() {
        return {
            updatedProps: true,
            loaded: false,
            updateInterval: 60000,
            lastUpdate: null,
            updating: false,
            // chartsPallet: 'palette10',
            chartsColors: ['#3F51B5', '#008FFB', '#00B1F2', '#81D4FA'],
        }
    },
    watch: {
        height() {
            this.updateProps()
        },

        width() {
            this.updateProps()
        },

        async now(n) {
            if(n - this.lastUpdate < this.updateInterval) return
            await this.update()
        }
    },

    async mounted() {
        await this.update()
        this.loaded = true
    },

    methods: {
        updateProps() {
            if(!this.updatedProps) return
            this.updatedProps = false

            console.debug('updatedPropsFalse!')

            setTimeout(() => {
                this.updatedProps = true
                console.debug('updatedPropsTrue!')
            }, 500)
        },

        fetch() {

        },

        async update() {
            this.updating = true
            await this.fetch()
            this.updating = false
            this.lastUpdate = Date.now()
        }
        // updateWidget(action) {
        //     setInterval(() => action, 1000)
        // }
    },
    computed: {
        ...mapGetters({
            'server': "server/instance"
        }),
    }
}