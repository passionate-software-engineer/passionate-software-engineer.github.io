function sumUpValues() {
  var input = document.getElementsByName("reserved_hours");
  var total = 0;
  for (var i = 0; i < input.length; i++) {
    if (input[i].checked) {
      total += parseFloat(input[i].getAttribute("data-price"));
    }
  }
  document.getElementById("reserved_hours_sum").textContent = total.toFixed(2)
      + " zł";
  document.getElementById("reserved_hours_sum_input").value = total;

  const additional_funds = document.getElementById("additional_funds").value;
  document.getElementById(
      "additional_funds_sum").textContent = additional_funds + " zł";

  const amount_to_return = parseFloat(document.getElementById("amount_to_return").value);
  
  const total_sum = total + parseFloat(additional_funds) + amount_to_return;
  document.getElementById(
      "total_sum").textContent = total_sum.toFixed(2) + " zł";
  if (document.getElementById("total_sum_transfer")){
    document.getElementById("total_sum_transfer").textContent = total_sum.toFixed(2) + " zł";
  }
  document.getElementById("total_sum_input").value = total_sum;
  
  document.getElementById("amount_to_return_sum").textContent = amount_to_return.toFixed(2)
      + " zł";
  
}

function fillInputsFromGetParameters(){
  var search = location.search.substring(1);
  var parametersAsJson = '{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\n/g, ' ') + '"}';
  inputParameters = search.length > 0 ? JSON.parse(parametersAsJson) : [];
  
  for (var key in inputParameters) {
    if (document.getElementById(key) != null) {
       var element = document.getElementById(key)
       parameterValue = decodeURIComponent(inputParameters[key]);
 
       if (element.type && element.type === 'checkbox') {
         element.checked = parameterValue === "true" ? true : false;   
       } else {
         element.value = parameterValue;
       }
    }
    
    if (key == "reserved_hours" && inputParameters[key] != "") {
      reserved_hours = decodeURIComponent(inputParameters[key]).split(',');
      for (var reserved_hour_index in reserved_hours) {
        document.getElementById(reserved_hours[reserved_hour_index].trim()).checked = true;
      }
    }
  }
    
  sumUpValues();
  Get("https://script.google.com/macros/s/AKfycbzMukfN2nW6VxC44B6JboZz8ORsb4mQM3BE9BR2PsG4XqAPMKsu/exec");
}

function addAvailableMeetings(meetings){
  for (var i = 0; i < meetings.length; ++i){
    var meeting = meetings[i];
    var fieldset = document.getElementById('available_meetings'); 
    var startDate = new Date(meeting.startDate);
    var meetingDate = startDate.getDay() + "." + (startDate.getMonth() + 1) + "." + startDate.getFullYear();
    var startTime = startDate.getHours() + ":" + startDate.getMinutes();
    var endDate = new Date(meeting.endDate);
    var endTime = endDate.getHours() + ":" + endDate.getMinutes();
    var title = meeting.title + " - " + meetingDate + " - " + startTime + "-" + endTime;
    
    var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = title;
        checkbox.name = "reserved_hours";
        checkbox.setAttribute("data-price", "75");
        checkbox.addEventListener('click', function() {
             sumUpValues();
        }, false);
        
        fieldset.appendChild(checkbox);
        fieldset.appendChild(document.createTextNode(title));
        var br = document.createElement("br");
        fieldset.appendChild(br);
  }
}

function Get(url){
    var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        //xhr.withCredentials = true
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) { 
            addAvailableMeetings(JSON.parse(xhr.responseText));
          }
        }
        //xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send()        
}
