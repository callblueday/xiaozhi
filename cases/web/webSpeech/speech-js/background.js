//author    :    veizz
//date      :   2012-08-18

function genericOnClick(info, tab){
    // set tip recording
    sendCmd('showTip', {msg:'录音中...'});
    startRecording();
    return;
}

function onFail(e) {
    console.log('Rejected!', e);
};


function onSuccess(s) {
    if(audio_context == null){
        audio_context = new AudioContext();
        audio_media_stream_source = audio_context.createMediaStreamSource(s);
    }
    recorder = new Recorder(audio_media_stream_source);
    recorder.onStop = function(){
        sendCmd('showTip', {msg:'识别中...'});
        recorder.exportWAV(function(s) {
            speechRecognition(s,function(err, text){
                if(!err){
                    sendCmd('closeTip', {});
                    return fillText(text);
                }
                else{
                    sendCmd('closeTip', {timeout:2000, msg:'未能识别，请重试'});
                }
            });
            // post to server
            window.xb = s;
        });
    }
    recorder.record();
}


function startRecording() {
    navigator.getUserMedia({audio: true}, onSuccess, onFail);
}

function speechRecognition(b, callback){
    var url = "http://vop.baidu.com/server_api";
    var fr = new FileReader();
    fr.readAsDataURL(b);
    console.log(b.size);
    fr.onload = function(){
        var params = {
            format:'wav',
            //rate:8000,
            rate:16000,
            channel:1,
            cuid: "callblueday",
            token:'24.2e46c39d7c905d0d43e40a4f873997df.2592000.1488987125.282335-9085373',
            lan:'zh',
            speech:fr.result.substr(22),
            len:b.size,
        };
        console.log(params);

        var postdata = JSON.stringify(params);
        $.ajax({
            url:url,
            type:'post',
            contentType:'application/json',
            data:postdata,
            //header:"Content-Length: " + postdata.length,
            success:function(d){
                console.log(d);
                if(callback){
                    var recogedtext = '';
                    if(d.err_no == 0){
                        recogedtext = d.result[0];
                        recogedtext = recogedtext.replace(/[,，]$/gi, '');
                        return callback(0, recogedtext);
                    }
                    else{
                        return callback(d.err_no, '');
                    }
                }
            },
            error:function(e){
                console.log('e:', e);
                var recogedtext = '未识别请重试';
                return callback('');
            },
        });

    }
}

function firstTimeCheck(){
    if (!Settings.keyExists("first_time")) {
        Settings.setValue("first_time", "no");
        openOptionPage();
    }
    return false;
}

function openOptionPage(){
    var url = "options.html";

    var fullUrl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i in tabs) { // check if Options page is open already
            if (tabs.hasOwnProperty(i)) {
                var tab = tabs[i];
                if (tab.url == fullUrl) {
                    chrome.tabs.update(tab.id, { selected:true }); // select the tab
                    return;
                }
            }
        }
        chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
            chrome.tabs.create({
                url:url,
                index:tab.index + 1
            });
        });
    });

}

function openAboutPage(){
    var url = "about.html";
    var fullUrl = chrome.extension.getURL(url);
    chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
        chrome.tabs.create({
            url:url,
            index:tab.index + 1
        });
    });

}

function fillText(s){
    return sendCmd('fillText', {msg:s});
}

function getCuid(){
    // var cuid = Settings.getValue('cuid');
    // if(!cuid){
    //     cuid = gen_cuid();
    //     Settings.setValue("cuid", cuid);
    // }
    return "callblueday";
}

function sendCmd(cmd, obj){
    //return chrome.tabs.executeScript(null, {file:'js/content.js', allFrames:true}, function(){
        // return chrome.tabs.getSelected(null, function(tab){
        //     return chrome.tabs.sendMessage(tab.id, {'method':cmd, params:obj}, function(res){

        //     });
        // });
    //});
    console.log(cmd + ": " + obj.msg);
}


function startRecordCmd(){
    navigator.getUserMedia({audio: true}, function(s){
        if(audio_context == null){
            audio_context = new webkitAudioContext();
            audio_media_stream_source = audio_context.createMediaStreamSource(s);
        }
        recorder = new Recorder(audio_media_stream_source);
        recorder.onStop = function(){
            sendCmd('showTip', {msg:'识别中...'});
            recorder.exportWAV(function(s) {
                speechRecognition(s,function(err, text){
                    if(!err){
                        sendCmd('closeTip', {});
                        // call cmd api
                        return getNlpCmd(text, function(data){
                            return openSearchPage(data.results[0].object.website, data.results[0].object.keywords);
                        });

                        //return fillText(text);
                    }
                    else{
                        sendCmd('closeTip', {timeout:2000, msg:'未能识别，请重试'});
                    }
                });
                // post to server
                window.xb = s;
            });
        }
        recorder.record();

    }, onFail);
}

function getNlpCmd(str, callback){
    //TODO use online service
    var d = {
        results:[
            {
                website:'baidu',
                keywords:'苹果6',
            }
        ]
    };
    return callback(d);
}

function getControlBarStatus(){
    var st = Settings.getValue('show_control');
    if(st == 'false'){
        return false;
    }
    else{
        Settings.setValue('show_control', 'true');
        return true;
    }

}
function toggleControlBar(type){
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i in tabs) { // check if Options page is open already
            var tab = tabs[i];
            chrome.tabs.sendMessage(tab.id, {method:'toggleControlBar', params:{type:type}}); // select the tab
        }
    });
}


// chrome.extension.onMessage.addListener(function(req, sender,sendResponse) {
//     console.log(req);
//     switch(req.method){
//         case 'getCuid':
//             //console.log(req.params.msg);
//             var cuid = getCuid();
//             sendResponse({cuid:cuid});
//             break;
//         case 'startRecordCmd':
//             //console.log(req.params.msg);
//             startRecordCmd();
//             break;
//         case 'getControlBarStatus':
//             var st = getControlBarStatus();
//             sendResponse({status:st});
//             break;
//         default:
//             break;
//     }
// }
// );

// var id = chrome.contextMenus.create({
//     title:'语音识别',
//     id: 'recog_menu_btn',
//     contexts:['editable'],
//     onclick:genericOnClick
// });

var audio_context = null;
var audio_media_stream_source = null;

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var recorder;
//var audio = document.querySelector('audio');

// firstTimeCheck();

//}
