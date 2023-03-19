import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,constantRoutes,allAsyncRouters,anyRoute } from '@/router'
import router from '@/router'
// 过滤routes，将路由中data数据的routes的名字与allAsyncRouters中的name相等的返回
function filterAsyncRoutes(allAsyncRouters,routeNames){
  let asyncRouters = allAsyncRouters.filter(item =>{
    if(routeNames.indexOf(item.name) !== -1){
      
      return true
    }
  })
  return asyncRouters
}

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',

    asyncRoutes:[], //获取异步的路由组件
    routes:[], //获取所有的路由组件，返回的是路由组件的名字
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERINFO:(state,userInfo) =>{
    state.name = userInfo.name,
    state.avatar = userInfo.avatar
  },

  // 设置路由
  SET_ROUTES:(state,asyncRoutes)=>{
    state.asyncRoutes = asyncRoutes
    state.routes = constantRoutes.concat(asyncRoutes,anyRoute)

    // 动态给路由器添加路由，参数必须是符合路由配置的数组
    router.addRoutes([...asyncRoutes,anyRoute])
  }
}

const actions = {
/*   login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
        console.log(data)
      }).catch(error => {
        reject(error)
      })
    })
  }, */
  // 用户登录
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    const result = await login({ username: username.trim(), password: password })
    if (result.code === 20000) {
      const { data } = result
      commit('SET_TOKEN', data.token)
      setToken(data.token)
    }
  },
  // get user info
/*   getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }, */
  async getInfo({ commit, state }) {
    const result = await getInfo(state.token)
    if (result.code === 20000) {
      commit('SET_USERINFO', result.data)
      const routes = filterAsyncRoutes(allAsyncRouters,result.data.routes)
      commit('SET_ROUTES',routes)
      return 'ok'
    }else{
      return new Error('验证失败，请再次登录')
    }
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
