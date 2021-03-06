#AngularJS
hnust = angular.module 'hnust', ['ngRoute', 'ngCookies', 'ngAnimate', 'angularFileUpload', 'bw.paging']

#加载服务器数据
hnust.factory 'request', ($rootScope, $http, $location, $cookies) ->
    #检查数据
    check: (res, callback) ->
        self = this
        callback ||= ->
        switch parseInt(res.code)
            #跳转到登录
            when -2
                $rootScope.user = rank:0
                $cookies.prompt = error = res.msg || '您需要登陆才能访问'
                $cookies.referer ||= window.location.href
                window.location.href = '/#/login'
            #错误提示
            when -1
                error = res.msg || '网络连接超时 OR 服务器错误。'
            #普通提示
            when 1
                layer.msg res.msg
            #确认框
            when 2
                layer.open
                    title: res.msg
                    content:res.data
            #跳转到登录前页面
            when 3
                if $cookies.referer and 'login' not in $cookies.referer
                    window.location.href = $cookies.referer
                else
                    $location.url '/student'
                $cookies.referer = $cookies.prompt = ''
            #需要输入密码
            when 4
                layer.prompt
                    formType: 1
                    title: res.msg
                    cancel: ->
                        $rootScope.$apply ->
                            callback '密码错误。', {}, {}
                , (value, index, elem) ->
                    $rootScope.$apply ->
                        layer.close index
                        res.req.data ||= {}
                        res.req.data.passwd = value
                        self.query res.req, callback
                return
        callback error, res.info, res.data

    #请求数据
    query: (req, callback) ->
        self = this
        reqBak = angular.copy req
        #get参数
        search = angular.copy $location.search()
        search.module ||= $rootScope.module
        search.method ||= $rootScope.method
        req.params = $.extend search, req.params || {}
        #post参数
        if req.data and angular.isObject req.data
            req.data = $.param req.data
        req.method = if req.data and req.data.length then 'POST' else 'GET'
        #网址
        req.url ||= $rootScope.url + req.params.module + '/' + req.params.method
        req.params.module = req.params.method = undefined
        #超时时间
        req.timeout ||= 10000
        #回调函数
        callback ||= ->

        #发起请求
        $http(req)
            .success (res) ->
                res = if angular.isObject res then res else code:-1
                res.req = reqBak
                self.check res, callback
            .error ->
                callback '网络异常，请稍后再试。'

