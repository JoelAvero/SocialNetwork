
document.addEventListener('DOMContentLoaded', function() {

    
    document.querySelector('#formpost').addEventListener('submit', send_post);

})
    
    



function send_post(e){

    e.preventDefault()
    const body = $('#bodypost').val();

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
                                    <p id="postusername">${post.username}</p>
                                </div>

                                    <div class="media-body border rounded">
                                        <p>${post.post}</p>
                                    </div>
                                    
                                    <div class="d-flex" id="likes">
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