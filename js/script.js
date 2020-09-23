// JSON data
const	answers = [
  {
    id: 1,
    image: './images/1_direct_supervisor.png',
    teamMember: 'Direct supervisor',
    priorities: [
      'Productivity',
      'Replacement of absent worker',
      'Training replacement workers',
      'Containing costs associated with absence',
      'Communication with union, absent worker and co-workers'
    ],
    concernsAndChallenges: [
      'Creating return to work opportunities',
      'Cost of supporting return to work',
      'Co-worker complaints',
      'Administration time to manage the absent worker’s claim',
      'Work slow down or disruption caused by absence and then return to work'
    ]
  },
  {
    id: 2,
    image: './images/2_coworker.png',
    teamMember: 'Co-workers',
    priorities: [
      'Doing their own job well',
      'Maintaining health and wellness at work',
      'Avoiding injury'
    ],
    concernsAndChallenges: [
      'Working harder because of the absent worker',
      'Training for a new job to cover the absence',
      'Fear of injury ',
      'Increased overtime',
      'Less recovery time or shortened breaks',
      'Doing a job they are not accustomed to',
      'Not having their rights violated under the collective agreement'
    ]
  },
  {
    id: 3,
    image: './images/3_injured_ill_coworker.png',
    teamMember: 'Injured/ill worker',
    priorities: [
      'Recovery',
      'Pain/symptom management',
      'Ensuring benefits received/paid',
      'Ensuring claim continues',
      'Communication with all parties: family, doctor, employer, insurer'
    ],
    concernsAndChallenges: [
      'Fear of re-injury',
      'Being pushed to return to work before feeling ready',
      'Uncertainty with what is happening at work while away',
      'Concern with what employer and co-workers think',
      'Claim eligibility and continuing to prove need for benefits'
    ]
  },
  {
    id: 4,
    image: './images/4_physician.png',
    teamMember: 'Physician',
    priorities: [
      'Recovery',
      'Symptom management',
      'Referrals for diagnostic tests or specialists are done in a timely manner',
      'Confidentiality of patient’s information',
      'Being a patient advocate'
    ],
    concernsAndChallenges: [
      'Seeing the patient for follow up at an appropriate time',
      'Understanding the patient’s job and return to work opportunities',
      'Completing paperwork in a timely manner',
      'Communicating with employer and insurer on claim and return to work',
      'Supporting return to work in a timely and appropriate manner'
    ]
  },
  {
    id: 5,
    image: './images/5_union_rep.png',
    teamMember: 'Union representative',
    priorities: [
      'Worker receiving benefits to which they are entitled',
      'Advocating for rights of absent worker and co-workers',
      'Protecting Collective Agreement'
    ],
    concernsAndChallenges: [
      'Ensuring member is paid appropriately and in a timely manner',
      'Members being injured',
      'Members being re-injured'
    ]
  },
  {
    id: 6,
    image: './images/6_insurance_provider.png',
    teamMember: 'Insurance provider',
    priorities: [
      'Contain costs of claim',
      'Validate eligibility for claim',
      'Conclude claim quickly'
    ],
    concernsAndChallenges: [
      'Communication with worker',
      'Explaining insurance process to worker',
      'Obtaining medical documentation to support claim',
      'Working with employer, worker and physician on return to work opportunities'
    ]
  },
  {
    id: 7,
    image: './images/7_disability_case_mgmt_pro.png',
    teamMember: 'Disability case management professional',
    priorities: [
      'Communicating with all stakeholders on absence duration',
      'Communicating with absent worker in a timely and regular manner',
      'Ensuring worker receiving appropriate medical treatment',
      'Ensuring worker receiving benefits they are entitled to',
      'Understanding the worker’s job and how the job demands might impact return to work efforts',
      'Exploring temporary accommodation measures to support return to work'
    ],
    concernsAndChallenges: [
      'Health and wellness of worker – potential for delay in recovery or re-injury',
      'Adequate medical intervention starting with correct diagnosis',
      'Trust and cooperation of the physician or healthcare team',
      'Cooperation and support from insurance provider',
      'Understanding worker’s progress in rehabilitation ',
      'Cooperation with supervisors, union, co-workers on return to work opportunities',
      'Managing a large case load',
      'Safe and sustainable return to work plans implemented at the right time'
    ]
  }
];

/**
 * Reference: Chapter 5 of "jQuery UI in Action" book written by T. J. Vantoll, published by Manning:
 * https://github.com/tjvantoll/jquery-ui-in-action-demos/blob/master/chapter-05/05-color-match-game.html
 */
