/**
 * @description communication width device, iOS, android or others.
 *   send message to device and receive message from the
 * @author Hujinhogn
 * @copyright 2015 Makeblock.cc
 */

/**
 * 数据传输存在几个动作问题：
    1. cp主动发数据给coding界面
        涉及到的接口: sendWidgetValue
    2. block块向cp请求某个组件的值
        (第一层过滤)指令索引index：是发出获取数值请求时带出的，这样能保证接收到的值，是因请求才返回的，用作数据校验
        (第二层过滤)组件id：带入执行块中，是为了获取某个指定组件的值，过滤其他无用的值，在具体的block块获取值后进行判断
        涉及到的接口： requestWidgetValue
    3. 模块输出值给cp上的某个组件
        主要是显示面板
        涉及到的接口: sendValue2Cp
 */

MBlockly = MBlockly || {};
MBlockly.HostInterface = {
    // 用来记录cp虚拟按键是否可以继续执行
    flagList: {}
};


/* web 调用 native */
extend(MBlockly.HostInterface, {
    // blockly准备就绪，请求加载项目数据
    // 用延迟是为了等待webview加载，目前的时间间隔并不精准
    requestLoadProject : function() {
        console.log('requestLoadProject');
        setTimeout(function() {
            if(TellNative) {
                TellNative.requestLoadProject();
                setTimeout(function() {
                    MBlockly.Settings.MODE_WEBVIEW_ONLOAD = true;
                }, 500);
            }
        }, 1000);
    },

    tellControlPanelBlocklyIsReady: function() {
        console.log('tellControlPanelBlocklyIsReady');
        if(TellNative.blocklyIsReady) {
            TellNative.blocklyIsReady();
        }
    },

    // 告知cp当前正在编辑哪个组件
    reportCurrentWidget: function(id) {
        TellNative.reportCurrentWidget(id + '');
    },

    // 组件编程数据存储
    saveControlPanel : function() {
        setTimeout(function() {
            var data = JSON.stringify(widgetList);
            var jsonStr = encodeURIComponent(data);
            TellNative.saveControlPanel(jsonStr)
        }, 0);
    },

    // 提供数据给控制台，例如生成示波器波形等
    sendValue2Cp : function(id, value) {
        var val = value.toString();
        console.log('sendValue2Cp: ' + id + ', value: ' + val);
        TellNative.sendValueToWidget(val + '', id + '');
    },

    // 接受原生端查询某个传感的值，取到值后，返回给原生端
    responseSensorValue2Cp: function(index, deviceTyep, val) {
        TellNative.responseSensorValue2Cp(index + '', deviceTyep + '', val + '');
    },

    // 主动请求相关组件的值
    requestWidgetValue: function(id) {
        id = parseInt(id) + '';
        console.log('requestWidgetValue: ' + id);
        return TellNative.requestWidgetValue(id);
    },

    // 主动请求相关组件的名称
    requestWidgetName: function(id) {
        id = parseInt(id) + '';
        return TellNative.requestWidgetName(id);
    },

    _bluetoothAvailableCheckPassed: function(){
        if(MBlockly.Settings.DEBUG) { return true; }
        var openBluetoothCheck = true; // 是否开启蓝牙检测
        if (openBluetoothCheck) {
            if (MBlockly.Control.bluetoothConnected) {
                return true;
            } else {
                if (MBlockly.Control.bleLastTimeConnected) {
                    this.sendBlueReconnectRequest();
                    MBlockly.Control.bleLastTimeConnected = false;
                    throw "BleDisconnected";
                }
            }
        } else {
            return true;
        }
        return false;
    },

    sendBluetoothRequest: function(dataArray) {
        var dataStr = dataArray.join(' ');
        // console.log(dataStr);
        if(this._bluetoothAvailableCheckPassed()){
            console.log('【send bluetooth】：' + dataStr);
            TellNative.sendViaBluetooth(dataStr);
        }
    },

    sendBluetoothRequestUnrelibly: function(dataArray){
        console.log('【send bluetooth ulybly】：' + intArrayToHexArray(dataArray).join(" "));
        var dataStr = dataArray.join(' ');
        if(this._bluetoothAvailableCheckPassed()){
            if(!MBlockly.Settings.DEBUG) {
                TellNative.sendViaBluetoothUnreliably(dataStr);
            }
        }
    },

    sendBlueReconnectRequest: function() {
        TellNative.requestBluetoothReconnect();
    }
});

