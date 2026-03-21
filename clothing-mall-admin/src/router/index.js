import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    perms: ['GET /aaa','POST /bbb']     will control the page perms (you can set multiple perms)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'app.menu.dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/order',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'orderCenter',
    meta: {
      title: 'app.menu.order_manage',
      icon: 'chart'
    },
    children: [
      {
        path: 'order',
        component: () => import('@/views/mall/order'),
        name: 'order',
        meta: {
          perms: ['GET /admin/order/list', 'GET /admin/order/detail', 'POST /admin/order/ship', 'POST /admin/order/refund', 'POST /admin/order/delete', 'POST /admin/order/reply'],
          title: 'app.menu.order_order',
          noCache: true
        }
      },
      {
        path: 'aftersale',
        component: () => import('@/views/mall/aftersale'),
        name: 'aftersale',
        meta: {
          perms: ['GET /admin/aftersale/list', 'GET /admin/aftersale/detail', 'POST /admin/order/receive', 'POST /admin/aftersale/complete', 'POST /admin/aftersale/reject'],
          title: 'app.menu.aftersale_aftersale',
          noCache: true
        }
      }
    ]
  },

  // 3. 商品管理
  {
    path: '/goods',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'goodsManage',
    meta: {
      title: 'app.menu.goods',
      icon: 'chart'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/goods/list'),
        name: 'goodsList',
        meta: {
          perms: ['GET /admin/goods/list', 'POST /admin/goods/delete'],
          title: 'app.menu.goods_list',
          noCache: true
        }
      },
      {
        path: 'create',
        component: () => import('@/views/goods/create'),
        name: 'goodsCreate',
        meta: {
          perms: ['POST /admin/goods/create'],
          title: 'app.menu.goods_create',
          noCache: true
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/goods/edit'),
        name: 'goodsEdit',
        meta: {
          perms: ['GET /admin/goods/detail', 'POST /admin/goods/update', 'POST /admin/goods/catAndBrand'],
          title: 'app.menu.goods_edit',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'sku',
        component: () => import('@/views/mall/sku'),
        name: 'goodsSku',
        meta: {
          perms: ['GET /admin/clothing/sku/list', 'POST /admin/clothing/sku/create', 'POST /admin/clothing/sku/update', 'POST /admin/clothing/sku/delete'],
          title: 'app.menu.goods_sku',
          noCache: true
        }
      },
      {
        path: 'memberLevel',
        component: () => import('@/views/mall/memberLevel'),
        name: 'memberLevel',
        meta: {
          perms: ['GET /admin/clothing/memberLevel/list', 'POST /admin/clothing/memberLevel/create', 'POST /admin/clothing/memberLevel/update', 'POST /admin/clothing/memberLevel/delete'],
          title: 'app.menu.goods_memberLevel',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'ocr',
        component: () => import('@/views/goods/ocr'),
        name: 'goodsOcr',
        meta: {
          perms: ['POST /admin/ocr/recognize', 'POST /admin/ocr/updateStock'],
          title: 'app.menu.goods_ocr',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'region',
        component: () => import('@/views/mall/region'),
        name: 'region',
        meta: {
          title: 'app.menu.mall_region',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'brand',
        component: () => import('@/views/mall/brand'),
        name: 'brand',
        meta: {
          perms: ['GET /admin/brand/list', 'POST /admin/brand/create', 'GET /admin/brand/read', 'POST /admin/brand/update', 'POST /admin/brand/delete'],
          title: 'app.menu.mall_brand',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'category',
        component: () => import('@/views/mall/category'),
        name: 'category',
        meta: {
          perms: ['GET /admin/category/list', 'POST /admin/category/create', 'GET /admin/category/read', 'POST /admin/category/update', 'POST /admin/category/delete'],
          title: 'app.menu.mall_category',
          noCache: true
        }
      },
      {
        path: 'issue',
        component: () => import('@/views/mall/issue'),
        name: 'issue',
        meta: {
          perms: ['GET /admin/issue/list', 'POST /admin/issue/create', 'GET /admin/issue/read', 'POST /admin/issue/update', 'POST /admin/issue/delete'],
          title: 'app.menu.mall_issue',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'keyword',
        component: () => import('@/views/mall/keyword'),
        name: 'keyword',
        meta: {
          perms: ['GET /admin/keyword/list', 'POST /admin/keyword/create', 'GET /admin/keyword/read', 'POST /admin/keyword/update', 'POST /admin/keyword/delete'],
          title: 'app.menu.mall_keyword',
          noCache: true
        },
        hidden: true
      }
    ]
  },

  // 4. 会员管理
  {
    path: '/user',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'userManage',
    meta: {
      title: 'app.menu.user',
      icon: 'chart'
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/user/user'),
        name: 'user',
        meta: {
          perms: ['GET /admin/user/list'],
          title: 'app.menu.user_user',
          noCache: true
        }
      },
      {
        path: 'address',
        component: () => import('@/views/user/address'),
        name: 'address',
        meta: {
          perms: ['GET /admin/address/list'],
          title: 'app.menu.user_address',
          noCache: true
        }
      },
      {
        path: 'collect',
        component: () => import('@/views/user/collect'),
        name: 'collect',
        meta: {
          perms: ['GET /admin/collect/list'],
          title: 'app.menu.user_collect',
          noCache: true
        }
      },
      {
        path: 'footprint',
        component: () => import('@/views/user/footprint'),
        name: 'footprint',
        meta: {
          perms: ['GET /admin/footprint/list'],
          title: 'app.menu.user_footprint',
          noCache: true
        }
      },
      {
        path: 'history',
        component: () => import('@/views/user/history'),
        name: 'history',
        meta: {
          perms: ['GET /admin/history/list'],
          title: 'app.menu.user_history',
          noCache: true
        }
      },
      {
        path: 'feedback',
        component: () => import('@/views/user/feedback'),
        name: 'feedback',
        meta: {
          perms: ['GET /admin/feedback/list'],
          title: 'app.menu.user_feedback',
          noCache: true
        }
      }
    ]
  },

  // 5. 活动管理
  {
    path: '/promotion',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'promotionManage',
    meta: {
      title: 'app.menu.promotion',
      icon: 'chart'
    },
    children: [
      {
        path: 'ad',
        component: () => import('@/views/promotion/ad'),
        name: 'ad',
        meta: {
          perms: ['GET /admin/ad/list', 'POST /admin/ad/create', 'GET /admin/ad/read', 'POST /admin/ad/update', 'POST /admin/ad/delete'],
          title: 'app.menu.promotion_ad',
          noCache: true
        }
      },
      {
        path: 'topic',
        component: () => import('@/views/promotion/topic'),
        name: 'topic',
        meta: {
          perms: ['GET /admin/topic/list', 'POST /admin/topic/create', 'GET /admin/topic/read', 'POST /admin/topic/update', 'POST /admin/topic/delete'],
          title: 'app.menu.promotion_topic',
          noCache: true
        }
      },
      {
        path: 'topic-create',
        component: () => import('@/views/promotion/topicCreate'),
        name: 'topicCreate',
        meta: {
          perms: ['POST /admin/topic/create'],
          title: 'app.menu.promotion_topic_create',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'topic-edit',
        component: () => import('@/views/promotion/topicEdit'),
        name: 'topicEdit',
        meta: {
          perms: ['GET /admin/topic/read', 'POST /admin/topic/update'],
          title: 'app.menu.promotion_topic_edit',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'outfit',
        component: () => import('@/views/promotion/outfit'),
        name: 'outfit',
        meta: {
          perms: ['GET /admin/outfit/list', 'POST /admin/outfit/create', 'POST /admin/outfit/update', 'POST /admin/outfit/delete'],
          title: 'app.menu.promotion_outfit',
          noCache: true
        }
      },
      {
        path: 'flashSale',
        component: () => import('@/views/promotion/flashSale'),
        name: 'flashSale',
        meta: {
          perms: ['GET /admin/flashSale/list', 'POST /admin/flashSale/create', 'POST /admin/flashSale/update', 'POST /admin/flashSale/delete'],
          title: 'app.menu.promotion_flashSale',
          noCache: true
        }
      },
      {
        path: 'coupon',
        component: () => import('@/views/promotion/coupon'),
        name: 'coupon',
        meta: {
          perms: ['GET /admin/coupon/list', 'POST /admin/coupon/create', 'POST /admin/coupon/update', 'POST /admin/coupon/delete'],
          title: 'app.menu.promotion_coupon',
          noCache: true
        }
      },
      {
        path: 'couponDetail',
        component: () => import('@/views/promotion/couponDetail'),
        name: 'couponDetail',
        meta: {
          perms: ['GET /admin/coupon/list', 'GET /admin/coupon/listuser'],
          title: 'app.menu.promotion_coupon_detail',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'fullReduction',
        component: () => import('@/views/promotion/fullReduction'),
        name: 'fullReduction',
        meta: {
          perms: ['GET /admin/fullReduction/list', 'POST /admin/fullReduction/create', 'POST /admin/fullReduction/update', 'POST /admin/fullReduction/delete'],
          title: 'app.menu.promotion_fullReduction',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'activity',
        component: () => import('@/views/promotion/activity'),
        name: 'activity',
        meta: {
          perms: ['GET /admin/activity/list', 'POST /admin/activity/create', 'POST /admin/activity/update', 'POST /admin/activity/delete'],
          title: 'app.menu.promotion_activity',
          noCache: true
        },
        hidden: true
      }
    ]
  },

  // 6. 运营管理（合并原「运营配置」菜单）
  {
    path: '/operation',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'operationManage',
    meta: {
      title: 'app.menu.operation_manage',
      icon: 'chart'
    },
    children: [
      {
        path: 'wework-push',
        component: () => import('@/views/wework/push'),
        name: 'weworkPush',
        meta: {
          perms: ['POST /admin/wework/uploadMedia', 'POST /admin/wework/sendCard', 'POST /admin/wework/sendCardByTag'],
          title: 'app.menu.operation_message_push',
          noCache: true
        }
      },
      {
        path: 'store',
        component: () => import('@/views/mall/store'),
        name: 'store',
        meta: {
          perms: ['GET /admin/clothing/store/list', 'POST /admin/clothing/store/create', 'POST /admin/clothing/store/update', 'POST /admin/clothing/store/delete'],
          title: 'app.menu.goods_store',
          noCache: true
        }
      },
      {
        path: 'guide',
        component: () => import('@/views/mall/guide'),
        name: 'guide',
        meta: {
          perms: ['GET /admin/clothing/guide/list', 'POST /admin/clothing/guide/create', 'POST /admin/clothing/guide/update', 'POST /admin/clothing/guide/delete'],
          title: 'app.menu.goods_guide',
          noCache: true
        }
      },
      {
        path: 'issue',
        component: () => import('@/views/mall/issue'),
        name: 'operationIssue',
        meta: {
          perms: ['GET /admin/issue/list', 'POST /admin/issue/create', 'GET /admin/issue/read', 'POST /admin/issue/update', 'POST /admin/issue/delete'],
          title: 'app.menu.mall_issue',
          noCache: true
        }
      },
      {
        path: 'keyword',
        component: () => import('@/views/mall/keyword'),
        name: 'operationKeyword',
        meta: {
          perms: ['GET /admin/keyword/list', 'POST /admin/keyword/create', 'GET /admin/keyword/read', 'POST /admin/keyword/update', 'POST /admin/keyword/delete'],
          title: 'app.menu.mall_keyword',
          noCache: true
        }
      },
      {
        path: 'mall',
        component: () => import('@/views/config/mall'),
        name: 'configMall',
        meta: {
          perms: ['GET /admin/config/mall', 'POST /admin/config/mall'],
          title: 'app.menu.config_mall',
          noCache: true
        }
      },
      {
        path: 'express',
        component: () => import('@/views/config/express'),
        name: 'configExpress',
        meta: {
          perms: ['GET /admin/config/express', 'POST /admin/config/express'],
          title: 'app.menu.config_express',
          noCache: true
        }
      },
      {
        path: 'order',
        component: () => import('@/views/config/order'),
        name: 'configOrder',
        meta: {
          perms: ['GET /admin/config/order', 'POST /admin/config/order'],
          title: 'app.menu.config_order',
          noCache: true
        }
      }
    ]
  },

  // 7. 数据统计
  {
    path: '/stat',
    component: Layout,
    redirect: '/stat/growth',
    alwaysShow: true,
    name: 'statManage',
    meta: {
      title: 'app.menu.stat',
      icon: 'chart'
    },
    children: [
      {
        path: 'growth',
        component: () => import('@/views/stat/growth'),
        name: 'statGrowth',
        meta: {
          perms: ['GET /admin/stat/growth'],
          title: 'app.menu.stat_growth',
          noCache: true
        }
      },
      {
        path: 'sales',
        component: () => import('@/views/stat/sales'),
        name: 'statSales',
        meta: {
          perms: ['GET /admin/stat/order'],
          title: 'app.menu.stat_sales',
          noCache: true
        }
      },
      {
        path: 'tracker',
        component: () => import('@/views/stat/tracker'),
        name: 'statTracker',
        meta: {
          perms: ['GET /admin/stat/tracker/overview'],
          title: 'app.menu.stat_tracker',
          noCache: true
        }
      }
    ]
  },

  // 8. 系统管理
  {
    path: '/sys',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'sysManage',
    meta: {
      title: 'app.menu.sys',
      icon: 'chart'
    },
    children: [
      {
        path: 'admin',
        component: () => import('@/views/sys/admin'),
        name: 'admin',
        meta: {
          perms: ['GET /admin/admin/list', 'POST /admin/admin/create', 'POST /admin/admin/update', 'POST /admin/admin/delete'],
          title: 'app.menu.sys_admin',
          noCache: true
        }
      },
      {
        path: 'notice',
        component: () => import('@/views/sys/notice'),
        name: 'sysNotice',
        meta: {
          perms: ['GET /admin/notice/list', 'POST /admin/notice/create', 'POST /admin/notice/update', 'POST /admin/notice/delete'],
          title: 'app.menu.sys_notice',
          noCache: true
        }
      },
      {
        path: 'log',
        component: () => import('@/views/sys/log'),
        name: 'log',
        meta: {
          perms: ['GET /admin/log/list'],
          title: 'app.menu.sys_log',
          noCache: true
        }
      },
      {
        path: 'role',
        component: () => import('@/views/sys/role'),
        name: 'role',
        meta: {
          perms: ['GET /admin/role/list', 'POST /admin/role/create', 'POST /admin/role/update', 'POST /admin/role/delete', 'GET /admin/role/permissions', 'POST /admin/role/permissions'],
          title: 'app.menu.sys_role',
          noCache: true
        }
      },
      {
        path: 'os',
        component: () => import('@/views/sys/os'),
        name: 'os',
        meta: {
          perms: ['GET /admin/storage/list', 'POST /admin/storage/create', 'POST /admin/storage/update', 'POST /admin/storage/delete'],
          title: 'app.menu.sys_os',
          noCache: true
        }
      }
    ]
  },

  {
    path: '/mini-program',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'miniProgramManage',
    meta: {
      title: 'app.menu.mini_program_config',
      icon: 'chart'
    },
    children: [
      {
        path: 'wx',
        component: () => import('@/views/config/wx'),
        name: 'configWx',
        meta: {
          perms: ['GET /admin/config/wx', 'POST /admin/config/wx'],
          title: 'app.menu.config_wx',
          noCache: true
        }
      }
    ]
  },

  // 外链（隐藏）
  {
    path: 'external-link',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    name: 'externalLink',
    meta: {
      title: 'app.menu.external_link',
      icon: 'link'
    },
    hidden: true,
    children: [
      {
        path: 'https://cloud.tencent.com/product/cos',
        meta: { title: 'app.menu.external_link_tencent_cos', icon: 'link' }
      },
      {
        path: 'https://cloud.tencent.com/product/sms',
        meta: { title: 'app.menu.external_link_tencent_sms', icon: 'link' }
      },
      {
        path: 'https://pay.weixin.qq.com/index.php/core/home/login',
        meta: { title: 'app.menu.external_link_weixin_pay', icon: 'link' }
      },
      {
        path: 'https://mpkf.weixin.qq.com/',
        meta: { title: 'app.menu.external_link_weixin_mpkf', icon: 'link' }
      },
      {
        path: 'https://www.alibabacloud.com/zh/product/oss',
        meta: { title: 'app.menu.external_link_alibaba_oss', icon: 'link' }
      },
      {
        path: 'https://www.qiniu.com/products/kodo',
        meta: { title: 'app.menu.external_link_qiniu_kodo', icon: 'link' }
      },
      {
        path: 'http://www.kdniao.com/api-track',
        meta: { title: 'app.menu.external_link_kdniao_api', icon: 'link' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: 'noredirect',
    alwaysShow: true,
    children: [
      {
        path: 'password',
        component: () => import('@/views/profile/password'),
        name: 'password',
        meta: { title: 'app.menu.profile_password', noCache: true }
      },
      {
        path: 'notice',
        component: () => import('@/views/profile/notice'),
        name: 'notice',
        meta: { title: 'app.menu.profile_notice', noCache: true }
      }
    ],
    hidden: true
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
