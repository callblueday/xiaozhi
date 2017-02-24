if(!window.speechRecognitionInjection){
    //console.log(document.location.href);
    //var speech_IO_href = document.location.href;
    // show control bar
    //console.log($('#content'));
    if(!window.speech_IO){
        window.speech_IO = {};
        speech_IO.audio = {};
        speech_IO.audio.contentElement = null;
        speech_IO.recorder = {};
        speech_IO.audio.contents = [];
    }

    speech_IO.recorder.start = function(){
        console.log('start record');
        speech_IO.recorder.showTip('录音中...');
        chrome.extension.sendMessage(null, {method:'startRecordCmd'});

        // post message, start
    }

    speech_IO.recorder.stop = function(){
        console.log('stop record');
        // post message, stop
        speech_IO.recorder.closeTip(2000, 'err');
    }

    speech_IO.recorder.showTip = function(tip){
        console.log(tip);
        var pTip = document.getElementById('speech_IO_tip');
        //pTip.innerText = tip;
        document.getElementById('speech_IO_tip_line').innerText = tip;
        pTip.style.display = 'block';
    }

    speech_IO.recorder.updateSoundWave = function(vol){
        var w = vol * 10;
        document.getElementById('speech_IO_vol').style.width = w + 'px';
    }

    speech_IO.recorder.closeTip = function(timeout, msg){
        console.log('close tip');
        var pTip = document.getElementById('speech_IO_tip');
        if(timeout == 0){
            pTip.style.display = 'none';
        }
        else{
            document.getElementById('speech_IO_tip_line').innerText = msg;
            setTimeout(function(){
                pTip.style.display = 'none';
            }, timeout);

        }
    }

    speech_IO.recorder.toggleControlBar = function(type){
        var pControl = document.getElementById('speech_IO_control');
        if(type){
        //pTip.innerText = tip;
            pControl.style.display = 'block';
        }
        else{
            pControl.style.display = 'none';
        }
    }




    speech_IO.supportSites = {
        'read.qidian.com':'getQidianContents',
        'book.zongheng.com':'getZonghengContents',
        'chuangshi.qq.com':'getChuangshiContents',
        'tieba.baidu.com':'getTiebaContents',
    };

    speech_IO.audio.prepareContents = function(content){

        var strArr = content.split(/[,.!?;，。！？；]/);
        var res = [];
        for(i in strArr){
            if(strArr[i].trim() != ''){
                res.push(strArr[i].trim());
            }
        }
        return res;
    }


    speech_IO.audio.getQidianContents = function(){
        if(document.location.pathname.indexOf('/BookReader/') < 0){
            return false;
        }
        var content = document.getElementById('content');
        if(!content){
            return false;
        }
        speech_IO.audio.contentElement = content;

        return speech_IO.audio.prepareContents(content.innerText);
    }
    speech_IO.audio.getZonghengContents = function(){
        if(document.location.pathname.indexOf('/chapter/') < 0){
            return false;
        }
        var content = document.getElementById('chapterContent');
        if(!content){
            return false;
        }
        speech_IO.audio.contentElement = content;
        return speech_IO.audio.prepareContents(content.innerText);
    }
    speech_IO.audio.getChuangshiContents = function(){
        if(document.location.pathname.indexOf('/bk/') < 0){
            return false;
        }
        var content = $('.bookreadercontent');
        if(!content){
            return false;
        }
        speech_IO.audio.contentElement = content;
        return speech_IO.audio.prepareContents(content.text());
    }
    speech_IO.audio.getTiebaContents = function(){
        if(document.location.pathname.indexOf('/p/') < 0){
            return false;
        }
        var content = $('.d_post_content');
        if(!content || content.length == 0){
            return false;
        }
        speech_IO.audio.contentElement = document.getElementById('j_p_postlist');
        var _content = '';
        content.each(function(ind, item){
            _content += $(item).text();
        });
        return speech_IO.audio.prepareContents(_content);
    }


    //    if(speech_IO.audio.contents = speech_IO.audio[speech_IO.supportSites[document.location.hostname]]()){

    speech_IO.showControlBar = function(){

        var pControlWrapper;
        var pControl;
        //if(pControl = document.getElementById('speech_IO_control')){
        if(pControlWrapper = document.getElementById('speech_IO_control_wrapper')){
            //pControl.innerText = tip;
            //pControl.style.display = 'block';
            pControlWrapper.style.display = 'block';
        }
        else{
            // init control wrapper
            pControlWrapper = document.createElement('div');
            pControlWrapper.id = 'speech_IO_control_wrapper';
            pControlWrapper.style.display = 'block';
            //pControlWrapper.style.border = '1px solid white';
            //pControlWrapper.style.borderRadius = '5px';
            //pControlWrapper.style.backgroundColor = 'black';
            pControlWrapper.style.width = '150px';
            //pControlWrapper.style.height = '30px';
            pControlWrapper.style.color = 'grey';
            pControlWrapper.style.textAlign = 'center';
            pControlWrapper.style.position = 'fixed';
            pControlWrapper.style.top = '200px';
            pControlWrapper.style.right = '20px';
            pControlWrapper.style.opacity = '0.8';
            pControlWrapper.style.zIndex = '9999';
            //pControlWrapper.style.lineHeight = '50px';
            pControlWrapper.draggable = 'true';
            pControlWrapper.style.cursor = 'move';

            // init control pannel
            pControl = document.createElement('div');
            pControl.id = 'speech_IO_control';
            //pControl.innerText = tip;
            //pControl.style.display = 'block';
            pControl.style.display = 'none';
            pControl.style.border = '1px solid white';
            pControl.style.borderRadius = '5px';
            pControl.style.backgroundColor = 'black';
            pControl.style.width = '150px';
            pControl.style.height = '30px';
            pControl.style.color = 'grey';
            pControl.style.textAlign = 'center';
            //pControl.style.position = 'fixed';
            //pControl.style.top = '200px';
            //pControl.style.right = '20px';
            //pControl.style.opacity = '0.8';
            //pControl.style.zIndex = '9999';
            //pControl.style.lineHeight = '50px';
            //pControl.draggable = 'true';
            //pControl.style.cursor = 'move';

            // init audio element
            var tts_audio = document.createElement('audio');
            tts_audio.id = 'tts_audio';
            tts_audio.style.display = 'none';

            // init record btn
            var recordBtn = document.createElement('button');
            recordBtn.id = 'speech_IO_record_btn';
            recordBtn.style.backgroundImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAACe0lEQVQ4EX2UT04qQRDGaxBIACFEA7IgJC7YeRWXgol4CU4BB+AAsGRLOAF7dmwgwMaFfxI2GFFR+vWvfDWZUd+rpGdqqr7vq+qe7g6SyeRBRAI/QguCQD4+PqRUKsnj42MYxymXy/L09CSeJ865WI6PxPcIYp+fn0pErNVqyXg81nF7e6sFEAUD9ofRoR8uOk5PTyntbm5u3P39vW/ky/CJkQMT5Zgf69AqFgoFLdxsNuXs7Eze39914F9fX2vOMMbRoH8kzbE3gMOBZRXJ5XL6jpKy2azGfM+/TjnWIUjIicRX2IRV4e/DYuCihQwTCpKkKmJ+PTT/G8FiYMB+7zQUpPLR0ZG8vr7KYrGwgv98gwELx7oGHAqenJzI29ubtNttWa1W0u125eXl5YcgMXJgwMKBa6aCtJ1OpzXGnzw/P9cRrWwE9p/l2Y8YXDQwXSxbPwJsEWy/3+uU9CPy2G63Ok3D8I6uYzhlBLD5fK6iFxcX0ul0ZLlcSiqV0oHPdMlRGCxmXP3wf+vgCS6Tyeju90E3nU59Uef6/b6r1Wqu1+vpwB8MBpoDA5YTAxcNTgtbRAX58OunIH9+3cPDgxLX67WbTCY68DFyYBCEAzcmaAG/lq5SqSiw0WioyGazUREe+IiTQwwsHBNDRzvEMVGA1WpVCfj+T2pHXAzFYjGMGyYqpjqeFJpvQs/v3d2dXF5eSr1el+fn5/CIXV1dST6f140/Go0Uyz6MmVfV64tKftfrT/AANxwOdap+3+mbh/nkwPCT4MS6NHWP1052u52GZrOZXl3+5kYrvEk9WchhYKN7mFhAhzhmnA6uKKb6Pzs+PtajaTeTYf8Ams63vnNDrBUAAAAASUVORK5CYII=)";
            //recordBtn.innerText = '◉';
            //recordBtn.innerText = '◼︎';
            recordBtn.style.backgroundPosition = 'center center';
            recordBtn.style.backgroundRepeat = 'no-repeat';
            recordBtn.style.backgroundSize = '20px 20px';
            recordBtn.style.display = 'inline-block';
            recordBtn.style.borderTopLeftRadius = '5px';
            recordBtn.style.borderBottomLeftRadius = '5px';
            recordBtn.style.borderStyle = 'none';
            recordBtn.style.borderRightWidth = '1px';
            recordBtn.style.borderRightColor = '#999';
            recordBtn.style.borderRightStyle = 'solid';
            recordBtn.style.backgroundColor = 'black';
            recordBtn.style.width = '50px';
            recordBtn.style.height = '30px';
            recordBtn.style.color = 'red';
            recordBtn.style.textAlign = 'center';
            recordBtn.style.lineHeight = '30px';
            recordBtn.style.float = 'left';

            // init play btn
            var playBtn = document.createElement('button');
            playBtn.id = 'speech_IO_play_btn';
            playBtn.innerText = '>';
            playBtn.style.display = 'inline-block';
            //playBtn.style.borderTopLeftRadius = '5px';
            //playBtn.style.borderBottomLeftRadius = '5px';
            playBtn.style.borderStyle = 'none';
            playBtn.style.borderRightWidth = '1px';
            playBtn.style.borderRightColor = '#999';
            playBtn.style.borderRightStyle = 'solid';
            playBtn.style.backgroundColor = 'black';
            playBtn.style.width = '50px';
            playBtn.style.height = '30px';
            playBtn.style.color = 'grey';
            playBtn.style.textAlign = 'center';
            playBtn.style.lineHeight = '30px';
            playBtn.style.float = 'left';
            // init next btn
            var nextBtn = document.createElement('button');
            nextBtn.id = 'speech_IO_next_btn';
            nextBtn.innerText = '>>';
            nextBtn.style.display = 'inline-block';
            nextBtn.style.borderTopRightRadius = '5px';
            nextBtn.style.borderBottomRightRadius = '5px';
            nextBtn.style.borderStyle = 'none';
            //nextBtn.style.borderRightWidth = '1px';
            //nextBtn.style.borderRightColor = '#999';
            //nextBtn.style.borderRightStyle = 'solid';
            nextBtn.style.backgroundColor = 'black';
            nextBtn.style.width = '50px';
            nextBtn.style.height = '30px';
            nextBtn.style.color = 'grey';
            nextBtn.style.textAlign = 'center';
            nextBtn.style.lineHeight = '30px';
            nextBtn.style.float = 'left';


            var pTip = document.createElement('div');
            pTip.id = 'speech_IO_tip';
            //pTip.innerText = '...';
            pTip.style.display = 'none';
            pTip.style.border = '1px solid white';
            pTip.style.borderRadius = '5px';
            pTip.style.backgroundColor = 'black';
            pTip.style.width = '150px';
            pTip.style.height = '50px';
            pTip.style.color = 'grey';
            pTip.style.textAlign = 'center';
            //pTip.style.opacity = '0.8';
            //pTip.style.zIndex = '9999';
            pTip.style.lineHeight = '40px';
            pTip.style.overflow = 'hidden';

            var tipLine = document.createElement('p');
            tipLine.id = 'speech_IO_tip_line';
            tipLine.innerText = '...';
            //tipLine.style.border = '1px solid white';
            //tipLine.style.borderRadius = '5px';
            //tipLine.style.backgroundColor = 'black';
            tipLine.style.width = '150px';
            tipLine.style.height = '40px';
            tipLine.style.color = 'grey';
            tipLine.style.textAlign = 'center';
            //tipLine.style.opacity = '0.8';
            //tipLine.style.zIndex = '9999';
            tipLine.style.lineHeight = '40px';

            var volBar = document.createElement('div');
            volBar.id = 'speech_IO_vol';
            volBar.style.display = 'block';
            volBar.style.backgroundColor = 'green';
            volBar.style.width = '150px';
            volBar.style.height = '10px';

            //volBar.style.color = 'grey';
            //volBar.style.textAlign = 'center';
            //volBar.style.opacity = '0.8';
            //volBar.style.zIndex = '9999';
            //volBar.style.lineHeight = '40px';


            tts_audio.addEventListener('ended', function(){
                speech_IO.audio.next();
            });

            recordBtn.addEventListener('click', function(){
                //if(recordBtn.innerText == '◉'){
                    // play
                    speech_IO.recorder.start();
                    //recordBtn.innerText = '◼︎';
                //}
                //else{
                    // pause
                //    speech_IO.recorder.stop();
                //    recordBtn.innerText = '◉';
                //}
            });
            playBtn.addEventListener('click', function(){
                if(playBtn.innerText == '>'){
                    // play
                    speech_IO.audio.play();
                    playBtn.innerText = '||';
                }
                else{
                    // pause
                    speech_IO.audio.pause();
                    playBtn.innerText = '>';
                }
            });
            nextBtn.addEventListener('click', function(){
                // next
                speech_IO.audio.next();
                playBtn.innerText = '||';
            });

            pControl.appendChild(tts_audio);
            pControl.appendChild(recordBtn);
            pControl.appendChild(playBtn);
            pControl.appendChild(nextBtn);

            pTip.appendChild(tipLine);
            pTip.appendChild(volBar);

            pControlWrapper.appendChild(pControl);
            pControlWrapper.appendChild(pTip);
            //document.body.insertBefore(pControl, document.body.firstChild);
            document.body.insertBefore(pControlWrapper, document.body.firstChild);

            speech_IO.tts_audio = tts_audio;

            //$(pControl).drags();
            $(pControlWrapper).drags();
        }
    }

    speech_IO.initDragSupport = function(){
        // drag support for jquery, without jqueryui
        (function($) {
            $.fn.drags = function(opt) {

                opt = $.extend({handle:"",cursor:"move"}, opt);

                if(opt.handle === "") {
                    var $el = this;
                } else {
                    var $el = this.find(opt.handle);
                }

                return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
                    if(opt.handle === "") {
                        var $drag = $(this).addClass('draggable');
                    } else {
                        var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
                    }
                    var z_idx = $drag.css('z-index'),
                       drg_h = $drag.outerHeight(),
                       drg_w = $drag.outerWidth(),
                       pos_y = $drag.offset().top + drg_h - e.pageY,
                       pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                    $('.draggable').offset({
                        top:e.pageY + pos_y - drg_h,
                        left:e.pageX + pos_x - drg_w
                    }).on("mouseup", function() {
                        $(this).removeClass('draggable').css('z-index', z_idx);
                    });
                });
                e.preventDefault(); // disable selection
                }).on("mouseup", function() {
                    if(opt.handle === "") {
                        $(this).removeClass('draggable');
                    } else {
                        $(this).removeClass('active-handle').parent().removeClass('draggable');
                    }
                });

            }
        })(jQuery);
    }

    //speech_IO.audio = {};

    //speech_IO.audio.contents = [];
    speech_IO.audio.currentIndex = 0;

    speech_IO.audio.play = function(){
        if(speech_IO.audio.contents.length == 0){
            return false;
            //speech_IO.audio.getContents();
        }

        if(speech_IO.tts_audio.src == ''){
            var str = speech_IO.audio.contents[speech_IO.audio.currentIndex];
            console.log(str);
            speech_IO.audio.showHighLight(null, str);
            speech_IO.tts_audio.src = speech_IO.audio.urlPrefix + encodeURIComponent(str);
            speech_IO.tts_audio.play();
        }
        else{
            speech_IO.tts_audio.play();
        }
        return true;
    }

    speech_IO.audio.pause = function(){
        speech_IO.tts_audio.pause();
    }

    speech_IO.audio.prev = function(){
        if(speech_IO.audio.currentIndex <= 0){
            return false;
        }
        speech_IO.audio.currentIndex --;
        if(speech_IO.audio.currentIndex < speech_IO.audio.contents.length){
            var str = speech_IO.audio.contents[speech_IO.audio.currentIndex];
            speech_IO.tts_audio.src = speech_IO.audio.urlPrefix + encodeURIComponent(str);
            speech_IO.tts_audio.play();
        }
    }

    speech_IO.audio.next = function(){
        var curr_str = speech_IO.audio.contents[speech_IO.audio.currentIndex];
        speech_IO.audio.currentIndex ++;
        var next_str = speech_IO.audio.contents[speech_IO.audio.currentIndex];

        if(speech_IO.audio.currentIndex < speech_IO.audio.contents.length){
            speech_IO.audio.showHighLight(curr_str, next_str);
            var str = speech_IO.audio.contents[speech_IO.audio.currentIndex];
            speech_IO.tts_audio.src = speech_IO.audio.urlPrefix + encodeURIComponent(str);
            speech_IO.tts_audio.play();
        }
    }

    speech_IO.audio.showHighLight = function(curr_str, next_str){
        if(!curr_str){
            // first str
            var replaced_str = '<span style="background-color:yellow">' + next_str + '</span>';
            //document.body.innerHTML = document.body.innerHTML.replace(s, replaced_str);
            speech_IO.audio.contentElement.innerHTML = speech_IO.audio.contentElement.innerHTML.replace(next_str, replaced_str);
            return;
        }

        if(!next_str){
           return;
        }

        var curr_replaced_str = '<span style="background-color:yellow">' + curr_str + '</span>';
        var next_replaced_str = '<span style="background-color:yellow">' + next_str + '</span>';
        //document.body.innerHTML = document.body.innerHTML.replace(s, replaced_str);
        speech_IO.audio.contentElement.innerHTML = speech_IO.audio.contentElement.innerHTML.replace(curr_replaced_str, curr_str).replace(next_str, next_replaced_str);
        return;
    }





    speech_IO.init = function(callback){
        // init cuid
        chrome.extension.sendMessage(null, {method:'getCuid'}, function(res){

            // init audio url prefix
            speech_IO.audio.urlPrefix = "http://tts.baidu.com/text2audio?cuid=" + "callblueday" + "&lan=zh&ctp=1&pdt=1&tex=";
            // init control bar
            speech_IO.initDragSupport();
            speech_IO.showControlBar();

            chrome.extension.sendMessage(null, {method:'getControlBarStatus'}, function(res){

                // check if init play btn
                if(!speech_IO.audio[speech_IO.supportSites[document.location.hostname]]
                    || !( speech_IO.audio.contents = speech_IO.audio[speech_IO.supportSites[document.location.hostname]]())){
                    //if(!speech_IO.audio.contents){
                    document.getElementById('speech_IO_play_btn').style.display = 'none';
                    document.getElementById('speech_IO_next_btn').style.display = 'none';
                    var record_btn = document.getElementById('speech_IO_record_btn');
                    record_btn.style.width = '150px';
                    record_btn.style.borderStyle = 'none';
                    record_btn.style.borderTopRightRadius = '5px';
                    record_btn.style.borderBottomRightRadius = '5px';
                }
                speech_IO.recorder.toggleControlBar(res.status);

                return callback();
            });
        });
    }

    // add message listener
    chrome.extension.onMessage.addListener(function (req, sender,sendResponse) {

        console.log(req);
        switch(req.method){
            case 'fillText':
                //console.log(req.params.msg);
                try{
                    document.activeElement.innerText = req.params.msg;
                }
                catch(e){
                    document.activeElement.value = req.params.msg;
                }
                break;
            case 'showTip':
                speech_IO.recorder.showTip(req.params.msg);
                break;
            case 'closeTip':
                speech_IO.recorder.closeTip(req.params.timeout, req.params.msg);
                break;
            case 'updateSoundWave':
                speech_IO.recorder.updateSoundWave(req.params.msg);
                break;
            case 'toggleControlBar':
                speech_IO.recorder.toggleControlBar(req.params.type);
                break;
            default:
                break;
        }
    });


    speech_IO.init(function(){
    });
    //    }
}
window.speechRecognitionInjection = true;