hnust.factory 'utils', ->
    units   : '个十百千万@#%亿^&~'
    chars   : '零一二三四五六七八九'
    numToZh : (number) ->
        a = (number + '').split('')
        s = []
        t = this
        if (a.length > 12) then return throw new Error('too big')

        j = a.length - 1
        for i in [0..j]
            if j not in [1, 5, 9] or i isnt 0 or a[i] isnt '1'
                s.push(t.chars.charAt(a[i]))
            if i isnt j then s.push(t.units.charAt(j-i));

        s.join('').replace /零([十百千万亿@#%^&~])/g, (m, d, b) ->
            b = t.units.indexOf(d);
            if b is -1
                ''
            else if d in ['亿', '万']
                d
            else if a[j-b] is '0'
                '零'
        .replace /零+/g, '零'
        .replace /零([万亿])/g, (m, b) ->
            b
        .replace /亿[万千百]/g, '亿'
        .replace /[零]$/, ''
        .replace /[@#%^&~]/g, (m) ->
            return {'@':'十', '#':'百', '%':'千', '^':'十', '&':'百', '~':'千'}[m]
        .replace /([亿万])([一-九])/g, (m, d, b, c) ->
            c = t.units.indexOf(d);
            if c is -1
                m
            else if a[j-c] is '0'
                d + '零' + b

hnust.factory 'animate', ->
    rand: ->
        animates = [
            'scale'
            'fade up'
            'fade left'
            'fade right'
            'slide down'
            'slide up'
            'slide left'
            'slide right'
        ]
        animates[Math.floor Math.random() * animates.length]

hnust.animation '.animate', (animate)->
    enter: (element, done) ->
        element.transition "#{animate.rand()} in", 300, done
        return

    leave: (element, done) ->
        element.transition 'scale out', 0, done
        return

hnust.directive 'autocomplete', ($timeout, request) ->
    link: ($scope, elem, attrs) ->
        $scope.keys = []
        #自动补全框
        $scope.dropdown = (method) ->
            dropdown = $('.ui.search.dropdown .menu')
            styles   = dropdown.attr('class')
            if method is 'hide'
                if styles.indexOf('hidden') is -1
                    dropdown.transition 'slide down out'
            else if styles.indexOf('visible') is -1
                dropdown.transition 'slide down in'
            return

        #检查输入框值的变化
        $scope.check = (key) ->
            $timeout ->
                if key is $scope.key
                    $scope.completion key
            , 300

        #自动补全
        $scope.completion = (key) ->
            request.query
                params:
                    type: 'key'
                    key : key
            , (error, info, data) ->
                if error or info.key != $scope.key
                    return
                $scope.keys = data
                if $scope.keys.length > 1
                    $scope.dropdown 'show'
                else if $scope.keys.length is 1 and $scope.keys[0] isnt $scope.key
                    $scope.dropdown 'show'
                else
                    $scope.dropdown 'hide'

        elem.on 'click', ->
            if $scope.keys.length
                $scope.dropdown 'show'

        elem.on 'mouseleave', ->
            $scope.dropdown 'hide'

        elem.on 'keydown', (event) ->
            if event.which is 13 then $scope.dropdown 'hide'

hnust.config ($animateProvider, $httpProvider, $routeProvider) ->
    #过滤动画
    $animateProvider.classNameFilter /animate/
    #使用urlencode方式Post
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    #设置路由
    $routeProvider
        .when '/system',
            title: '系统配置'
            controller: 'system'
            templateUrl: 'admin-system.html'
        .when '/statistic',
            title: '数据统计'
            controller: 'statistic'
            templateUrl: 'admin-statistic.html'
        .when '/user',
            title: '用户管理'
            controller: 'user'
            templateUrl: 'admin-user.html'
        .when '/group',
            title: '群组管理'
            module: 'group'
            controller: 'group'
            templateUrl: 'admin-group.html'
        .when '/app',
            title: 'APP管理'
            controller: 'app'
            templateUrl: 'admin-app.html'
        .when '/push',
            title: '消息推送'
            controller: 'push'
            templateUrl: 'admin-push.html'
        .when '/logs',
            title: '访问日志'
            controller: 'logs'
            templateUrl: 'admin-logs.html'
        .when '/tools',
            title: '实用工具'
            module: 'tools'
            controller: 'tools'
            templateUrl: 'admin-tools.html'
        .otherwise
            redirectTo: '/student'

hnust.run ($rootScope, $cookies, request) ->
    #初始化数据
    $rootScope.url  = ''
    $rootScope.user = rank: 0

    #客户端相关
    tick = $rootScope.tick = window.tick || {}
    tick.setTitle ||= ->
    tick.isClient ||= navigator.userAgent.indexOf('hnust') isnt -1
    tick.version  ||= if tick.getVersion then tick.getVersion() else 'v0.0.0'

    #监视路由成功事件
    $rootScope.$on '$routeChangeSuccess', (event, current, previous) ->
        $rootScope.module = current.$$route?.module || 'admin'
        $rootScope.method = current.$$route?.method || current.$$route?.controller || ''
        $rootScope.title  = current.$$route?.title  || ''
        $rootScope.tick.setTitle $rootScope.title
        #清空弹出层页面
        $('.ui.modals').html('')

    #获取用户信息
    $rootScope.$on 'updateUserInfo', (event, current) ->
        request.query
            params:
                module: 'user'
                method: 'user'
        , (error, info, data) ->
            if error then return
            $rootScope.user = info

    #WebSocket
    $rootScope.$watch ->
        $cookies.token
    , (token) ->
        socket = $rootScope.socket
        if token and !socket
            socket = $rootScope.socket = io.connect()
        else if token and socket.disconnected
            socket.connect()
        else if !token and socket
            return socket.close()
        else return

        #连接时发送Token并请求日志
        socket.on 'connect', ->
            socket.emit 'token', token
            socket.emit 'log'  , 'log'

        #彩蛋
        eggs = (content) ->
            if content.indexOf('下雪') isnt -1
                $.getScript('dist/vendor/snow.src.js')
                $('.pusher').css('opacity','0.9')

        #HTML转义
        htmlEncode = (str) ->
            div = document.createElement('div')
            div.appendChild(document.createTextNode(str))
            div.innerHTML

        #接收到消息
        socket.on 'push', (data) ->
            if !angular.isObject(data) then return
            if $rootScope.tick.version isnt 'v0.0.0'
                return eggs(data.content)
            data.type    = parseInt(data.type)
            data.title   = htmlEncode(data.title)
            data.content = "<pre>#{htmlEncode(data.content)}</pre><span>#{data.time.substr(5, 11)}</span>"
            #回调函数
            callback = (index) ->
                layer.close(index)
                eggs(data.content)
                socket.emit 'achieve', data.id
            #消息处理
            switch data.type
                when 0
                    layer.confirm data.content,
                        btn: ['确定']
                        title:data.title
                    , callback, callback
                when 1, 2
                    layer.confirm data.content,
                        btn: ['前往','关闭']
                        title: data.title
                    , (index) ->
                        callback(index)
                        if data.type is 1
                            window.location.href = data.success
                        else
                            index = layer.open
                                type   : 2
                                title  : data.title
                                minmax : true
                                content: data.success
                            layer.full index
                    , callback

        #初始化实时日志
        $rootScope.rtLogs =
            begin: (new Date().getTime()) / 1000
            data : []
            time : 0
            count: 0
            speed: 0
            title: '服务器连接成功，正在等待用户请求...'
        #接收服务端实时日志
        socket.on 'log', (log) ->
            logs = $rootScope.rtLogs
            #插入日志，超过60条则删除一条
            logs.data.unshift(log)
            if logs.data.length > 60 then logs.data.pop()
            logs.count += 1
            logs.time   = Math.round(((new Date().getTime()) / 1000 - logs.begin) * 10) / 10
            logs.speed  = Math.round(logs.count / logs.time * 600) / 10
            logs.title  = "#{logs.time}s 里共产生 #{logs.count}pv ，平均 #{logs.speed} pv/min."
            if !$rootScope.$$phase then $rootScope.$digest()

        #获取在线用户
        socket.on 'online', (onlineUser) ->
            $rootScope.onlineUser = onlineUser
            if !$rootScope.$$phase then $rootScope.$digest()

        #断开连接
        socket.on 'disconnect', ->
            $rootScope.onlineUser = []
            if !$rootScope.$$phase then $rootScope.$digest()

    #发送WebSockets消息
    $rootScope.sendMsg = (uid, name) ->
        if !uid then return layer.msg '无确定学号无法发送消息'
        layer.prompt
            formType: 2
            title: "给 #{name} 发送消息："
        , (value, index, elem) ->
            layer.close index
            $rootScope.socket.emit 'push',
                uid    : uid
                content: value

#导航栏控制器
hnust.controller 'navbar', ($scope, $rootScope, request) ->
    #加载layer扩展方法
    layer.config
        extend: 'extend/layer.ext.js'

    #顶栏
    $('.desktop.only.dropdown').dropdown
        on:'hover'
        action:'select'

    #侧栏
    $('.ui.sidebar').sidebar 'attach events', '#menu'
    $scope.$on '$routeChangeSuccess', ->
        $('.ui.sidebar').sidebar 'hide'

    #打赏
    $('.alipay.item').popup
        popup: $('.alipay.popup')
        on   : 'hover'

    #获取用户信息
    $scope.$emit 'updateUserInfo'

    #滚动到指定位置
    $rootScope.scrollTop = ->
        $('body,html').animate
            scrollTop:0
        , 500
        return

    #注销登录
    $scope.logout = ->
        request.query
            params:
                module: 'user'
                method: 'logout'

#学生资料
hnust.controller 'search', ($scope, $rootScope, $location, $timeout, request) ->
    #初始化
    params = $location.search();
    $scope.key  = params.key || ''
    $scope.page = params.page || 1

    #默认搜索
    $scope.loading = true
    request.query
        params:
            type: 'search'
            key : $scope.key
            page: $scope.page
    , (error, info, data) ->
        $scope.loading = false
        $scope.error   = error
        $scope.info    = info
        $scope.key     = info.key || $scope.key
        $scope.data    = data
        $timeout ->
            $('.action.dropdown').dropdown()

    $scope.mark = ->
        layer.prompt
            formType: 2
            title: '请输入新备注：'
            value: $scope.data.mark
        , (value, index, elem) ->
            request.query
                data:
                    type: 'mark'
                    sid : $scope.data.sid
                    mark: value
            , (error, info, data) ->
                if error then return
                layer.close index
                $scope.data.mark = value

    $scope.search = (key, page) ->
        params.key  = key || $scope.key
        params.page = page || 1
        $location.search(params)

#系统配置
hnust.controller 'system', ($scope, request) ->
    $('.tabular.menu .item').tab()
    $('.ui.update.dropdown').dropdown()

    #获取配置列表
    $scope.setting = loading:true
    request.query
        params:
            method: 'setting'
    , (error, info, data) ->
        $scope.setting.loading = false
        $scope.setting.error   = error
        $scope.setting.data    = data

    #更新配置
    $scope.setting.update = (item) ->
        request.query
            params:
                method: 'setting'
            data:
                type  : 'update'
                method: item.method
                value : item.value
        , (error, info, data) ->
            if !error then item.changed = false

    #数据更新
    $scope.update = {}
    $('.ui.update.form').form
        type:
            identifier: 'type'
            rules: [
                type  : 'empty'
                prompt: '更新类型不能为空！'
            ]
        , start:
            identifier: 'start'
            optional  : true,
            rules: [
                type  : 'length[10]'
                prompt: '学号不能少于10位！'
            ,
                type  : 'maxLength[10]'
                prompt: '学号不能大于10位！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.update.loading = true
            type = $('.ui.update.dropdown').dropdown('get value')
            request.query
                params:
                    method: 'update'
                    type  : type
                    start : $scope.update.start
                    cookie: $scope.update.cookie
            , (error) ->
                $scope.update.loading = false
                if error then layer.msg error
            return false

#数据统计
hnust.controller 'statistic', ($scope, $timeout ,request) ->
    $('.tabular.menu .item').tab()

    #获取配置列表
    $scope.loading = true
    request.query {}, (error, info, data) ->
        $scope.loading = false
        $scope.error   = error
        $scope.sum     = data.sum || []
        $scope.ip      = data.ip || []
        $scope.key     = data.key || []
        $scope.modules = data.modules || []
        $scope.WordCloud $scope.key

    #标签云画图
    $scope.WordCloud = (keys) ->
        list = []
        len  = keys.length
        for item, index in keys
            if index / len <= 0.1
                list.push [item.key, 4]
            else if index / len <= 0.3
                list.push [item.key, 3]
            else if index / len <= 0.6
                list.push [item.key, 2]
            else
                list.push [item.key, 1]

        WordCloud $('#canvas')[0],
            list: list
            gridSize: 16
            weightFactor: 16
            color: 'random-light'
            backgroundColor: '#333'
            rotateRatio: 0

        $('#canvas-save').on 'click', (evt) ->
            url = $('#canvas')[0].toDataURL()
            if 'download' of document.createElement('a')
                return this.href = url
            evt.preventDefault()
            window.open(url, '_blank', 'width=500,height=300,menubar=yes')

#用户管理
hnust.controller 'user', ($scope, $rootScope, $timeout, $filter, request) ->
    $('.tabular.menu .item').tab()
    $('.add.dropdown').dropdown()
    $('.sort.dropdown').dropdown()
    $scope.rank2group =
        1: "查自己"
        2: "查全班"
        3: "查统计"
        4: "查他人"
        8: "查资料"
        9: "管理员"

    $scope.list =
        key     : ''
        per     : 15
        page    : 1
        sortName: 'regTime'
        sortBy  : false
        data    : []
        result  : []
        action: (key, page, sortName, sortBy)->
            if this.data.lenght is 0 then return
            this.key      = key      || this.key
            this.page     = page     || this.page
            if sortName is this.sortName
                this.sortBy = !this.sortBy
            else if typeof sortBy is 'boolean'
                this.sortBy = sortBy
            this.sortName = sortName || this.sortName
            this.offset = (this.page - 1) * this.per
            this.result = $filter('filter')(this.data, this.key)
            this.result = $filter('sortBy')(this.result, this.sortName, this.sortBy)
            this.total  = this.result.length
            this.result = $filter('cut')(this.result, this.offset, this.offset + this.per)
            $rootScope.scrollTop()
            $timeout ->
                $('.change.dropdown').dropdown
                    action: 'hide'

    #获取用户列表
    $scope.getList = ->
        $scope.loading = true
        request.query {}, (error, info, data) ->
            $scope.loading   = false
            $scope.error     = error
            $scope.list.data = data || []
            $scope.list.action()

    #权限下拉框
    $('.ui.add.dropdown').dropdown()
    #表单验证
    $('.ui.add.form').form
        uid:
            identifier: 'uid'
            rules: [
                type  : 'empty'
                prompt: '学号不能为空！'
            ,
                type  : 'length[10]'
                prompt: '学号不能少于10位！'
            ,
                type  : 'maxLength[10]'
                prompt: '学号不能大于10位！'
            ]
        , rank:
            identifier: 'rank'
            rules: [
                type  : 'empty'
                prompt: '权限不能为空！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.add.error   = ''
            $scope.add.loading = true
            request.query
                data:
                    type: 'add'
                    uid : $scope.add.uid
                    rank: $("input[name='rank']").val()
            , (error, info, data) ->
                $scope.add.loading = false
                $scope.add.error   = error
                if !error then $scope.getList()
            return false

    #解锁用户
    $scope.unlock = (uid) ->
        request.query
            data:
                type: 'unlock'
                uid : uid
        , (error, info, data) ->
            if !error then $scope.getList()

    #修改用户
    $scope.change = (uid, rank) ->
        request.query
            data:
                type: 'change'
                uid : uid
                rank: rank
        , (error, info, data) ->
            if !error then $scope.getList()

    #删除用户
    $scope.delete = (uid, name) ->
        if !confirm("您确定要删除 #{name} 吗？") then return
        request.query
            data:
                type: 'delete'
                uid : uid
        , (error, info, data) ->
            if !error then $scope.getList()

    #重置用户
    $scope.reset = (uid, name) ->
        if !confirm("您确定要重置 #{name} 的密码吗？") then return
        request.query
            data:
                type: 'reset'
                uid : uid

    #获取用户列表
    $scope.getList()

#群组管理
hnust.controller 'group', ($scope, $location, $timeout, request) ->
    $('.add.form').form {},
        onSuccess: ->
            $scope.$apply ->
                $scope.addMember $scope.sid

    $scope.gid     = $location.search().gid
    $scope.method  = if $scope.gid then 'getMember' else 'get'

    #请求数据
    $scope.get = ->
        $scope.loading = true
        request.query
            params:
                method:$scope.method
        , (error, info, data) ->
            $scope.loading = false
            $scope.error   = error
            $scope.info    = info
            $scope.data    = data

    #查看群组
    $scope.view = (gid) ->
        search = $location.search()
        search.gid = gid
        $location.search(search)

    #编辑群组
    $scope.edit = (item) ->
        $scope.editItem = if item then angular.copy item else {}
        $scope.editItem.share ||= '0'
        $timeout ->
            $('.edit.modal').modal(
                onApprove: ->
                    $('.edit.form').form('validate form')
                    return false
            ).modal('show')
            $('.share.dropdown').dropdown('set selected', $scope.editItem.share)
        return

    $('.ui.edit.form').form
        name:
            identifier: 'name'
            rules: [
                type  : 'empty'
                prompt: '群组名称不能为空'
            ]
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            editItem = $scope.editItem
            editItem.error   = ''
            editItem.loading = true
            editItem.share   = $('.share.dropdown').dropdown('get value')
            request.query
                params:
                    method:'edit'
                data  : editItem
            , (error, info, data) ->
                editItem.loading = false
                editItem.error   = error
                if !error
                    $('.edit.modal').modal('hide')
                    $scope.get()
            return false

    #删除群组
    $scope.delete = (item) ->
        if !confirm "您确定要删除群组【#{item.name}】吗？" then return
        $scope.loading = true
        request.query
            params:
                method: 'delete'
            data:
                gid: item.gid
        , (error, info, data) ->
            $scope.loading = false
            if error
                layer.msg error
            else
                $scope.get()

    #添加群组成员
    $scope.addMember = (sid) ->
        if !sid then return
        $scope.loading = true
        request.query
            params:
                method: 'addMember'
            data:
                sid: sid
                gid: $scope.gid
        , (error, info, data) ->
            $scope.loading = false
            if error
                layer.msg error
            else
                $scope.sid = ''
                $scope.get()

    #删除群组成员
    $scope.deleteMember = (sid) ->
        $scope.loading = true
        request.query
            params:
                method: 'deleteMember'
            data:
                sid: sid
                gid: $scope.gid
        , (error, info, data) ->
            $scope.loading = false
            if error
                layer.msg error
            else
                $scope.get()

    $scope.get()

#APP管理
hnust.controller 'app', ($scope, $rootScope, request, $filter, FileUploader) ->
    $('.tabular.menu .item').tab()

    #获取配置列表
    $scope.loading = true
    request.query {}, (error, info, data) ->
        $scope.loading  = false
        $scope.error    = error
        $scope.qiniu    = info?.qiniu
        $scope.log.data = data || []
        $scope.log.action()

    #APP日志
    $scope.log =
        key   : ''
        per   : 15
        page  : 1
        data  : []
        result: []
        action: (key, page)->
            if this.data.lenght is 0 then return
            this.key    = key  || this.key
            this.page   = page || this.page
            this.offset = (this.page - 1) * this.per
            this.result = $filter('filter')(this.data, this.key)
            this.total  = this.result.length
            this.result = $filter('cut')(this.result, this.offset, this.offset + this.per)
            $rootScope.scrollTop()

    #发布App
    $scope.put = {}
    #计算文件大小
    $scope.readablizeBytes = (bytes) ->
        s = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        e = Math.floor Math.log(bytes) / Math.log(1024)
        (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + ' ' + s[e]

    #文件上传到七牛
    uploadUrl =
        'http:' : 'http://upload.qiniu.com/'
        'https:': 'https://up.qbox.me/'
    $scope.put.uploader = uploader = new FileUploader
        url: uploadUrl[window.location.protocol]
    #添加文件
    uploader.onAfterAddingFile = (fileItem) ->
        uploader.queue.splice 0, uploader.queue.length - 1
        $scope.put.size = $scope.readablizeBytes uploader.queue[0]?.file.size
        $scope.put.name = uploader.queue[0]?.file.name + '  (' + $scope.put.size + ')'
    #上传成功
    uploader.onCompleteItem = (fileItem, response, status, headers) ->
        uploader.queue[0].isSuccess = false
        uploader.queue[0].isUploaded = false
        if status isnt 200
            $scope.put.loading = false
            return $scope.put.error = angular.toJson response
        #将上传数据反馈到服务器
        request.query
            data:
                type   : 'put'
                version: $scope.put.version
                develop: $("input[name='develop']").val()
                intro  : $scope.put.intro
                size   : $scope.put.size
                key    : response.key
        , (error, info, data) ->
            $scope.put.loading = false
            $scope.put.error = error
    #权限下拉框
    $('.ui.put.dropdown').dropdown()
    #发布APP表单
    $('.ui.put.form').form
        version:
            identifier: 'version'
            rules: [
                type  : 'empty'
                prompt: '版本号不能为空！'
            ]
        , develop:
            identifier: 'develop'
            rules: [
                type  : 'empty'
                prompt: '类型不能为空！'
            ]
        , intro:
            identifier: 'intro'
            rules: [
                type  : 'empty'
                prompt: '介绍不能为空！'
            ]
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.put.error = ''
            if !uploader.queue.length
                $scope.put.error = 'APK文件不能为空'
            else
                $scope.put.loading = true
                uploader.queue[0].formData = [
                    key  : 'APP/' + uploader.queue[0].file.name
                    token: $scope.qiniu
                ]
                uploader.uploadAll()
            return false

#消息推送
hnust.controller 'push', ($scope, request) ->
    $('.tabular.menu .item').tab()
    $scope.types =
        '0': '普通推送'
        '1': '跳转网页'
        '2': '弹出IFrame'

    #权限下拉框
    $('.ui.add.dropdown').dropdown()
    #表单验证
    $('.ui.add.form').form
        uid:
            identifier: 'uid'
            rules: [
                type  : 'empty'
                prompt: '学号不能为空！'
            ,
                type  : 'length[10]'
                prompt: '学号不能少于10位！'
            ,
                type  : 'maxLength[10]'
                prompt: '学号不能大于10位！'
            ]
        , type:
            identifier: 'type'
            rules: [
                type  : 'empty'
                prompt: '类型不能为空！'
            ]
        , title:
            identifier: 'title'
            rules: [
                type  : 'empty'
                prompt: '标题不能为空！'
            ]
        , content:
            identifier: 'content'
            rules: [
                type  : 'empty'
                prompt: '内容不能为空！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.add.error   = ''
            $scope.add.loading = true
            request.query
                data:
                    type   : 'add'
                    uid    : $scope.add.uid
                    mode   : $("input[name='mode']").val()
                    title  : $scope.add.title
                    content: $scope.add.content
                    success: $scope.add.success
            , (error, info, data) ->
                $scope.add.loading = false
                $scope.add.error   = error
                if !error then $scope.list()
            return false

    #列表
    $('.ui.list.form').form {},
        onSuccess: ->
            $scope.$apply ->
                $scope.list()
            return false

    #获取推送列表
    $scope.list = (key, page) ->
        $scope.loading = true
        request.query
            params:
                type: 'list'
                key : key  || $scope.info?.key
                page: page || 1
        , (error, info, data) ->
            $scope.loading = false
            $scope.error   = error
            $scope.data    = data
            $scope.info    = info

    #标记已读、未读
    $scope.reset = (id) ->
        request.query
            data:
                type: 'reset'
                id  : id
        , (error, info, data) ->
            if !error then $scope.list()

    #删除用户
    $scope.delete = (id) ->
        if !confirm('您确定要删除吗？') then return
        request.query
            data:
                type: 'delete'
                id  : id
        , (error, info, data) ->
            if !error then $scope.list()

    #获取推送列表
    $scope.list()

#访问日志
hnust.controller 'logs', ($scope, $timeout, request) ->
    $('.tabular.menu .item').tab()
    $('.ui.saved.form').form {},
        onSuccess: ->
            $scope.$apply ->
                $scope.list()
            return false

    #状态转类型
    $scope.state2Type =
        0: '正常'
        1: '需要登陆'
        2: '禁止访问'
        3: '账号异常'
        4: '页面未找到'
        6: '微信调用'
        7: 'API调用'
        8: '数据更新'
        9: '后台管理'

    #状态转颜色
    $scope.state2Color =
        0: 'green'
        1: 'green'
        2: 'red'
        3: 'red'
        4: 'orange'
        6: 'teal'
        7: 'teal'
        8: 'teal'
        9: 'purple'

    #访问日志\
    $scope.list = (type, key, page) ->
        $scope.loading = true
        request.query
            params:
                type: type || $scope.info?.type
                key : key  || $scope.info?.key
                page: page || 1
        , (error, info, data) ->
            $scope.loading = false
            $scope.error   = error
            $scope.data    = data
            $scope.info    = info
            $timeout ->
                $('.ui.type.dropdown').dropdown()

    #获取所有访问日志
    $scope.list('all')

#实用工具
hnust.controller 'tools', ($scope, $rootScope, $timeout, request) ->
    $('.tabular.menu .item').tab()
    $('.ui.sms.dropdown').dropdown()
    $('.ui.room.dropdown').dropdown()
    $('.ui.time.dropdown').dropdown()
    $('.ui.elective.dropdown').dropdown()

    $scope.sms      = {}
    $scope.room     = {}
    $scope.teacher  = {}
    $scope.time     = {}
    $scope.elective = {}

    #获取群组信息
    $scope.loading = true
    request.query
        params:
            module: 'group'
            method: 'get'
    , (error, info, data) ->
        $scope.loading = false
        $scope.error   = error
        $scope.groups  = data

    $scope.time.weeks = []
    for i in [1..20]
        $scope.time.weeks.push "第#{i}周"

    #高亮当前周次
    $scope.$watch ->
        $rootScope.user
    , (user) ->
        if !user then return
        $timeout ->
            $('.ui.time.week.dropdown').dropdown 'set selected', user.week
    . true

    #短信通知
    $('.ui.sms.form').form
        sgroup:
            identifier: 'sgroup'
            rules: [
                type  : 'empty'
                prompt: '请选择要发送的群组！'
            ]
        , template:
            identifier: 'template'
            rules: [
                type  : 'empty'
                prompt: '短信模板不能为空！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            if !confirm '发送后无法撤回，请确定无误！' then return false
            $scope.sms.error   = null
            $scope.sms.loading = true
            request.query
                params:
                    method: 'sms'
                data:
                    group   : $("input[name='sgroup']").val()
                    template: $scope.sms.template
            , (error, info, data) ->
                $scope.sms.loading = false
                $scope.sms.error   = error
            return false

    #通过上课教室查询上课信息
    $('.ui.room.form').form
        rsession:
            identifier: 'rsession'
            rules: [
                type  : 'empty'
                prompt: '上课节次不能为空！'
            ]
        , classroom:
            identifier: 'classroom'
            rules: [
                type  : 'empty'
                prompt: '教室名称不能为空！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.room.data    = null
            $scope.room.error   = null
            $scope.room.loading = true
            request.query
                params:
                    method: 'room'
                data:
                    session: $("input[name='rsession']").val()
                    classroom: $scope.room.classroom
                timeout: 60000
            , (error, info, data) ->
                $scope.room.loading = false
                $scope.room.error   = error
                $scope.room.info    = info
                $scope.room.data    = data
            return false

    #教师
    $('.ui.teacher.form').form
        teacher:
            identifier: 'teacher'
            rules: [
                type  : 'empty'
                prompt: '教师名字不能为空'
            ]
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.teacher.data    = null
            $scope.teacher.error   = null
            $scope.teacher.loading = true
            request.query
                params:
                    method: 'teacher'
                data  :
                    teacher: $scope.teacher.teacher
                timeout: 60000
            , (error, info, data) ->
                $scope.teacher.loading = false
                $scope.teacher.error   = error
                $scope.teacher.info    = info
                $scope.teacher.data    = data
            return false

    #空闲时间
    $('.ui.time.form').form {},
        onSuccess: ->
            $scope.time.data    = null
            $scope.time.error   = null
            $scope.time.loading = true
            request.query
                params:
                    method: 'time'
                data:
                    week : $("input[name='week']").val()
                    group: $("input[name='tgroup']").val()
                    list : $scope.time.list
            , (error, info, data) ->
                $scope.time.loading = false
                $scope.time.error   = error
                $scope.time.info    = info
                $scope.time.data    = data
            return false

    #选修课
    $('.ui.elective.form').form
        day:
            identifier: 'day'
            rules: [
                type  : 'empty'
                prompt: '上课星期不能为空！'
            ]
        , esession:
            identifier: 'esession'
            rules: [
                type  : 'empty'
                prompt: '上课节次不能为空！'
            ]
        , course:
            identifier: 'course'
            rules: [
                type  : 'empty'
                prompt: '课程名称不能为空！'
            ]
        ,
    ,
        inline: true
        on    : 'blur'
        onSuccess: ->
            $scope.elective.data    = null
            $scope.elective.error   = null
            $scope.elective.loading = true
            request.query
                params:
                    method: 'elective'
                data  :
                    day    : $("input[name='day']").val()
                    session: $("input[name='esession']").val()
                    course : $scope.elective.course
                timeout: 60000
            , (error, info, data) ->
                $scope.elective.loading = false
                $scope.elective.error   = error
                $scope.elective.info    = info
                $scope.elective.data    = data
            return false

#切片
hnust.filter 'cut' , ->
    (object, start, end) ->
        object.slice(start || 0, end || object.length)

#排序
hnust.filter 'sortBy', ->
    (items, predicate, reverse) ->
        if !items then return []
        #转化
        replace = (item) ->
            if item[predicate] is '优'
                95.02
            else if item[predicate] is '良'
                84.02
            else if item[predicate] is '中'
                74.02
            else if item[predicate] is '及格'
                60.02
            else if item[predicate] is '不及格'
                0
            else if !isNaN(item[predicate]) && item[predicate]
                parseFloat(item[predicate])
            else
                item[predicate]
        #根据转化结果排序
        items.slice().sort (a, b) ->
            if replace(a) > replace(b)
                if reverse then 1 else -1
            else if reverse then -1 else 1
