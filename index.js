
var audio = new Audio();
var audioPersistence = []

var baseURL = "https://gttsapi.herokuapp.com";
var url = baseURL + "/gtts/api/text-to-speech/blob/";

const showAndHideErrorMessage = (message) => {
    $("#error-container").css("display", "flex");
    $("#error-message").text(message)
    setTimeout(() => {
        $("#error-container").fadeOut("slow", () => {
            $(this).css("display", "none")
        })
    }, 1500)
}

const resetTextInput = () => {
    $("#reset-text-input").click(() => {
        $("#text-to-translate").val("");
    })
}

const toggleNavbar = () => {
    let toggle = 1;

    $("#burger-btn").click(() => {
        
        if (toggle % 2 === 0) {
            $(".application-container").css("width", "70%");
            $(".message-container").css("width","30%");
    
            setTimeout(() => {
                $(".message-container").css("display", "block");
            }, 500);
        
        } else {
            $(".application-container").css("width", "100%");
            $(".message-container").css("width","0%");
    
            setTimeout(() => {
                $(".message-container").css("display", "none");
            }, 100);            
        }

        toggle++;
    })
}

const validateInput = (id, message) => {
    if ($(id).val() === "" || $(id).val() === null) {
        return showAndHideErrorMessage(message)
    } else {
        return $(id).val();
    }
}

const formValues = () => {
    let lang = validateInput("#language-chooser", "Seleccione un idioma");
    let text = validateInput("#text-to-translate", "Debe ingresar un texto")

    return {
        "text": text,
        "language": lang,
        "should_be_slow": false
    }
}

const makeRequest = () => {
    let body = formValues()

    $.ajax({
        type: "POST",
        dataType: "native",
        crossDomain: true,
        cache: false,
        url: url,
        data: JSON.stringify(body),
        xhrFields : {
            responseType : "blob"
        },
        success: (res) => {
            var link = document.createElement("a");
            link.href = window.URL.createObjectURL(res);
            
            playAudio(link.href)
            saveAudioInMemory(link.href, body.text)
            showAudios(audioPersistence);
        }
    })
}

const translateTextToSpeech = () => {

    $("#translate-btn").click((e) => {
        console.log("click")
        makeRequest();
    })
}

const translateTextToSpeechWithKeyword = () => {
    $("#text-to-translate").keyup(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault()
            makeRequest();
        }
    })
} 

const playAudio = (src) => {
    
    audio.pause();
    delete audio;

    audio = new Audio(src)
    audio.preload;
    audio.play();

    //controlAudioVolume(audio)
}

const controlAudioVolume = (audio) => {
    let slider = document.getElementById("slider")

    slider.oninput = function() {
        audio.volume = this.value / 100;
    }

}


const saveAudioInMemory = (src, text) => {
    audioPersistence.push({ details : [src, text] })
}


const playSideAudio = () => {
    $(document).on('click', '.play-side-audio-btn', function(e) {
        e.preventDefault()

        let html = $(this)[0].parentElement.parentElement;
        let src = $(html).attr('file-src');

        playAudio(src)

    })
}

const showAudios = (audios) => {

    templateContainer = $("#message-table");
    template = "";

    if (audios.length == 0) {
        template = "<tr class='text-center'> <td>No hay mensajes <i class='fa fa-warning ml-2 mt-1'><i/></td> </tr>" 
        return templateContainer.html(template);
    } else {
        audios.forEach(audio => {
            template += `
                <tr file-src="${audio.details[0]}">
                    <td>${audio.details[1].length > 20 ? audio.details[1].substring(0, 20) + "..." : audio.details[1]}</td>
                    <td> ${formValues().language} </td>
                    <td> 
                        <button class="play-side-audio-btn btn btn-sm btn-info rounded-circle">
                            <i class="fa fa-play"></i>
                        </button>
                        <button class="delete-side-audio-btn btn btn-sm btn-danger rounded-circle ml-2">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>       
                </tr>
            `
        })

        return templateContainer.html(template)
    }   
}


const deleteAudio = () => {
    $(document).on('click', '.delete-side-audio-btn', function(e) {
        let html = $(this)[0].parentElement.parentElement;
        let src = $(html).attr('file-src');        
        
        console.log(src);

        Swal.fire({
            "text" : "Mensaje eliminado",
            "icon" : "success",
            "timer" : 1500
        }).then(() => {
            removeAudioFromMemory(src);
        })
    })    
}

const removeAudioFromMemory = (src) => {
    let index = 0;
    audioPersistence.forEach(audio => {
        if (audio.details[0] === src) {
            index = audioPersistence.indexOf(audio);
            if (index > -1) {
                audioPersistence.splice(index, 1);
            }
        }
    });

    console.log(audioPersistence)

    showAudios(audioPersistence)
}

function ready() {
    translateTextToSpeechWithKeyword();
    translateTextToSpeech();
    playSideAudio();
    deleteAudio();
    toggleNavbar();
    resetTextInput();
}

$(document).ready(ready)