// Generated by CoffeeScript 1.9.3
(function() {
  var apiUrl, book, card, credit, editUser, exam, hnust, judge, lastUser, login, navbar, schedule, score, tuition, user;

  $('#menu').dropdown({
    action: 'hide',
    transition: 'drop',
    forceSelection: true
  });

  apiUrl = 'http://a.hnust.sinaapp.com/index.php';

  hnust = angular.module('hnust', ['ngRoute']);

  hnust.factory('getJsonpData', function($rootScope, $http, $location) {
    return {
      query: function(params, timeout, callback) {
        var ref, search, self;
        self = this;
        $rootScope.error = '';
        search = angular.copy($location.search());
        search.fun || (search.fun = $rootScope.fun);
        params = $.extend(search, params);
        params.callback = 'JSON_CALLBACK';
        timeout || (timeout = 8000);
        if ((ref = params.fun) !== 'userInfo') {
          $rootScope.loading = true;
        }
        return $http.jsonp($rootScope.url, {
          params: params,
          timeout: timeout
        }).success(function(res) {
          var ref1;
          if ((ref1 = params.fun) !== 'userInfo') {
            $rootScope.loading = false;
          }
          if (res.code === 6) {
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
          if ((ref1 = params.fun) !== 'userInfo') {
            return $rootScope.loading = false;
          }
        });
      }
    };
  });

  hnust.factory('checkJsonpData', function($rootScope, $location) {
    return {
      check: function(data) {
        switch (data.code) {
          case -1:
            $rootScope.error = data.msg || '网络连接超时 OR 服务器错误。';
            break;
          case 1:
            layer.msg(data.msg);
            return true;
          case 2:
            layer.msg(data.msg, {
              shift: 6
            });
            window.history.back();
            break;
          case 3:
            $rootScope.user = {
              name: '游客',
              rank: -1
            };
            $rootScope.referer = $location.url();
            $location.url('/login');
            break;
          case 4:
            if ($rootScope.referer && $rootScope.referer !== '/login') {
              $location.url($rootScope.referer);
              $rootScope.referer = '';
            } else {
              $location.url('/score');
            }
            return true;
          case 5:
            $rootScope.error = data.msg;
            break;
          default:
            return true;
        }
        return false;
      }
    };
  });

  hnust.factory('httpInterceptor', function($q, checkJsonpData) {
    return {
      response: function(res) {
        var ref;
        if (res.config.method !== 'JSONP') {
          return res;
        }
        res.data.code = parseInt((ref = res.data) != null ? ref.code : void 0);
        if (checkJsonpData.check(res.data)) {
          return res;
        } else {
          return $q.reject('reject');
        }
      },
      responseError: function(res) {
        checkJsonpData.check({
          code: -1,
          msg: '网络异常，请稍后再试。'
        });
        return $q.reject('reject');
      }
    };
  });

  hnust.config(function($httpProvider, $routeProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    return $routeProvider.when('/login', {
      fun: 'login',
      title: '用户登录',
      controller: login,
      templateUrl: 'views/login.html?150722'
    }).when('/agreement', {
      fun: 'agreement',
      title: '用户使用协议',
      templateUrl: 'views/agreement.html?150722'
    }).when('/user', {
      fun: 'user',
      title: '用户中心',
      controller: user,
      templateUrl: 'views/user.html?150722'
    }).when('/score', {
      fun: 'score',
      title: '成绩查询',
      controller: score,
      templateUrl: 'views/score.html?150722'
    }).when('/schedule', {
      fun: 'schedule',
      title: '实时课表',
      controller: schedule,
      templateUrl: 'views/schedule.html?150722'
    }).when('/exam', {
      fun: 'exam',
      title: '考试安排',
      controller: exam,
      templateUrl: 'views/exam.html?150722'
    }).when('/credit', {
      fun: 'credit',
      title: '学分绩点',
      controller: credit,
      templateUrl: 'views/credit.html?150722'
    }).when('/tuition', {
      fun: 'tuition',
      title: '学年学费',
      controller: tuition,
      templateUrl: 'views/tuition.html?150722'
    }).when('/judge', {
      fun: 'judge',
      title: '教学评价',
      controller: judge,
      templateUrl: 'views/judge.html?150722'
    }).when('/book', {
      fun: 'book',
      title: '图书续借',
      controller: book,
      templateUrl: 'views/book.html?150722'
    }).when('/card', {
      fun: 'card',
      title: '校园一卡通',
      controller: card,
      templateUrl: 'views/card.html?150722'
    }).when('/editUser', {
      fun: 'editUser',
      title: '修改权限',
      controller: editUser,
      templateUrl: 'views/editUser.html?150722'
    }).when('/lastUser', {
      fun: 'lastUser',
      title: '最近使用用户',
      controller: lastUser,
      templateUrl: 'views/lastUser.html?150722'
    }).otherwise({
      redirectTo: '/score'
    });
  });

  hnust.run(function($location, $rootScope, getJsonpData) {
    $rootScope.url = apiUrl;
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      var ref, ref1;
      $rootScope.fun = ((ref = current.$$route) != null ? ref.fun : void 0) || '';
      return $rootScope.title = ((ref1 = current.$$route) != null ? ref1.title : void 0) || '';
    });
    return $rootScope.$on('userLogin', function(event, current) {
      return getJsonpData.query({
        fun: 'userInfo'
      }, 8000, function(data) {
        var base;
        data.info.id = data.info.studentId || '';
        (base = data.info).name || (base.name = '游客');
        data.info.rank = data.info.rank != null ? parseInt(data.info.rank) : -1;
        return $rootScope.user = data.info;
      });
    });
  });

  navbar = function($scope, $rootScope, getJsonpData) {
    $scope.hideNavbar = navigator.userAgent === 'demo';
    $scope.$emit('userLogin');
    return $scope.logout = function() {
      return getJsonpData.query({
        fun: 'logout'
      });
    };
  };

  user = function($scope, $rootScope, $location, getJsonpData) {
    var ref;
    if ((((ref = $rootScope.user) != null ? ref.rank : void 0) == null) || $rootScope.user.rank === -1) {
      return $location.url('/login');
    }
    $('.ui.checkbox').checkbox();
    $scope.user = $rootScope.user;
    return console.log($scope.user);
  };

  login = function($scope, $rootScope, getJsonpData, checkJsonpData) {
    var ref;
    $('.ui.checkbox').checkbox();
    if ((((ref = $rootScope.user) != null ? ref.rank : void 0) != null) && $rootScope.user.rank !== -1) {
      return checkJsonpData.check({
        code: 4
      });
    }
    $scope.studentId = $scope.passwd = '';
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
          return $scope.$emit('userLogin');
        });
      }
    });
  };

  score = function($scope, getJsonpData) {
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
      })()).reverse();
    });
  };

  schedule = function($scope, getJsonpData) {
    return getJsonpData.query({}, 8000, function(data) {
      $scope.data = data.data;
      $scope.info = data.info;
      $('.menu .item').tab();
      return $('#term').dropdown();
    });
  };

  exam = function($scope, getJsonpData) {
    return getJsonpData.query({}, 10000, function(data) {
      return $scope.data = data.data;
    });
  };

  credit = function($scope, getJsonpData) {
    return getJsonpData.query({}, 10000, function(data) {
      return $scope.data = data.data;
    });
  };

  tuition = function($scope, getJsonpData) {
    return getJsonpData.query({}, 8000, function(data) {
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
      })()).reverse();
    });
  };

  judge = function($scope, $rootScope, $location, $anchorScroll, getJsonpData) {
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

  book = function($scope, getJsonpData) {
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

  card = function($scope, getJsonpData) {
    return getJsonpData.query({}, 8000, function(data) {
      $scope.info = data.info;
      return $scope.data = data.data;
    });
  };

  editUser = function($scope, $rootScope, $location, getJsonpData) {
    var ref;
    if ((((ref = $rootScope.user) != null ? ref.rank : void 0) == null) || $rootScope.user.rank === -1) {
      return $location.url('/login');
    }
    $rootScope.error = '';
    $scope.studentId = '';
    $('#rank').dropdown();
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

  lastUser = function($scope, getJsonpData) {
    return getJsonpData.query({}, 5000, function(data) {
      return $scope.data = data.data;
    });
  };

  hnust.controller('navbar', navbar);

  hnust.controller('login', login);

  hnust.controller('user', user);

  hnust.controller('score', score);

  hnust.controller('schedule', schedule);

  hnust.controller('exam', exam);

  hnust.controller('credit', credit);

  hnust.controller('tuition', tuition);

  hnust.controller('judge', judge);

  hnust.controller('book', book);

  hnust.controller('card', card);

  hnust.controller('editUser', editUser);

  hnust.controller('lastUser', lastUser);

}).call(this);
