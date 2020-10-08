
document.addEventListener('DOMContentLoaded', function() {
    

    document.querySelector('#formpost').addEventListener('submit', send_post);

    
    $('body').on("click",".buttonlike", function(e) {
        like(e.target.id, "like");
    })
    
    $('body').on("click",".buttondislike", function(e) {
        like(e.target.id, "dislike");
    })


    
})
    


function send_post(e){

    e.preventDefault()
    const body = $('#bodypost').val();
    let body2 = body.length

    if(body.length > 141){
        console.log("manejar este error");
        return false
    };

    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            body: body,
        })
    })
    .then(response => response.json())
    .then(data => {

    })
    .catch(err => {

    });

    $('#bodypost').val('');
    
}


function load_posts(requestedposts){

    let container = $('#allpostshere')
    
    container.text("")

    if(requestedposts == "all" || requestedposts == "following"){
        document.querySelector("#formlayer").style.display = "block";
        document.querySelector("#profilelayer").style.display = "none";
    } else {
        document.querySelector("#profilelayer").style.display = "block";
        document.querySelector("#formlayer").style.display = "none";
    }

    fetch(`getposts/${requestedposts}`)
    .then(response => response.json())
    .then(posts => {
        
        posts.forEach(post => {
            

            let status

            switch(post[1].liketype){

                case "like":
                    status = "buttonlikeon"
                    break

                case "dislike":
                    status = "buttonlikeoff"
                    break

                case "nolike":
                    status = ""
                    break
            };
            

            container.append(
                `
                
                <div class="container-fluid border">
                                <div class="row">
                                    <div class="col-12">
                                        
                                        <div class="media">
            
                                            <div class="text-center">
                                                <div id="miniavatar" class="d-inline-flex shadow bg-white rounded-circle"></div>
                                                <p id="postname"><strong>David Beckham</strong></p>
                                                <p id="postusername">/${post[0].username}</p>
                                                
                                            </div>
            
                                                <div class="media-body border rounded">
                                                    <p>${post[0].post}</p>
                                                </div>
                                                
                                                <div class="" id="likes">
                                                    <img class="buttonlike ${status == "buttonlikeon" ? status : ''}" id="${post[0].id}" src="/static/network/like.png" alt="">
                                                    <span id="likescounter${post[0].id}">${post[0].likes}</span>
                                                    <br>
                                                    <img class="buttondislike ${status == "buttonlikeoff" ? status : '' }" id="${post[0].id}" src="/static/network/dislike.png" alt="">
                                                    <span id="dislikescounter${post[0].id}">${post[0].dislikes}</span>
                                                </div>
            
                                        </div>
            
                                        <div class="text-right">
                                            <span>${post[0].date}</span>
                                        </div>
            
                                    </div>
                                </div>
                            </div>

                `
                )
        })
        
    })

    
}


function like(id, liketype) {
    

    fetch('/newlike', {
        method: 'POST',
        body: JSON.stringify({
            postid: id,
            liketype: liketype
        })
    })
    .then(result => result.json())
    .then(data => {

        if (data.like == "like"){

            let boton = $(`#${id}.buttonlike`);
            let boton2 = $(`#${id}.buttondislike`);
            let likespan = $(`#likescounter${id}`);
            let dislikespan = $(`#dislikescounter${id}`);
            
            
            switch(data.result){

                case "change":
                    boton2.removeClass("buttonlikeoff");
                    boton.addClass("buttonlikeon");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`)
                    likespan.text(`${Number($(`#likescounter${id}`).text()) + 1}`)
                    
                    break

                case "like":
                    boton.addClass("buttonlikeon");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) + 1}`)
                    break
                
                case "delete":
                    boton.removeClass("buttonlikeon");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    break
            };


        } else {
            let boton2 = $(`#${id}.buttonlike`);
            let boton = $(`#${id}.buttondislike`);
            let likespan = $(`#likescounter${id}`);
            let dislikespan = $(`#dislikescounter${id}`);
            switch(data.result){

                case "change":
                    boton2.removeClass("buttonlikeon");
                    boton.addClass("buttonlikeoff");
                    likespan.text(`${Number($(`#likescounter${id}`).text()) - 1}`);
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break

                case "dislike":
                    boton.addClass("buttonlikeoff");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) + 1}`);
                    break
                
                case "delete":
                    boton.removeClass("buttonlikeoff");
                    dislikespan.text(`${Number($(`#dislikescounter${id}`).text()) - 1}`);
                    break
            }
        }

    })

}



// Cuando el texto del post no tiene espacios, se sobrepasa del contenedor ver wordwrap

// Validar los caracteres maximos del post en el back tambien

