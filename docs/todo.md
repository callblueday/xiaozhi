## cases
### done
- [x]百度语音-文字转语音网页实现
- [x] nodejs 的 POST 方式获取信息
- [x] nodejs 实现的串口通信 node-serialport，websocket
- [x] 通过串口，硬件 -> 串口 -> web 联调
- [x]图灵机器人的信息对话

### todo
- 录音，并存储文件
- node POST 方式模拟上传
- 播放音乐
  - 通过 nightmare（自动化测试工具） 调用web浏览器，搜索歌曲信息，获取播放链接，直接播放，或者将播放链接传给web，加载到web页面中。
  - 获取具体音乐的名称，封面
- 百度语音识别 demo
- threeJs 加载虚拟3D人物
  - 加载静态3D
  - 加载3D图形眼睛要能跟着动
  - 加载3D图形嘴巴要能动
  - 通过手势来完成一个转动web中3D球的案例(https://threejs.org/examples/#webgl_clipping_advanced)。重点是在手势交互和threejs的接口上。实体控制虚拟。X轴，Y轴，Z轴（仅仅是放大缩小都可以）
    - https://threejs.org/examples/#webgl_clipping_intersection
  - https://threejs.org/examples/#webgl_exporter_obj  可以通过手势切换，变换不同的形状，能导出obj，与3D打印联合
  - https://threejs.org/examples/#webgl_geometry_nurbs 切换颜色很酷
- 摄像头识别手势（intel 的 real sensor）
  - X轴，Y轴，Z轴的识别。陀螺仪也可以，与 curi 结合，硬件的成本更低
- 出来一个球，用手势来操控，缩进
- 识别唇语，读取信息
- websocket
- 调用pc程序
  - 操作浏览器
    - nightmare，使用的是electron
  - 打开系统程序
  - 模拟键盘

- 使用 reactjs 重构


### 小zhi
1. [x]实现语音播出
2. [x]实现语音输入 讯飞语音
3. [x]蓝牙连接 mbot
5. [x]实时的转文字为全息图（优化）
6. [x]加上百度AI，文字转语音，网页说话验证
7. [x]加上图灵
1. [x]添加视屏
9. []亚格力切割
1. []文字的优化
4. []注意提前准备路由器，wifi连接问题,socket地址要更改，演示前提前调试

特色：
- 一个图像展示
- 一个智能语音聊天
  - 文字回答
  - 音乐播放
