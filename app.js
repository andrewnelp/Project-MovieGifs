$(function () {

  // let movies = [];
  let form = $("#movie-search");
  // let movieList = $("#movie-list");
  let movieList = document.getElementById('movie-list');
  
  

  // Grabs user input from the form on submit and
  $("#submit").on("click", (e) => {
    e.preventDefault();
    // This line grabs the input from the textbox
    let movie = form.val().trim();
    //url for movies
    let queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=13a937dc";

     
      
    // Creating an AJAX call for the specific movie button being clicked
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {

      console.log(response);

      // grabbing and storing data in vars from response:

      let title = response.Title;
      let year = response.Year;
      let runtime = response.Runtime;
      let actors = response.Actors;
      let plot = response.Plot;
      let imageUrl = response.Poster;


      // console.log(plot);

      //storing values in Database
      db.collection('movies').add({
        title: title,
        year: year,
        runtime: runtime,
        actors: actors,
        plot: plot,
        image: imageUrl
      });
      form.value = '';

    });

  })

 
  //rendering movies
  function renderMovie(doc) {
    // let table = $("<tbody class='text-center'>");
    let title = $("<p class='z-depth-2'>");
    let year = $("<p>");
    let runtime = $("<p>");
    let actors = $("<p>");
    let plot = $("<p>");
    let buttonGifs = $('<button type="button" class="btn btn - info showGifs"> Show Gifs </button>');
    let cross = $("<p>");
    let imagePlace = $("<img height='250'>");

    
    //appending all the elements
    let ulInfo = $('<div>').append(
      title.text(doc.data().title),
      year.text(doc.data().year),
      runtime.text(doc.data().runtime),
      actors.text(doc.data().actors),
      imagePlace.attr("src", doc.data().image),
      plot.text(doc.data().plot),
      buttonGifs.text('Show Gifs'),
      cross.html('<i class="far fa-trash-alt"></i>')
      // cross.html('X')
    );
    buttonGifs.attr('data-name', doc.data().title)
    let movieRow = $("<div class='row mb-2'>")
    let colOne = $('<div class="col s5">');
    let colTwo = $('<div class="col s7 second">');
    let gifDiv = $("<div>");
    
    movieRow = movieRow.attr('data-id', doc.id);
    colOne.append(ulInfo);
    colTwo.append(gifDiv);
    movieRow.append(colOne, colTwo);
    movieRow.prependTo(movieList);
    
    //showing gifs
    buttonGifs.on('click', function(event){
      event.stopPropagation();
      //url for gifs
      let movieGif = $(this).attr("data-name");
      let queryURLgifs = "http://api.giphy.com/v1/gifs/search?q=" + movieGif + "+movie&api_key=Wa2AdCO6cHGtHNULqRHDcKFm4pSgr85Q&limit=7";

      $.ajax({
        url: queryURLgifs,
        method: "GET"
      }).then(function (resp) {
        console.log(queryURLgifs);
        console.log(resp);
        for (let i = 0; i < resp.data.length; i++) {
          let imgGif = $('<img>')
          // gifDiv.addClass('carGif m-1 shadow p-3 mb-5 bg-white rounded')
          imgGif.attr('src', resp.data[i].images.fixed_width.url);
          imgGif.attr('id', resp.data[i].id);
          gifDiv.append(imgGif);
        }
      })
    
    } )

    // deleting data
    cross.on('click', function (e) {
      e.stopPropagation();
      // confirm('Do you want to delete this movie?');
      alert('Do you want to delete this movie?')
      let id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
      // console.log(id);
      // console.log(db.collection('movies').doc(id));
      db.collection('movies').doc(id).delete();
    });
  }

  // real-time listener
  db.collection('movies').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    // console.log(changes);
    changes.forEach(change => {
      // console.log(change.doc.data());
      if (change.type == 'added') {
        renderMovie(change.doc);
      } else if (change.type == 'removed') {
        //finding the div with attr
        let divRemove = movieList.querySelector('[data-id=' + change.doc.id + ']');
        // console.log(divRemove)
        movieList.removeChild(divRemove);
      }
    });
  })

});


