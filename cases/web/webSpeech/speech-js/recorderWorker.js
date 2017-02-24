var recLength = 0,
  recBuffersL = [],
  //recBuffersR = [],
  sampleRate;
//var bdSampleRate = 8000;
var bdSampleRate = 16000;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportWAV':
      exportWAV(e.data.type);
      break;
    case 'getBuffer':
      getBuffer();
      break;
    case 'clear':
      clear();
      break;
  }
};

function init(config){
  sampleRate = config.sampleRate;
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  //recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function exportWAV(type){
  var bufferL = mergeBuffers(recBuffersL, recLength);
  //var bufferR = mergeBuffers(recBuffersR, recLength);
  //var interleaved = interleave(bufferL, bufferR);
  var interleaved = interleave(bufferL);
  var dataview = encodeWAV(interleaved);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function getBuffer() {
  var buffers = [];
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  //buffers.push( mergeBuffers(recBuffersR, recLength) );
  this.postMessage(buffers);
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  //recBuffersR = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

//function interleave(inputL, inputR){
function interleave(inputL){
  //var length = inputL.length + inputR.length;
  //var compression = 44100 / 16000;
  var compression = 44100 / bdSampleRate;
  //var length = inputL.length;
  var length = inputL.length / compression;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[parseInt(inputIndex)];
    inputIndex += compression;
    //result[index++] = inputR[inputIndex];
    //inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}
function floatTo8BitPCM(output, offset, input) {
    //这里只能加1了
    for (var i = 0; i < input.length; i++, offset++) {    
        var s = Math.max(-1, Math.min(1, input[i]));
        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;         
        //这里有一个转换的代码,这个是我个人猜测的,就是按比例转换
        val = parseInt(255 / (65535 / (val + 32768)));     
        output.setInt8(offset, val, true);
    }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples) {
  var sampleBits = 16;//16;//这里改成8位
  var dataLength = samples.length * (sampleBits / 8);
  var buffer = new ArrayBuffer(44 + dataLength);
  var view = new DataView(buffer);

  //var sampleRateTmp = 16000;
  var sampleRateTmp = bdSampleRate;

  var channelCount = 1;
  var offset = 0;
  /* 资源交换文件标识符 */
  writeString(view, offset, 'RIFF'); offset += 4;
  /* 下个地址开始到文件尾总字节数,即文件大小-8 */
  view.setUint32(offset, /*32这里地方栗子中的值错了,但是不知道为什么依然可以运行成功*/ 36 + dataLength, true); offset += 4;
  /* WAV文件标志 */
  writeString(view, offset, 'WAVE'); offset += 4;
  /* 波形格式标志 */
  writeString(view, offset, 'fmt '); offset += 4;
  /* 过滤字节,一般为 0x10 = 16 */
  view.setUint32(offset, 16, true); offset += 4;
  /* 格式类别 (PCM形式采样数据) */
  view.setUint16(offset, 1, true); offset += 2;
  /* 通道数 */
  view.setUint16(offset, channelCount, true); offset += 2;
  /* 采样率,每秒样本数,表示每个通道的播放速度 */
  view.setUint32(offset, sampleRateTmp, true); offset += 4;
  /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
  view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true); offset += 4;
  /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
  view.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
  /* 每样本数据位数 */
  view.setUint16(offset, sampleBits, true); offset += 2;
  /* 数据标识符 */
  writeString(view, offset, 'data'); offset += 4;
  /* 采样数据总数,即数据总大小-44 */
  view.setUint32(offset, dataLength, true); offset += 4;
  /* 采样数据 */
  floatTo16BitPCM(view, 44, samples);
  //floatTo8BitPCM(view, 44, samples);//这里改为写入8位的数据
  return view;
}

//function encodeWAV(samples){
//  var buffer = new ArrayBuffer(44 + samples.length * 2);
//  var view = new DataView(buffer);
//
//  /* RIFF identifier */
//  writeString(view, 0, 'RIFF');
//  /* RIFF chunk length */
//  view.setUint32(4, 36 + samples.length * 2, true);
//  /* RIFF type */
//  writeString(view, 8, 'WAVE');
//  /* format chunk identifier */
//  writeString(view, 12, 'fmt ');
//  /* format chunk length */
//  view.setUint32(16, 16, true);
//  /* sample format (raw) */
//  view.setUint16(20, 1, true);
//  /* channel count */
//  view.setUint16(22, 2, true);
//  /* sample rate */
//  view.setUint32(24, sampleRate, true);
//  /* byte rate (sample rate * block align) */
//  view.setUint32(28, sampleRate * 4, true);
//  /* block align (channel count * bytes per sample) */
//  view.setUint16(32, 4, true);
//  /* bits per sample */
//  view.setUint16(34, 16, true);
//  /* data chunk identifier */
//  writeString(view, 36, 'data');
//  /* data chunk length */
//  view.setUint32(40, samples.length * 2, true);
//
//  floatTo16BitPCM(view, 44, samples);
//
//  return view;
//}
