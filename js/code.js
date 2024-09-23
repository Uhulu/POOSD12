const urlBase = 'http://poosd12.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

const ids = [] //storing ids in this array from contacts function

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );

	// if (!validLoginForm(login, password)) {
    //     document.getElementById("loginResult").innerHTML = "invalid username or password";
    //     return;
    // }
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
	//let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doSignup() {
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!validSignUpForm(firstName, lastName, username, password)) {
        document.getElementById("signupResult").innerHTML = "invalid signup";
        return;
    }

    //var hash = md5(password);

    document.getElementById("signupResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {

            if (this.readyState != 4) {
                return;
            }

            if (this.status == 409) {
                document.getElementById("signupResult").innerHTML = "User already exists";
                return;
            }

            if (this.status == 200) {

                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                document.getElementById("signupResult").innerHTML = "User added";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                saveCookie();
				window.location.href = "color.html";
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("signupResult").innerHTML = err.message;
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
// 	if( userId < 0 )
// 	{
// 		window.location.href = "index.html";
// 	}
// 	else
// 	{
// //		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
// 	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {

    let firstname = document.getElementById("contactTextFirst").value;
    let lastname = document.getElementById("contactTextLast").value;
    let phonenumber = document.getElementById("contactTextNumber").value;
    let emailaddress = document.getElementById("contactTextEmail").value;

    //check for shitty data
    if (!validContact(firstname, lastname, phonenumber, emailaddress )) {
    document.getElementById("contactAddResult").innerHTML = "invalid Contact Data";
    return;
   }   

    let tmp = {
        firstName: firstname,
        lastName: lastname,
        phoneNumber: phonenumber,
        emailAddress: emailaddress,
        userId: userId
    };


    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/AddContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been added");

                document.getElementById("contactAddResult").innerHTML = "Conctact was Added"
                //document.getElementById("contactAddResult").reset(); //Empties all the fields 

                // Clear the fields after adding
                document.getElementById("contactTextFirst").value = "";
                document.getElementById("contactTextLast").value = "";
                document.getElementById("contactTextNumber").value = "";
                document.getElementById("contactTextEmail").value = "";

                //need to implement a refresh function after adding 
                loadContacts();//this should refresh the list after adding 

                
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function searchContacts() {
    const searchInput = document.getElementById("searchText"); // Input box for search
    const searchTerms = searchInput.value.toUpperCase().split(' '); // Get search query and split into words
    const contactsTable = document.getElementById("contacts"); // Table containing contact data
    const tableRows = contactsTable.getElementsByTagName("tr"); // Get all rows in the table
    const contactListElement = document.getElementById("contactList"); // The <p> element to display results

    // Clear previous search results
    contactListElement.innerHTML = "";

    // Loop through all the rows in the table
    for (let i = 0; i < tableRows.length; i++) {
        const firstNameCell = tableRows[i].getElementsByTagName("td")[0]; // First name column
        const lastNameCell = tableRows[i].getElementsByTagName("td")[1]; // Last name column

        if (firstNameCell && lastNameCell) {
            const firstNameText = firstNameCell.textContent || firstNameCell.innerText; // First name text
            const lastNameText = lastNameCell.textContent || lastNameCell.innerText; // Last name text

            // Check if any part of the search matches the first name or last name
            let matchFound = false;
            for (let term of searchTerms) {
                if (firstNameText.toUpperCase().indexOf(term) > -1 || lastNameText.toUpperCase().indexOf(term) > -1) {
                    matchFound = true;
                    break; // Exit loop if a match is found
                }
            }

            // If a match is found, add the contact to the <p> element
            if (matchFound) {
                const contactInfo = `First Name: ${firstNameText}, Last Name: ${lastNameText}`;
                const contactEntry = document.createElement("p");
                contactEntry.textContent = contactInfo;
                contactListElement.appendChild(contactEntry);
            }
        }
    }

    // If no results found, display a message
    if (contactListElement.innerHTML === "") {
        contactListElement.innerHTML = "No contacts found.";
    }
}


function loadContacts() {
    let tmp = {
        search: "",
        userId: userId //cookieeee
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    //API check and call
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.log(jsonObject.error);
                    return;
                }
                //Generate rows of info from users contacts
                let text = "<table border='1'>"
                for (let i = 0; i < jsonObject.results.length; i++) {
                    ids[i] = jsonObject.results[i].ID
                    text += "<tr id='row" + i + "'>"
                    text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
                    text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
                    text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
                    text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
                    //delete and edit buttons for the form
                    text += "<td>" +
                        "<button type='button' id='edit_button" + i + "' class='w3-button w3-circle w3-lime' onclick='edit_row(" + i + ")'>" + "<span class='glyphicon glyphicon-edit'></span>" + "</button>" +
                        "<button type='button' id='save_button" + i + "' value='Save' class='w3-button w3-circle w3-lime' onclick='save_row(" + i + ")' style='display: none'>" + "<span class='glyphicon glyphicon-saved'></span>" + "</button>" +
                        "<button type='button' onclick='delete_row(" + i + ")' class='w3-button w3-circle w3-amber'>" + "<span class='glyphicon glyphicon-trash'></span> " + "</button>" + "</td>";
                    text += "<tr/>"
                }
                text += "</table>"
                document.getElementById("tbody").innerHTML = text;
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function validLoginForm(logName, logPass) {

    var logNameErr = logPassErr = true;

    if (logName == "") {
        console.log("USERNAME IS BLANK");
    }
    else {
        var regex = /(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;

        if (regex.test(logName) == false) {
            console.log("USERNAME IS NOT VALID");
        }

        else {

            console.log("USERNAME IS VALID");
            logNameErr = false;
        }
    }

    if (logPass == "") {
        console.log("PASSWORD IS BLANK");
        logPassErr = true;
    }
    else {
        var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

        if (regex.test(logPass) == false) {
            console.log("PASSWORD IS NOT VALID");
        }

        else {

            console.log("PASSWORD IS VALID");
            logPassErr = false;
        }
    }

    if ((logNameErr || logPassErr) == true) {
        return false;
    }
    return true;

}

function validContact(first,last,phone,email){
    var firstError = lastError = phoneError = emailError = true;

    if(first == ""){
        console.log("First Name Blank");
    }
    else {
        console.log("Valid First Name");
        firstError = false; //Valid entry sets it to false
    }

    if(last == ""){
        console.log("Last Name Blank");
    }
    else {
        console.log("Valid Last Name");
        lastError = false; //Valid entry sets it to false
    }
    
    if (phone == "") {
        console.log("PHONE IS BLANK");
    }
    else {
        var regex = /^(\(?\d{3}\)?[-\s\.]?)\d{3}[-\s\.]?\d{4}$/;


        if (regex.test(phone) == false) {
            console.log("PHONE IS NOT VALID");
        }

        else {

            console.log("PHONE IS VALID");
            phoneError = false; //Valid entry sets it to false
        }
    }

    if (email == "") {
        console.log("EMAIL IS BLANK");
    }
    else {
        var regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/; //confusing ass regex line

        if (regex.test(email) == false) {
            console.log("EMAIL IS NOT VALID");
        }

        else {

            console.log("EMAIL IS VALID");
            emailError = false;
        }
    }

    if((firstError ||lastError || phoneError || emailError) == true){
        return false;
    } 

    return true;
       

}

function validSignUpForm(fName, lName, user, pass) {

    var fNameErr = lNameErr = userErr = passErr = true;

    if (fName == "") {
        console.log("FIRST NAME IS BLANK");
    }
    else {
        console.log("first name IS VALID");
        fNameErr = false;
    }

    if (lName == "") {
        console.log("LAST NAME IS BLANK");
    }
    else {
        console.log("LAST name IS VALID");
        lNameErr = false;
    }

    if (user == "") {
        console.log("USERNAME IS BLANK");
    }
    else {
        var regex = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;

        if (regex.test(user) == false) {
            console.log("USERNAME IS NOT VALID");
        }

        else {

            console.log("USERNAME IS VALID");
            userErr = false;
        }
    }

    if (pass == "") {
        console.log("PASSWORD IS BLANK");
    }
    else {
        var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

        if (regex.test(pass) == false) {
            console.log("PASSWORD IS NOT VALID");
        }

        else {

            console.log("PASSWORD IS VALID");
            passErr = false;
        }
    }

    if ((fNameErr || lNameErr || userErr || passErr) == true) {
        return false;

    }

    return true;
}