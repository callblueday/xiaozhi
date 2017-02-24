/**
 * @description: provide global config setting.
 * @author: hujinhong
 * @copyright 2015 Makeblock
 */

MBlockly = MBlockly || {};

MBlockly.Settings = {
    // DEBUG MODE
    DEBUG: false,

    // whether open console.log
    OPEN_LOG: false,

    // 是否开启撤销重做功能
    OPEN_UNDO: true,

    // 开启超时重发
    OPEN_RESNET_MODE: true,

    // 对不同的主板，是否开启过滤block块选项
    FILTER_BLOCKS_FOR_BOARDS: true,

    // 对不同的组件，是否开启过滤begin菜单里block块的类型
    FILTER_BEGIN_BLOCKS: true,

    // 是否开启代码高亮
    OPEN_HIGHLIGHT: true,

    // 是否采用整体执行代码的逻辑
    EXCUTE_CODE_DIRECTLY: false,

    // 是否开启不同类型组件编程界面，自动添加起始 when block 块的功能
    INIT_TOP_BLOCKS: true,

    // 对于同一组件的不同状态(例如按钮的按下和松开)，当一种状态运行时，是否自动终止另一个状态
    OPEN_STATE_MUTEX: true,

    // 是否接收原生cp端的数据通信
    OPEN_INFO_TUEN_WITH_APP: true,

    // 显示在硬件数码管上值的最大限制
    MAX_NUMBER_IN_TUBE: 9999,

    // 显示在硬件数码管上负值的最大限制
    MIN_NUMBER_IN_TUBE: -999,

    // 噪音的阈值，正常范围是：100 到 300之间。 当不接传感器时，会读值： 800+ 或者 20-
    NOISE_THRESHOLD: 150,

    // 超声波传感器判定为遇到障碍物的最大距离
    OBSTACLE_THRESHOLD: 10,

    // 接收到光线的阈值
    LIGHT_THRESHOLD: 100,

    // 接收到火焰的阈值
    FLAME_THRESHOLD: 100,

    // 当前应用是否处在coding模式
    MODE_IN_CODING: false,

    // 记录webview是否已完成加载，准备接收navtive相关数据
    MODE_WEBVIEW_ONLOAD: false,

    // 设置port口前缀，方便统计port口数量
    PORT_PREFIX: "PORT-",

    // 设置slot口前缀，方便统计slot口数量
    SLOT_PREFIX: "SLOT-",

    // 设置 RGB 亮度的缩小倍率 value/1
    RGB_BRIGHTNESS: 2.5,

    // 设置 RGB 灯显示的时间间隔，这是因为LED灯板是用中断实现的，操纵太快会导致程序异常
    RGB_TIME_GAP: 5,

    // 设置两个Buzzer音调之间的间隔时间, 单位是毫秒，为了使音乐演奏更优节奏感
    BUZZER_TIME_GAP: 20,

    // 编程界面，包裹名字框的最小长度
    NAME_WRAPPER_MIN_WIDTH: 200,

    // 编程界面，包裹名字框的最大长度
    NAME_WRAPPER_MAX_WIDTH: 500,

    // BLOCK ICON WIDTH
    BLOCK_ICON_WIDTH: 20,

    // BLOCK ICON HEIGHT
    BLOCK_ICON_HEIGHT: 20,

    // 组件距离顶部的距离-ipad
    MARGIN_TOP_IPAD: 80,

    // 组件距离顶部的距离-phone
    MARGIN_TOP_PHONE: 45,

    // 虚拟UI组件图标路径
    UI_WIDGET_ICON_PATH: '../../images/ui-widget-icons-v2/',
    BLOCK_ICON_PATH: '../../images/block-icons/',
    // Resource
    resources: function() {
        var BLOCK_ICON_PATH = this.BLOCK_ICON_PATH;
        return {
            ICONS: {
                START_TABLET_SHAKE: BLOCK_ICON_PATH + 'icon-Event-TabletShake.svg',
                START_RECEIVE_LIGHT: BLOCK_ICON_PATH + 'icon-Event-ReceiveLight.svg',
                START_OBSTACLE_DETECTED: BLOCK_ICON_PATH + 'icon-Event-ObstacleDetected.svg',
                START_BUTTON: BLOCK_ICON_PATH + 'icon-Event-Button.svg',

                MOVE_FORWARD: BLOCK_ICON_PATH + 'icon-Move-Forward.svg',
                MOVE_BACKWARD: BLOCK_ICON_PATH + 'icon-Move-Backward.svg',
                MOVE_TURN_LEFT: BLOCK_ICON_PATH + 'icon-Move-TurnLeft.svg',
                MOVE_TURN_RIGHT: BLOCK_ICON_PATH + 'icon-Move-TurnRight.svg',
                MOVE_ROTATE_ANTICLOCKWISE: BLOCK_ICON_PATH + 'icon-Move-RotateAnticlockwise.svg',
                MOVE_ROTATE_CLOCKWISE: BLOCK_ICON_PATH + 'icon-Move-RotateClockwise.svg',
                MOVE_STOP: BLOCK_ICON_PATH + 'icon-Move-Stop.svg',
                MOVE_MOTOR: BLOCK_ICON_PATH + 'icon-Move-Motor.svg',
                MOVE_DC_MOTOR: BLOCK_ICON_PATH + 'icon-Move-DcMotor.svg',
                MOVE_ENCODER_MOTOR: BLOCK_ICON_PATH + 'icon-Move-EncoderMotor.svg',
                MOVE_SERVO_MOTOR: BLOCK_ICON_PATH + 'icon-Move-ServoMotor.svg',
                MOVE_STEPPER_MOTOR: BLOCK_ICON_PATH + 'icon-Move-StepperMotor.svg',

                DISPLAY_LED_ALL: BLOCK_ICON_PATH + 'icon-Display-LedAll.svg',
                DISPLAY_LED_LEFT: BLOCK_ICON_PATH + 'icon-Display-LedLeft.svg',
                DISPLAY_LED_RIGHT: BLOCK_ICON_PATH + 'icon-Display-LedRight.svg',
                DISPLAY_PLAY_TONE: BLOCK_ICON_PATH + 'icon-Display-PlayTone.svg',
                DISPLAY_STOP_TONE: BLOCK_ICON_PATH + 'icon-Display-StopTone.svg',
                DISPLAY_7SEGMENTS: BLOCK_ICON_PATH + 'icon-Display-7Segments.svg',
                DISPLAY_SHUTTER: BLOCK_ICON_PATH + 'icon-Display-Shutter.svg',
                DISPLAY_FACE: BLOCK_ICON_PATH + 'icon-Display-Face.svg',

                EVENT_TABLET_SHAKE: BLOCK_ICON_PATH + 'icon-Event-TabletShake.svg',
                EVENT_TILT_LEFT: BLOCK_ICON_PATH + 'icon-Event-TiltLeft.svg',
                EVENT_TILT_RIGHT: BLOCK_ICON_PATH + 'icon-Event-TiltRight.svg',
                EVENT_TILT_BACKWARD: BLOCK_ICON_PATH + 'icon-Event-TiltBackward.svg',
                EVENT_TILT_FORWARD: BLOCK_ICON_PATH + 'icon-Event-TiltForward.svg',
                EVENT_LINE_FOLLOW: BLOCK_ICON_PATH + 'icon-Event-LineFollow.svg',
                EVENT_SOUND: BLOCK_ICON_PATH + 'icon-Event-Sound.svg',
                EVENT_SWITCH_ON: BLOCK_ICON_PATH + 'icon-Event-SwitchOn.svg',
                EVENT_SWITCH_OFF: BLOCK_ICON_PATH + 'icon-Event-SwitchOff.svg',
                EVENT_BUTTON_PRESSED: BLOCK_ICON_PATH + 'icon-Event-ButtonPressed.svg',
                EVENT_BUTTON_RELEASED: BLOCK_ICON_PATH + 'icon-Event-ButtonReleased.svg',

                DETECT_BRIGHTNESS: BLOCK_ICON_PATH + 'icon-Detect-Brightness.svg',
                DETECT_ULTRASONIC: BLOCK_ICON_PATH + 'icon-Detect-Ultrasonic.svg',
                DETECT_SLIDER: BLOCK_ICON_PATH + 'icon-Detect-Slider.svg',
                DETECT_TEMPERATURE: BLOCK_ICON_PATH + 'icon-Detect-Temperature.svg',
                DETECT_GYRO: BLOCK_ICON_PATH + 'icon-Detect-Gyro.svg',
                DETECT_POTENTIOMETER: BLOCK_ICON_PATH + 'icon-Detect-Potentiometer.svg',
                DETECT_LIMIT_SWITCH: BLOCK_ICON_PATH + 'icon-Detect-LimitSwitch.svg',
                DETECT_PIR_MOTION: BLOCK_ICON_PATH + 'icon-Detect-PirMotion.svg',
                DETECT_JOYSTICK: BLOCK_ICON_PATH + 'icon-Detect-Joystick.svg',
                DETECT_TOUCH: BLOCK_ICON_PATH + 'icon-Detect-Touch.svg',
                DETECT_COMPASS: BLOCK_ICON_PATH + 'icon-Detect-Compass.svg',
                DETECT_FLAME: BLOCK_ICON_PATH + 'icon-Detect-Flame.svg',
                DETECT_GAS: BLOCK_ICON_PATH + 'icon-Detect-Gas.svg',
                DETECT_FOURKEY: BLOCK_ICON_PATH + 'icon-Detect-Fourkey.svg',
                DETECT_HUMIDITY: BLOCK_ICON_PATH + 'icon-Detect-Humidity.svg'
            }
        };
    }
};

// window.settings = MBlockly.Settings;

// if(location.host.indexOf('localhost') > -1 || location.host.indexOf('192.168') > -1 || location.host.indexOf('127.0.0.1') > -1
//     || location.host.indexOf('0.0.0.0') > -1) {
//     MBlockly.Settings.DEBUG = true;
//     MBlockly.Settings.OPEN_LOG = true;
// }

// if(!MBlockly.Settings.OPEN_LOG) {
//     console.log = function() {};
// }