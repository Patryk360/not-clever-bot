"use strict";
$(document).ready(function() {
    $("#register").click(function() {
        $("#progress-bar").html(`<div class="progress" id="progress-bar-delete"><div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 100%"></div></div>`);
        const data = {
            username: $("#usernameVal").val(),
            email: $("#emailVal").val(),
            password: $("#passwordVal").val(),
        };
        $.post("/dashboard/register", data).done(function(done) {
            $("#progress-bar-delete").remove();
        });
    });
});