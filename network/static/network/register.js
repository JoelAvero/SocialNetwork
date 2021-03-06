

$(document).ready(function () {
    
    $("#registerform").on('submit', e => {
        e.preventDefault()
        register_control()
    })
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function register_control() {

    const firstname = $("#firstname");
    const lastname = $("#lastname");
    const username = $("#username");
    const email = $("#email");
    const password = $("#password");
    const confirmation = $("#confirmation");
    const image = $("#image");
    const csrftoken = getCookie('csrftoken');

    if (firstname.val() == ""){
        firstname.addClass('pholder');
        firstname.attr("placeholder", "Please, complete this field");
    }
    if (lastname.val() == ""){
        lastname.addClass('pholder');
        lastname.attr("placeholder", "Please, complete this field");
    }
    if (username.val() == ""){
        username.addClass('pholder');
        username.attr("placeholder", "Please, complete this field");
    }
    if (email.val() == ""){
        email.addClass('pholder');
        email.attr("placeholder", "Please, complete this field");
    }
    if (password.val() != confirmation.val()){
        confirmation.after("Passwords must be match");
    }
    
    
    if (firstname.val() != "" & lastname.val() != "" & username.val() != "" & email.val() != "" & password.val() != "" & password.val() == confirmation.val()){
        
        fetch("/register", {
            method: "POST",
            headers: { "X-CSRFToken": csrftoken },
            body: JSON.stringify({
                firstname: firstname.val(),
                lastname: lastname.val(),
                username: username.val(),
                email: email.val(),
                password: password.val(),
                confirmation: confirmation.val(),
                image: image.val()
            })
        })
        .then(response => response.json())
        .then(resp => {
            console.log(resp);
            switch(resp.message){

                case "integrityerror":
                    username.val("");
                    username.addClass('pholder');
                    username.attr("placeholder", "Username already taken");
                    break
                
                case "password":
                    confirmation.val("");
                    confirmation.addClass('pholder');
                    confirmation.attr("placeholder", "Passwords must be match");
                    break

                case "blankfields":
                    break
                
                case "successful":
                    window.location.replace("http://127.0.0.1:8000");
                    break

            }
        })
    
    } else {
        return false;
    }
    


}