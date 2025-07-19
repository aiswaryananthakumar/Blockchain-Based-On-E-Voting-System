// login.js
$(document).ready(function () {
    var cookie = readCookie('auth');
    if (cookie != null) {
        window.location = "/app";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $('#messagebox').hide();

    // Modified Login Handler
    $('#loginForm').submit(function(event) {
        event.preventDefault();
        
        if ($('#username').val() == "") {
            $('#messagebox').show();
            $('#errormsg').text('Please Enter Username');
            return;
        } 
        if ($('#password').val() == "") {
            $('#messagebox').show();
            $('#errormsg').text('Please Enter a Valid Password');
            return;
        }

        $('#messagebox').hide();
        $.ajax({
            url: "/login",
            method: "POST",
            data: {
                username: $('#username').val(),
                password: $('#password').val()
            },
            success: function(response) {
                console.log("Login Success:", response);
                $('#messagebox').removeClass('alert-danger').addClass('alert-success');
                $('#errormsg').text('Login successful! Redirecting...');
                $('#messagebox').show();
                setTimeout(function() {
                    window.location = '/app';
                }, 1500);
            },
            error: function(xhr) {
                console.log("Login Error:", xhr.responseJSON);
                $('#messagebox').removeClass('alert-success').addClass('alert-danger');
                $('#errormsg').text(xhr.responseJSON?.message || 'Login failed');
                $('#messagebox').show();
            }
        });
    });

    // Modified Register Handler
    $('#register').click(function(event) {
        event.preventDefault();
        
        if ($('#regUsername').val() == "" || $('#regPassword').val() == "") {
            $('#messagebox').show();
            $('#errormsg').text('Please Enter a Username and Password');
            return;
        }

        if ($('#regPassword').val() !== $('#regConfirmPassword').val()) {
            $('#messagebox').show();
            $('#errormsg').text('Passwords do not match');
            return;
        }

        $.ajax({
            url: "/register",
            method: "POST",
            data: {
                username: $('#regUsername').val(),
                password: $('#regPassword').val()
            },
            success: function(response) {
                $('#messagebox').removeClass('alert-danger').addClass('alert-success');
                $('#errormsg').text('Registration successful! Please log in.');
                $('#messagebox').show();
                setTimeout(function() {
                    $('#backToLogin').click();
                }, 1500);
            },
            error: function(xhr) {
                $('#messagebox').removeClass('alert-success').addClass('alert-danger');
                $('#errormsg').text(xhr.responseJSON?.message || 'Registration failed');
                $('#messagebox').show();
            }
        });
    });
});