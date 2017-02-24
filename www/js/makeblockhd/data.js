/**
 * @description data handler
 * @author Hujinhogn
 * @copyright 2015 Makeblock.cc
 */


MBlockly = MBlockly || {};

MBlockly.Data = {
  widgetList: {},
  mockData: {
    "1": {
      'id': '1',
      'name': '2414124',
      'type': 'Display',
      'xib': 'MBWBarDisplay',
      "port": "",
      "code": "",
      "xmlData": ""
    },
    "2": {
      'id': '2',
      'name': 'BarDisplay',
      'type': 'Display',
      'xib': 'MBWBarDisplay',
      "port": "",
      "code": "",
      "xmlData": ""
    },
    "4": {
      'id': '4',
      'name': '哈哈',
      'type': 'Slider',
      'xib': 'MBWSlider',
      "port": "",
      "code": "",
      "xmlData": ""
    },
    "5": {
      'id': '5',
      'name': '哈哈',
      'type': 'Switch',
      'xib': 'MBWSwitch',
      "port": "",
      "code": "",
      "xmlData": ""
    },
    "3": {
      'id': '3',
      'name': '哈哈',
      'type': 'DPad',
      'xib': 'MBWDPad',
      "port": "",
      "code": "",
      "xmlData": ""
    },
    "6": {
      'id': '6',
      'name': '哈哈',
      'type': 'Button',
      'xib': 'MBWButton',
      "port": "",
      "code": "[]",
      "xmlData": ""
    }
  },
  // 不需要编程的组件类型
  noNeedCodingWidgets: ['MBWJoystick', 'MBWSpeaker', 'MBWColorPicker', 'MBWMusicKey', 'MBWFlightAttitudeJoystick',
        'MBWCarJoystick', 'MBWFlightJoystick', 'MBWPathController'],
  // 需要编程但不显示在顶部
  noNeedShowWidgets: ['MBWFlightInstrument', 'MBWDuoIndicator']
};

// fetch all data
MBlockly.Data.fetch = function() {
  return this.widgetList;
};

window.widgetList = MBlockly.Data.fetch();

MBlockly.Data.add = function(newWidget) {

  // 过滤不需要编程的组件
  if (newWidget.xib && MBlockly.Data.noNeedCodingWidgets.indexOf(newWidget.xib) == -1) {

    // 增加去重检测
    if (!MBlockly.Data.hasOne(newWidget.id)) {
      // 更新数据集
      this.fetch()[newWidget.id] = newWidget;

      // 给不同类型的组件编程面板，添加不同的起始 when 块
      if (MBlockly.Settings.INIT_TOP_BLOCKS) {
        this.initTopBlock(newWidget);
      }

      // 注册每个组件的可执行flag
      MBlockly.HostInterface.flagList[newWidget.id] = true;

      // 当新增组件时更新页面顶部UI
      MBlockly.App.addTopWidgetItem(newWidget);

      // 注册 when_start 块
      if (newWidget.xmlData.hasStr('when_start')) {
        MBlockly.WhenEvent.registerWhenStartblocks(newWidget.id);
      }

      // 构建 dropdown list
      this.widgetDropdownList.add(newWidget);
    } else {
      console.log('-- 组件已存在 --');
    }
  }
};

// get a certain item
MBlockly.Data.getOne = function(id) {
  return this.fetch()[id];
};

MBlockly.Data.hasOne = function(id) {
  if (this.fetch()[id]) {
    return true;
  } else {
    return false;
  }
};

// 更新数据集：更新blockly代码块，更新codelist中新生成的代码
MBlockly.Data.updateData = function(id, key, value) {
  if (id && eval(id)) {
    if (this.getOne(id)) {
      // 更新最终数据集
      this.getOne(id)[key] = value;
      // 更新 dropdown list
      this.widgetDropdownList.update(id, key, value);
    }
  }
};


// 从组件上删除数据
MBlockly.Data.deleteData = function(id) {
  console.log(id);
  if (this.hasOne(id)) {
    // 移除顶部UI组件
    MBlockly.App.removeTopWidgetItem(id);

    // 处理已经注册的when块
    MBlockly.WhenEvent.clearWhenStarts(id);

    // 处理已注册的widget下拉菜单列表
    this.widgetDropdownList.remove(id);

    // 移除最终数据
    if (delete this.widgetList[id]) {
      console.log('【移除数据:' + id + '】: 成功');
    }
  }
};

/**
 * 清空所有数据
 */
MBlockly.Data.resetData = function() {
  this.widgetList = {};
  window.widgetList = MBlockly.Data.fetch();
  this.widgetDropdownList.reset();
  MBlockly.WhenEvent.resetWhenStarts();
};

