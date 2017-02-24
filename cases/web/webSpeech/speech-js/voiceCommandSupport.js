// http://www.baidu.com/s?ie=UTF-8&wd=
// http://s.taobao.com/search?q=
// https://www.bing.com/search?setmkt=en-US&q=
// http://search.jd.com/Search?enc=utf-8&keyword=

function openSearchPage(type, word){
    var urls = {
        baidu:'http://www.baidu.com/s?ie=UTF-8&wd=',
        taobao:'http://s.taobao.com/search?q=',
        jd:'http://search.jd.com/Search?enc=utf-8&keyword=',
        tmall:'http://list.tmall.com/search_product.htm?type=p&from=..pc_1_opensearch&q='
    };
    
    var noKeywordUrls = {
        baidu:'http://www.baidu.com/',
        taobao:'http://www.taobao.com/',
        jd:'http://www.jd.com/',
        tmall:'http://www.tmall.com/'
    };

    var fromParam = 'ssssfrom=baidu_speech_ext';
    var url = '';
    if(word){
        url = urls[type] + word + '&' + fromParam;
    }
    else{
        url = noKeywordUrls[type] + '?' +  fromParam;
    }
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i in tabs) { // check if Options page is open already
            if (tabs.hasOwnProperty(i)) {
                var tab = tabs[i];
                if (tab.url.indexOf(urls[type]) >= 0 && tab.url.indexOf(fromParam) > 0) {
                    chrome.tabs.update(tab.id, { 
                        selected:true ,
                        url:url
                    }); // select the tab
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

//setTimeout(function(){
//openSearchPage('baidu', '内存条');
//}, 2000);
