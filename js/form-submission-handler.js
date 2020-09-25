// get all data in form and return object
function getFormData() {
  var form = document.getElementById("gform");
  var elements = form.elements; // all form elements
  var fields = Object.keys(elements)
  .map(function (k) {
    if (elements[k].name !== undefined) {
      return elements[k].name;
      // special case for Edge's html collection
    } else if (elements[k].length > 0) {
      return elements[k].item(0).name;
    }
  }).filter(function (item, pos, self) {
    return self.indexOf(item) == pos && item;
  });

  var data = {};
  fields.forEach(function (k) {
    data[k] = elements[k].value;
    var str = "";
    // TODO - that's causing list of meetings not to work when only one is available
    if (elements[k].type === "checkbox") { // special case for Edge's html collection
      str += elements[k].checked + ", ";
      data[k] = str.slice(0, -2); // remove the last comma and space 
                                  // from the  string to make the output 
                                  // prettier in the spreadsheet
   } else 
                 if (elements[k].length) {
      for (var i = 0; i < elements[k].length; i++) {
        if (elements[k].item(i).checked) {
          str = str + elements[k].item(i).value + ", "; // same as above
          data[k] = str.slice(0, -2);
        }
      }
    }
  });

  // add form-specific values into the data
  //data.formDataNameOrder = JSON.stringify(fields);

  // console.log(data);
  return data;
}

function handleFormSubmit(event) {  // handles form submit withtout any jquery
  event.preventDefault();           // we are submitting via xhr below
  var data = getFormData();         // get the values submitted in the form

  var recaptcha = grecaptcha.getResponse();
  if (recaptcha === "") {
//      alert("Please check the reCaptcha");
//      return;
  }
  
  var url = event.target.action;  //
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  // xhr.withCredentials = true;
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 
  var blackoutParent = document.getElementById("blackout").parentNode.nodeName;
  if (blackoutParent == "BODY") {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
  }
  
  document.getElementById('blackout').style.display = 'block';
 
  
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) { 
      document.getElementById('blackout').style.display = 'none';
      document.body.style.overflow = 'auto';

      hideForm();

      if (xhr.responseText.indexOf('error') >= 0) {
        showErrorMessage(xhr.responseText);
      } else if (xhr.responseText.indexOf('success') >= 0) {
        showSuccessMessage();
      } else {
        showErrorMessage("No response was received from server, please check developer console");
      }

    }

    //return;
  };

  // url encode form data for sending as post data
  var encoded = Object.keys(data).map(function (k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(data[k])
  }).join('&')

  xhr.send(encoded);
}

function loaded() {
  // console.log("Contact form submission handler loaded successfully.");

  var form = document.getElementById("gform");
  form.addEventListener("submit", handleFormSubmit, false);
};
document.addEventListener("DOMContentLoaded", loaded, false);

function hideForm() {
  document.getElementById("gform").style.display = "none";
  document.getElementById("form_header").style.display = "none";
  document.getElementById("form_footer").style.display = "none";
}

function showSuccessMessage() {
  const thankYouMessage = document.getElementById("success_message");
  if (thankYouMessage) {
    thankYouMessage.style.display = "block";
  }
}

function showErrorMessage(responseText) {
  const error_message = document.getElementById("error_message");
      if (error_message) {
        error_message.style.display = "block";
      }
      
      const error_message_content = document.getElementById("error_message_details");
      if (error_message_content) {
        error_message_content.textContent = responseText;
      }
}

function showFormAgain() {
  document.getElementById("gform").style.display = "block";
  document.getElementById("form_header").style.display = "block";
  document.getElementById("form_footer").style.display = "block";
  
  const successMessage = document.getElementById("success_message");
  if (successMessage) {
    successMessage.style.display = "none";
  }
  
  const error_message = document.getElementById("error_message");
  if (error_message) {
    error_message.style.display = "none";
  }
  
  const error_message_content = document.getElementById("error_message_details");
      if (error_message_content) {
        error_message_content.textContent = "";
      }
}

function showPrivacyDisclaimerDetails() {
  var x = document.getElementById('PrivacyDisclaimerDetails');
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}

//# sourceURL=/js/form-submission-handler.js
