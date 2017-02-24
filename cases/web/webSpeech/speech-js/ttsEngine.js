(function(){
    var ttsUrlPrefix = "http://tts.baidu.com/text2audio?cuid=baidutest&lan=zh&ctp=1&pdt=1&tex=";
    var speakListener = function(utterance, options, sendTtsEvent) {
        
        // tts start
        console.log('tts stoped');
        sendTtsEvent({type:'start', charIndex:0});
        console.log('audio start: ', utterance);

        var url = ttsUrlPrefix + utterance;
        tts_audio.src = url;
        tts_audio.play();

        tts_audio.addEventListener('ended', function(){
            // tts end
            console.log('audio ended');
            sendTtsEvent({type:'end', charIndex:utterance.length});
        });
    };

    var stopListener = function() {
        // (stop all speech)
        console.log('tts stoped');
        tts_audio.pause();
    };

    chrome.ttsEngine.onSpeak.addListener(speakListener);
    chrome.ttsEngine.onStop.addListener(stopListener);
})();
