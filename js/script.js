/**
 * Reference: Chapter 5 of "jQuery UI in Action" book written by T. J. Vantoll, published by Manning:
 * https://github.com/tjvantoll/jquery-ui-in-action-demos/blob/master/chapter-05/05-color-match-game.html
 */
function randomize( array ){
  return array.sort( function(){
    return 0.5 - Math.random();
  });
};

function generateQuestion( data ){
  // generate a random question	
  let questions = [...data];
  randomize( questions );
  let question = questions.pop();

  // get question data from JSON object
  const $questionArea = $("#question-area");
  let $questionDiv = $("<div></div>");
  $questionDiv.attr('id', 'question');

  // build column 1 of question
  let $column1 = $("<div></div>");
  $column1.addClass('column');
  let $column1heading = $("<h2></h2>");
  $column1heading.text("Priorities");
  $column1.append( $column1heading );
  if( question.priorities.length > 0 ){
    let $column1list = $("<ul></ul>");

    for( let i=0; i < question.priorities.length; i++ ){
      let $listItem = $("<li></li>");
      $listItem.text( question.priorities[i] );
      $column1list.append( $listItem );
    }
    
    $column1.append( $column1list );
  }
  $questionDiv.append( $column1 );

  // build column 2 of question
  let $column2 = $("<div></div>");
  $column2.addClass('column');
  let $column2heading = $("<h2></h2>");
  $column2heading.text("Concerns and Challenges");
  $column2.append( $column2heading );
  if( question.concernsAndChallenges.length > 0 ){
    let $column2list = $("<ul></ul>");

    for( let j=0; j < question.concernsAndChallenges.length; j++ ){
      let $listItem = $("<li></li>");
      $listItem.text( question.concernsAndChallenges[j] );
      $column2list.append( $listItem );
    }
    
    $column2.append( $column2list );
  }
  $questionDiv.append( $column2 );
  
  // define drop zone corresponding to question for Mouse-pointer devices, ie. Desktop view
  const $dropZone = $("<div></div>");
  $dropZone.attr( 'id', 'drop-zone' );
  $dropZone.data( 'id', question.id );
  $dropZone.droppable({
    accept: function( draggable ){
      return draggable.attr( 'id' ) == $( this ).data( 'id' );
    },
    drop: function( event, ui ){
      $( this ).addClass( "filled" );
      let $member = ui.draggable.data( 'member' );
      let $image = ui.draggable.data( 'image' );
      $( this ).find("#member").text( $member );
      $( this ).find("#image img").attr( 'src', $image );

      // hide correct answer selected on Desktop view
      ui.draggable.hide( "fade", function(){
        $(this).remove();
      });

      // hide corresponding answer on Mobile view as well
      let $correctAnswerOnMobile = $("#answers-touch-screen").children( "#" + ui.draggable.attr('id') );
      $correctAnswerOnMobile.remove();      

      $( "<div><p><b>"+ $member +"</b> is correct! Try the next question.</p></div>")
        .dialog({ 
          modal: true,
          close: function( event, ui ){
            // reset placeholder image and title
            $dropZone.find("#member").text( 'Team member?' );
            $dropZone.find("#image img").attr( 'src', './images/0_placeholder.png' );


            
            $(this).remove();
          }
        });


      // choose next question at random
      /*
      question = questions.pop();
      if( question ){
        $( "<div>", { text: question })
        .appendTo( "#drop-zone" );
      } else {
        $( "<div><p>Well done! You've answered all questions correctly!</p></div>")
        .dialog({ modal: true });
      }
      */
      
      // when all questions have been answered
      /*
      if ( $( ".filled" ).length === answers.length ) {
        $( "<div><p>Nice job! Refreshing game.</p></div>")
          .dialog({ modal: true });

        setTimeout(function() {
          window.location = window.location; // refresh page to re-start game
        }, 3000 );
      }
      */
    }
  });

  // initialise title
  const $h3 = $("<h3></h3>");
  $h3.attr( 'id', 'member' );
  $h3.text( 'Team member?' );
  $dropZone.append( $h3 );

  // initialise placeholder image
  const $imageWrapper = $("<div></div>");
  $imageWrapper.attr( 'id', 'image' );
  const $image = $("<img />");
  $image.attr( 'src', './images/0_placeholder.png' );
  $imageWrapper.append( $image );
  $dropZone.append( $imageWrapper );

  // append drop zone and generated question to question area
  $questionArea.append( $dropZone );
  $questionArea.append( $questionDiv );
}

/**
 * Determine whether should use drag 'n' drop functionality for Mouse-pointer devices (Desktop), 
 * or click selection functionality for Touch-screen devices (Mobile/Tablet).
 */