/* native 直接调用 web */
extend(MBlockly.HostInterface, {
    // 加载cp上所有组件数据
    loadControlPanel : function(dataStr) {
        var data;
        var that = this;
        if(!MBlockly.Settings.DEBUG) {
            var decodeData = decodeURIComponent(dataStr);
            data = JSON.parse(decodeData);
            console.log(data);
        } else {
            // in debug mode
            data = MBlockly.Data.mockData;

            if($('.test-area')) {
                $('.test-area').show();
            }

            window.TellNative = {
                requestLoadProject: function(){},
                reportCurrentWidget: function(){},
                saveControlPanel: function(){},
                sendValueToWidget: function(){},
                sendViaBluetooth: function(){},
                requestBluetoothReconnect: function(){},
                sendViaBluetoothUnreliably: function(){}
            };
        }
        if(data) {
            for(var i in data) {
                if(data[i]) {
                    this.widgetAdd(JSON.stringify(data[i]));
                }
            }

            setTimeout(function() {
                that.tellControlPanelBlocklyIsReady();
            }, 100);
        }
    },

    // cp上新增组件
    widgetAdd : function(jsonStr) {
        if(jsonStr) {
            var that = this;
            var data = JSON.parse(jsonStr);
            data.code = decodeURIComponent(data.code);
            data.icon = MBlockly.Settings.UI_WIDGET_ICON_PATH + "widget-" + data.xib + ".png";
            MBlockly.Data.add(data);

            // TOFIX: hack for module do not save auto when added into the panel.
            setTimeout(function() {
                that.saveControlPanel();
            }, 50);
        }
    },

    // cp上删除组件
    widgetDelete: function(widgetId) {
        MBlockly.Data.deleteData(widgetId);
        this.saveControlPanel();
    },

    // cp上更新组件，比如改slider的名字，更新port口
    widgetUpdate : function(id, jsonStr) {
        var data = JSON.parse(jsonStr);
        var targetWidget = MBlockly.Data.getOne(id);
        for(var i in data) {
            if(data[i]) {
                // 用slot口代替port口
                if(data.port == "0") {
                    data.port = data.slot;
                }
                MBlockly.Data.updateData(id, i, data[i]);
            }
        }
        MBlockly.App.widgetOnLoad(id);
        this.saveControlPanel();
    },

    // 操作cp上的组件，实时传值给 program
    sendWidgetValue : function(id, value) {
        var that = this;
        console.log('sendWidgetValue: ' + id + '：' + value);
        if(this.flagList[id]) {
            this.flagList[id] = false;
            MBlockly.WhenEvent.activateWhenBlocks(id, value);
        } else {
            setTimeout(function() {
                MBlockly.WhenEvent.activateWhenBlocks(id, value);
            }, 100);
        }
    },

    switchToCodingPanel: function(id) {
        MBlockly.Settings.MODE_IN_CODING = true;
        MBlockly.Settings.OPEN_HIGHLIGHT = true;
        MBlockly.App.widgetOnLoad(id);
        this.exitPlayMode();
    },

    switchToControlPanel: function() {
        MBlockly.Settings.OPEN_HIGHLIGHT = false;
        MBlockly.Settings.MODE_IN_CODING = false;
        // 提交所有编码数据给controlPanel
        this.saveControlPanel();
    },

    // 开始运行代码，当在 cp 的 play 界面开始定时执行 when star 模块的代码，pause 和 edit 界面停止各定时器
    enterPlayMode: function() {
        // MBlockly.Settings.OPEN_INFO_TUEN_WITH_APP = true;
        // if(MBlockly.Settings.MODE_IN_CODING) {
        //     MBlockly.WhenEvent.runWhenStarts();
        // } else {
        //     setTimeout(function() {
        //         MBlockly.WhenEvent.runWhenStarts();
        //     }, 500);
        // }
    },

    // 停止运行代码
    exitPlayMode: function() {
        MBlockly.Settings.OPEN_INFO_TUEN_WITH_APP = false;
        if(MBlockly.Settings.MODE_IN_CODING) {
            MBlockly.WhenEvent.stopWhenStarts();
        } else {
            setTimeout(function() {
                MBlockly.WhenEvent.stopWhenStarts();
            }, 400);
        }
    },

    // 通知web主板的类型
    tellMainboardInfo: function(jsonStr) {
        var data = JSON.parse(jsonStr);
        MBlockly.Control.setDeviceInfo(data);
    },

    // 清空webview中的所有有关blockly的数据，因为Android切换项目是不会刷新webview
    resetMblockly: function() {
        this.exitPlayMode();
        MBlockly.App.resetUi();
        MBlockly.Data.resetData();
        // 中断runtime
        // 中断数据重发
        // 重置处理传感器读值的队列
        MBlockly.Control.PromiseList.reset();

    }
});

