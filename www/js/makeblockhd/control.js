/**
 * Serial port communication through device such as iOS and android.
 * It likes a dispatcher and handlers two things:
 *      1. read message from device and parse it. The message may be serial port signal or
 *      device info.
 *      2. write message into serial port via device.
 */


MBlockly = MBlockly || {};


/**
 * common protocol.
 * 定义协议
 */
MBlockly.Control = {
    SETTING: {
        /* 发送数据相关 */
        CODE_CHUNK_PREFIX: [255, 85],
        READ_CHUNK_SUFFIX: [13, 10],
        // 回复数据的index位置
        READ_BYTES_INDEX: 2,
        // 发送数据中表示“读”的值
        READMODULE: 1,
        // 发送数据中表示“写”的值
        WRITEMODULE: 2,
        // 读值指令超时的设定
        COMMAND_SEND_TIMEOUT: 2000,
        // 超时重发的次数
        RESENT_COUNT: 10,
        // 当前指令的索引值
        CURRENT_CMD_INDEX: null,
        // 获取到的最大指令长度
        REC_BUF_LENGTH: 40,

        // PORT口
        PORT: {
            "auriga": {
                // 通用port口列表
                COMMON_LIST: [6, 7, 8, 9, 10],
                // 板载传感器port口
                LIGHT: [11, 12, 6, 7, 8, 9, 10],
                TEMPERATURE: 13,
                VOLUME: [14, 6, 7, 8, 9, 10],
                LED_PANEL: 0,
                // 两个板载电机是slot口1和2，port口味0，其他电机的port口是1,2,3,4
                MOTOR: [1,2,3,4],
                ENCODER_MOTOR: [1,2],
                COMMON_ENCODER_MOTOR: [1,2,3,4]
            },
            "mcore": {
                COMMON_LIST: [1, 2, 3, 4],
                MOTOR: [9,10],
                LED: 7,
                VOLUME: [3,4],
                FLAME: [3,4],
                GAS: [3,4],
                FOUR_KEY: [3,4],
                LIGHT: [6,3,4],
                JOYSTICK: [3,4],
                KEY_PRESSDOWN_SENSOR: [3,4],
                POTENTIOMETER: [3,4]
            },
            "orion": {
                COMMON_LIST: [3, 4, 6, 7, 8],
                LINEFOLLOW: [3,4,6],
                LIGHT: [6,7,8],
                VOLUME: [6,7,8],
                TOUCHSENSOR: [3,4,6],
                FLAMESENSOR: [6,7,8],
                GAS_STRENGTH_SENSOR: [6,7,8],
                KEY_PRESSDOWN_SENSOR: [6,7,8],
                JOYSTICK: [6,7,8],
                POTENTIOMETER: [6,7,8],
                PIR_MOTION: [3,4,6],
                MOTOR: [9,10,1,2],
                JOYSTICK: [6,7,8],
                POTENTIOMETER: [6,7,8],
                COMMON_ENCODER_MOTOR: [1,2],
                SEGMENTS_TUBE: [3,4,6]
            },
            "megaPi": {
                COMMON_LIST: [6, 7, 8],
                MOTOR: [1,2,3,4,9,10,11,12],
                STEPPER_MOTOR: [1,2,3,4],
                ENCODER_MOTOR: [1,2,3,4]
            }
        },

        // tone
        TONE_HZ: {
            // 原始数据：D5: 587 "E5": 658,"F5": 698,"G5": 784,"A5": 880,"B5": 988,"C6": 1047
            "A2": 110,"B2": 123,
            "C3": 131,"D3": 147,"E3": 165,"F3": 175,"G3": 196,"A3": 220,
            "B3": 247,"C4": 262,"D4": 294,"E4": 330,"F4": 349,"G4": 392,
            "A4": 440,"B4": 494,"C5": 523,"D5": 555,"E5": 640,"F5": 698,
            "G5": 784,"A5": 880,"B5": 988,"C6": 1047,"D6": 1175,"E6": 1319,
            "F6": 1397,"G6": 1568,"A6": 1760,"B6": 1976,"C7": 2093,"D7": 2349,
            "E7": 2637,"F7": 2794,"G7": 3136,"A7": 3520,"B7": 3951,"C8": 4186,"D8":4699
        },
        BEATS: {
            "Quarter":250,"Half":500,"Eighth":125,"Whole":1000,"Double":2000,"Zero":0
        }
    }
};

