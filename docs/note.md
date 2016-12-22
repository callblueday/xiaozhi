### 语音识别
1、录音，将文件存储起来
2、获取token
3、Post数据并请求获取返回值


#### 百度语音接口
1. 获取Access Token, 从开放平台post请求获取。默认有效期为1个月，过期了可重新申请

```
https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=G3bCFkXGMNGkkKZl6c5Ez09q&client_secret=b95a72265a14b193e02fa33b55c948f6&
```

得到返回结果：

```json
{
  "access_token": "24.61399cfb279ea95aee1d9ea4ddbfb478.2592000.1484758685.282335-9085373",
  "session_key": "9mzdDcfqbnkF\/bI4TJINwIvy4epZf3HMuuHABVeSC15aqXXVnxANDMGrtBkWHGECUbBYewrCiGaOMi5sUtz2Kps3HACN",
  "scope": "public audio_voice_assistant_get audio_tts_post wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian wangrantest_test wangrantest_test1 bnstest_test1 bnstest_test2 ApsMisTest_Test\u6743\u9650",
  "refresh_token": "25.30fde152d65bc33a2a819202d890a999.315360000.1797526685.282335-9085373",
  "session_secret": "7646386daf512a3e7d5c92268d7324e1",
  "expires_in": 2592000
}
```

2. 利用access token 上传语音

语音数据直接放在 HTTP-BODY 中，这是怎么放的呢？

```
http://vop.baidu.com/server_api?lan=zh&cuid=callblueday&token=24.61399cfb279ea95aee1d9ea4ddbfb478.2592000.1484758685.282335-9085373

```

3. 语音合成，实现录音，将文件存储起来
http://tsn.baidu.com/text2audio?tex=你好&lan=zh&cuid=callblueday&ctp=1&tok=24.61399cfb279ea95aee1d9ea4ddbfb478.2592000.1484758685.282335-9085373


### POST 上传
使用 [node-request](https://github.com/request/request) 来处理。


### tuling
APIkey: 6d8b646def4745e6a84bf2990d4cbc1d
secret: 3d3ab24b80e93be9