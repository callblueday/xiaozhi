    var onFail = function(e) {
        tip.innerText = '未取得录音权限，将不能使用扩展提供的语音识别功能！';
        re_auth_btn.style.display = 'show';
        // TODO: 
    };

    var onSuccess = function(s) {
        tip.innerText = '已经取得录音权限，现在可以使用语音识别输入啦！';
    }

    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var recorder;
    //var audio = document.querySelector('audio');

    function checkRecordPermission() {
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true}, onSuccess, onFail);
        } else {
            console.log('navigator.getUserMedia not present');
        }
    }

    //function stopRecording() {
    //    recorder.stop();
    //    recorder.exportWAV(function(s) {
    //        audio.src = window.URL.createObjectURL(s);
    //    });
    //}

    checkRecordPermission();