/* 一些公用变量 */
extend(MBlockly.Control, {
    buffer: [],
    // 接收到的数据长度
    recvLength: 0,
    tabletTiltLeftRightStatus: 0,
    tabletTiltForwardBackwardStatus: 0,
    tabletLastShakeTime: 0,
    bluetoothConnected: true,
    bleLastTimeConnected: true,

    isMotorMoving: false,

    LINEFOLLOWER_VALUE: {
        'BLACK_BLACK': 0,
        'BLACK_WHITE': 1,
        'WHITE_BLACK': 2,
        'WHITE_WHITE': 3
    },

    LedPosition: {
        BOTH: "0",
        RIGHT: "1",
        LEFT: "2"
    },

    // 用来记录不同主板的port, slot等信息
    // 主板类型为：mcore,orion,auriga,megaPi,AirBlockCar,AirBlockDrone,AirBlockCustom
    deviceInfo : {
        type: "mcore",
        portlist: MBlockly.Control.SETTING.PORT["mcore"]
    },
    getDeviceInfo: function() {
        return this.deviceInfo;
    },

    setDeviceInfo: function(data) {
        console.log(data);
        var type = data.type;

        // makelbock 第一代老版本的固件，默认可以用mcore来处理，主要是蜂鸣器和led的通信协议上发生了改变, data.version = "1.2.103"
        if(type == "default" || type == "(null)") {
            type = "mcore";
        }
        // 更名兼容：原来2560名称改为auriga
        if(type == "2560") {
            type = "auriga";
        }
        this.deviceInfo.type = type;
        if(this.SETTING.PORT[type]) {
            this.deviceInfo.portlist = this.SETTING.PORT[type];
            this.deviceInfo.version = data.version;
        } else {
            console.log('【error】:"' + type + '" is not a valid board type, they should be: \n ' +
                'mcore, orion, auriga, megaPi');
            return false;
        }
    }
});

