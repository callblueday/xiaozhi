(function(window){

  var WORKER_PATH = 'js/speech-js/recorderWorker.js';

  var Recorder = function(source, cfg){
    var self = this;
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    this.emptydatacount = 0;
    this.emptyCheckCount = 0;
    // init empdata array
    //this.node = (this.context.createScriptProcessor ||
    //             this.context.createJavaScriptNode).call(this.context,
    //                                                     bufferLen, 2, 2);
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                                                         bufferLen, 1, 1);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      self.isEmptyData(e.inputBuffer.getChannelData(0));
      //console.log(e.inputBuffer.getChannelData(0));
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          //e.inputBuffer.getChannelData(1)
        ]
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
    }

    this.stop = function(){
        if(recording == true){
            recording = false;
            if(typeof self.onStop == 'function'){
                self.onStop();
            }
        }
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffer' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    this.isEmptyData = function(d){
        // 基本确定采样得到的语音数据是空，即没有语音输入
        // 非常简单的基于音量的端点检测算法
        // 这个循环加操作执行用时不超过1ms
        var l = Math.floor(d.length / 10);
        var vol = 0;
        for(var i = 0; i < l ; i++){
            vol += Math.abs(d[i*10]);
        }
        self.emptyCheckCount ++;

        //if(self.emptyCheckCount % 2 == 0){
            sendCmd('updateSoundWave', {msg:vol});
        //}

        if(vol < 10){
            self.emptydatacount ++;

            if(self.emptydatacount > 10){
                //recording = false;
                self.stop();
                console.log('stoped');
                return true;
            }
        }
        else{
            self.emptydatacount = 0;
        }
        return false;
    }

    // stop callback
    this.onStop = null;

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary

  };

  Recorder.forceDownload = function(blob, filename){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }

  window.Recorder = Recorder;

})(window);
