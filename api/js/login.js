"use strict";
$(document).ready(() => {
    $("#login").click(() => {
        $.post("/dashboard/login", "oka").done(() => {
            console.log("okej");
        });
    });
});