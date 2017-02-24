/**
 * @description action.js - define actions and dispose methods in control.js
 * @author Hujinhong
 * @copyright Makeblock.cc
 */

MBlockly = MBlockly || {};

MBlockly.Action = {
    baseSpeed: 85,

    runSpeed : function(speed, dir) {
        // 左右电机相反
        var spd1 = -dir * speed;
        var spd2 = dir * speed;
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    turnSpeed : function(speed, dir) {
        var spd1, spd2;
        if(MBlockly.Control.deviceInfo.type == 'auriga' ||
            MBlockly.Control.deviceInfo.type == 'megaPi') {
            // 左右电机相反
            if(dir == 1) {
                spd1 = -1 * speed;
                spd2 = -1 * speed;
            } else {
                spd1 = speed;
                spd2 = speed;
            }
        } else if(MBlockly.Control.deviceInfo.type == 'mcore' ||
            MBlockly.Control.deviceInfo.type == 'orion') {
            // 左右电机相反
            if(dir == 1) {
                spd1 = speed;
                spd2 = speed;
            } else {
                spd1 = -1 * speed;
                spd2 = -1 * speed;
            }
        }
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    /*
     * 利用陀螺仪的z轴角度值来处理旋转角度的问题
     *
     *  @param  {num} degree - degree value
     *  @param  {num} dir - direction, 1: clockwise, -1: anticlockwise
     *  @param  {num} speed - speed value for clockwiseRotate and anticlockwiseRotate
     *  @param  {num} times - repeat times
     */
    turnDegree : function(degree, dir, speed, times) {
        var that = this;
        speed = speed ? speed : 160;
        times = times ? times : 1;
        degree = degree * times;
        this.turnSpeed(speed, dir);

        var originDegree = 0, currentDegree = 0, first = true;
        var degreeTimer = setInterval(function() {
            MBlockly.Control.getSensorValue('GYROSCOPE', 1, function(val) {
                console.log('degree: ' + val);
                if(first) {
                    originDegree = val;
                    first = false;
                } else {
                    currentDegree = val;
                    var deta = Math.abs(Math.abs(currentDegree) - Math.abs(originDegree));
                    console.log('dela: ' + deta);
                    // 因为惯性的原因，做一定的误差校对
                    if(deta >= (degree - 10)) {
                        MBlockly.Control.stopSpeed();
                        clearInterval(degreeTimer);
                    }
                }
            }, 0x03);
        }, 100);
    },

    forward : function() {
        var spd1 = -1 * this.baseSpeed;
        var spd2 = 1 * this.baseSpeed;

        MBlockly.Control.setSpeed(spd1, spd2);
    },

    backForward : function() {
        var spd1 = 1 * this.baseSpeed;
        var spd2 = -1 * this.baseSpeed;
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    turnLeftLittle : function() {
        var spd1 = -1 * (this.baseSpeed - 30);
        var spd2 = 1 * this.baseSpeed;
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    turnRightLittle : function() {
        var spd1 = 1 * (this.baseSpeed - 20);
        var spd2 = 1 * (this.baseSpeed - 20);
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    turnLeftExtreme : function() {
        var spd1 = 1 * (this.baseSpeed - 20);
        var spd2 = 1 * (this.baseSpeed - 20);
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    turnRightExtreme : function() {
        var spd1 = -1 * (this.baseSpeed - 20);
        var spd2 = -1 * (this.baseSpeed - 20);
        MBlockly.Control.setSpeed(spd1, spd2);
    },

    clockwiseRotate : function(speed, time) {
        var that = this;
        var spd1 = -1 * speed;
        var spd2 = -1 * speed;
        MBlockly.Control.setSpeed(spd1, spd2);
        setTimeout(function() {
            MBlockly.Control.stopSpeed();
        }, time*1000);
    },

    antiClockwiseRotate : function(speed, time) {
        var that = this;
        var spd1 = 1 * speed;
        var spd2 = 1 * speed;
        MBlockly.Control.setSpeed(spd1, spd2);
        setTimeout(function() {
            MBlockly.Control.stopSpeed();
        }, time*1000);
    },

    clockwiseRotateTimes : function(speed, times) {
        this.turnDegree(360, -1, speed, times);
    },

    antiClockwiseRotateTimes : function(speed, times) {
        this.turnDegree(360, 1, speed, times);
    },

    /* 为原生端准备的调用接口 */

    setLedColor: function(json) {
        switch(MBlockly.Control.deviceInfo.type) {
            case 'mcore':
                if(json.port == 7) {
                    MBlockly.Control.setMbotLed(json.r, json.g, json.b, json.position);
                } else {
                    MBlockly.Control.setLedByPosition(json.r,json.g,json.b,json.position,json.port,json.slot);
                    setTimeout(function() {
                        MBlockly.Control.setLedByPosition(json.r,json.g,json.b,json.position,json.port);
                    }, 50);
                }
                break;
            default:
                MBlockly.Control.setLedByPosition(json.r,json.g,json.b,json.position,json.port,json.slot);
                // MBlockly.Control.setLedByPosition(json.r,json.g,json.b,json.position,json.port);
                break;
        }
    },

    turnOffLed: function(json) {
        switch(MBlockly.Control.deviceInfo.type) {
            case 'mcore':
                MBlockly.Control.turnOffMbotLed(json.position);
                MBlockly.Control.turnOffLed(json.position, json.port);
                break;
            default:
                MBlockly.Control.turnOffLed(json.position, json.port);
                break;
        }
    },

    setTone: function(json) {
        MBlockly.Control.playTone(json.toneName);
    },

    /**
     * 返回传感器数值给原生端
     * @param  {number}   index query order index number
     * @param  {string}   deviceType device type, such as `LINEFOLLOW`
     * @param  {number}   portOrId   port or device id number
     * @param  {number}   slot       optional, slot number.
     * @example
     *     getSensorValue('LINEFOLLOW',2);
     */
    getSensorValue: function(json) {
        MBlockly.Control.getSensorValue(json.deviceType, json.portOrId, function(val) {
            console.log(json.index);
            MBlockly.HostInterface.responseSensorValue2Cp(json.index, json.deviceType, val);
        }, json.slot);
    }
};