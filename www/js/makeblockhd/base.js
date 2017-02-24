/**
 * @description provide util functions.
 * @author Hujinhogn
 * @copyright 2015 Makeblock.cc
 */

'use strict';

var MBlockly = {};

(function(that) {
    // 辅助函数：扩充对象
    that.extend =  function() {
        var args = arguments;
        if (args.length < 2) { return };
        var temp = args[0];
        for (var n = 1; n < args.length; n++) {
            for (var i in args[n]) {
                temp[i] = args[n][i];
            }
        }
        return temp;
    };

    that._matrix2long = function(matrix) {
      var result = [];
      var tempByte = 0,
        tempLong = 0,
        byteCnt = 0;
      for (var i = 0; i < matrix.length; i++) {
        tempByte = tempByte | ((matrix[i] ? 1 : 0) << (7 - (i % 8)));
        if ((i % 8) == 7) {
          tempLong = tempLong | (tempByte << (8 * byteCnt));
          tempByte = 0;
          byteCnt += 1;
          if (byteCnt == 4) {
            byteCnt = 0;
            result.push(tempLong);
            tempLong = 0;
          }
        }
      }

      return result;
    };

    /*  date2str(new Date(data.qpoints[i].qtime*1000),"yyyy-MM-dd hh:mm"); */
    that.date2str = function (x, y) {
        var z = {
            M: x.getMonth() + 1,
            d: x.getDate(),
            h: x.getHours(),
            m: x.getMinutes(),
            s: x.getSeconds()
        };
        y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
            return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
        });
        return y.replace(/(y+)/g, function(v) {
            return x.getFullYear().toString().slice(-v.length);
        });
    };

    // 辅助函数，输出信息
    that.mylog = function(msg) {
        var s = $('#log').html() + '<br>' + msg;
        $('#log').html(s);
    };

    // 自定义编码字符串: 将双引号置换为@字符，单引号转为##
    that.xencode = function(str) {
        return str.replace(/\"/g, "@").replace(/\'/g, "##");
    };

    // 自定义解码字符串：将@字符置换为双引号,##转为单引号,!!转为\n
    that.xdecode = function(str) {
        return str.replace(/@/g, "\"").replace(/##/g, "\'").replace(/!!/g, "\n");
    };

    //辅助函数: stringify the code likes xencode
    that.xstringcode = function(str) {
        return str.replace(/\"/g, "@").replace(/\'/g, "##").replace(/\n/g, '');
    };

    /**
     * 取String 或者 object的长度
     *
     * */
    that.getLength = function(o) {
        var t = typeof o;
        if(t == 'string'){
                return o.length;
        }else if(t == 'object'){
                var n = 0;
                for(var i in o){
                        n++;
                }
                return n;
        }
        return false;
    };

    /**
     * 判断设备类型
     */
    that.checkDeviceType = function() {

        var checkFunc = {
            android: function() {
                return navigator.userAgent.match(/Android/i) ? true : false;
            },
            blackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i) ? true : false;
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
            },
            winphone: function() {
                return navigator.userAgent.match(/IEMobile/i) ? true : false;
            },
            mobile: function() {
                return navigator.userAgent.match(/Mobile/i) ? true : false;
            },
            ipad: function() {
                return navigator.userAgent.match(/iPad/i) ? true : false;
            },
            androidPad: function() {
                var isAndroid = checkFunc.android();
                var isMobile = navigator.userAgent.match(/Mobile/i) ? true : false;
                return isAndroid && !isMobile;
            },
            phone: function() {
                return (checkFunc.mobile() && !checkFunc.ipad() && !checkFunc.androidPad());
            },
            pc: function() {
                return (!checkFunc.mobile() && !checkFunc.ipad() && !checkFunc.androidPad());
            }
        };

        var device = {
            android: checkFunc.android(),
            blackBerry: checkFunc.blackBerry(),
            iOS: checkFunc.iOS(),
            winphone: checkFunc.winphone(),
            ipad: checkFunc.ipad(),
            androidPad: checkFunc.androidPad(),
            mobile: checkFunc.mobile(),
            phone: checkFunc.phone(),
            pc: checkFunc.pc()
        };

        return device;
    };

    /**
     * Get event type for different devices.
     */
    that.getEventType = function() {
        var eventType;
        if (that.checkDeviceType().mobile) {
            // eventType = 'tap';
            eventType = 'touchstart';
        } else {
            eventType = 'click';
        }
        return eventType;
    };

    /**
     * 检测是否包含某字符串
     */
    String.prototype.hasStr = function(str) {
        var text = this;
        if(text.indexOf(str) > -1) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 检测某字符串出现的次数
        var s = "The rain in Spain falls rain mainly in the rain plain";
        var re = new RegExp("rain","g");
        var arr = s.match(re);
     */
    String.prototype.countStrFrequency = function(str) {
        var count;
        var text = this;
        var re = new RegExp(str, "g");
        var arr = text.match(re);
        if(arr) {
            count = arr.length;
        } else {
            count = 0;
        }
        return count;
    };

    /**
     * 用来存值、取值
     * valueWrapper是一个拥有存值、取值的类，每一个对象都将拥有这两个方法。
     *
     * 用来储存“读取数据”block对数据的请求，使用valueWrapper来完成程序变量的临时替代
     * 在蓝牙返回数据之后设置真实的值，然后继续程序执行。
     * 最终目的：取到程序块中请求的值
     *
     * 该技巧利用了对象的引用类型的原理，对象的属性值存在内存的某一个位置，后面值改变，内存
     * 中的值即跟着改变。
     */
    that.ValueWrapper = function() {

    },
    that.ValueWrapper.prototype.toString = function() {
        return this.val;
    };

    that.ValueWrapper.prototype.setValue = function(value) {
        this.val = value;
    };


    that.isJsonEmpty = function(obj) {
        return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
    };

    /**
     * Load xml file
     * @param  {string} xmlUrl xml url, such as `./a.xml`
     * @return {string}        xml text
     */
    that.fetchFile = function(xmlUrl) {
      try {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', xmlUrl, false);
        xmlHttp.setRequestHeader('Content-Type', 'text/xml');
        xmlHttp.send('');
      } catch (e) {
        // Attempt to diagnose the problem.
        var msg = 'Error: Unable to load XML data.\n';
        if (window.location.protocol == 'file:') {
          msg += 'This may be due to a security restriction preventing\n' +
              'access when using the file:// protocol.\n' +
              'Use an http webserver, or a less paranoid browser.\n';
        }
        alert(msg + '\n' + e);
        return null;
      }
      return xmlHttp.responseText;
    };

    /**
     * 封装dialog
     * @param {object} options
     */
    that.Dialog = function(options) {
        /*
        <div class="dialog">
            <div class="head">
                <i class="fa fa-info-circle"></i>
                <span class="title">Save Project</span>
                <i class="fa fa-times dialog-close-btn"></i>
            </div>
            <div class="body">
                <input type="text" name="projectName" autofocus placeholder="Input a project name">
            </div>
            <div class="footer">
                <button class="cancel">No</button>
                <button class="ok">Ok</button>
                <button class="save-as-new">Save as new</button>
            </div>
        </div>
        */
        var eventType = that.getEventType();
        var app = MBlockly.App;
        var self = this;
        var $dialog = $('.dialog');
        options ? options : {};

        var defaultOptions = {
            type: '',
            cancelValue: 'No',
            okValue: 'Ok',
            saveAsNewValue: 'Save as new',

            beforeShow: null,
            onShow: function() {
                this.registerEvents();
                $('.dialog .body').show();
                $('.dialog .head .title').html(Blockly.Msg.Dialog_SAVE);

                if (!app.isWorkspaceEmpty() && this.type != 'edit') {
                    $('.save-as-new').hide();
                    if (app.currentProject && app.currentProject.id) {
                        $('.dialog .head .title').html(Blockly.Msg.Dialog_OVERWRITE);
                        $('.dialog input').val(app.currentProject.name);
                        $('.save-as-new').show();
                    } else {
                        $('.dialog input').val("");
                    }
                    $('.dialog').show();
                }
            },
            hide: function() {
                document.activeElement.blur();
                $("input").blur();
                setTimeout(function() {
                    window.scrollTo(0, 0);
                }, 50)

                $('.dialog').hide();
                this.removeEvents();
                app.dialog = null;
            },
            removeEvents: function() {
                $('.cancel').off();
                $('.ok').off();
                $('.save-as-new').off();
            },
            registerEvents: function() {
                $('.cancel').on(eventType, function() {
                    self.hide();
                    if (self.cancelCallback !== null) {
                        self.cancelCallback();
                    }
                });

                $('.ok').on(eventType, function(e) {
                    if (self.type == 'delete') {
                        // callback
                        if (self.okCallback !== null) {
                            self.okCallback(name);
                        }
                        self.hide();
                    } else {
                        var name = $dialog.find('[name=projectName]').val();
                        if (name && name.length) {

                            if (self.type != 'edit') {
                                if (app.currentProject && app.currentProject.id) {
                                    app.edit(name, app.currentProject.id); // update
                                } else {
                                    app.save(name); // add
                                }
                            }

                            // callback
                            if (self.okCallback !== null) {
                                self.okCallback(name);
                            }
                            self.hide();
                        }
                    }
                });

                $('.save-as-new').on(eventType, function() {
                    var name = $dialog.find('[name=projectName]').val();
                    if (name && name.length) {
                        self.hide();
                        app.save(name);

                        if (self.saveAsNewCallback !== null) {
                            self.saveAsNewCallback();
                        }
                    }
                });
            },
            cancelCallback: null,
            okCallback: null,
            saveAsNewCallback: null
        };

        var option = $.extend(defaultOptions, options);
        $.extend(Dialog.prototype, option);

        if (this.title) {
            $dialog.find('.head .title').html(this.title);
        }


        // close-btn
        $dialog.find('.dialog-close-btn').on(eventType, function() {
            self.hide();
        });

        // onshow
        if (self.onShow !== null && self.onShow !== undefined) {
            self.onShow();
        }

        // beforeshow
        if (self.beforeShow !== null && self.beforeShow !== undefined) {
            self.beforeShow();
        }


        // edit
        if (self.onEdit !== null && self.onEdit !== undefined) {
            self.onEdit();
        }
    };


    /**
     * 将十进制字符串数组转为16进制
     * @param  {Array} data 10进制的数组
     * @return {Array}      16进制的数组
     */
    that.intArrayToHexArray = function(data) {
        var temp = [];
        for(var i = 0; i < data.length; i++) {
            if(data[i] != null) {
                var item =  parseInt(data[i]).toString(16);
                if(item.length == 1) {
                    item = "0" + item;
                }
                temp.push(item);
            }
        }
        return temp;
    }

    /**
     * 十六进制字符串转成十进制字符串
     * @param  {String} str 16进制的字符串
     * @return {String}     10进制的字符串
     */
    that.hexStr2IntStr = function(str) {
        var a = str.split(" ");
        var arr = [];
        for(var i in a) {
            var num = parseInt(a[i], 16);
            arr.push(num);
        }
        arr.reverse();
        console.log(arr);
        return arr.join(" ");
    }
})(window);