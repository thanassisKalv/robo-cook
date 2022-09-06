$(document).ready(function() {
	var LangText = ["Please select game's language", "Seleziona la lingua del gioco"];
	var LangTextNum = 0;
    function loop() {
        $('.lang-title').delay(1500).animate ({
            opacity: '0'
        }, 500, 'linear', function() {
			$(".lang-title").text(LangText[LangTextNum]);
			LangTextNum ++;
			if(LangTextNum==3){LangTextNum = 0;}
			$('.lang-title').animate({opacity:'1'},500,'linear');
            loop();
        });
    }
    loop();
});