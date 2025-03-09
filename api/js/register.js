"use strict";
$(document).ready(() => {
    $("#register").click(() => {
        $("#progress-bar").html(`<div class="progress" id="progress-bar-delete"><div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 100%"></div></div>`);
        const data = {
            username: $("#usernameVal").val(),
            email: $("#emailVal").val(),
            password: $("#passwordVal").val(),
            retypePassword: $("#retypePasswordVal").val()
        };
        $.post("/dashboard/register", data).done(() => {
            $("#progress-bar-delete").remove();
        });
    });
});