/**
 * 构建 port 口下拉列表
 * @param {string} type 默认的传感器类型
 */
extend(MBlockly.Data, {
  portList: {
    list: {},
    get: function(type) {
      var settingsPort = MBlockly.Control.getDeviceInfo().portlist;
      var port = settingsPort[type],
        portPrefix = MBlockly.Settings.PORT_PREFIX,
        portPrefixTip = Blockly.Msg.PORT,
        portListTemp = [];
      var deviceType = MBlockly.Control.deviceInfo.type;

      // 处理特殊传感器的 port 口描述，例如板载端口
      var onBoardPortTipMap = {
        mcore: {
          MOTOR: {
            9: "M1",
            10: "M2"
          },
          LIGHT: {
            6: Blockly.Msg.ON_BOARD_LIGHT
          },
        },
        orion: {
          MOTOR: {
            9: "M1",
            10: "M2"
          },
        },
        auriga: {
          VOLUME: {
            14: Blockly.Msg.ON_BOARD_SOUND
          },
          LIGHT: {
            11: Blockly.Msg.ON_BOARD_LEFT,
            12: Blockly.Msg.ON_BOARD_RIGHT
          },
          ENCODER_MOTOR: {
            1: "M1",
            2: "M2",
          }
        }
      };

      if (port || port == 0) {
        if (typeof(port) == 'object') {
          // 判断是不是数组
          for (var i in port) {
            var portStr = portPrefixTip + port[i];
            if(onBoardPortTipMap[deviceType] && onBoardPortTipMap[deviceType][type] && onBoardPortTipMap[deviceType][type][port[i]]) {
              portStr = onBoardPortTipMap[deviceType][type][port[i]];
            }
            portListTemp.push([portStr, portPrefix + port[i]]);
          }
        } else {
          portListTemp.push([portPrefixTip + port, portPrefix + port]);
        }
      } else {
        // 其他所有外接传感器的通用port口
        for (var i in settingsPort.COMMON_LIST) {
          var item = settingsPort.COMMON_LIST;
          portListTemp.push([portPrefixTip + item[i], portPrefix + item[i]]);
        }
      }

      if (MBlockly.App.currentWidget.id && MBlockly.Data.getOne(MBlockly.App.currentWidget.id)) {
        // 如果 cp 面板上有设置 port 口，则将port口选项放入下拉列表中，并将该选项调整为当前选中
        var portFromCp = false;//MBlockly.Data.getOne(MBlockly.App.currentWidget.id).port;
        var slotFromCp = false;//MBlockly.Data.getOne(MBlockly.App.currentWidget.id).slot;
        // 为auriga的port口做出单独处理
        if (type == "ENCODER_MOTOR" && MBlockly.Control.deviceInfo.type == "auriga" && slotFromCp) {
          console.log('slotFromCp: ' + slotFromCp);
          portListTemp.splice(0, 0, [Blockly.Msg.PORT_RECEIVED_BY_SETTING, portPrefix + slotFromCp]);
        } else {
          if (portFromCp) {
            console.log("【port】：" + portFromCp);
            portListTemp.splice(0, 0, [Blockly.Msg.PORT_RECEIVED_BY_SETTING, portPrefix + portFromCp]);
          }
        }
      }

      this.list = portListTemp;
      return this.list;
    },
    getSlot: function() {
      var slot = [];
      if (MBlockly.App.currentWidget.id && MBlockly.Data.getOne(MBlockly.App.currentWidget.id)) {
        // 如果 cp 面板上有设置 slot 口，则将slot口选项放入下拉列表中，并将改选项调整为当前选中
        var slotFromCp = MBlockly.Data.getOne(MBlockly.App.currentWidget.id).slot;
        if (slotFromCp) {
          var temp = [slotFromCp + "", MBlockly.Settings.SLOT_PREFIX + slotFromCp];
          if (slotFromCp == "1") {
            slot.push(temp);
            slot.push(["2", MBlockly.Settings.SLOT_PREFIX + "2"]);
          } else {
            slot.push(["1", MBlockly.Settings.SLOT_PREFIX + "1"]);
            slot.push(temp);
          }
        } else {
          slot = [
            ["1", MBlockly.Settings.SLOT_PREFIX + "1"],
            ["2", MBlockly.Settings.SLOT_PREFIX + "2"]
          ];
        }
      } else {
        slot = [
          ["1", MBlockly.Settings.SLOT_PREFIX + "1"],
          ["2", MBlockly.Settings.SLOT_PREFIX + "2"]
        ];
      }
      return slot;
    },
    update: function(id, portValue, type) {
      var targetData = MBlockly.Data.getOne(id);
      var code = targetData.code;
      var xmlData = targetData.xmlData;
      var portCount = MBlockly.Data.reportPortCount(id, code);
      var slotCount = MBlockly.Data.reportSlotCount(id, code);

      if (type == "port") {
        if (portCount >= 1) {
          var reg = /@PORT-(\d+)@/g;
          // var rs = reg.exec(code)[0];
          var newPort = "@PORT-" + portValue + "@";
          var newCode = code.replace(reg, newPort);
          MBlockly.Data.updateData(id, 'code', newCode);

          var reg2 = /PORT-(\d+)/g;
          // var rs2 = reg2.exec(xmlData)[0];
          var newPort2 = "PORT-" + portValue;
          var newXmlData = xmlData.replace(reg2, newPort2);
          MBlockly.Data.updateData(id, 'xmlData', newXmlData);
        }
      }

      if (type == "slot") {
        if (slotCount >= 1) {
          var reg = /@SLOT-(\d+)@/g;
          // var rs = reg.exec(code)[0];
          var newSlot = "@SLOT-" + portValue + "@";
          var newCode = code.replace(reg, newSlot);
          MBlockly.Data.updateData(id, 'code', newCode);

          var reg2 = /SLOT-(\d+)/g;
          // var rs2 = reg2.exec(xmlData)[0];
          var newSlot2 = "SLOT-" + portValue;
          var newXmlData = xmlData.replace(reg2, newSlot2);
          MBlockly.Data.updateData(id, 'xmlData', newXmlData);
        }
      }

    }
  },
});

