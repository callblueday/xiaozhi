if(!window.speechRecognition){
    //var balloon;
    if(!window.speech_IO){
        window.speech_IO = {};
    }

    speech_IO.showTip = function(tip){
        console.log(tip);
        var pTip;
        if(pTip = document.getElementById('speech_IO_tip')){
            pTip.innerText = tip;
            pTip.style.display = 'block';
        }
        else{
            // init tip
            pTip = document.createElement('p');
            pTip.id = 'speech_IO_tip';
            pTip.innerText = tip;
            pTip.style.display = 'block';
            pTip.style.border = '1px solid white';
            pTip.style.borderRadius = '5px';
            pTip.style.backgroundColor = 'black';
            pTip.style.width = '150px';
            pTip.style.height = '50px';
            pTip.style.color = 'grey';
            pTip.style.textAlign = 'center';
            pTip.style.position = 'fixed';
            pTip.style.top = '5px';
            pTip.style.right = '5px';
            pTip.style.opacity = '0.8';
            pTip.style.zIndex = '9999';
            pTip.style.lineHeight = '50px';

            document.body.insertBefore(pTip, document.body.firstChild);
        }
    }
    speech_IO.closeTip = function(timeout, msg){
        console.log('close tip');
        var pTip = document.getElementById('speech_IO_tip');
        if(timeout == 0){
            pTip.style.display = 'none';
        }
        else{
            pTip.innerText = msg;
            setTimeout(function(){
                pTip.style.display = 'none';
            }, timeout);

        }
    }


    chrome.extension.onMessage.addListener(
            function (req, sender,sendResponse) {
                console.log(req);
                switch(req.method){
                    case 'fillText':
                        //console.log(req.params.msg);
                        document.activeElement.value = req.params.msg;
                        break;
                    case 'showTip':
                        speech_IO.showTip(req.params.msg);
                        break;
                    case 'closeTip':
                        speech_IO.closeTip(req.params.timeout, req.params.msg);
                        break;
                    default:
                        break;
                }
            }
            );

}
window.speechRecognition = true;
