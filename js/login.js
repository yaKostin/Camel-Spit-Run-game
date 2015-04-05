$(document).ready(function () {
    // login
    $('#login_btn').click(function () {
        if ($('.name_input').val().trim().length != 0) {
            var name = $('.name_input').val().trim();
            $('.start_wr > div').fadeOut(300, function () {
                window.location = "game.html?" + name;
                startMusic('back');
            });
        }
    });
});