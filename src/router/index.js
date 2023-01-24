import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import DatabaseView from "../views/DatabaseView.vue";
import store from '@/stores/store'


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "login",
            component: LoginView,
            meta: {
                requiresAuth: false,
                title: 'Login'
            }
        },
        {
            path: "/databases",
            name: "databases",
            component: HomeView,
            meta: {
                requiresAuth: true,
                title: 'Home'
            }
        },
        {
            path: "/databases/:database",
            name: "tables",
            component: DatabaseView,
            meta: {
                requiresAuth: true,
                title: '$DB'
            }
        },
    ],
});


router.beforeEach((to, from) => {
    if (to.meta.requiresAuth) {
        if (!store.state.database.connected) {
            return '/'
        }
    }

    if (! to.meta.requiresAuth) {
        if (store.state.database.connected) {
            return '/databases'
        }
    }

    return true
})

router.afterEach((to) => {
    let title = 'DB Weiv';

    if (to.meta.title) {
        title += ' - '
        title += to.meta.title

        if (title.includes('$DB')) {
            title = title.replace('$DB', to.params.database)
        }
    }

    document.title = title
})

export default router;
