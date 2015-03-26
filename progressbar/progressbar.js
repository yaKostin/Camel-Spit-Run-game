
function progress(percent, $element) { 
    var progressBarWidth = percent * $element.width() / 100;
    $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");
}
$( document ).ready(function() {
    progress(80, $('.progressBar'));
});