// 接收并解析设备（iOS, android）返回数据，直接调用函数
function receiveDeviceData(message, a, b, c) {
    var runListenerList = function(listenerList) {
        for (var i = 0; i < listenerList.length; i++) {
            listenerList[i]();
        }
    };
    switch(message) {
        case 'shake':
            MBlockly.Control.tabletLastShakeTime = (new Date()).getTime() / 1000;
            break;
        case 'receiveVoice':
            Message.receiveVoice(a);
        case 'bleconnect':
            MBlockly.Control.bluetoothConnected = true;
            MBlockly.Control.bleLastTimeConnected = true;
            MBlockly.Servo && MBlockly.Servo.bluetoothConnect();
            break;
        case 'bledisconnect':
            MBlockly.Control.bluetoothConnected = false;
            break;
        // case 'tilt':
        //     MBlockly.Control.tabletTiltLeftRightStatus = a; // -1:left, 1:right
        //     MBlockly.Control.tabletTiltForwardBackwardStatus = b; //-1: backward, 1: forward
        //     break;
        // case 'loadControlPanel':
        //     MBlockly.HostInterface.loadControlPanel(a);
        //     break;
        // case 'widgetAdd':
        //     MBlockly.HostInterface.widgetAdd(a);
        //     break;
        // case 'widgetDelete':
        //     MBlockly.HostInterface.widgetDelete(a);
        //     break;
        // case 'widgetUpdate':
        //     MBlockly.HostInterface.widgetUpdate(a, b);
        //     break;
        // case 'sendWidgetValue':
        //     if(MBlockly.Settings.OPEN_INFO_TUEN_WITH_APP) {
        //         // widgetId, widgetState
        //         MBlockly.HostInterface.sendWidgetValue(a, b);
        //     }
        //     break;
        // case 'switchToControlPanel':
        //     MBlockly.HostInterface.switchToControlPanel();
        //     break;
        // case 'switchToCodingPanel':
        //     MBlockly.HostInterface.switchToCodingPanel(a);
        //     break;
        // case 'resetMblockly':
        //     MBlockly.HostInterface.resetMblockly();
        //     break;
        // case 'enterPlayMode':
        //     MBlockly.HostInterface.enterPlayMode();
        //     break;
        // case 'exitPlayMode':
        //     MBlockly.HostInterface.exitPlayMode();
        //     break;
        case 'tellMainboardInfo':
            MBlockly.HostInterface.tellMainboardInfo(a);
            break;
        default:
            break;
    }
}

// 接收并解析蓝牙返回数据
function receiveBluetoothData(string) {
    var data = decodeURIComponent(string);
    MBlockly.Control.decodeData(data);
}


// 原声端调用js的接口定义
function nativeCallWeb(methodName, jsonStr) {
    if(jsonStr) {
        var json  = JSON.parse(jsonStr);
    }
    switch(methodName) {
        case 'setLedColor':
            MBlockly.Action.setLedColor(json);
            break;
        case 'turnOffLed':
            MBlockly.Action.turnOffLed(json);
            break;
        case 'setTone':
            MBlockly.Action.setTone(json);
            break;
        // 通过blockly获取传感器的值
        case 'getSensorValue':
            MBlockly.Action.getSensorValue(json);
            break;
        default:
            break;
    }
}