function randomize( array ){
  return array.sort( function(){
    return 0.5 - Math.random();
  });
};

function generateQuestion(){
  // generate a random question	
  let questions = [...answers];
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

  // append generated question to question area
  $questionArea.append( $questionDiv );

  // define drop zone corresponding to question on Desktop view
  const $dropZone = $("#drop-zone");
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
      
      /*
      if ( $( ".filled" ).length === answers.length ) {
        $( "<div><p>Nice job! Refreshing game.</p></div>")
          .dialog({ modal: true });

        setTimeout(function() {
          window.location = window.location; // refresh page to re-start game
        }, 3000 );
      }
      */

      /*
      if ( $(".filled").length === 1 ) {
        $("<div><p>Nice job! Try the next question.</p></div>")
          .dialog({ modal: true });

        // reset drop zone
        $("#drop-zone #member").text( 'Team member?' );
        $("#drop-zone #image img").attr( 'src', './images/0_placeholder.png' );

        // ask next question in the drop zone
        question = questions.pop();
        if( question ){
          $( "<div>", { text: question })
          .appendTo( "#drop-zone" );
        } else {
          $( "<div><p>Well done! You've answered all questions correctly!</p></div>")
          .dialog({ modal: true });
        }
      }    
      */
    }
  });
}

/**
 * Check window width to determine if should use drag 'n' drop functionality for Desktop view, 
 * or click selection for Mobile/Tablet view < 768px.
 */
function enableDesktopOrMobileAnswers(){
  // Note: 1024px is usually max screen width of a tablet/touch device,
  // however there are still same touch screen tablets much wider, so this is not an accurate way to determine if device is touch screen.
  // if( $(window).width() <= 1024 ){

  // Source: https://codepen.io/tteske/pen/KKwxOxp
  // Uses a better way to determine if device is a touch screen which does not rely on screen width.
  // This works, however, you cannot switch between touch-screen and mouse-pointer devices on emulator. You need to refresh after doing so.
  if("ontouchstart" in document.documentElement){  
    console.log('You are using a touch-screen device!!!')

    // hide draggable answers
    $("#answers").addClass( 'hidden' );

    // show clickable answers for Mobile/Tablet view
    $("#answers-touch-screen").removeClass( 'hidden' );
  } else {
    console.log('You are using a mouse pointer device')

    // hide clickable answers
    $("#answers-touch-screen").addClass( 'hidden' );

    // show draggable answers for Desktop view
    $("#answers").removeClass( 'hidden' );
  }
}

function generateDesktopAnswers(){
  for( let i = 0; i < answers.length; i++ ){
    let $answer = $("<div></div>");
    $answer.attr( 'id', answers[ i ].id );
    $answer.data( 'member', answers[ i ].teamMember );
    $answer.data( 'image', answers[ i ].image );

    let $heading = $("<h3></h3>");
    $heading.text( answers[ i ].teamMember );

    let $imgWrapper = $("<div></div>");
    let $img = $("<img />");
    $img.attr('src', answers[ i ].image );

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
  for( let i = 0; i < answers.length; i++ ){
    let $answer = $("<div></div>");
    $answer.attr( 'id', answers[ i ].id );
    $answer.data( 'member', answers[ i ].teamMember );
    $answer.data( 'image', answers[ i ].image );

    let $heading = $("<h3></h3>");
    $heading.text( answers[ i ].teamMember );

    let $imgWrapper = $("<div></div>");
    let $img = $("<img />");
    $img.attr('src', answers[ i ].image );

    $imgWrapper.append( $img );
    $answer.append( $heading );
    $answer.append( $imgWrapper );

    // add click handler
    $answer.on('click', function(ev){
      // logic to check if correct selection has been made
      const $answerID = $( this ).attr( 'id' );
      if( $answerID == $("#drop-zone").data( 'id' ) ){
        console.log("You are correct!  Try next question.")
        
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
        
        // and scroll to top after
        // window.scrollTo(0, 0);
        // $(window).scrollTop(0);
        $('html, body').animate( {scrollTop:0}, 'slow' );

        // prompt user to confirm, and go to next question
        
      } else {
        console.log('Incorrect answer.  Please try again.')
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
$(document).ready( function() {
  generateQuestion();

  // generate both draggable and clickable answers once
  generateDesktopAnswers();
  generateMobileTabletAnswers();
  
  // initial screen width check to determine whether to show draggable or clickable answers
  enableDesktopOrMobileAnswers(); 

  /**
   * Event handlers
   */
  // if screen has resized, check screen width again
  $(window).on('resize', () => {
    enableDesktopOrMobileAnswers();
  });
});
