import { Template } from 'meteor/templating';
//import Meteor from "meteor/meteor"
import './main.html';
import {Session} from "meteor/session"

Meteor.startup(function () {
    Stripe.setPublishableKey(Meteor.settings.public.PublishKey);
});
Session.setDefault("hasAttachedCard", true);

Template.body.helpers({
    "hasAttachedCard": function(){
        return Session.get("hasAttachedCard");
    },
    "loadingCardInfo": function(){
        loadCardInfo();
        return Session.get("loadingCardInfo");
    },
    "cardInfo": function(){
        return Session.get("cardInfo");
    }
});

function loadCardInfo() {
    Meteor.call("loadCardInfo", function (err, data) {
        if (err == null) {
            Session.set("hasAttachedCard", data.hasCard);
            if (data.hasCard) {
                Session.set("cardInfo", data.cardInfo);
                Session.set("loadingCardInfo", false);
            }
        }
    });
}
Template.body.events({
    "submit .payment-form": function (event) {
        event.preventDefault();

        const cardDetails={
            "number":event.target.cardNumber.value,
            "cvc":event.target.cardCVC.value,
            "exp_month":event.target.cardExpiryMM.value,
            "exp_year":event.target.cardExpiryYY.value
        };

        Stripe.createToken(cardDetails, function (status, result) {
            if(result.error){
                alert(result.error.message)
            }else{
                Meteor.call("addCard", result.id, function(err, response){
                    if(err){
                        alert(err.message);
                    }else{
                        loadCardInfo();
                        alert("Card Saved");
                    }
                })
            }
        })
    },
    "click #chargeUser": console.log("lklkklkk")

    /*function () {
        Meteor.call("loadCardInfo", function(err, response){
            if(err){
                alert(err.message);
            }else{
                console.log(response);
            }
        })
    }*/
});

