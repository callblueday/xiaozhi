
$(document).ready(function(){
    var bg = chrome.extension.getBackgroundPage();
    function checkSettings(){
        var mode = localStorage.getItem('t2c_mode');
        var from = localStorage.getItem('t2c_from');

        var showControl = bg.Settings.getValue('show_control');
        if(showControl != 'false'){
            // show
            $("#show_control_bar span")[0].innerText = "✔";
        }
        else{
            $("#show_control_bar span")[0].innerText = "";
        }
    }

    $('#show_control_bar').click(function(){
        // open option page
        if(bg.Settings.getValue('show_control') == 'false'){
            bg.Settings.setValue('show_control', 'true');
            $('#show_control_bar span').text('✔');
            bg.toggleControlBar(true);
        }
        else{
            bg.Settings.setValue('show_control', 'false');
            $('#show_control_bar span').text('');
            bg.toggleControlBar(false);
        }
    });
    $('#option_page').click(function(){
        // open option page
        return bg.openOptionPage();
    });
    $('#about_page').click(function(){
        // open about page
        return bg.openAboutPage();
    });

    checkSettings();
});
