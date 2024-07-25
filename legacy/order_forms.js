function acceptAllAgreements() {
  var value = document.getElementById("acceptAllAgreementsCheckbox").checked;
  document.getElementById("accept_mandatory_regulations").checked = value;
  document.getElementById("confirm_marketing").checked = value;
  document.getElementById("confirm_start_service_before_14_days").checked = value;
  document.getElementById("confirm_finish_service_before_14_days").checked = value;
}

function deselectAcceptAllAgreementsCheckbox() {
  document.getElementById("acceptAllAgreementsCheckbox").checked = false;
}

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

  const additional_funds = parseFloat(document.getElementById("additional_funds").value);
  document.getElementById(
      "additional_funds_sum").textContent = additional_funds.toFixed(2) + " zł";

  const amount_to_return = -1 * parseFloat(document.getElementById("amount_to_return").value);
  
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

function fillInputsFromGetParameters(disabled = false, requestListOfMeetings = true, includeReserved=false){
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
        var element = document.getElementById(reserved_hours[reserved_hour_index].trim());
        if (element != null){
          element.checked = true;
        }
      }
    }
  }
    
  sumUpValues();
  
  if (requestListOfMeetings){
      getListOfMeeetings(includeReserved, disabled);
  }
}

function addAvailableMeetings(meetings, disabled = false){
  for (var i = 0; i < meetings.length; ++i){
    var meeting = meetings[i];
   
    var startDate = new Date(meeting.startDate);
    var meetingDate = ("0" + startDate.getDate()).slice(-2) + "." + ("0" + (startDate.getMonth() + 1)).slice(-2) + "." + startDate.getFullYear();
    var startTime = ("0" + startDate.getHours()).slice(-2) + ":" + ("0" + startDate.getMinutes()).slice(-2);
    var endDate = new Date(meeting.endDate);
    var endTime = ("0" + endDate.getHours()).slice(-2) + ":" + ("0" + endDate.getMinutes()).slice(-2); 
    var title = meeting.title + " - " + meetingDate + " - " + startTime + "-" + endTime;
    
    var meetingDurationInMinutes = (endDate - startDate) / 60000;
    
    var price = 0;
    if (title.toLowerCase().indexOf("lead") > 0){
      price = document.getElementById("lead_price").value;
    } else if (title.toLowerCase().indexOf("senior") > 0) {
      price = document.getElementById("senior_price").value;
    } else {
      continue; // do not display - invalid meeting
    }
    
    if (price == 0){
      continue;
    }
    
    var meetingCost = Math.round((price / 60) * meetingDurationInMinutes); 
    
    title += " (" + meetingCost + " zł)";
         
    var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.value = meeting.id + "###" + title;
        checkbox.id = checkbox.value;
        checkbox.name = "reserved_hours";
        checkbox.disabled = disabled;
        checkbox.setAttribute("data-price", meetingCost);
        checkbox.addEventListener('click', function() {
             sumUpValues();
        }, false);
     
    var fieldset = document.getElementById('available_meetings');
        fieldset.appendChild(checkbox);
        fieldset.appendChild(document.createTextNode(title));
        var br = document.createElement("br");
        fieldset.appendChild(br);
  }
}

function getListOfMeeetings(includeReserved, disabled = false){
  var url = "https://script.google.com/macros/s/AKfycbzMukfN2nW6VxC44B6JboZz8ORsb4mQM3BE9BR2PsG4XqAPMKsu/exec?type=meetings" + (includeReserved ? "&all=true" : "");
    var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        //xhr.withCredentials = true
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) { 
            addAvailableMeetings(JSON.parse(xhr.responseText), disabled);
             sumUpValues();
  
            //fillInputsFromGetParameters(disabled, false);
          }
        }
        //xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send()        
}

function applyDiscount(){
   var discountCode = document.getElementById("discount_code").value; 
   var url = "https://script.google.com/macros/s/AKfycbzMukfN2nW6VxC44B6JboZz8ORsb4mQM3BE9BR2PsG4XqAPMKsu/exec?type=discounts&discount_code=" + discountCode;

    var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        //xhr.withCredentials = true
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) { 
            var discount_percent = parseFloat(xhr.responseText);
            if (discount_percent > 0){
              document.getElementById("senior_price").value = Math.round(document.getElementById("senior_price_original").value * (1-discount_percent/100));
              document.getElementById("lead_price").value = Math.round(document.getElementById("lead_price_original").value * (1-discount_percent/100));
              var meetings = document.getElementById("available_meetings");
              meetings.innerHTML = "<legend>Krok 1: Konsultacje zarezerwowane z gory</legend>";
//               for (var i = 0; i < meetings.length; i++) {
//                 var meeting = meetings[i];
//                 if (meeting.tagName != "LEGEND"){
//                   document.getElementById("available_meetings").removeChild(meeting);
//                 }
//               }
      
              getListOfMeeetings(false, false);

              var discountDiv = document.getElementById("discountInformation")
              if (discountDiv.firstChild){
                discountDiv.removeChild(discountDiv.firstChild);
              }
              discountDiv.appendChild(document.createTextNode("Zastosowano zniżkę " + discount_percent + "%"));
              
            } else {
              var discountDiv = document.getElementById("discountInformation")
              if (discountDiv.firstChild){
                discountDiv.removeChild(discountDiv.firstChild);
              }
              discountDiv.appendChild(document.createTextNode("Podany kod zniżkowy jest nieprawidłowy."));
            }
          }
        }
        //xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send()        
}

//# sourceURL=/js/order_forms.js
