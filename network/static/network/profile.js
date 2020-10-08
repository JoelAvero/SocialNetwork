

$(document).ready(function () {
    
    console.log("hello");

});


function load_posts(user_name){

    fetch('/getprofile', {
        method: "POST",
        body: JSON.stringify({
            username: user_name
        })
    })
    

}