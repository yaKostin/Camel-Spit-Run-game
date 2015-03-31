$(document).ready(function () {
    // login
    $('#login_btn').click(function () {
        if ($('.name_input').val().trim().length != 0) {
            $('.enter_name_wr').fadeOut(300, function () {
                $('.game_menu').fadeIn(300);
                startMusic('back');
            });
        }
    });

    // start
    $('#start_btn').click(function () {
        window.location = "game.html";
    });

    // settings dropdown
    $('#settings_btn').click(function () {
        if ($(this).hasClass('opened')) {
            $(this).removeClass('opened');
        } else {
            $(this).addClass('opened');
        }
        $('.settings_wr').slideToggle();
    });

    // sounds
    var ismuted = true;
    $(window).blur(function () {
        document.getElementById('audio_back').pause();
    });
    $(window).focus(function () {
        if (!ismuted) {
            document.getElementById('audio_back').play();
        }
    });
    $('#music_btn').click(function () {
        if ($(this).hasClass('sound_btn_off')) {
            $(this).removeClass('sound_btn_off');
            document.getElementById('audio_back').muted = false;
            document.getElementById('audio_back').play();
            ismuted = false;
        } else {
            $(this).addClass('sound_btn_off');
            document.getElementById('audio_back').muted = true;
            document.getElementById('audio_back').pause();
            ismuted = true;
        }
    });
    $('#sounds_btn').click(function () {
        if ($(this).hasClass('sound_btn_off')) {
            $(this).removeClass('sound_btn_off');
        } else {
            $(this).addClass('sound_btn_off');
        }
    });

    function startMusic(file) {
        ismuted = false;

        audio = document.createElement("audio");
        audio.setAttribute("id", "audio_back");
        audio.setAttribute("loop", "true");

        var mp3 = document.createElement("source");
        mp3.setAttribute("src", "audio/" + file + ".mp3");
        mp3.setAttribute("type", "audio/mpeg");
        audio.appendChild(mp3);

        var ogg = document.createElement("source");
        ogg.setAttribute("src", "audio/" + file + ".ogg");
        ogg.setAttribute("type", "audio/ogg");
        audio.appendChild(ogg);

        audio.play();

        document.body.appendChild(audio);
    }

});