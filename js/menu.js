/* global chrome */

var tabId;

// get the tab id since we're calling it from a non-tab context (popup)
chrome.tabs.query({currentWindow:true,active:true}, function(tabs) {
	tabId = tabs[0].id;
});
		
document.addEventListener('DOMContentLoaded', function() {
	bindElementSelector();
	bindGridScraper();
	bindLinkPage();
	bindCancelButton();
	bindLinkAccountButton();
	
	// get the selected tool from storage to highlight it
	chrome.storage.local.get('toolSelected', function(result) {
		var tool = result.toolSelected;
		if (tool) {
			$('#'+tool).addClass('hover');
		}	
	});
});

function bindElementSelector() {
	$('#elementSelector').click(function() {
		console.log('Reflex div clicked');
		
		// fires reflex start() function
		chrome.tabs.sendMessage(tabId, {
			action: 'initOrRestore'
		}, function(loaded) {
			if (loaded) {
				$('#elementSelector').addClass('hover');
				$('#gridScraper').removeClass('hover');
				
				// we need to store the state of the pop up selection in local storage
				chrome.storage.local.set({'toolSelected':'elementSelector'});
				console.log('inited');
			} else {
				$('#elementSelector').removeClass('hover');
				chrome.storage.local.remove('toolSelected');  
				console.log('restored');
			}
		});
	});
}

function bindGridScraper(){
	$('#gridScraper').click(function() {	
		alert("This hasn't been implemented yet!");
		//TODO : update the toolSelected
		
		if ($(this).hasClass('hover')) {
			$(this).removeClass('hover');
		} else {
			$(this).addClass('hover');
			$('#elementSelector').removeClass('hover');
		}
	});
}

function bindLinkPage() {
	$('#linkPageButton').click(function() {	
		$('#menu').hide();
		$('#logIn').show();
	});
}

function bindCancelButton() {
	$('#cancelButton').click(function() {	
		$('#logIn').hide();
		$('#menu').show();
	});
}

//TODO: the cancel button and the link link button.  not to mention the error handling.
function bindLinkAccountButton() {
	$('#linkAccountButton').click(function() {
		var username = $('input#username').val();
		var password = $('input#password').val();

		$.ajax({
		  type: 'GET',
		  url: 'http://dev.reflex.systems/user',
		  dataType: 'json',
		  async: false,
		  headers: {
		    "Authorization": "Basic " + btoa(username + ":" + password)
		  },
		  data: '{ "comment" }', //TODO: do I need to send any data?
		  success: function (){
		    alert('Thanks for your comment!'); //TODO: hang on to something here?
		    //1) update the #logInStatus
			//2) hide the #logIn page
			//3) show the #menu
		  },
		  error:function(){
		   	//TODO: do what?  "Invalid Username/Password" -in red above the button...	
		  }
		});
	});
}




