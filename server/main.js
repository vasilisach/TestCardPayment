import { Meteor } from 'meteor/meteor';
this.StripeAPI = Npm.require('stripe');
Meteor.startup(() => {
    var stripe=StripeAPI(Meteor.settings.StripePri);
});
Meteor.methods({
    "addCard": function (cardToken) {

        (async ()=> {
            // Create a Customer:
            var customerCreate = await stripe.customers.create({
                source: cardToken
            })
            if (customerCreate.error) {
                throw new Meteor.error(500, "stripe-error", customerCreate.error.message);
            } else {
                Meteor.users.update(Meteor.userId(), {$set: {stripeCust: customerCreate.result.id}});
                return Meteor.users.stripeCust;
            }
        })

    },
    "loadCardInfo": function() {
        if (Meteor.user().stripeCust == null) {
            return {
                "hasCard": false
            }
        } else {
            (async done => {
                var customerDetails = await stripe.customers.retrieve(Meteor.user().stripeCust,
                    function (err, result) {
                        done(err, result);
                    })
                if (customerDetails.result.sources.data.length == 0) {
                    return {
                        "hasCard": false
                    }
                } else {
                    var cardDetails = customerDetails.result.sources.data[0];

                    return {
                        "hasCard": true,
                        "cardInfo": {
                            "brand": cardDetails.brand,
                            "exp_month": cardDetails.exp_month,
                            "exp_year": cardDetails.exp_year,
                            "last4": cardDetails.last4
                        }
                    }
                }
            })

        }

    },
   "chargeUser": async function(){
       await stripe.charges.create({
            amount: 500,
            currency: "aud",
            customer: Meteor.user().stripeCust
        }, function(err, result) {
           if (err) {
               //throw new Meteor.error(500, "stripe-error", err.message);
               console.log(Meteor.user().stripeCust);
           } else {
               console.log(result);
               return result;
           }
       })
    }
});


