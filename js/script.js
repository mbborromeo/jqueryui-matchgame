// Executes right after the HTML document is loaded property and the DOM is ready
$(document).ready( function(){
  /*****************
   * Global variables
   */
  var questions;
  const $summaryArea = $("#summary-area");
  $summaryArea.addClass('hidden');


  /************************
   * Function declarations
   */

  // Reference: Chapter 5 of "jQuery UI in Action" book written by T. J. Vantoll, published by Manning:
  // https://github.com/tjvantoll/jquery-ui-in-action-demos/blob/master/chapter-05/05-color-match-game.html  
  function randomize( array ){
    return array.sort( function(){
      return 0.5 - Math.random();
    });
  };

  function generateQuestions( data ){
    // generate a random set of questions
    let questionsList = [...data];
    randomize( questionsList );
    return questionsList;
  }

  function generateSummary(){
    for( let q=0; q < questions.length; q++ ){
      // build answer area
      const $summaryItem = $("<div></div>");
      $summaryItem.addClass('summary-item');

      const $answer = $("<div></div>");
      $answer.addClass('answer');

      const $h3 = $("<h3></h3>");
      $h3.text( questions[q].teamMember );
      $answer.append( $h3 );

      const $imageWrapper = $("<div></div");
      $imageWrapper.addClass('image');
      const $image = $("<img />");
      $image.attr( 'src', questions[q].image );
      $imageWrapper.append( $image );
      $answer.append( $imageWrapper );

      $summaryItem.append( $answer );

      // build question columns
      const $question = $("<div></div>");
      $question.addClass('question');

      // build 1st column
      const $column1 = $("<div></div>");
      $column1.addClass('column');

      const $column1Heading = $("<h2></h2>");
      $column1Heading.text( 'Priorities' );
      $column1.append( $column1Heading );

      const $column1List = $("<ul></ul>");
      for( let p=0; p < questions[q].priorities.length; p++ ){
        const $listItem = $("<li></li>");
        $listItem.text( questions[q].priorities[p] );
        $column1List.append( $listItem );
      }
      $column1.append( $column1List );
      $question.append( $column1 );

      // build 2nd column
      const $column2 = $("<div></div>");
      $column2.addClass('column');

      const $column2Heading = $("<h2></h2>");
      $column2Heading.text( 'Concerns and Challenges' );
      $column2.append( $column2Heading );

      const $column2List = $("<ul></ul>");
      for( let c=0; c < questions[q].concernsAndChallenges.length; c++ ){
        const $listItem = $("<li></li>");
        $listItem.text( questions[q].concernsAndChallenges[c] );
        $column2List.append( $listItem );
      }
      $column2.append( $column2List );
      $question.append( $column2 );

      $summaryItem.append( $question );

      // append it to DOM, but make sure area is initially hidden
      $summaryArea.append( $summaryItem );
    }
  }

  function showSummary(){
    // hide questions
    $("#question-area").addClass('hidden');
    $("#answers").addClass('hidden');
    $("#answers-touch-screen").addClass('hidden');

    // display summary of questions with answers
    $("#summary-area").removeClass('hidden');
  }

  function askNextQuestion(){
    let question = questions.pop();
  
    if( question ){
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
      $questionDiv.empty();
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
  
          if( questions.length > 0 ){
            $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct! You have "+ questions.length +" more question/s. Try the next one.</p></div>")
              .dialog({ 
                modal: true,
                close: function( event, ui ){  
                  // choose next question at random
                  askNextQuestion(); // recursive function call to self

                  // remove dialog popup from DOM
                  $(this).remove();
                  $("#mobile-dialog").dialog('destroy');
                },
                buttons: [
                  {
                    text: "OK",
                    click: function() {
                      $( this ).dialog( "close" );
                    }
                  }
                ]
              });
          } else {
            $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct! You have answered all the questions now.  Well done!  A summary of the answers has been provided on the screen.</p></div>")
              .dialog({ 
                modal: true,
                close: function( event, ui ){
                  // remove dialog popup from DOM
                  $(this).remove();    
                  $("#mobile-dialog").dialog('destroy');
                  
                  showSummary();
                },
                buttons: [
                  {
                    text: "OK",
                    click: function() {
                      $( this ).dialog( "close" );
                    }
                  }
                ]
              });
          }
        }
      });
  
      // initialise title
      const $h3 = $("<h3></h3>");
      $h3.attr( 'id', 'member' );
      $h3.text( 'Team member?' );
      $dropZone.empty();
      $dropZone.append( $h3 );
  
      // initialise placeholder image
      const $imageWrapper = $("<div></div>");
      $imageWrapper.attr( 'id', 'image' );
      const $image = $("<img />");
      $image.attr( 'src', './images/0_placeholder.png' );
      $imageWrapper.empty();
      $imageWrapper.append( $image );
      $dropZone.append( $imageWrapper );
  
      // append drop zone and generated question to question area
      $questionArea.empty();
      $questionArea.append( $dropZone );
      $questionArea.append( $questionDiv );
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

          // Upon choosing correct answer:
          // animate screen to top, 
          // pause there a little so image/title inserted in placeholder can be noticed, 
          // display dialog popup box with feedback message
          // when user closes dialog, reset placeholder and ask next question
          // dialog box closes
          // remove dialog box from DOM - important otherwise close button doesn't work.
          $('html, body').animate( {scrollTop:0}, 600, function(){
            setTimeout( 
              function(){
                if( questions.length > 0 ){
                  $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct! You have "+ questions.length +" more question/s. Try the next one.</p></div>")
                    .dialog({ 
                      modal: true,
                      close: function( event, ui ){                    
                        // remove dialog popup from DOM
                        $(this).remove();
                        $("#mobile-dialog").dialog('destroy');
                        
                        // choose next question at random
                        askNextQuestion(); // recursive function call to self
                      },
                      buttons: [
                        {
                          text: "OK",
                          click: function() {
                            $( this ).dialog( "close" );
                          }
                        }
                      ]
                    });                
                } else {
                  $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct! You have answered all the questions now.  Well done!  A summary of the answers has been provided on the screen.</p></div>")
                    .dialog({ 
                      modal: true,
                      close: function( event, ui ){
                        // remove dialog popup from DOM
                        $(this).remove();
                        $("#mobile-dialog").dialog('destroy');

                        showSummary();
                      },
                      buttons: [
                        {
                          text: "OK",
                          click: function() {
                            $( this ).dialog( "close" );
                          }
                        }
                      ]
                    });
                }
              }, 
              200 
            );
          });
        } else {
          $( "<div id='mobile-dialog'><p>That answer was incorrect.  Please try again.</p></div>")
            .dialog({ 
              modal: true,
              close: function( event, ui ){
                $(this).remove();
                $("#mobile-dialog").dialog('destroy');
              },
              buttons: [
                {
                  text: "OK",
                  click: function() {
                    $( this ).dialog( "close" );
                  }
                }
              ]
            });
        }
      });
  
      $answer.appendTo( "#answers-touch-screen" );
    }
  }

  // Determine whether should use drag 'n' drop functionality for Mouse-pointer devices (Desktop), 
  // or click selection functionality for Touch-screen devices (Mobile/Tablet).
  // Reference: https://codepen.io/tteske/pen/KKwxOxp
  // Determines if device is a touch-screen without relying on screen width.
  // Note: if you switch between touch-screen and mouse-pointer devices on an emulator, you need to refresh after doing so.
  function enableDesktopOrMobileAnswers(){
    if("ontouchstart" in document.documentElement){
      // hide draggable answers for Desktop, show clickable answers for Mobile/Tablet view
      $("#answers").addClass( 'hidden' );
      $("#answers-touch-screen").removeClass( 'hidden' );
    } else {
      // hide clickable answers for Mobile/Tablet, show draggable answers for Desktop view 
      $("#answers-touch-screen").addClass( 'hidden' );
      $("#answers").removeClass( 'hidden' );
    }
  }


  /******************
   * Main code logic
   */
  // extract Q & A data from JSON file
  $.getJSON( "perceptions.json", function( data, status ){
    if( status==="success" ){
      // generate question and drop zone area
      questions = generateQuestions( data );

      // generate Q & A summary, but it is initially hidden from view
      generateSummary();

      // choose a question to ask user
      askNextQuestion();

      // generate both draggable and clickable answers once
      generateDesktopAnswers( data );
      generateMobileTabletAnswers( data );
      
      // initial screen width check to determine whether to show draggable or clickable answers
      enableDesktopOrMobileAnswers();
    } else {
      console.error('There was an error loading the JSON file')
    }
  });


  /*****************
   * Event handlers
   */
  // if screen has resized, check screen width again
  $(window).on('resize', () => {
    enableDesktopOrMobileAnswers();
  });
  
});