/**
 * 按照不同的类型构建组件类型列表，方便下拉菜单的加载和选择
 */
extend(MBlockly.Data, {
  widgetGroups: {
    'ids': {},
    'Buttons': [],
    'Switchs': [],
    'Sliders': [],
    'Displays': []
  },
  widgetDropdownList: {
    // 注册各类型的组件
    add: function(data) {
      var groups = MBlockly.Data.widgetGroups;
      if (!groups.ids[data.id]) {
        groups.ids[data.id] = true;

        var temp = [];
        var name = MBlockly.App.getWidgetName(data.id, data.name);
        temp.push(name);
        temp.push(data.id);

        if (data.id) {
          var abstractType = data.type;
          if (abstractType && groups[abstractType + 's']) {
            groups[abstractType + 's'].push(temp);
          }
        }
      }
    },
    // 更新widgetList
    update: function(id, key, value) {
      // console.log(id + '-' + key);
      var groups = MBlockly.Data.widgetGroups;
      if (key == 'name') {
        if (groups.ids[id]) {
          var type = MBlockly.Data.getOne(id).type;
          var list = groups[type + 's'];
          for (var i = 0; i < list.length; i++) {
            if (list[i][1] == id) {
              list[i][0] = value;
            }
          }
        }
      }
      if (key == 'port') {
        // 如果更新了port口，则重新加载项目，将cp上设置的port口直接更新
        MBlockly.Data.portList.update(id, value, "port");
      }

      if (key == 'slot') {
        // 如果更新了slot口，则重新加载项目，将cp上设置的slot口直接更新
        MBlockly.Data.portList.update(id, value, "slot");
      }
    },
    /**
     * 获取指定类型的组件下拉菜单列表
     * @param  {string} type [description]
     * @return {array} 返回满足blockly下拉菜单格式的数组列表
     */
    get: function(type) {
      var options = goog.cloneObject(MBlockly.Data.widgetGroups[type]);
      // wy: 增加一个"this"选项，
      // 只拖一个官方组件，id为0，但执行的时候会引用当前组件
      options.unshift([Blockly.Msg.THIS, '0']);
      if (options.length == 0) {
        options = [
          [Blockly.Msg.NO_DISPLAY_WIDGET_AVAILABLE, '--']
        ];
      } else {
        // 如果当前组件位于列表中，则将其与首位互换，置为默认位置
        var cloneOptions = goog.cloneObject(options);
        var id = MBlockly.App.currentWidget.id;
        for (var i in cloneOptions) {
          if ((cloneOptions[i][1] == id) && cloneOptions.length > 1) {
            return cloneOptions;
          }
        }
      }
      return options;
    },
    /**
     * 当在cp上移除了某个组件时，如果涉及到下拉菜单，则同时将其移除
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    remove: function(id) {
      var groups = MBlockly.Data.widgetGroups;
      // 检查groups是否注册过该组件
      if (groups.ids[id]) {
        var type = MBlockly.Data.getOne(id).type;
        var list = groups[type + 's'];
        if (list) {
          for (var i = 0; i < list.length; i++) {
            if (list[i][1] == id) {
              list.splice(i, 1);
            }
          }
        }
      }
    },

    reset: function() {
      MBlockly.Data.widgetGroups = {
        'ids': {},
        'Buttons': [],
        'Switchs': [],
        'Sliders': [],
        'Displays': []
      };
    }
  }
});


MBlockly.Data.reportPortCount = function(id, code) {
  var portCount = code.countStrFrequency(MBlockly.Settings.PORT_PREFIX);
  console.log('port\'s number is: ' + portCount);
  return portCount;
};

MBlockly.Data.reportSlotCount = function(id, code) {
  var slotCount = code.countStrFrequency(MBlockly.Settings.SLOT_PREFIX);
  console.log('slot\'s number is: ' + slotCount);
  return slotCount;
};

/**
 * 为不同类型的组件，自动添加起始 when 块
 * @param  {[type]} widgetData 单个组件的数据
 * @return {void}
 */
MBlockly.Data.initTopBlock = function(widgetData) {
  var xmlStr = widgetData.xmlData;
  var type = widgetData.type;
  if (!xmlStr.hasStr('when_')) {
    // 当原数据中不包含 when 模块时，才自动添加 when
    if (xmlStr.length == 0) {
      xmlStr = xencode(this.createInitTopBlockXmlStr(type));
      this.updateData(widgetData.id, 'xmlData', xmlStr);
    }
  }
};

/**
 * 创建不同类型组件起始when块的XML代码
 * @param  {[type]} type 组件的通用类型
 * @return {string} 返回xml字符串
 */
MBlockly.Data.createInitTopBlockXmlStr = function(type) {

  // 设置自动添加的when模块的位置, 1表示一个when块，2表示两个，排列思路是
  // 先从左到右，再从上到下，一行最多两个when块
  var pos = {
    "1": [{
      x: 200,
      y: 100
    }],
    "2": [{
      x: 200,
      y: 100
    }, {
      x: 200,
      y: 260
    }],
    "4": [{
      x: 100,
      y: 100
    }, {
      x: 450,
      y: 100
    }, {
      x: 100,
      y: 200
    }, {
      x: 450,
      y: 200
    }, {
      x: 100,
      y: 300
    }, {
      x: 450,
      y: 300
    }, {
      x: 100,
      y: 400
    }, {
      x: 450,
      y: 400
    }]
  };

  var s = '<xml xmlns="http://www.w3.org/1999/xhtml">';
  var blockStr;
  if (type == 'Button') {
    blockStr = '<block type="when_button_pressed_down" data-widgettype="Button" data-blocktype="when" x="' + pos["2"][0].x + '" y="' + pos["2"][0].y + '"></block>' +
      '<block type="when_button_pressed_up" data-widgettype="Button" data-blocktype="when" x="' + pos["2"][1].x + '" y="' + pos["2"][1].y + '"></block>';
  } else if (type == 'Slider') {
    blockStr = '<block type="when_slider_changed" data-widgettype="Slider" data-blocktype="when" x="' + pos["1"][0].x + '" y="' + pos["1"][0].y + '"></block>';
  } else if (type == 'Switch') {
    blockStr = '<block type="when_switch_on" data-widgettype="Switch" data-blocktype="when" x="' + pos["2"][0].x + '" y="' + pos["2"][0].y + '"></block>' +
      '<block type="when_switch_off" data-widgettype="Switch" data-blocktype="when" x="' + pos["2"][1].x + '" y="' + pos["2"][1].y + '"></block>';
  } else if (type == 'Display') {
    blockStr = '<block type="when_start" data-widgettype="Display" data-blocktype="when" x="' + pos["1"][0].x + '" y="' + pos["1"][0].y + '"></block>';
  } else if (type == 'DPad') {
    blockStr = '<block type="when_dpad_top_down" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][0].x + '" y="' + pos["4"][0].y + '"></block>' +
      '<block type="when_dpad_top_up" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][1].x + '" y="' + pos["4"][1].y + '"></block>' +
      '<block type="when_dpad_bottom_down" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][2].x + '" y="' + pos["4"][2].y + '"></block>' +
      '<block type="when_dpad_bottom_up" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][3].x + '" y="' + pos["4"][3].y + '"></block>' +
      '<block type="when_dpad_left_down" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][4].x + '" y="' + pos["4"][4].y + '"></block>' +
      '<block type="when_dpad_left_up" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][5].x + '" y="' + pos["4"][5].y + '"></block>' +
      '<block type="when_dpad_right_down" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][6].x + '" y="' + pos["4"][6].y + '"></block>' +
      '<block type="when_dpad_right_up" data-widgettype="DPad" data-blocktype="when" x="' + pos["4"][7].x + '" y="' + pos["4"][7].y + '"></block>';
  }

  s += (blockStr + '</xml>');
  return s;
};