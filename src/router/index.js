import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/home";
import User from "@/components/user";
import Role from "@/components/roleManager";
import Organization from "@/components/organization";
import projectApp from "@/components/projectApp";
import dictionary from "@/components/dictionary";

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    redirect: '/org/org'
  },
    {
      path: '/home/:id',
      name: 'home',
      component: Home
    },
    {
      path: '/user/:id',
      name: 'user',
      component: User
    },
    {
      path: '/role/:id',
      name: 'role',
      component: Role
    },
    {
      path: '/org/:id',
      name: 'org',
      component: Organization
    },
    {
      path: '/home/:id',
      name: 'submenu1',
      component: Home
    },
    {
      path: '/role/:id',
      name: 'submenu2',
      component: Role
    },
    {
      path: '/user/:id',
      name: 'submenu3',
      component: User
    },
    {
      path: '/role/:id',
      name: 'submenu4',
      component: Role
    },
    {
      path: '/role/:id',
      name: 'submenu5',
      component: Role
    },
    {
      path: '/user/:id',
      name: 'submenu21',
      component: User
    },
    {
      path: '/role/:id',
      name: 'submenu22',
      component: Role
    },
    {
      path: '/role/:id',
      name: 'submenu23',
      component: Role
    },
    {
      path: '/projectApp/:id',
      name: 'projectApp',
      component: projectApp
    },
    {
      path: '/dic/:id',
      name: 'dictionary',
      component: dictionary
    },
  ]
})
