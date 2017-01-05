var inputEl = document.querySelector('#gv-search-input');
var mpEls = document.querySelectorAll('.gv-mps-list .gv-mp-name span');
var groupEls = document.querySelectorAll('.gv-group-container');
var elData = {};
var mpNames = [];

for(var i=0; i<mpEls.length; i++){
	var name = mpEls[i].innerHTML.toLowerCase();
	var group = mpEls[i].parentElement.getAttribute('data-group');

	if(elData[name]){
		elData[name].groups.push(group);
	}else{
		elData[name] = {
			groups:[group],
			name: mpEls[i].innerHTML,
			totalFunds: mpEls[i].parentElement.getAttribute('data-funds')
		}
	}

	if(mpNames.indexOf(name.toLowerCase()) < 0){
		mpNames.push(name.toLowerCase());
	}

	mpEls[i].addEventListener('click',function(e){
		clearSearchBtn.style.visibility = "visible"
		filterNames(e.target.innerHTML,'click')
	})
}


// Toggle names list
var toggleBtns = document.querySelectorAll('.gv-btn-toggle')
Array.from(toggleBtns).forEach(btn => {
	btn.addEventListener('click',function(e){
		var mode = e.target.getAttribute('data-toggle');
		var targetEl = e.target.parentElement.parentElement;
		if(mode === "show"){
			targetEl.classList.add('funds-visible');
		}else{
			targetEl.classList.remove('funds-visible');
		}
	})
})


var mpDescription = document.querySelector('#gv-mp-description');
function filterNames(val,mode){
	var filteredOptions = mpNames.filter(function(name){ return name.indexOf(val.toLowerCase()) > -1 });
	for(var i = 0; i< groupEls.length; i++){
		groupEls[i].classList.add('inactive')
	}

	filteredOptions.forEach(function(name){
		elData[name].groups.forEach(function(group){
			document.querySelector('.gv-group-container[data-group-name="' + group + '"]').classList.remove('inactive')
		})
	})

	if(filteredOptions.length === 1){
		mpDescription.style.visibility = "visible";
		var totalFunds = elData[filteredOptions[0]].totalFunds;
		var paidFunds = elData[filteredOptions[0]].groups.length;
		var unpaidFunds = totalFunds - paidFunds;
		var string = "";
			string += elData[filteredOptions[0]].name + " is a member of ";
			string += totalFunds + " All-Party Parliamentary Group" + checkPlural(totalFunds,"s") + ". ";

		if(unpaidFunds > 0){
			string += "Of those group" + checkPlural(totalFunds,"s") + ", " + paidFunds + " " + checkPlural(paidFunds,"are") + " funded, as shown below, "
			string += "and " + unpaidFunds + " " + checkPlural(unpaidFunds,"do") + " not receive any funding."
		}

		mpDescription.innerHTML = string;
	}else{
		mpDescription.style.visibility = "hidden"
	}

	if(mode === "click"){
		inputEl.value = val;
	}

	function checkPlural(val,word){
		if(val == 1){
			if(word === "are"){
				return "is"
			}else if(word === "s"){
				return ""
			}else if(word==="do"){
				return "does"
			}
		}else{
			return word
		}

	}
}



// Search functionality
var clearSearchBtn = document.querySelector('#clear-input-btn')

inputEl.addEventListener('keyup',function(e){
	var query = e.target.value;
	
	if(query.length === 0){
		clearSearchBtn.style.visibility = "hidden"
	}else{
		clearSearchBtn.style.visibility = "visible"
	}

	filterNames(query);
})

clearSearchBtn.addEventListener('click',function(){
	inputEl.value = "";
	clearSearchBtn.style.visibility = "hidden"

	filterNames("");
})