function enableDesktopOrMobileAnswers(){
  // Note: 1024px is usually max screen width of a tablet/touch devices,
  // however there are still same touch screen tablets much wider, so this is not an accurate way to determine if device is touch screen.
  // if( $(window).width() <= 1024 ){

  // Source: https://codepen.io/tteske/pen/KKwxOxp
  // Uses a better way to determine if device is a touch screen which does not rely on screen width.
  // This works, however, you cannot switch between touch-screen and mouse-pointer devices on emulator. You need to refresh after doing so.
  if("ontouchstart" in document.documentElement){
    // hide draggable answers
    $("#answers").addClass( 'hidden' );

    // show clickable answers for Mobile/Tablet view
    $("#answers-touch-screen").removeClass( 'hidden' );
  } else {
    // hide clickable answers
    $("#answers-touch-screen").addClass( 'hidden' );

    // show draggable answers for Desktop view
    $("#answers").removeClass( 'hidden' );
  }
}

function generateDesktopAnswers( data ){
  for( let i = 0; i < data.length; i++ ){
    let $answer = $("<div></div>");
    $answer.attr( 'id', data[ i ].id );
    $answer.data( 'member', data[ i ].teamMember );
    $answer.data( 'image', data[ i ].image );

    let $heading = $("<h3></h3>");
    $heading.text( data[ i ].teamMember );

    let $imgWrapper = $("<div></div>");
    let $img = $("<img />");
    $img.attr('src', data[ i ].image );

    $imgWrapper.append( $img );
    $answer.append( $heading );
    $answer.append( $imgWrapper );

    // add droppable functionality
    $answer.draggable({ 
      revert: "invalid", 
      zIndex: 2
    });

    $answer.appendTo( "#answers" );
  }
}

function generateMobileTabletAnswers( data ){
  for( let i = 0; i < data.length; i++ ){
    let $answer = $("<div></div>");
    $answer.attr( 'id', data[ i ].id );
    $answer.data( 'member', data[ i ].teamMember );
    $answer.data( 'image', data[ i ].image );

    let $heading = $("<h3></h3>");
    $heading.text( data[ i ].teamMember );

    let $imgWrapper = $("<div></div>");
    let $img = $("<img />");
    $img.attr('src', data[ i ].image );

    $imgWrapper.append( $img );
    $answer.append( $heading );
    $answer.append( $imgWrapper );

    // add click handler
    $answer.on('click', function(ev){
      // logic to check if correct selection has been made
      const $answerID = $( this ).attr( 'id' );
      if( $answerID == $("#drop-zone").data( 'id' ) ){        
        // fadeout/remove selected card after user reads prompt
        $( this ).fadeOut( function(){ 
          $( this ).remove();        
        });
        
        // also remove selected card in Desktop view
        let $correctAnswerOnDesktopView = $("#answers").children( "#" + $answerID );
        $correctAnswerOnDesktopView.remove();

        // populate image and member name in Mobile view placeholder 
        const $dropZone = $( "#drop-zone" );
        const $member = $( this ).data( 'member' );
        const $image = $( this ).data( 'image' );
        $dropZone.find("#member").text( $member );
        $dropZone.find("#image img").attr( 'src', $image );

        // scroll to top after dialogue box is closed or 3 seconds have passed
        $('html, body').animate( {scrollTop:0}, 600, function(){
          // after 1 second, show dialog popup box
          setTimeout(function() {
            $( "<div><p><b>"+ $member +"</b> is correct! Try the next question.</p></div>")
              .dialog({ 
                modal: true,
                //position: { my: "left bottom", at: "right bottom", collision: "fit" },
                close: function( event, ui ){
                  $dropZone.find("#member").text( 'Team member?' );
                  $dropZone.find("#image img").attr( 'src', './images/0_placeholder.png' );
                  
                  $(this).remove();
                }
              });            
          }, 200 );
        });

        // prompt user to confirm, and go to next question
        /*
        $( "<div><p><b>"+ $member +"</b> is correct! Try the next question.</p></div>")
          .dialog({ 
            modal: true,
            //position: { my: "center top", at: "center", of: "body" },
            open: function( event, ui ){
              $('html, body').animate( {scrollTop:0}, 'slow' );
            }
          });
        */

      } else {
        $( "<div><p>That answer was incorrect.  Please try again.</p></div>")
          .dialog({ 
            modal: true,
            close: function( event, ui ){
              $(this).remove();              
            }
          });
      }

      // let user submit selection

      // feedback to user: 
      // if correct - dialog well done. try next question. hide/remove correct answer from choices.
      // else if incorrect - dialog choose another answer. 
    });

    $answer.appendTo( "#answers-touch-screen" );
  }
}

// Executes right after the HTML document is loaded property and the DOM is ready
$(document).ready( function(){
  // get JSON data
  $.getJSON( "perceptions.json", function( data, status ){
    if( status==="success" ){
      // generate question and drop zone area
      generateQuestion( data );

      // generate both draggable and clickable answers once
      generateDesktopAnswers( data );
      generateMobileTabletAnswers( data );
      
      // initial screen width check to determine whether to show draggable or clickable answers
      enableDesktopOrMobileAnswers();
    } else {
      console.error('There was an error loading the JSON file')
    }
  });

  /**
   * Event handlers
   */
  // if screen has resized, check screen width again
  $(window).on('resize', () => {
    enableDesktopOrMobileAnswers();
  });
});