/* step2: 定义发送具体条目的串口指令 */
extend(MBlockly.Control, {
    // 超声波
    readUltrasoinic: function(index, port) {
        var type = 1;
        var port = port ? port : 0x05;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 巡线
    readLineFollow: function(index, port) {
        var type = 17;
        var port = port ? port : 0x03;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 光线传感器
    readLightSensor: function(index, port) {
        var type = 3;
        var port = port ? port : 0x0b;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 读取红外传感器的值： mbot 板载，协议暂时没写
    readInfraredSensor: function(index, port) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x0e,
            port
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 火焰传感器
    readFlameSensor: function(index, port) {
        var type = 0x18;
        var port = port ? port : 0x06;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 触摸传感器
    readTouchSensor: function(index, port) {
        var type = 0x33;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 按键传感器
    readKeyPressDownSensor: function(index, port) {
        var type = 0x16;
        var port = port ? port : 0x06;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 点击按钮: ff 55 05 00 01 23 07 00
    readTopButton: function(index) {
        var type = 35;
        var port = 7;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 温度传感器（板载）
    readTemperatureSensor: function(index, port) {
        var type = 27;
        var port = port ? port : 0x0d;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 通用温度传感器: ff 55 05 00 01 02 03 01  （单独的温度传感器）
    readCommonTemperatureValue: function(index, port, slot) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x02,
            port,
            slot
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 温湿度传感器: ff 55 05 00 01 17 06 01（01表示温度，00表示湿度）
    readCommonTemperatureHumidityValue: function(index, port, type) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x17,
            port,
            type
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 气体浓度传感器
    readGasStrength: function(index, port) {
        var type = 0x19; //device type
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    // 按键被按下传感器: ff 55 05 00 01 16 06 01（01、02、03、04分别表示按键1、2、3、4）
    readKeyPressDownSensorValue: function(index, port, key) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x16,
            port,
            key
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 通用陀螺仪: ff 55 05 00 01 06 01 01， mbot不支持
    readGyroscopeSensor: function(index, port, axis) {
        var that = MBlockly.Control;
        if(that.deviceInfo.type == "auriga") {
            port = 0x01;
        }

        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x06,
            port,
            axis
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 电子罗盘: ff 55 04 00 01 1a 06
    readCompassValue: function(index, port) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x04,index,
            that.SETTING.READMODULE,
            0x1a,
            port
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 音量传感器
    readVolumeSensor: function(index, port) {
        var type = 7;
        var port = port ? port : 0x0e;
        MBlockly.Control.buildModuleRead(type, port, index);
    },

    /**
     * 读取编码电机的值
     * @param  {string} port 左右电机的port口，针对 auriga 左电机为1，右电机为2
     * @param  {string} type 读取位置还是速度，"position" 和 "speed"
     *
     *  ff 55 06 00 01 3d 00 01 02
     */
    readEnCoderMotorValue: function(index, port, type) {
        var that = MBlockly.Control;
        type = (type == "position") ? 1 : 2;

        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,index,
            that.SETTING.READMODULE,
            0x3d,
            0,
            port,
            type
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 读取电位器: ff 55 04 00 01 04 06
    readPotentiometerValue: function(index, port) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x04,index,
            that.SETTING.READMODULE,
            0x04,
            port
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 读取限位开关: ff 55 05 00 01 15 06 01
                // ff 55 05 00 01 15 06 02
    readLimitSwitchValue: function(index, port, slot) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x15,
            port,
            slot
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 读取人体红外传感器状态: ff 55 04 00 01 0f 06
    readPirValue: function(index, port) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x04,index,
            that.SETTING.READMODULE,
            0x0f,
            port
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 读取摇杆的值: ff 55 05 00 01 05 06 01
    readJoystickValue: function(index, port, axis) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,index,
            that.SETTING.READMODULE,
            0x05,
            port,
            axis
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 读取智能舵机的角度: ff 55 06 00 01 3f 0d 05 01
    readSmartServoAngleValue: function(index, id) {
        var type = 0x0d;

        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,index,
            that.SETTING.READMODULE,
            0x3f,
            0x0d,
            0x05,
            id
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    },

    // 表情面板
    showFace: function(port,x, y, face){
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x17,0,
            that.SETTING.WRITEMODULE,
            0x29,
            port,
            0x02,
            x,
            y
        ].concat(face);

        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /**
     * 设置左右电机速度
     * @param {Number} leftSpeed  左电机速度
     * @param {Number} rightSpeed 右电机速度
     */
    setSpeed: function(leftSpeed, rightSpeed) {
        var that = this;
        var portLeft = this.deviceInfo.portlist.MOTOR[0];
        var portRight = this.deviceInfo.portlist.MOTOR[1];
        // this.setVirtualJoyStick(leftSpeed, rightSpeed);

        this.setMotor(portLeft, leftSpeed);
        setTimeout(function() {
            that.setMotor(portRight, rightSpeed);
        }, 5);
    },

    // 虚拟摇杆: ff 55 07 00 02 05 (64 00) (64 00)
    setVirtualJoyStick: function(leftSpeed, rightSpeed) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x07, 0,
            this.SETTING.WRITEMODULE,
            0x05,
            leftSpeed & 0xff,
            (leftSpeed >> 8) & 0xff,
            rightSpeed & 0xff,
            (rightSpeed >> 8) & 0xff
        ];

        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 停止速度
    stopSpeed: function() {
        this.setSpeed(0, 0);
    },

    // 设置直流电机转速: for 套件
    setMotor: function(port, speed) {
        if (speed != 0) {
            this.isMotorMoving = true;
        } else {
            this.isMotorMoving = false;
        }

        if(this.deviceInfo.type == 'auriga' || this.deviceInfo.type == 'megaPi') {
            // 板载编码电机：用slot来代表port
            this.setEncoderMotor(port, speed);
        } else {
            // 直流电机
            this.setDcMotor(port, speed);
        }
    },

    // 直流电机: ff 55 06 00 02 0a 01 00 00, 没有slot
    setDcMotor: function(port, speed) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x06, 0,
            this.SETTING.WRITEMODULE,
            0x0a,
            port,
            speed & 0xff,
            (speed >> 8) & 0xff
        ];

        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 板载编码电机: ff 55 07 00 02 3d 00 01 ff 00
    // port为0，用slot来表示不同的位置
    setEncoderMotor: function(slot, speed) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x07, 0,
            this.SETTING.WRITEMODULE,
            0x3d,
            0,
            slot,
            speed & 0xff,
            (speed >> 8) & 0xff
        ];

        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 通用编码电机，速度150，角度720(float型): ff 55 0b 00 02 0c 08 01 96 00 00 00 34 44
    setCommonEncoderMotor: function(port, slot, speed, distance) {
        var distanceBytes = this.floatToBytes(distance);
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x0b, 0,
            this.SETTING.WRITEMODULE,
            0x0c,
            0x08, // TO WARN: port值为0x08，是系统默认值，该处实际为I²C的值
            slot,
            speed & 0xff,
            (speed >> 8) & 0xff,
            parseInt(distanceBytes[0]),
            parseInt(distanceBytes[1]),
            parseInt(distanceBytes[2]),
            parseInt(distanceBytes[3])
        ];

        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /*
        设置步进电机
        示例：设置步进电机port口1，速度3000，距离1000
            ff 55 08 00 02 28 02 b8 0b e8 03  通用步进电机
     */
    setStepperMotor: function(port, speed, distance) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x08,0,
            this.SETTING.WRITEMODULE,
            0x28,  // 通用步进电机
            port,
            speed & 0xff,
            (speed >> 8) & 0xff,
            distance & 0xff,
            (distance >> 8) & 0xff
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 设置舵机: ff 55 06 60 02 0b 05 01 2d
    setServoMotor: function(port, slot, degree) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,0,
            this.SETTING.WRITEMODULE,
            0x0b,
            port,
            slot,
            degree
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /* 设置智能舵机 */

    // 1: 设置智能舵机锁定/解锁: ff 55 07 00 02 3f 01 05 01 00
    setServoBreak: function(id, mode) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x07,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x01,
            0x05,
            id,
            mode  // 00表示锁定，01表示释放
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 2: 设置智能舵机全彩LED灯的颜色: ff 55 09 00 02 3f 02 05 01 ff 00 00
    setServoLed: function(id, r, g, b) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x09,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x02,
            0x05,
            id,
            r,
            g,
            b
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 3: 设置智能舵机握手指令: ff 55 06 00 02 3f 03 05 01
    setServoHandShake: function(id) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x03,
            0x05,
            id
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 4: 设置智能舵机绝对角度: ff 55 0e 00 02 3f 04 05 01 68 01 00 00 00 00 48 42
    setServoAbsoluteAngle: function(id, angle, speed) {
        // angle long型，speed float型
        var angleBytes = this.longToBytes(angle).reverse();
        var speedBytes = this.floatToBytes(speed);
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x0e,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x04,
            0x05, // port值固定
            id,
            parseInt(angleBytes[0]),
            parseInt(angleBytes[1]),
            parseInt(angleBytes[2]),
            parseInt(angleBytes[3]),
            parseInt(speedBytes[0]),
            parseInt(speedBytes[1]),
            parseInt(speedBytes[2]),
            parseInt(speedBytes[3])
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 5: 设置智能舵机相对角度转动: ff 55 0e 00 02 3f 05 05 01 68 01 00 00 00 00 48 42
    setServoRelativeAngle: function(id, angle, speed) {
        // angle long型，speed float型
        var angleBytes = this.longToBytes(angle).reverse();
        var speedBytes = this.floatToBytes(speed);
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x0e,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x05,
            0x05, // port值固定
            id,
            parseInt(angleBytes[0]),
            parseInt(angleBytes[1]),
            parseInt(angleBytes[2]),
            parseInt(angleBytes[3]),
            parseInt(speedBytes[0]),
            parseInt(speedBytes[1]),
            parseInt(speedBytes[2]),
            parseInt(speedBytes[3])
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 6: 设置智能舵机直流模式转动: ff 55 08 00 02 3f 06 05 01 96 00
    setServoAsDcMotor: function(id, speed) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x08,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x06,
            0x05, // port值固定
            id,
            speed & 0xff,
            (speed >> 8) & 0xff
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 7: 设置智能舵机当前位置为零点: ff 55 06 00 02 3f 07 05 01
    initServoCurrentPosAsBeginPos: function(id) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x07,
            0x05, // port值固定
            id
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 8: 设置智能舵机回到初始位置: ff 55 06 00 02 3f 08 05 01
    resetServoPosToBeginPos: function(id) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x06,0,
            this.SETTING.WRITEMODULE,
            0x3f,
            0x08,
            0x05, // port值固定
            id
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // 设置板载LED灯
    setMbotLed: function(r, g, b, position) {
        var that = this;
        var port = this.deviceInfo.portlist.LED;

        // setTimeout(function() {
            that.setLedByPosition(r, g, b, position, port);
        // }, MBlockly.Settings.RGB_TIME_GAP);
    },

    setMbotLedFull: function(r,g,b,position) {
        var that = this;
        var port = this.deviceInfo.portlist.LED;

        // setTimeout(function() {
            that.setLedByPosition(r, g, b, position, port);
        // }, MBlockly.Settings.RGB_TIME_GAP);
    },

    turnOffMbotLed: function(position) {
        var that = this;
        var port = this.deviceInfo.portlist.LED;
        // setTimeout(function() {
            that.setLedByPosition(0, 0, 0, position, port);
        // }, MBlockly.Settings.RGB_TIME_GAP);
    },

    // 设置灯盘或者灯带
    //  示例：          ff 55 09 00 02 08 00 01 00 14 00 ff
    //  老版本固件示例： ff 55 08 00 02 08 07 00 ff 00 00 00
    setLedByPosition: function(r, g, b, position, port, slot) {
        position = parseInt(position) || 0;
        var port = port || 0; //0是板载，其余是可外接端口
        var slot = slot || 2;

        var red = parseInt(r / MBlockly.Settings.RGB_BRIGHTNESS);
        var green = parseInt(g / MBlockly.Settings.RGB_BRIGHTNESS);
        var blue = parseInt(b / MBlockly.Settings.RGB_BRIGHTNESS);

        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x09,0,
            this.SETTING.WRITEMODULE,
            0x08,
            port,
            slot,
            position,red,green,blue
        ];

        // mbot 老版本
        if(this.getDeviceInfo().version == "1.2.103") {
            a[2] = 8;
            a[7] = position;
            a[8] = red;
            a[9] = green;
            a[10] = blue;
            a[11] = 0;
        }
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    stopLed: function() {
        this.setMbotLed(0, 0, 0, 0);
    },

    turnOffLed: function(position, port, slot) {
        var position = position || 0;
        var port = port || 0;
        if(slot) {
            this.setLedByPosition(0, 0, 0, position, port, slot);
        } else {
            this.setLedByPosition(0, 0, 0, position, port);
        }
    },

    playTone: function(toneName, beat) {
        if (toneName in this.SETTING.TONE_HZ) {
            this.playBuzzer(this.SETTING.TONE_HZ[toneName], beat);
        }
    },

    playBuzzer: function(toneValue, beat) {
        if(this.deviceInfo.type == "mcore") {
            this.buildModuleWriteMcoreBuzzer(toneValue, beat);
        } else {
            this.buildModuleWriteBuzzer(toneValue, beat);
        }
    },

    stopBuzzer: function() {
        if(this.deviceInfo.type == "mcore") {
            this.buildModuleWriteMcoreBuzzer(0);
        } else {
            this.buildModuleWriteBuzzer(0);
        }
    },

    /**
     * 数码管
     * @param {Number} port port number.
     * @param {Number} num float.
     * ff 55 08 00 02 09 03 00 00 c8 42
     */
    showSerialNumber: function(port, num) {
        var bytes = this.floatToBytes(num); // 4bytes
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x08,0,
            this.SETTING.WRITEMODULE,
            0x09,
            port,
            parseInt(bytes[0]),
            parseInt(bytes[1]),
            parseInt(bytes[2]),
            parseInt(bytes[3])
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /**
     * 相机快门
     * @param  {Number} port
     * @param  {Number} type 操作类型：00是按下快门，01是松开快门，02是开始对焦，03是停止对焦
     * ff 55 05 00 02 14 06 00
     */
    shutter: function(port, type) {
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x05,0,
            this.SETTING.WRITEMODULE,
            0x14,
            port,
            type
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    // stop All
    stopAll: function() {
        var that = this;
        if(this.deviceInfo.type == 'mcore') {
            this.stopLed();
        }

        // mcore出厂固件没有reset这条指令，所以只能主动停
        setTimeout(function() {
          that.setSpeed(0,0);
        }, 100);

        this.reset();
    },

    reset: function() {
        var a = [0xff,0x55,0x02,0x00,0x04];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },


    /**
     * build Buzzer machine code
     * @private
     * 播放音调为C4，四分之一拍：ff 55 07 60 02 22 06 01 fa 00
     * （老版本）：             ff 55 05 00 02 22 06 01
     */
    buildModuleWriteMcoreBuzzer: function(value, beat) {
        beat = beat ? beat : 250;
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x07,0,
            this.SETTING.WRITEMODULE,
            0x22,
            value & 0xff,
            (value >> 8) & 0xff,
            beat & 0xff,
            (beat >> 8) & 0xff,
        ];
        // 老版本的mbot固件
        if(this.getDeviceInfo().version == "1.2.103") {
            a[2] = 5;
            a[8] = 0;
            a[9] = 0;
        }
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /**
     * build Buzzer machine code
     * @private
     * 播放引脚为x2d，音调为B2，节拍为四分之一：ff 55 08 00 02 22 2d 7b 00 fa 00
     */
    buildModuleWriteBuzzer: function(value, beat) {
        beat = beat ? beat : 250;
        var a = [
            this.SETTING.CODE_CHUNK_PREFIX[0],
            this.SETTING.CODE_CHUNK_PREFIX[1],
            0x08,0,
            this.SETTING.WRITEMODULE,
            0x22,
            0x2d,
            value & 0xff,
            (value >> 8) & 0xff,
            beat & 0xff,
            (beat >> 8) & 0xff
        ];
        MBlockly.HostInterface.sendBluetoothRequestUnrelibly(a);
    },

    /**
     * build Read code
     * @private
     */
    buildModuleRead: function(type, port, index) {
        var that = MBlockly.Control;
        var a = [
            that.SETTING.CODE_CHUNK_PREFIX[0],
            that.SETTING.CODE_CHUNK_PREFIX[1],
            0x04,index,
            that.SETTING.READMODULE,
            type,
            port
        ];
        MBlockly.HostInterface.sendBluetoothRequest(a);
    }
});

// 接收的消息队列并实现组包，例如：ff 55 3c 02 10  01 0d | 0a | ff 55 03 | 04 01 0d 0a 0a 32 | 0d 0a
// data : 当前处理的数据
// this.buffer: 历史缓存数据
// 记录数据和历史数据分开记录
MBlockly.Control.decodeData = function(bytes, callback) {
    var data;
    if(typeof(bytes) == 'string') {
        console.log("【receive data】:" + bytes);
        data = bytes.split(" ");
    } else {
        data = bytes;
    }

    data = this.buffer.concat(data);
    this.buffer = [];

    // parse buffer data
    for (var i = 0; i < data.length; i++) {
        this.buffer.push(parseInt(data[i]));
        if (parseInt(data[i]) === 0x55 && parseInt(data[i - 1]) === 0xff) {
            // start flag
            this.recvLength = 0;
            this.beginRecv = true;
            this.tempBuf = [];
        } else if (parseInt(data[i - 1]) === 0x0d && parseInt(data[i]) === 0x0a) {
            // end flag
            this.beginRecv = false;
            var buf = this.tempBuf.slice(0, this.recvLength - 1);
            // 解析正确的数据后，清空buffer
            this.buffer = [];

            callback && callback(buf);

            // 以下为有效数据, 获取返回字节流中的索引位
            var dataIndex = buf[0];
            console.log('【dataIndex】：' + dataIndex);
            var promiseType = MBlockly.Control.PromiseList.getType(dataIndex);
            if(promiseType || promiseType == 0) {
                // 计算对应传感器的返回值
                this.sensor_callback(promiseType, buf);
            }
        } else {
            // normal
            if (this.beginRecv) {
                if (this.recvLength >= this.SETTING.REC_BUF_LENGTH) {
                    console.log("receive buffer overflow!");
                }
                this.tempBuf[this.recvLength++] = parseInt(data[i]);
            }
        }
    }
};

/**
 * 用来储存“读取数据”block对数据的请求，使用valueWrapper来完成程序变量的临时替代
 * 在蓝牙返回数据之后设置真实的值，然后继续程序执行。
 * 最终目的：取到程序块中请求的值
 */
extend(MBlockly.Control, {
    // index: 没有实际的用途
    PromiseType: {
        ULTRASONIC: {
            index: 0,
            method: MBlockly.Control.readUltrasoinic
        },
        // 巡线传感器
        LINEFOLLOW: {
            index: 2,
            method: MBlockly.Control.readLineFollow
        },
        // 光线传感器
        LIGHTSENSOR: {
            index: 3,
            method: MBlockly.Control.readLightSensor
        },
        // 顶部按钮
        ON_TOP_BUTTON: {
            index: 4,
            method: MBlockly.Control.readTopButton
        },
        // 温度传感器
        TEMPERATURE: {
            index: 5,
            method: MBlockly.Control.readTemperatureSensor
        },
        // 陀螺仪
        GYROSCOPE: {
            index: 6,
            method: MBlockly.Control.readGyroscopeSensor
        },
        // 音量传感器
        VOLUME: {
            index: 7,
            method: MBlockly.Control.readVolumeSensor
        },
        // 编码电机
        ENCODER_MOTER: {
            index: 9,
            method: MBlockly.Control.readEnCoderMotorValue
        },
        // 电位器
        POTENTIOMETER: {
            index: 10,
            method: MBlockly.Control.readPotentiometerValue
        },
        // 限位开关
        LIMIT_SWITCH: {
            index: 11,
            method: MBlockly.Control.readLimitSwitchValue
        },
        // 人体红外感应器
        PIR_MOTION: {
            index: 12,
            method: MBlockly.Control.readPirValue
        },
        // 读取摇杆的值
        JOYSTICK: {
            index: 13,
            method: MBlockly.Control.readJoystickValue
        },
        // 读取摇杆的值
        COMMON_TEMPERATURE: {
            index: 14,
            method: MBlockly.Control.readCommonTemperatureValue
        },
        // 温湿度传感器
        TEMPERATURE_HUMIDITY: {
            index: 15,
            method: MBlockly.Control.readCommonTemperatureHumidityValue
        },
        // 智能舵机 1- 8
        SMART_SERVO_ANGLE: {
            index: 16,
            method: MBlockly.Control.readSmartServoAngleValue
        },
        // 火焰传感器
        FLAMESENSOR: {
            index: 17,
            method: MBlockly.Control.readFlameSensor
        },
        // 触摸传感器
        TOUCHSENSOR: {
            index: 18,
            method: MBlockly.Control.readTouchSensor
        },
        // 按键被按下传感器
        KEY_PRESSDOWN_SENSOR: {
            index: 18,
            method: MBlockly.Control.readKeyPressDownSensorValue
        },
        // 红外传感器: for mbot（板载）
        INFRARED_SENSOR: {
            index: 19,
            method: MBlockly.Control.readInfraredSensor
        },
        // 气体传感器
        GAS_STRENGTH_SENSOR: {
            index: 20,
            method: MBlockly.Control.readGasStrength
        },
        // 电子罗盘
        COMPASS: {
            index: 21,
            method: MBlockly.Control.readCompassValue
        }
    },

    PromiseList: {
        requestList: new Array(128),
        // 用索引来标识不同设备发出的指令，用于判断接收到的回复的指令是属于哪种设备的，主要针对传感器读指令
        index: 1,

        // 将请求加入请求队列，拥有类型，回调，以及值对象，并返回该请求在列表中的索引
        add: function(type, callback, valueWrapper) {
            // TOFIX: hack for mbot's firmaware-v06.01.102 ultrasonic's index is not handdled in command.
            // Use 0 as the default index.
            if(type == MBlockly.Control.PromiseType["ULTRASONIC"].index &&
                (MBlockly.Control.getDeviceInfo().type == "mcore") && MBlockly.Control.deviceInfo.version == "06.01.102") {
                this.requestList[0] = {
                    type: type,
                    callback: callback,
                    valueWrapper: valueWrapper
                };
                return 0;
            } else {
                this.index++;
                if (this.index > 127) {
                    this.index = 1;
                }
                this.requestList[this.index] = {
                    type: type,
                    callback: callback,
                    valueWrapper: valueWrapper,
                    hasReceivedValue: false,
                    resentCount: 0
                };
                return this.index;
            }
        },

        // 将值写到对应请求的值对象中，并且启动回调
        receiveValue: function(index, value) {
            if (this.requestList[index]) {
                this.requestList[index].valueWrapper.setValue(value);
                this.requestList[index].callback(value);
                this.requestList[index].hasReceivedValue = true;
            }
        },

        getType: function(index) {
            if(this.requestList[index]) {
                return this.requestList[index].type;
            } else {
                console.log("返回字节的索引值无法匹配");
                return 0;
            }
        },

        reset: function() {
            this.requestList = new Array(128);
            this.index = 1;
        }
    },

    getSensorValue: function(deviceType, portOrId, callback, extraParam) {
        var that = this;
        if(!MBlockly.Control.bluetoothConnected) {
            console.log('蓝牙未连接');
            return false;
        }
        var item = MBlockly.Control.PromiseType[deviceType];
        var valueWrapper = new ValueWrapper();
        var index = MBlockly.Control.PromiseList.add(item.index, callback, valueWrapper);
        MBlockly.Control.CURRENT_CMD_INDEX = index;

        // 发送读取指令
        this.doGetSensorValue(item, index, portOrId, extraParam);

        // 防止递归阻碍了 valueWrapper 的返回
        setTimeout(function() {
            if(MBlockly.Settings.OPEN_RESNET_MODE && that.bluetoothConnected) {
                // 执行超时检测
                that.handlerCommandSendTimeout(index, deviceType, portOrId, callback, extraParam);
            }
        }, 0);
        return valueWrapper;
    },

    doGetSensorValue: function(item, index, portOrId, extraParam) {
        if(extraParam || extraParam == 0) {
            item.method(index, portOrId, extraParam);
        } else {
            item.method(index, portOrId);
        }
    },

    // 处理指令发出后的超时问题，超时后会进行重发
    handlerCommandSendTimeout: function(index, deviceType, portOrId, callback, extraParam) {
        var that = this;

        var promiseItem = MBlockly.Control.PromiseList.requestList[index];
        var item = MBlockly.Control.PromiseType[deviceType];
        setTimeout(function() {
            if(!promiseItem || promiseItem.hasReceivedValue || !that.bluetoothConnected) {
                // 成功拿到数据 或者蓝牙断开了连接，不进行处理
                return;
            } else {
                // 超过规定的时间，还没有拿到数据，需要进行超时重发处理
                if(promiseItem.resentCount > MBlockly.Control.SETTING.RESENT_COUNT - 1) {
                    // 如果重发的次数大于10,则终止重发,模拟数据并返回
                    console.log("序号为" + index + "的指令，重发结束");
                    promiseItem.hasReceivedValue = true;
                    MBlockly.Control.PromiseList.receiveValue(index, 0);
                    return;
                } else {
                    console.log('【resend】:' + index);
                    promiseItem.resentCount  = promiseItem.resentCount || 0;
                    promiseItem.resentCount++;
                    that.doGetSensorValue(item, index, portOrId, extraParam);
                    try{
                        that.handlerCommandSendTimeout(index, deviceType, portOrId, callback, extraParam);
                    }catch (err){
                        console.log("【error】" + err);
                        if(err == 'BleDisconnected'){
                            promiseItem.resentCount = 0;
                            return false;
                        }
                    }
                }
            }
        }, that.SETTING.COMMAND_SEND_TIMEOUT);
    },

    /**
     * 回复数据数值解析
     * @param  {string} type 传感器的类型
     * @param  {array} buf 待解析的数据数组
     * @return {Number}      传感器返回的数值
     *
     * 回复数据从左到右第四位数据的值所代表的含义
     *     1: 单字符(1 byte)
     *     2： float(4 byte)
     *     3： short(2 byte)，16个长度
     *     4： 字符串
     *     5： double(4 byte)
     *     6: long(4 byte)
     */
    sensor_callback: function(type, buf) {
        console.log(type + ' callback: ' + buf.join(' '));
        // 获取返回的数据类型
        // var dataType = buf[3];
        var dataType = buf[1];
        var result = null;
        switch(dataType) {
            case "1":
            case 1:
                // 1byte
                result = buf[2];
                break;
            case "3":
            case 3:
                // 2byte
                result = this.calculateResponseValue([parseInt(buf[3]), parseInt(buf[2])]);
                break;
            case "4":
            case 4:
                // 字符串
                result = this.bytesToString(buf);
                break;
            case "2":
            case "5":
            case "6":
            case 2:
            case 5:
            case 6:
                // long型或者float型的4byte处理
                result = this.calculateResponseValue([parseInt(buf[5]), parseInt(buf[4]), parseInt(buf[3]), parseInt(buf[2])]);
                break;
            default:
                break;
        }

        if(type == this.PromiseType.ENCODER_MOTER.index) {
            result = Math.abs(result);
        }
        MBlockly.Control.PromiseList.receiveValue(buf[0], result);
    },

    bytesToString: function(bytes) {
        var endIndex = 5 + parseInt(bytes[4]);
        var str = bytes.toString('utf8', 5, endIndex);
        return str;
    },

     /**
     * 计算数值: 将小车返回的short型数据转换成浮点型, bytes -> int -> float
     * @param  {array}tArray 十进制数组
     * @return {float}    十进制
     */
    calculateResponseValue: function(intArray) {
        // FIXME: int字节转浮点型
        var intBitsToFloat = function(num) {
            /* s 为符号（sign）；e 为指数（exponent）；m 为有效位数（mantissa）*/
            s = (num >> 31) == 0 ? 1 : -1,
                e = (num >> 23) & 0xff,
                m = (e == 0) ?
                (num & 0x7fffff) << 1 :
                (num & 0x7fffff) | 0x800000;
            return s * m * Math.pow(2, e - 150);
        };
        var intValue = this.bytesToInt(intArray);
        // TOFIX
        if(intValue < 100000 && intValue > 0) {
            result = intValue;
        } else {
            result = parseFloat(intBitsToFloat(intValue).toFixed(2));
        }
        return result;
    },

    /**
     * n个byte转成int值
     * @param  {Array} bytes 传入的bytes数组
     * @return {Number}          返回的int数值
     */
    bytesToInt: function(bytes) {
        var val = 0;
        for(var i = bytes.length - 1; i >= 0; i--) {
            val += (bytes[bytes.length - i - 1] << (i * 8) );
        }
        return val;
    },

    floatToBytes: function(value) {
        // TOFIX: hack
        if(value == 0) {return [0,0,0,0];}
        var bytesInt = 0;
        switch (value) {
            case Number.POSITIVE_INFINITY: bytesInt = 0x7F800000; break;
            case Number.NEGATIVE_INFINITY: bytesInt = 0xFF800000; break;
            case +0.0: bytesInt = 0x40000000; break;
            case -0.0: bytesInt = 0xC0000000; break;
            default:
                // if (Number.isNaN(value)) { bytesInt = 0x7FC00000; break; }
                if (value <= -0.0) {
                    bytesInt = 0x80000000;
                    value = -value;
                }
                var exponent = Math.floor(Math.log(value) / Math.log(2));
                var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;
                exponent += 127;
                if (exponent >= 0xFF) {
                    exponent = 0xFF;
                    significand = 0;
                } else if (exponent < 0) exponent = 0;

                bytesInt = bytesInt | (exponent << 23);
                bytesInt = bytesInt | (significand & ~(-1 << 23));
            break;
        }
        var bytesArray = this.bigIntToBytes(bytesInt);
        return bytesArray;
    },

    /**
     * TOFIX: big int to bytes
     * @param  {Number} value value is translated from float, larger than 1036831948(0.1)
     * @return {Array} bytes array.
     */
    bigIntToBytes: function(value) {
        var bytes = [];
        var b1 = (value & 0xff);
        var b2 = ((value >> 8) & 0xff);
        var b3 = ((value >> 16) & 0xff);
        var b4 = ((value >> 24) & 0xff);
        bytes.push(b1);
        bytes.push(b2);
        bytes.push(b3);
        bytes.push(b4);
        return bytes;
    },

    /**
     * 32位整数转成字节，js最多只支持32位有符号整数，不支持64位，因此最多只能转成4byte
     * @param  {Number} float number
     * @return {Array} bytes array
     */
    longToBytes: function(value) {
        var bytes = [];
        var i = 4;
        do {
            bytes[--i] = value & (255);
            value = value>>8;
        } while ( i )
        return bytes;
    }
});
