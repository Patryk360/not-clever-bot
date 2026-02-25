"use strict";
$(document).ready(() => {
    $("#login").click(() => {
        const data = {
            username: $("#username").val(),
            password: $("#password").val()
        };
        $.post("/dashboard/login", data).done(() => {
            console.log("okej");
        });
    });
});