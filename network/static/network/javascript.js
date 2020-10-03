
document.addEventListener('DOMContentLoaded', function() {

    
    document.querySelector('#formpost').addEventListener('submit', send_post);

    /*
    document.querySelector("#allpostshere").addEventListener('click', e => {
        const likebuttons = document.querySelectorAll("#buttonlike");
        const dislikebuttons = document.querySelectorAll("#buttondislike");
        
        likebuttons.forEach(likehere => {
            likehere.onclick = () => {
                like(likehere.value);
            }
        })
    
    })
    */
    
    $('body').on("click","#buttonlike", function(e) {
        like(e.target.value, "like");
    })
    
    $('body').on("click","#buttondislike", function(e) {
        like(e.target.value, "dislike");
    })


    load_posts();
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
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });

    $('#bodypost').val('');
    load_posts();
}


function load_posts() {

    let container = $('#allpostshere')

    fetch('/getposts')
    .then(resp => resp.json())
    .then(posts => {

        posts.forEach(post => {

            container.append(
                `
                
                <div class="container-fluid border">
                    <div class="row">
                        <div class="col-12">
                            
                            <div class="media">

                                <div class="text-center">
                                    <div id="miniavatar" class="d-inline-flex shadow bg-white rounded-circle"></div>
                                    <p id="postname"><strong>David Beckham</strong></p>
                                    <p id="postusername">/${post.username}</p>
                                </div>

                                    <div class="media-body border rounded">
                                        <p>${post.post}</p>
                                    </div>
                                    
                                    <div class="d-flex" id="likes">
                                        <button id="buttonlike" value="${post.id}">Like</button><br>
                                        ${post.likes}
                                        <button id="buttondislike" value="${post.id}">Dislike</button>
                                        ${post.dislikes}
                                    </div>

                            </div>

                            <div class="text-right">
                                <span>${post.date}</span>
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
    });

}

// Cuando el texto del post no tiene espacios, se sobrepasa del contenedor ver wordwrap

// Validar los caracteres maximos del post en el back tambien

// para los likes, se podria pasar un segundo argumento a la funcion like, si es un like o un dislike ocn el fin de usar solo una funcion para manejar los dos estados

/* el backend decidira que hace con los likes, solo recibe si fue un like o un dislike y procesa la base de datos
    una vez procesado, responde (quiza con un estado) y el front end, con ese estado pone corazon, o lo saca, y actuaaliza el contador
    hay que ver como hacer eso, quiza creando una apì para los likes o algo asi.
*/