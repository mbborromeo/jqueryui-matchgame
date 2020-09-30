// Executes right after the HTML document is loaded property and the DOM is ready
$(document).ready( function(){
  /*****************
   * Global variables
   */
  var originalData;
  var questionsToAsk;
  const $summaryArea = $("#summary-area");
  const $questionArea = $("#question-area");
  const $instructions = $("#instructions");
  const $answers = $("#answers");
  const $answersTouchScreen = $("#answers-touch-screen");


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

  function arrangeQuestions(){
    // generate a random set of questions
    let questionsList = originalData.slice(); // IE 11 doesn't like syntax [...data]
    randomize( questionsList );
    return questionsList;
  }

  function generateMemberPriorities( question ){
    const $column1 = $("<div></div>");
    $column1.addClass('column');

    const $column1Heading = $("<h2></h2>");
    $column1Heading.text( 'Priorities' );
    $column1.append( $column1Heading );

    const $column1List = $("<ul></ul>");
    for( let p=0; p < question.priorities.length; p++ ){
      const $listItem = $("<li></li>");
      $listItem.text( question.priorities[p] );
      $column1List.append( $listItem );
    }
    $column1.append( $column1List );

    return $column1;
  }

  function generateMemberConcerns( question ){
    const $column2 = $("<div></div>");
    $column2.addClass('column');

    const $column2Heading = $("<h2></h2>");
    $column2Heading.text( 'Concerns and Challenges' );
    $column2.append( $column2Heading );

    const $column2List = $("<ul></ul>");
    for( let c=0; c < question.concernsAndChallenges.length; c++ ){
      const $listItem = $("<li></li>");
      $listItem.text( question.concernsAndChallenges[c] );
      $column2List.append( $listItem );
    }
    $column2.append( $column2List );

    return $column2;
  }

  function generateSummary(){
    // empty summary area in case quiz has been attempted before
    $summaryArea.empty();
    $summaryArea.addClass('hidden');

    for( let q=0; q < questionsToAsk.length; q++ ){
      const question = questionsToAsk[q];

      // build answer area
      const $summaryItem = $("<div></div>");
      $summaryItem.addClass('summary-item');

      const $answer = $("<div></div>");
      $answer.addClass('answer');

      const $h3 = $("<h3></h3>");
      $h3.text( question.teamMember );
      $answer.append( $h3 );

      const $imageWrapper = $("<div></div");
      $imageWrapper.addClass('image');
      const $image = $("<img />");
      $image.attr( 'src', question.image );
      $imageWrapper.append( $image );
      $answer.append( $imageWrapper );

      $summaryItem.append( $answer );

      // build question columns
      const $questionDiv = $("<div></div>");
      $questionDiv.addClass('question');

      // build 1st column
      const $column1 = generateMemberPriorities( question );      
      $questionDiv.append( $column1 );

      // build 2nd column
      const $column2 = generateMemberConcerns( question );
      $questionDiv.append( $column2 );

      // append Question to DOM
      $summaryItem.append( $questionDiv );

      // append it to DOM, but make sure area is initially hidden
      $summaryArea.append( $summaryItem );
    }

    // build and append Replay button
    const $replayBtn = $("<button></button>");
    $replayBtn.attr( 'id', 'replay-btn' );
    $replayBtn.addClass('ui-button ui-widget ui-corner-all');
    $replayBtn.text('Replay quiz');
    $replayBtn.on( 'click', function(){
      setUpQuiz();
    });
    $summaryArea.append( $replayBtn );
  }

  function showSummary(){
    // hide questions
    $questionArea.addClass('hidden');
    $instructions.addClass('hidden');
    $answers.addClass('hidden') // override CSS logic from enableDesktopOrMobileAnswers() - css({ "display": "none" })
    $answersTouchScreen.addClass('hidden'); // override CSS logic from enableDesktopOrMobileAnswers() - css({ "display": "none" })

    // display summary of questions with answers
    $summaryArea.removeClass('hidden');
  }

  function generateQuestionContent( question ){
    let $questionDiv = $("<div></div>");
    $questionDiv.attr('id', 'question');

    // build column 1 of question
    const $column1 = generateMemberPriorities( question ); 
    $questionDiv.append( $column1 );

    // build column 2 of question
    const $column2 = generateMemberConcerns( question );
    $questionDiv.append( $column2 );

    return $questionDiv;
  }

  // define drop zone corresponding to question for Mouse-pointer devices, ie. Desktop view
  function generateAnswerDropZone( questionID ){    
    const $dropZone = $("<div></div>");
    $dropZone.attr( 'id', 'drop-zone' );
    $dropZone.data( 'id', questionID );
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
        let $correctAnswerOnMobile = $answersTouchScreen.children( "#" + ui.draggable.attr('id') );
        $correctAnswerOnMobile.remove();      

        if( questionsToAsk.length > 0 ){
          $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct!<br /><br />You have <b>"+ questionsToAsk.length +"</b> more question/s. Try the next one.</p></div>")
            .dialog({ 
              modal: true,
              dialogClass: "no-show bg-correct",
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
          $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct!<br /><br />You have answered <b>all</b> the questions now.  Well done!<br /><br />A summary of the answers has been provided on the screen.</p></div>")
            .dialog({ 
              modal: true,
              dialogClass: "no-show bg-correct",
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
    $h3.text( 'Who is this team member?' );      
    $dropZone.append( $h3 );

    // initialise placeholder image
    const $imageWrapper = $("<div></div>");
    $imageWrapper.attr( 'id', 'image' );
    const $image = $("<img />");
    $image.attr( 'src', './images/0_placeholder.png' );
    $imageWrapper.append( $image );
    $dropZone.append( $imageWrapper );

    return $dropZone;
  }

  function askNextQuestion(){    
    $questionArea.empty();
    $questionArea.removeClass('hidden');

    // remove last item from questions array and return item
    let question = questionsToAsk.pop();
  
    // extract question data from JSON object  
    if( question ){          
      const $qcontent = generateQuestionContent( question );
      
      // drop zone corresponding to question 
      // will be visible/used for both Mouse-pointer (desktop) and Touch-screen devices (mobile/tablet)
      const $dzone = generateAnswerDropZone( question.id );
  
      // append drop zone and generated question to question area
      $questionArea.append( $dzone );
      $questionArea.append( $qcontent );
    }
  }

  function generateDesktopAnswers(){
    // empty answers in case quiz has been attempted before
    $answers.empty();
    $answers.removeClass('hidden');

    for( let i = 0; i < originalData.length; i++ ){
      let $answer = $("<div></div>");
      $answer.attr( 'id', originalData[ i ].id );
      $answer.data( 'member', originalData[ i ].teamMember );
      $answer.data( 'image', originalData[ i ].image );

      let $heading = $("<h3></h3>");
      $heading.text( originalData[ i ].teamMember );

      let $imgWrapper = $("<div></div>");
      let $img = $("<img />");
      $img.attr('src', originalData[ i ].image );

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

  function generateMobileTabletAnswers(){
    // empty answers in case quiz has been attempted before
    $answersTouchScreen.empty();
    $answersTouchScreen.removeClass('hidden');

    for( let i = 0; i < originalData.length; i++ ){
      let $answer = $("<div></div>");
      $answer.attr( 'id', originalData[ i ].id );
      $answer.data( 'member', originalData[ i ].teamMember );
      $answer.data( 'image', originalData[ i ].image );
  
      let $heading = $("<h3></h3>");
      $heading.text( originalData[ i ].teamMember );
  
      let $imgWrapper = $("<div></div>");
      let $img = $("<img />");
      $img.attr('src', originalData[ i ].image );
  
      $imgWrapper.append( $img );
      $answer.append( $heading );
      $answer.append( $imgWrapper );
  
      // add click handler
      $answer.on('click', function(ev){
        // logic to check if correct selection has been made
        const $answerID = $( this ).attr( 'id' );
        const $member = $( this ).data( 'member' );

        if( $answerID == $("#drop-zone").data( 'id' ) ){        
          // fadeout/remove selected card after user reads prompt
          $( this ).fadeOut( function(){ 
            $( this ).remove();        
          });
          
          // also remove selected card in Desktop view
          let $correctAnswerOnDesktopView = $answers.children( "#" + $answerID );
          $correctAnswerOnDesktopView.remove();
  
          // populate image and member name in Mobile view placeholder 
          const $dropZone = $( "#drop-zone" );          
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
                if( questionsToAsk.length > 0 ){
                  $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct!<br /><br />You have <b>"+ questionsToAsk.length +"</b> more question/s. Try the next one.</p></div>")
                    .dialog({ 
                      modal: true,
                      dialogClass: "no-show bg-correct",
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
                  $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is correct!<br /><br />You have answered <b>all</b> the questions now.  Well done!<br /><br />A summary of the answers has been provided on the screen.</p></div>")
                    .dialog({ 
                      modal: true,
                      dialogClass: "no-show bg-correct",
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
          $( "<div id='mobile-dialog'><p><b>"+ $member +"</b> is incorrect. Please try again.</p></div>")
            .dialog({ 
              modal: true,
              dialogClass: "no-show bg-incorrect",
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
      // instructions for mobile/tablet touchscreen device
      $instructions.html("<b><i>Click</i></b> on the team member below that matches the description above...");
      $instructions.removeClass('hidden');

      // hide draggable answers for Desktop, show clickable answers for Mobile/Tablet view
      $answers.addClass( 'hidden' );
      $answersTouchScreen.removeClass( 'hidden' );
    } else {
      // instructions for desktop mouse-pointer device
      $instructions.html("<b><i>Drag</i></b> the corresponding team member of the description above onto the blank face...");
      $instructions.removeClass('hidden');

      // hide clickable answers for Mobile/Tablet, show draggable answers for Desktop view 
      $answersTouchScreen.addClass( 'hidden' );
      $answers.removeClass( 'hidden' );
    }
  }

  function setUpQuiz(){
    // empty summary and hide it
    $summaryArea.empty();
    $summaryArea.addClass('hidden');

    // make sure user is at top of page
    $('html, body').scrollTop(0);

    // generate question and drop zone area
    questionsToAsk = arrangeQuestions();

    // generate Q & A summary, but it is initially hidden from view
    generateSummary();

    // choose a question to ask user
    askNextQuestion();

    // generate both draggable and clickable answers once
    generateDesktopAnswers();
    generateMobileTabletAnswers();
    
    // initial screen width check to determine whether to show draggable or clickable answers
    enableDesktopOrMobileAnswers();
  }


  /*******************
   * Code starts here
   */
  // extract Q & A data from JSON file
  $.getJSON( "perceptions.json", function( data, status ){
    if( status==="success" ){
      originalData = data;

      setUpQuiz();
    } else {
      console.error('There was an error loading the JSON file')
    }
  });


  /*****************
   * Event handlers
   */
  // if screen has resized, check screen width again
  // $(window).on('resize', () => { // Doesn't work in IE 11
  $( window ).resize( function(){
    enableDesktopOrMobileAnswers();
  });
  
});
