// Generated by CoffeeScript 1.9.3
(function() {
  var bookController, bookListController, cardController, classroomConller, creditController, editUserController, electiveConller, examController, failRateController, hnust, judgeController, lastUserController, loginController, navbarController, scheduleController, scoreAllController, scoreController, sortByFilter, tuitionController, userController,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  hnust = angular.module('hnust', ['ngRoute']);

  hnust.factory('checkJsonpData', function($rootScope, $location) {
    return {
      check: function(data) {
        if (!angular.isObject(data)) {
          data = {
            code: -1
          };
        }
        switch (data.code) {
          case -2:
            $rootScope.user = {
              name: '游客',
              rank: -1
            };
            $rootScope.referer = $location.url();
            $location.url('/login');
            break;
          case -1:
            $rootScope.error = data.msg || '网络连接超时 OR 服务器错误。';
            break;
          case 1:
            layer.msg(data.msg);
            break;
          case 2:
            layer.open({
              title: data.msg,
              content: data.data
            });
            break;
          case 3:
            if ($rootScope.referer && $rootScope.referer !== '/login') {
              $location.url($rootScope.referer);
              $rootScope.referer = '';
            } else {
              $location.url('/score');
            }
        }
        if (data.code >= 0) {
          return true;
        } else {
          return false;
        }
      }
    };
  });

  hnust.factory('getJsonpData', function($rootScope, $http, $location, checkJsonpData) {
    return {
      query: function(params, timeout, callback) {
        var bgjsonp, ref, search, self;
        self = this;
        bgjsonp = ['user', 'failRateKey', 'bookInfo', 'electiveKey', 'electiveQueue'];
        if (ref = params.fun, indexOf.call(bgjsonp, ref) < 0) {
          $rootScope.error = '';
          $rootScope.loading = true;
        }
        search = angular.copy($location.search());
        search.fun || (search.fun = $rootScope.fun);
        params = $.extend(search, params);
        params.callback = 'JSON_CALLBACK';
        timeout || (timeout = 8000);
        return $http.jsonp($rootScope.url, {
          params: params,
          timeout: timeout
        }).success(function(res) {
          var ref1;
          if (ref1 = params.fun, indexOf.call(bgjsonp, ref1) < 0) {
            $rootScope.loading = false;
          }
          res.code = parseInt(res.code);
          if (!checkJsonpData.check(res)) {

          } else if (res.code === 4) {
            params.passwd = prompt(res.msg, '');
            if (params.passwd) {
              return self.query(params, timeout, callback);
            } else {
              return $rootScope.error = '密码错误！';
            }
          } else if (callback != null) {
            return callback(res);
          }
        }).error(function() {
          var ref1;
          if (ref1 = params.fun, indexOf.call(bgjsonp, ref1) < 0) {
            $rootScope.loading = false;
          }
          return checkJsonpData.check({
            code: -1,
            msg: '网络异常，请稍后再试。'
          });
        });
      }
    };
  });

  hnust.config(function($httpProvider, $routeProvider) {
    return $routeProvider.when('/login', {
      fun: 'login',
      title: '用户登录',
      controller: 'login',
      templateUrl: 'views/login.html?150808'
    }).when('/agreement', {
      fun: 'agreement',
      title: '用户使用协议',
      templateUrl: 'views/agreement.html?150808'
    }).when('/user', {
      fun: 'user',
      title: '用户中心',
      controller: 'user',
      templateUrl: 'views/user.html?150811'
    }).when('/score', {
      fun: 'score',
      title: '成绩查询',
      controller: 'score',
      templateUrl: 'views/score.html?150808'
    }).when('/scoreAll', {
      fun: 'scoreAll',
      title: '全班成绩',
      controller: 'scoreAll',
      templateUrl: 'views/scoreAll.html?150808'
    }).when('/schedule', {
      fun: 'schedule',
      title: '实时课表',
      controller: 'schedule',
      templateUrl: 'views/schedule.html?150808'
    }).when('/exam', {
      fun: 'exam',
      title: '考试安排',
      controller: 'exam',
      templateUrl: 'views/exam.html?150808'
    }).when('/credit', {
      fun: 'credit',
      title: '学分绩点',
      controller: 'credit',
      templateUrl: 'views/credit.html?150808'
    }).when('/classroom', {
      fun: 'classroom',
      title: '空闲教室',
      controller: 'classroom',
      templateUrl: 'views/classroom.html?150810'
    }).when('/elective', {
      fun: 'elective',
      title: '空闲教室',
      controller: 'elective',
      templateUrl: 'views/elective.html?150811'
    }).when('/judge', {
      fun: 'judge',
      title: '教学评价',
      controller: 'judge',
      templateUrl: 'views/judge.html?150808'
    }).when('/book', {
      fun: 'book',
      title: '图书续借',
      controller: 'book',
      templateUrl: 'views/book.html?150808'
    }).when('/bookList', {
      fun: 'bookList',
      title: '图书检索',
      controller: 'bookList',
      templateUrl: 'views/bookList.html?150811'
    }).when('/tuition', {
      fun: 'tuition',
      title: '学年学费',
      controller: 'tuition',
      templateUrl: 'views/tuition.html?150808'
    }).when('/card', {
      fun: 'card',
      title: '校园一卡通',
      controller: 'card',
      templateUrl: 'views/card.html?150811'
    }).when('/failRate', {
      fun: 'failRate',
      title: '挂科率统计',
      controller: 'failRate',
      templateUrl: 'views/failRate.html?150811'
    }).when('/editUser', {
      fun: 'editUser',
      title: '修改权限',
      controller: 'editUser',
      templateUrl: 'views/editUser.html?150808'
    }).when('/lastUser', {
      fun: 'lastUser',
      title: '最近使用用户',
      controller: 'lastUser',
      templateUrl: 'views/lastUser.html?150808'
    }).otherwise({
      redirectTo: '/score'
    });
  });

  hnust.run(function($location, $rootScope, getJsonpData) {
    $rootScope.url = 'http://hnust.sinaapp.com/api/index.php';
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      var ref, ref1;
      $rootScope.fun = ((ref = current.$$route) != null ? ref.fun : void 0) || '';
      return $rootScope.title = ((ref1 = current.$$route) != null ? ref1.title : void 0) || '';
    });
    return $rootScope.$on('updateUserInfo', function(event, current) {
      return getJsonpData.query({
        fun: 'user'
      }, 8000, function(data) {
        var base;
        data.info.id = data.info.studentId || '';
        (base = data.info).name || (base.name = '游客');
        data.info.rank = data.info.rank != null ? parseInt(data.info.rank) : -1;
        data.info.scoreRemind = !!parseInt(data.info.scoreRemind);
        return $rootScope.user = data.info;
      });
    });
  });

  navbarController = function($scope, $rootScope, getJsonpData) {
    var isPhone, sidebarElement;
    isPhone = document.body.offsetWidth < 1360;
    sidebarElement = $('.ui.sidebar');
    $('.ui.sidebar a').click(function() {
      if (isPhone) {
        return sidebarElement.sidebar('hide');
      }
    });
    $scope.$watch(function() {
      var ref;
      return (ref = $rootScope.user) != null ? ref.rank : void 0;
    }, function() {
      sidebarElement.sidebar('attach events', '#menu');
      if (!isPhone) {
        return sidebarElement.sidebar({
          closable: false,
          dimPage: false,
          transition: 'overlay'
        });
      }
    });
    $scope.hideNavbar = navigator.userAgent === 'demo';
    $scope.$emit('updateUserInfo');
    return $scope.logout = function() {
      return getJsonpData.query({
        fun: 'logout'
      });
    };
  };

  userController = function($scope, $rootScope, $location, getJsonpData) {
    var watch;
    $('.ui.checkbox').checkbox('check');
    $rootScope.error = '';
    $scope.scoreRemind = function(isCheck) {
      var ref;
      $scope.user.scoreRemind = isCheck != null ? isCheck : !((ref = $scope.user) != null ? ref.scoreRemind : void 0);
      if ($scope.user.scoreRemind === true) {
        $('.ui.checkbox').checkbox('check');
        $('#mailField').transition('slide down in');
        return $scope.user.mail = $rootScope.user.mail;
      } else {
        $('.ui.checkbox').checkbox('uncheck');
        $('#mailField').transition('slide down out');
        return $scope.user.mail = '';
      }
    };
    watch = $scope.$watch(function() {
      return $rootScope.user;
    }, function() {
      var ref;
      if ((((ref = $rootScope.user) != null ? ref.rank : void 0) != null) && $rootScope.user.rank !== -1) {
        $scope.user = angular.copy($rootScope.user);
        $scope.scoreRemind($scope.user.scoreRemind);
        return watch();
      }
    }, true);
    return $('.ui.form').form({
      mail: {
        identifier: 'mail',
        optional: true,
        rules: [
          {
            type: 'email',
            prompt: '请输入正确的邮件地址。'
          }
        ]
      }
    }, {
      inline: true,
      on: 'blur',
      onSuccess: function() {
        var params;
        params = {
          fun: 'userUpdate',
          scoreRemind: $scope.user.scoreRemind ? '1' : '0',
          mail: $scope.user.mail
        };
        getJsonpData.query(params, 8000, function(data) {
          return $scope.$emit('updateUserInfo');
        });
        return false;
      }
    });
  };

  loginController = function($scope, $rootScope, getJsonpData, checkJsonpData) {
    var ref;
    $('.ui.checkbox').checkbox();
    if ((((ref = $rootScope.user) != null ? ref.rank : void 0) != null) && $rootScope.user.rank !== -1) {
      return checkJsonpData.check({
        code: 4
      });
    }
    $scope.studentId = $scope.passwd = '';
    $('.ui.form').attr('action', $rootScope.url);
    return $('.ui.form').form({
      studentId: {
        identifier: 'studentId',
        rules: [
          {
            type: 'empty',
            prompt: '学号不能为空！'
          }, {
            type: 'length[10]',
            prompt: '学号不能少于10位！'
          }, {
            type: 'maxLength[10]',
            prompt: '学号不能大于10位！'
          }
        ]
      },
      passwd: {
        identifier: 'passwd',
        rules: [
          {
            type: 'empty',
            prompt: '密码不能为空！'
          }
        ]
      },
      agreement: {
        identifier: 'agreement',
        rules: [
          {
            type: 'checked',
            prompt: '同意用户使用协议方可使用！'
          }
        ]
      }
    }, {
      inline: true,
      on: 'blur',
      onSuccess: function() {
        var params;
        params = {
          fun: 'login',
          passwd: $scope.passwd,
          studentId: $scope.studentId
        };
        return getJsonpData.query(params, 8000, function(data) {
          return $scope.$emit('updateUserInfo');
        });
      }
    });
  };

  scoreController = function($scope, getJsonpData) {
    return getJsonpData.query({}, 8000, function(data) {
      var k, v;
      $scope.data = data.data;
      return $scope.terms = ((function() {
        var ref, results;
        ref = $scope.data;
        results = [];
        for (k in ref) {
          v = ref[k];
          results.push(k);
        }
        return results;
      })()).sort(function(a, b) {
        return a < b;
      });
    });
  };

  scoreAllController = function($scope, $location, getJsonpData) {
    if (!$location.search().course) {
      return $location.url('/score');
    }
    return getJsonpData.query({}, 8000, function(data) {
      $scope.info = data.info;
      return $scope.data = data.data;
    });
  };

  scheduleController = function($scope, getJsonpData) {
    return getJsonpData.query({}, 8000, function(data) {
      $scope.data = data.data;
      $scope.info = data.info;
      $('.menu .item').tab();
      return $('.ui.inline.dropdown').dropdown();
    });
  };

  examController = function($scope, getJsonpData) {
    return getJsonpData.query({}, 10000, function(data) {
      return $scope.data = data.data;
    });
  };

  creditController = function($scope, getJsonpData) {
    return getJsonpData.query({}, 10000, function(data) {
      return $scope.data = data.data;
    });
  };

  classroomConller = function($scope, $rootScope, $timeout, getJsonpData) {
    var date, day, hour, i, isSummer, j, l, m, minute, month, n, ref, week;
    $rootScope.error = '';
    $scope.nums = {
      '1': '一',
      '2': '二',
      '3': '三',
      '4': '四',
      '5': '五',
      '6': '六',
      '7': '七',
      '8': '八',
      '9': '九',
      '10': '十',
      '11': '十一',
      '12': '十二',
      '13': '十三',
      '14': '十四',
      '15': '十五',
      '16': '十六',
      '17': '十七',
      '18': '十八',
      '19': '十九',
      '20': '二十'
    };
    $scope.builds = [['103', '第一教学楼'], ['102', '第二教学楼'], ['104', '第三教学楼'], ['105', '第四教学楼'], ['107', '第五教学楼'], ['110', '第八教学楼'], ['111', '第九教学楼'], ['212', '第十教学楼'], ['213', '第十教附一楼'], ['214', '第十教附二楼']];
    $scope.build = '103';
    $scope.weeks = [];
    for (i = j = 1; j <= 20; i = ++j) {
      $scope.weeks.push([i, "第" + $scope.nums[i] + "周"]);
    }
    $scope.days = [];
    for (i = l = 1; l < 7; i = ++l) {
      $scope.days.push([i, "星期" + $scope.nums[i]]);
    }
    $scope.days.push([7, '星期日']);
    $scope.beginSessions = [];
    for (i = m = 1; m <= 5; i = ++m) {
      $scope.beginSessions.push([i, "" + $scope.nums[i * 2 - 1] + $scope.nums[i * 2] + "节"]);
    }
    $scope.endSessions = [];
    for (i = n = 1; n <= 5; i = ++n) {
      $scope.endSessions.push([i, "至" + $scope.nums[i * 2 - 1] + $scope.nums[i * 2] + "节"]);
    }
    date = new Date();
    week = ((ref = $rootScope.user) != null ? ref.week : void 0) || 0;
    month = date.getMonth() + 1;
    day = date.getDay() === 0 ? 7 : date.getDay();
    hour = date.getHours();
    minute = date.getMinutes();
    isSummer = month >= 5 && month < 10 ? true : false;
    if (hour < 8 || hour === 8 && isSummer && minute < 30) {
      $scope.beginSession = 1;
      $scope.endSession = 1;
    } else if (hour < 10 || hour === 10 && isSummer && minute < 30) {
      $scope.beginSession = 2;
      $scope.endSession = 2;
    } else if (hour < 14 || hour === 14 && isSummer && minute < 30) {
      $scope.beginSession = 3;
      $scope.endSession = 3;
    } else if (hour < 16 || hour === 16 && isSummer && minute < 30) {
      $scope.beginSession = 4;
      $scope.endSession = 4;
    } else if (hour < 19 || hour === 19 && isSummer && minute < 30) {
      $scope.beginSession = 5;
      $scope.endSession = 5;
    } else {
      $scope.beginSession = 1;
      $scope.endSession = 1;
      week = day === 7 ? week + 1 : week;
      day = day === 7 ? 1 : day + 1;
    }
    if (!week) {
      $scope.week = 1;
    } else if (week > 20) {
      $scope.week = 20;
    } else {
      $scope.week = week;
    }
    $scope.day = day;
    return $scope.search = function() {
      var params;
      $rootScope.error = '';
      if (!$scope.build || !$scope.week || !$scope.day || !$scope.beginSession || !$scope.endSession) {
        return $rootScope.error = '请填写完整表单';
      }
      params = {
        build: $scope.build,
        week: $scope.week,
        day: $scope.day,
        beginSession: $scope.beginSession,
        endSession: $scope.endSession
      };
      return getJsonpData.query(params, 8000, function(data) {
        return $scope.data = data.data;
      });
    };
  };

  electiveConller = function($scope, $timeout, getJsonpData) {
    $('.tabular .item').tab();
    $scope.elective = function() {
      $scope.person = {
        loading: true
      };
      return getJsonpData.query({}, 30000, function(data) {
        $scope.person.logs = data.data.logs;
        $scope.person.courses = data.data.courses;
        return $scope.person.loading = false;
      });
    };
    $scope.queue = function() {
      return $timeout(function() {
        return getJsonpData.query({
          fun: 'electiveQueue'
        }, 8000, function(data) {
          if (data.code !== 0) {
            $scope.elective();
          }
          return $scope.queue();
        });
      }, 3000);
    };
    $scope.action = function(title, url) {
      var params;
      if (!confirm('您确定要' + title + '吗？')) {
        return;
      }
      params = {
        fun: 'electiveAction',
        title: title,
        url: url
      };
      return getJsonpData.query(params, 8000, function(data) {
        if (angular.isObject(data.data && !angular.isArray(data.data))) {
          return $scope.person.logs.push(data.data);
        }
      });
    };
    $scope.dropdown = function(method) {
      var dropdown, styles;
      dropdown = $('.ui.search.dropdown .menu');
      styles = dropdown.attr('class');
      if (method === 'hide') {
        if (styles.indexOf('hidden') === -1) {
          dropdown.transition('slide down out');
        }
      } else if (styles.indexOf('visible') === -1) {
        dropdown.transition('slide down in');
      }
    };
    $scope.check = function(key) {
      return $timeout(function() {
        if (key === $scope.key) {
          return $scope.completion(key);
        }
      }, 300);
    };
    $scope.completion = function(key) {
      if (!key) {
        return $scope.keys = [];
      }
      return getJsonpData.query({
        fun: 'electiveKey',
        key: key
      }, 8000, function(data) {
        $scope.keys = data.data;
        return $scope.dropdown('show');
      });
    };
    $scope.electiveList = function(key, page) {
      var params;
      $scope.dropdown('hide');
      if (key) {
        $scope.key = key;
      }
      $scope.list = {
        loading: true
      };
      params = {
        fun: 'electiveList',
        key: $scope.key,
        page: page && page > 0 ? page : 1
      };
      return getJsonpData.query(params, 8000, function(data) {
        $scope.list.info = data.info;
        $scope.list.data = data.data;
        return $scope.list.loading = false;
      });
    };
    $scope.queue();
    $scope.elective();
    return $scope.electiveList();
  };

  judgeController = function($scope, $rootScope, $location, $anchorScroll, getJsonpData) {
    getJsonpData.query({}, 10000, function(data) {
      return $scope.data = data.data;
    });
    $scope.judge = function(item) {
      $('.ui.checkbox').checkbox();
      $('.ui.form').form('clear');
      $scope.judging = item;
      return $anchorScroll();
    };
    return $scope.submit = function() {
      var data, flag, i, j, params;
      $rootScope.error = '';
      data = {
        params: $scope.judging.params
      };
      flag = true;
      for (i = j = 0; j < 10; i = ++j) {
        data["a" + i] = $("input[name='a" + i + "']:checked").val();
        if (!data["a" + i]) {
          layer.msg('请确定表单已填写完整。', {
            shift: 6
          });
          return false;
        }
        if (i !== 0 && data["a" + i] !== data["a" + (i - 1)]) {
          flag = false;
        }
      }
      if (flag) {
        layer.msg('不能全部选择相同的选项。', {
          shift: 6
        });
        return false;
      }
      params = {
        fun: 'judge',
        data: angular.toJson(data)
      };
      return getJsonpData.query(params, 10000, function(data) {
        if (data.code === 0) {
          $scope.judging = false;
          return $scope.data = data.data;
        }
      });
    };
  };

  bookController = function($scope, getJsonpData) {
    getJsonpData.query({}, 8000, function(data) {
      return $scope.data = data.data;
    });
    return $scope.renew = function(params) {
      params.fun = 'book';
      return getJsonpData.query(params, 8000, function(data) {
        return $scope.data = data.data;
      });
    };
  };

  bookListController = function($scope, $rootScope, $timeout, $location, getJsonpData) {
    var search;
    $('.ui.form').form({}, {
      onSuccess: function() {
        return $scope.$apply(function() {
          return $scope.search();
        });
      }
    });
    $rootScope.error = '';
    $scope.search = function(key) {
      var ref;
      if (key) {
        $scope.key = key;
      }
      if (!((ref = $scope.key) != null ? ref.length : void 0)) {
        return;
      }
      return $location.search({
        key: $scope.key,
        page: 1,
        rand: Math.random()
      });
    };
    $scope.bookInfo = function(item) {
      if (item.data || item.loading) {
        return;
      }
      item.loading = true;
      return getJsonpData.query({
        fun: 'bookInfo',
        key: item.id
      }, 8000, function(data) {
        item.loading = false;
        return item.data = data.data;
      });
    };
    if ($location.search().key) {
      search = $location.search();
      $scope.key = search.key;
      return getJsonpData.query({
        key: search.key,
        page: search.page
      }, 8000, function(data) {
        $scope.info = data.info;
        $scope.data = data.data;
        return $timeout(function() {
          return $('.ui.accordion').accordion({
            duration: 200,
            exclusive: false
          });
        });
      });
    }
  };

  tuitionController = function($scope, getJsonpData) {
    getJsonpData.query({}, 8000, function(data) {
      var k, ref, ref1, v;
      $scope.total = (ref = data.data) != null ? ref.total : void 0;
      if ((ref1 = data.data) != null) {
        delete ref1.total;
      }
      $scope.data = data.data;
      return $scope.terms = ((function() {
        var ref2, results;
        ref2 = $scope.data;
        results = [];
        for (k in ref2) {
          v = ref2[k];
          results.push(k);
        }
        return results;
      })()).sort(function(a, b) {
        return a < b;
      });
    });
    return $('.ui.positive.message').popup({
      popup: $('.ui.flowing.popup'),
      on: 'hover'
    });
  };

  cardController = function($scope, getJsonpData) {
    getJsonpData.query({}, 8000, function(data) {
      $scope.info = data.info;
      return $scope.data = data.data;
    });
    return $scope.card = function(fun) {
      var msg, params;
      msg = '您确定要' + (fun === 'cardLoss' ? '挂失' : '解挂' + '吗？');
      if (!confirm(msg)) {
        return;
      }
      params = {
        fun: fun,
        cardId: $scope.info.cardId
      };
      return getJsonpData.query(params, 8000, function(data) {
        return $scope.info = data.info;
      });
    };
  };

  failRateController = function($scope, $rootScope, $timeout, getJsonpData) {
    $rootScope.error = '';
    $scope.keys = [];
    $scope.dropdown = function(method) {
      var dropdown, styles;
      dropdown = $('.ui.search.dropdown .menu');
      styles = dropdown.attr('class');
      if (method === 'hide') {
        if (styles.indexOf('hidden') === -1) {
          dropdown.transition('slide down out');
        }
      } else if (styles.indexOf('visible') === -1) {
        dropdown.transition('slide down in');
      }
    };
    $scope.check = function(key) {
      return $timeout(function() {
        if (key === $scope.key) {
          return $scope.completion(key);
        }
      }, 300);
    };
    $scope.completion = function(key) {
      if (!key) {
        return $scope.keys = [];
      }
      return getJsonpData.query({
        fun: 'failRateKey',
        key: key
      }, 8000, function(data) {
        $scope.keys = data.data;
        return $scope.dropdown('show');
      });
    };
    $scope.search = function(key) {
      $scope.dropdown('hide');
      $scope.data = [];
      if (key) {
        $scope.key = key;
      }
      return getJsonpData.query({
        key: $scope.key
      }, 8000, function(data) {
        $scope.data = data.data;
        return $timeout(function() {
          return $('.progress').progress();
        });
      });
    };
    return $scope.progressColor = function(rate) {
      if (rate <= 2) {
        return ['teal'];
      } else if (rate <= 6) {
        return ['green'];
      } else if (rate <= 12) {
        return ['pink'];
      } else if (rate <= 20) {
        return ['orange'];
      } else {
        return ['red'];
      }
    };
  };

  editUserController = function($scope, $rootScope, $location, getJsonpData) {
    $rootScope.error = '';
    $scope.studentId = '';
    $('.ui.dropdown').dropdown();
    return $('.ui.form').form({
      studentId: {
        identifier: 'studentId',
        rules: [
          {
            type: 'empty',
            prompt: '学号不能为空！'
          }, {
            type: 'length[10]',
            prompt: '学号不能少于10位！'
          }, {
            type: 'maxLength[10]',
            prompt: '学号不能大于10位！'
          }
        ]
      },
      rank: {
        identifier: 'rank',
        rules: [
          {
            type: 'empty',
            prompt: '权限不能为空！'
          }
        ]
      }
    }, {
      inline: true,
      on: 'blur',
      onSuccess: function() {
        var params;
        params = {
          fun: 'editUser',
          studentId: $scope.studentId,
          rank: $("select[name='rank']").val()
        };
        getJsonpData.query(params);
        return false;
      }
    });
  };

  lastUserController = function($scope, getJsonpData) {
    return getJsonpData.query({}, 5000, function(data) {
      return $scope.data = data.data;
    });
  };

  sortByFilter = function() {
    return function(items, predicate, reverse) {
      items = _.sortBy(items, function(item) {
        if (item[predicate] === '优') {
          return 95.02;
        } else if (item[predicate] === '良') {
          return 84.02;
        } else if (item[predicate] === '中') {
          return 74.02;
        } else if (item[predicate] === '及格') {
          return 60.02;
        } else if (item[predicate] === '不及格') {
          return 0;
        } else if (!isNaN(item[predicate]) && item[predicate]) {
          return parseFloat(item[predicate]);
        } else {
          return item[predicate];
        }
      });
      if (reverse) {
        return items;
      } else {
        return items.reverse();
      }
    };
  };

  hnust.controller('navbar', navbarController);

  hnust.controller('login', loginController);

  hnust.controller('user', userController);

  hnust.controller('score', scoreController);

  hnust.controller('scoreAll', scoreAllController);

  hnust.controller('schedule', scheduleController);

  hnust.controller('exam', examController);

  hnust.controller('credit', creditController);

  hnust.controller('classroom', classroomConller);

  hnust.controller('elective', electiveConller);

  hnust.controller('judge', judgeController);

  hnust.controller('book', bookController);

  hnust.controller('bookList', bookListController);

  hnust.controller('tuition', tuitionController);

  hnust.controller('card', cardController);

  hnust.controller('failRate', failRateController);

  hnust.controller('editUser', editUserController);

  hnust.controller('lastUser', lastUserController);

  hnust.filter('sortBy', sortByFilter);

}).call(this);
