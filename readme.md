## 权限
    1.登录之后会收到'buttons,roles,routes'
        buttons:是按钮得权限
        roles:是添加身份
        routes:是当前该用户可以查看得路由组件得路由名字（名称数组）
    
    2.现在存在2个账户：Admin和again
        Admin:是管理员,能够查看所有得路由组件
        again:是游客，只能查看首页
    
    3.操作：
        1.info这个接口返回的routes只是组件名字(字符串)，而不是组件
            我们要的是组件，而不是组件的名字

        2.在user这个仓库中收集  异步的组件 和 所有的组件
        
        3.使用filterAsyncRoutes这个函数去过滤出：将 异步返回的结果data.routes中含有异步路由组件(allAsyncRouters)的名字 的组件返回。